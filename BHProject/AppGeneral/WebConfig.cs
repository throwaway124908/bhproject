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
public static class WebConfig
{
    private static readonly Dictionary<string, string> ConfigDictionary = new Func<Dictionary<string, string>>(delegate ()
    {
        var ConfigFileContent = File.ReadAllText(Environment.CurrentDirectory + @"\web.config");
        var TheDictionary = new Dictionary<string, string>();
        var ParseTimer = Stopwatch.StartNew();
        var ParsedXML = MarkupReader.ParseXML(ConfigFileContent, out _);
        var AddElements = ParsedXML.GetTagsByName("add", "appSettings", "configuration");
        foreach (var Element in AddElements)
        {
            var Key = Element.Attributes.TryGetValue("key", out var KeyStr) ? KeyStr : throw new Exception("one or more 'add' elements do not have a 'key' attribute");
            var Val = Element.Attributes.TryGetValue("value", out var ValStr) ? ValStr : throw new Exception("one or more 'add' elements do not have a 'val' attribute");
            TheDictionary.Add(Key, Val);
        }
        Console.WriteLine(">>>>>>>>>>>>>>>>>>>>>>>>>>> web.config Parse Seconds: " + ParseTimer.Elapsed.TotalSeconds);
        return TheDictionary;
    }).Invoke();
    //################################################################################
    //################################################################################
    //################################################################################
    private static readonly Regex BoolValRegex = new(@"^\s*(?:yes|true|1)\s*$", RegexOptions.IgnoreCase | RegexOptions.Compiled);
    private static bool ParseBoolVal(string input) { return BoolValRegex.IsMatch(input); }
    //################################################################################
    //################################################################################
    //################################################################################
    public static readonly string ConnectionString = ConfigDictionary[(Program.WebEnvironment.IsDevelopment() || Defaults.IsLocalAppPool) ? "ConnectionStringDev" : "ConnectionStringProd"];
    public static readonly int StaticFileCacheSeconds = ToInt(ConfigDictionary["StaticFileCacheSeconds"], 0);
    public static readonly int SessionTimeout = ToInt(ConfigDictionary["SessionTimeout"], 0);
    public static readonly int CookieExpireDays = ToInt(ConfigDictionary["CookieExpireDays"], 0);
}