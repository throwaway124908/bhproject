global using static Helpers;
using System;
using System.Collections;
using System.Collections.Generic;
using System.Collections.Specialized;
using System.Data;
using System.Data.Common;
using System.Diagnostics;
using System.Net.Http;
using System.Net.WebSockets;
using System.Threading;
using System.Threading.Tasks;
using System.Text;
using System.Text.RegularExpressions;
using System.Security.Claims;
using System.Linq;
using System.IO;
using Microsoft.Extensions.Options;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Hosting;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Sqlite;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Session;
using Microsoft.AspNetCore.CookiePolicy;
using Microsoft.AspNetCore.Server.IISIntegration;
using Microsoft.AspNetCore.Server.HttpSys;
using Microsoft.AspNetCore.Routing;
using Microsoft.AspNetCore.Routing.Patterns;
using Microsoft.AspNetCore.Routing.Constraints;
using Microsoft.AspNetCore.Rewrite;
using Microsoft.AspNetCore.ResponseCompression;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Razor;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.AspNetCore.Mvc.Razor.RuntimeCompilation;
using Microsoft.AspNetCore.Mvc.Infrastructure;
using Microsoft.AspNetCore.HttpsPolicy;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.Extensions;
using Microsoft.AspNetCore.Http.Connections;
using Microsoft.AspNetCore.Http.Features;
using Microsoft.AspNetCore.Http.Headers;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Mvc.ViewFeatures;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.StaticFiles;

public class Program
{
    private static IConfiguration? _configuration;
    private static IWebHostEnvironment? _environment;
    private static ITempDataProvider? _dataProvider;
    private static IRazorViewEngine? _razorEngine;
    private static IHttpContextAccessor? _contextAccessor;
    private static ISessionStore? _sessionStore;
    public static IConfiguration WebConfiguration { get { return _configuration ?? throw new Exception("Cannot access configuration before the application is built."); } }
    public static IWebHostEnvironment WebEnvironment { get { return _environment ?? throw new Exception("Cannot access environment before the application is built."); } }
    public static ITempDataProvider DataProvider { get { return _dataProvider ?? throw new Exception("Cannot access data provider before the application is built."); } }
    public static IRazorViewEngine RazorEngine { get { return _razorEngine ?? throw new Exception("Cannot access razor engine before the application is built."); } }
    public static IHttpContextAccessor ContextAccessor { get { return _contextAccessor ?? throw new Exception("Cannot access context accessor before the application is built."); } }
    public static ISessionStore SessionStore { get { return _sessionStore ?? throw new Exception("Cannot access session store before the application is built."); } }
    public static CookieBuilder GetDefaultCookieBuilder(string Name, bool BlockJavaScriptAccess = false, bool ExpireOnBrowserExit = false)
    {
        return new CookieBuilder
        {
            Name = Name,
            Domain = null,
            Expiration = ExpireOnBrowserExit ? null : TimeSpan.FromDays(WebConfig.CookieExpireDays),
            MaxAge = null,
            Path = "/",
            SameSite = SameSiteMode.Lax, //don't do SameSiteMode.Strict or else password reset links from an email inbox to the site will not include the session cookie with them
            HttpOnly = BlockJavaScriptAccess,
            IsEssential = true,
            SecurePolicy = CookieSecurePolicy.SameAsRequest
        };
    }
    public static void Main(string[] args)
    {
        var builder = WebApplication.CreateBuilder(args);
        _configuration = builder.Configuration;
        _environment = builder.Environment;

        var services = builder.Services;

        services.AddControllersWithViews(delegate (MvcOptions options) { }).AddRazorRuntimeCompilation(delegate (MvcRazorRuntimeCompilationOptions options) { });

        services.AddCookiePolicy(delegate (CookiePolicyOptions options)
        {
            //whether user consent for non-essential cookies is needed for a given request.
            //options.ConsentCookie = null;
            options.CheckConsentNeeded = delegate (HttpContext Context) { return false; };
            options.Secure = CookieSecurePolicy.SameAsRequest;
            options.MinimumSameSitePolicy = SameSiteMode.Lax;
            options.HttpOnly = HttpOnlyPolicy.None;
            options.OnAppendCookie = delegate (AppendCookieContext ctx) { };
            options.OnDeleteCookie = delegate (DeleteCookieContext ctx) { };
        });
        services.AddSession(delegate (SessionOptions options)
        {
            //use the build id for the session cookie to avoid the
            //"invalid payload - error unprotecting the session cookie" error
            //see https://stackoverflow.com/questions/55806649/asp-net-core-prevent-session-cookie-conflict-between-same-domain-applications
            //Cookie.Path defaults to Microsoft.AspNetCore.Session.SessionDefaults.CookiePath "/"
            //Cookie.Name defaults to Microsoft.AspNetCore.Session.SessionDefaults.CookieName ".AspNetCore.Session"
            //Cookie.SameSite defaults to SameSiteMode.Lax
            //Cookie.HttpOnly defaults to true
            //Cookie.IsEssential defaults to false
            var Timeout = TimeSpan.FromSeconds(WebConfig.SessionTimeout);
            options.IdleTimeout = Timeout;
            options.IOTimeout = Timeout;
            options.Cookie = GetDefaultCookieBuilder(Defaults.BuildID, true, true);
        });

        services.AddHttpContextAccessor();

        // Add services to the container.
        services.AddControllersWithViews();

        DatabaseContext.SetConnectionString(WebConfig.ConnectionString);

        services.AddScoped(delegate (IServiceProvider serviceProvider)
        {
            var DB = new DatabaseContext(IsolationLevel.Serializable, true);
            ContextAccessor.HttpContext!.Items["Database"] = DB;
            return DB;
        });

        var app = builder.Build();
        _dataProvider = app.Services.GetRequiredService<ITempDataProvider>();
        _razorEngine = app.Services.GetRequiredService<IRazorViewEngine>();
        _contextAccessor = app.Services.GetRequiredService<IHttpContextAccessor>();
        _sessionStore = app.Services.GetRequiredService<ISessionStore>();

        using (var DB = new DatabaseContext(IsolationLevel.Serializable, false))
        {
            DB.Database.Migrate();
        }

        // Configure the HTTP request pipeline.
        if (!app.Environment.IsDevelopment())
        {
            app.UseExceptionHandler("/Home/Error");
        }
        app.UseStaticFiles(new StaticFileOptions
        {
            OnPrepareResponse = delegate (StaticFileResponseContext FileContext)
            {
                var Response = FileContext.Context.Response;
                Response.Headers["Cache-Control"] = "max-age=" + WebConfig.StaticFileCacheSeconds;
            }
        });

        //'before routing' middleware
        app.Use(async delegate (HttpContext Context, Func<Task> Next)
        {
            await Next();
        });

        //'routing' middleware
        app.UseRouting();

        //'after routing' middleware
        app.Use(async delegate (HttpContext Context, Func<Task> Next)
        {
            await Next();
            var DB = Context.Items["Database"] as DatabaseContext;
            if (DB != null)
            {
                await DB.CommitAndDisposeAsync();
            }
        });

        app.UseAuthorization();

        app.MapControllerRoute(name: "default", pattern: "{controller=Home}/{action=Index}/{id?}");

        app.MapFallbackToController(action: "NotFound", controller: "Home");

        app.Run();
    }
}