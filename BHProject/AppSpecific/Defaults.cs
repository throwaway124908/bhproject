using System;
using System.Web;
using System.Collections;
using System.Collections.Generic;
using System.Collections.Specialized;
using System.Collections.Concurrent;
using System.Diagnostics;
using System.Linq;
using System.Configuration;
using System.Security.Cryptography.X509Certificates;
using System.Net;
using System.IO;
using System.Text;
using System.Text.RegularExpressions;
using System.Globalization;
using System.Reflection;
using Microsoft.AspNetCore.Html;
using Microsoft.AspNetCore.Http;

public static class Defaults
{
    static Defaults() { }
    //################################
    public static readonly IDictionary EnvironmentVariables = Environment.GetEnvironmentVariables();
    public static readonly string AppPoolID = (string?)EnvironmentVariables["APP_POOL_ID"] ?? "";
    public static readonly bool IsLocalAppPool = Regex.IsMatch(AppPoolID, "^(?:|IISExpressAppPool)$", RegexOptions.IgnoreCase);
    public static readonly Assembly EntryAssembly = Assembly.GetEntryAssembly() ?? throw new Exception("entry assembly is null");
    public static readonly string BuildID = EntryAssembly.ManifestModule.ModuleVersionId.ToString("N");
}