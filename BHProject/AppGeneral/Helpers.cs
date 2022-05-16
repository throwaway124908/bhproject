using System;
using System.Web;
using System.Collections;
using System.Collections.Generic;
using System.Collections.Specialized;
using System.Diagnostics;
using System.Threading.Tasks;
using System.IO;
using System.Linq;
using System.Configuration;
using System.Security.Cryptography.X509Certificates;
using System.Net;
using System.Text;
using System.Text.RegularExpressions;
using System.Reflection;
using System.Security.Cryptography;
using System.Runtime.CompilerServices;
using System.Globalization;
using Microsoft.AspNetCore.Html;
using Microsoft.AspNetCore.Identity;
using System.IO.Compression;
public static class Helpers
{
    private static readonly Random RNG = new();
    //null dynamic variables do not work with generic methods
    //SomeGenericMethod((dynamic)null) -> The type arguments for method 'SomeGenericMethod<T>(T)' cannot be inferred from the usage. Try specifying the type arguments explicitly.
    //this works, however: SomeGenericMethod<dynamic>((dynamic)null)
    //typeof(dynamic) also does not work
    //######################################################################################################
    public static bool empty<T>(T? val)
    {
        //this method returns true if val is null, an empty string, or an IEnumerable with no elements
        switch (val)
        {
            case null: { return true; }
            case string x: { return x == ""; }
            case ICollection x: { return x.Count == 0; }
            case IEnumerable<T> x:
                {
                    if (x.TryGetNonEnumeratedCount(out var Count)) { return Count == 0; }
                    //foreach (var _ in x) { return false; }
                    throw new Exception("could not find a fast way to check if IEnumerable<" + typeof(T).Name + "> is empty (extension method TryGetNonEnumeratedCount() returned false)");
                }
            case IEnumerable: { throw new Exception("a non-generic IEnumerable cannot be checked for emptiness"); }
            default: { return false; }
        }
    }
    //######################################################################################################
    //######################################################################################################
    //######################################################################################################
    public static Type[] GetTypesInNamespace(Assembly TheAssembly, string Namespace)
    {
        //this method takes an assembly and namespace and returns an array of all the types/classes defined within it
        return TheAssembly.GetTypes().Where(x => x.Namespace == Namespace).ToArray();
    }
    public static Type[] GetAssignableTypes(Assembly TheAssembly, Type ParentType)
    {
        //this method takes an assembly and "parent type" and returns an array of all types within the assembly that can be casted to the "parent type"
        return TheAssembly.GetTypes().Where(x => ParentType.IsAssignableFrom(x) && x != ParentType).ToArray();
    }
    public static double ProcessTimer(Action Process)
    {
        var AttrType = typeof(AsyncStateMachineAttribute);
        Process = Process.Method.IsDefined(AttrType) ? throw new Exception("async delegate not allowed") : Process;
        var Timer = Stopwatch.StartNew();
        Process();
        return Timer.Elapsed.TotalSeconds;
    }
    public static async Task<double> ProcessTimerAsync(Func<Task> Process)
    {
        var Timer = Stopwatch.StartNew();
        await Process();
        return Timer.Elapsed.TotalSeconds;
    }
    public static string FixDir(string path)
    {
        //this method takes a file path, directory, or url and removes duplicate slashes and any trailing slashes,
        //and replaces all back slashes (\) with forward slashes (/)
        path = Regex.Replace(path, "[\\\\/]+", "/");
        path = Regex.Replace(path, "/$", "");
        return path;
    }
    public static string RemoveComments(string input)
    {
        //use regex to pull out the "tokens" (strings, comments, regular expressions)
        var TokenRegex = new Regex(@"(""(?:[^\\""]|\\.)*"")|('(?:[^\\']|\\.)*')|(/\*(?:(?!\*/).)*\*/)|(//[^\r\n]*)|(([-+/*=<>;,.!%\^&|~[({:?@\r\n])\s*)(/(?![*/])(?:[^\\\/\r\n]|\\[^\r\n])*/[a-zA-Z]*)", RegexOptions.Singleline);
        //omit the comment tokens by replacing with capture groups 1, 2, 5, and 7 to effectively remove the comments
        return TokenRegex.Replace(input, "$1$2$5$7");
    }
    public static string MinifyCSS(string input)
    {
        //remove the comments
        input = RemoveComments(input);
        //remove white space but don't touch strings and spaces between non-symbols (such as in "border-width:5px 0px 0px 5px;")
        input = Regex.Replace(input, "\\G((?:(?<![>;:{},()])\\s(?![>;:{},()])|[^\\s\"']+|\"(?:[^\\\\\"]|\\\\.)*\"|'(?:[^\\\\']|\\\\.)*')*)\\s*((?:(?<![>;:{},()])\\s(?![>;:{},()])|[^\\s\"']+|\"(?:[^\\\\\"]|\\\\.)*(?:\"|$)|'(?:[^\\\\']|\\\\.)*(?:'|$))*)", "$1$2", RegexOptions.Singleline);
        return input.Trim();
    }
    //###############################################################################################################
    //###############################################################################################################
    //###############################################################################################################
    //###############################################################################################################
    private enum FixJSMode { All, Single, Double }
    public static HtmlString FixJSSingle(string? input) { return FixJS(input, FixJSMode.Single); }
    public static HtmlString FixJSDouble(string? input) { return FixJS(input, FixJSMode.Double); }
    public static HtmlString FixJS(string? input) { return FixJS(input, FixJSMode.All); }
    public static HtmlString FixJSSingle(HtmlString? input) { return FixJSSingle(input?.Value); }
    public static HtmlString FixJSDouble(HtmlString? input) { return FixJSDouble(input?.Value); }
    public static HtmlString FixJS(HtmlString? input) { return FixJS(input?.Value); }
    private static HtmlString FixJS(string? input, FixJSMode Mode)
    {
        //this escapes single/double quotes and backslashes for insertion into a JavaScipt string
        var QuoteRegex = Mode switch
        {
            FixJSMode.Single => FixJSSingleRegex.Value,
            FixJSMode.Double => FixJSDoubleRegex.Value,
            _ => FixJSRegex.Value
        };
        input = QuoteRegex.Replace(input ?? "", "\\$1").Replace("\r\n", "\\n").Replace("\r", "\\n").Replace("\n", "\\n");
        return new HtmlString(input);
    }
    private static Lazy<Regex> FixJSSingleRegex = new(delegate () { return new("('|&#39;|&apos;|&#x27;|/(?=script)|\\\\)", RegexOptions.IgnoreCase | RegexOptions.Compiled); });
    private static Lazy<Regex> FixJSDoubleRegex = new(delegate () { return new("(\"|&#34;|&quot;|&#x22;|/(?=script)|\\\\)", RegexOptions.IgnoreCase | RegexOptions.Compiled); });
    private static Lazy<Regex> FixJSRegex = new(delegate () { return new("('|\"|&#39;|&apos;|&#x27;|&#34;|&quot;|&#x22;|/(?=script)|\\\\)", RegexOptions.IgnoreCase | RegexOptions.Compiled); });
    //###############################################################################################################
    //###############################################################################################################
    //###############################################################################################################
    //###############################################################################################################
    public static HtmlString FixHTML(string? input)
    {
        //this escapes HTML characters
        //input ??= "";
        //input = input.Replace("&", "&#38;");
        //input = input.Replace("<", "&#60;");
        //input = input.Replace(">", "&#62;");
        //input = input.Replace("\"", "&#34;");
        //do NOT escape forward slash or it will break BBCode
        //input = input.Replace("/", "&#47;");
        //input = input.Replace("'", "&#39;");
        return new HtmlString(HttpUtility.HtmlEncode(input));
    }
    public static HtmlString FixHTML(HtmlString? input)
    {
        //this escapes HTML characters
        return FixHTML(input?.Value);
    }
    public static string FixSQL(string? input)
    {
        input ??= "";
        input = input.Replace("\\", "\\\\");
        input = input.Replace("%", "\\%");
        input = input.Replace("'", "''");
        return input;
    }
    public static string FixName(string First, string Middle, string Last, bool LastFirst = false)
    {
        //this method takes a first, middle, and last name and returns a clean presentation of it
        First = (First ?? "").Trim();
        Middle = (Middle ?? "").Trim();
        Last = (Last ?? "").Trim();
        if (LastFirst)
        {
            return empty(Middle) ? Last + ", " + First : Last + ", " + First + " " + Middle.Substring(0, 1) + ".";
        }
        else
        {
            return empty(Middle) ? First + " " + Last : First + " " + Middle.Substring(0, 1) + ". " + Last;
        }
    }
    public static int ToInt(string? input, int Fallback = default)
    {
        return int.TryParse(input, out int result) ? result : Fallback;
    }
    public static long ToLong(string? input, long Fallback = default)
    {
        return long.TryParse(input, out long result) ? result : Fallback;
    }
    public static decimal ToDecimal(string? input, int Fallback = default)
    {
        return decimal.TryParse(input, out decimal result) ? result : Fallback;
    }
    public static bool IntIsEven(int input)
    {
        return input % 2 == 0;
    }
    public static bool IntIsOdd(int input)
    {
        return !IntIsEven(input);
    }
    public static string AddCommas(string input)
    {
        //this adds the thousands comma to a number (e.g. 1000 becomes 1,000)
        return AddCommas(ToDecimal(input));
    }
    public static string AddCommas(decimal input)
    {
        //this adds the thousands comma to a number (e.g. 1000 becomes 1,000)
        var decimals = Regex.Replace(input + "", "^[^.]*\\.?", "").Length;
        return String.Format("{0:n" + decimals + "}", input);
    }
    public static string FixPrice(string input)
    {
        //this takes a number and rounds it to two decimal places
        //if the decimal portion of the number ends up being less than two digits then zeroes are added to the right of the decimal point
        //finally, if the number is less than one it adds a zero to the left of the decimal point
        //e.g. ".5232" becomes "0.52" and "32.229001" becomes "32.23"
        if (!decimal.TryParse(input, out decimal value))
        {
            throw new Exception("FixPrice error: input must be numeric");
        }
        return FixPrice(value);
    }
    public static string FixPrice(decimal input)
    {
        //this takes a number and rounds it to two decimal places
        //if the decimal portion of the number ends up being less than two digits then zeroes are added to the right of the decimal point
        //finally, if the number is less than one it adds a zero to the left of the decimal point
        //e.g. ".5232" becomes "0.52" and "32.229001" becomes "32.23"
        var str = Math.Round(input, 2, MidpointRounding.AwayFromZero).ToString();
        if (Regex.Match(str, "^[0-9]+$").Success) { str += ".00"; }
        else
        {
            if (Regex.Match(str, @"^\.").Success) { str = "0" + str; }
            if (Regex.Match(str, @"\.[0-9]$").Success) { str += "0"; }
        }
        return AddCommas(str);
    }
    public static bool IsInteger(decimal input)
    {
        //this method returns true if the decimal is a whole number
        return Math.Floor(input) == input;
    }
    public static int RandomInt()
    {
        //this method returns a random integer between two numbers (inclusive of the two numbers)
        return RandomInt(1000000000, 2147483647);
    }
    public static int RandomInt(int min, int max)
    {
        //this method returns a random integer between two numbers
        //normally Random.Next() is exclusive max (if min is 1 and max is 2, you will only get 1)
        //so subtract 1 from the min, get a random number, and add 1 to the result to make it inclusive
        return RNG.Next(min - 1, max) + 1;
    }
    public static bool IsDirectory(string path)
    {
        //this method returns true if the given path is an actual directory (it exists and is not a file)
        return Directory.Exists(path);
    }
    public static bool IsFile(string path)
    {
        //this method returns true if the given path is an actual file (it exists and is not a directory)
        return File.Exists(path);
    }
    //######################################################################################################
    //######################################################################################################
    public static T? Random<T>(ICollection<T?>? TheCollection)
    {
        return Random(TheCollection, out _);
    }
    public static T? Random<T>(ICollection<T?>? TheCollection, out int Index)
    {
        return Random(TheCollection, null, out Index);
    }
    public static T? Random<T>(ICollection<T?>? TheCollection, IEnumerable<T?>? IgnoreElements, out int Index)
    {
        if (TheCollection == null) { throw new Exception("collection cannot be null"); }
        if (TheCollection.Count == 0) { throw new Exception("collection cannot be empty"); }
        if (!empty(IgnoreElements))
        {
            TheCollection = new List<T?>(TheCollection);
            ((List<T>)TheCollection).RemoveAll(x => IgnoreElements!.Contains(x));
        }
        Index = RNG.Next(TheCollection.Count);
        return TheCollection.ElementAt(Index);
    }
    public static T? RandomOrDefault<T>(ICollection<T?>? TheCollection)
    {
        return RandomOrDefault(TheCollection, out _);
    }
    public static T? RandomOrDefault<T>(ICollection<T?>? TheCollection, out int Index)
    {
        return Random(TheCollection, null, out Index);
    }
    public static T? RandomOrDefault<T>(ICollection<T?>? TheCollection, IEnumerable<T?>? IgnoreElements, out int Index)
    {
        if (TheCollection == null) { throw new Exception("collection cannot be null"); }
        if (TheCollection.Count == 0) { Index = -1; return default; }
        if (!empty(IgnoreElements))
        {
            TheCollection = new List<T?>(TheCollection);
            ((List<T?>)TheCollection).RemoveAll(x => IgnoreElements!.Contains(x));
        }
        Index = RNG.Next(TheCollection.Count);
        return TheCollection.ElementAt(Index);
    }
    public static T?[] RandomSubset<T>(T?[]? TheArray, int Length, bool UniqueIndexes = false, IEnumerable<T?>? IgnoreElements = null)
    {
        if (TheArray == null) { throw new Exception("collection cannot be null"); }
        if (TheArray.Length == 0) { throw new Exception("collection cannot be empty"); }
        if (Length < 0) { throw new Exception("length cannot be negative"); }
        if (Length == 0) { return Array.Empty<T?>(); }
        return CreateRandomSubsetCollection(TheArray, Length, UniqueIndexes, IgnoreElements);
    }
    public static T?[] RandomSubsetOrDefault<T>(T?[]? TheArray, int Length, bool UniqueIndexes = false, IEnumerable<T?>? IgnoreElements = null)
    {
        if (TheArray == null) { throw new Exception("collection cannot be null"); }
        if (Length < 0) { throw new Exception("length cannot be negative"); }
        if (Length == 0) { return Array.Empty<T?>(); }
        return CreateRandomSubsetCollection(TheArray, Length, UniqueIndexes, IgnoreElements);
    }
    public static List<T?> RandomSubset<T>(List<T?>? TheCollection, int Length, bool UniqueIndexes = false, IEnumerable<T?>? IgnoreElements = null)
    {
        if (TheCollection == null) { throw new Exception("collection cannot be null"); }
        if (TheCollection.Count == 0) { throw new Exception("collection cannot be empty"); }
        if (Length < 0) { throw new Exception("length cannot be negative"); }
        if (Length == 0) { return new List<T?>(); }
        return CreateRandomSubsetCollection(TheCollection, Length, UniqueIndexes, IgnoreElements);
    }
    public static List<T?> RandomSubsetOrDefault<T>(List<T?>? TheCollection, int Length, bool UniqueIndexes = false, IEnumerable<T?>? IgnoreElements = null)
    {
        if (TheCollection == null) { throw new Exception("collection cannot be null"); }
        if (Length < 0) { throw new Exception("length cannot be negative"); }
        if (Length == 0) { return new List<T?>(); }
        return CreateRandomSubsetCollection(TheCollection, Length, UniqueIndexes, IgnoreElements);
    }
    private static T1 CreateRandomSubsetCollection<T1, T2>(T1 TheCollection, int Length, bool UniqueIndexes, IEnumerable<T2?>? IgnoreElements) where T1 : ICollection<T2?>
    {
        var T1Type = typeof(T1);
        if (!T1Type.IsArray && T1Type != typeof(List<T2?>)) { throw new Exception("collection must be an array or List"); }
        ICollection<T2?> BoxedCollection = TheCollection;
        ICollection<T2?> TempList;
        if (!empty(IgnoreElements))
        {
            BoxedCollection = TheCollection.ToList();
            ((List<T2>)BoxedCollection).RemoveAll(x => IgnoreElements!.Contains(x));
        }
        if (UniqueIndexes)
        {
            TempList = new List<T2?>();
            var AvailableIndexes = Enumerable.Range(0, BoxedCollection.Count).ToList();
            for (var i = 0; i < Length; i++)
            {
                if (AvailableIndexes.Count == 0) { break; }
                else
                {
                    var RandomIndex = Random(AvailableIndexes, out var Index);
                    AvailableIndexes.RemoveAt(Index);
                    TempList.Add(BoxedCollection.ElementAt(RandomIndex));
                }
            }
        }
        else
        {
            TempList = new List<T2?>(BoxedCollection.Count);
            for (var i = 0; i < Length; i++) { TempList.Add(Random(BoxedCollection)); }
        }
        return (T1)(T1Type.IsArray ? TempList.ToArray() : TempList);
    }
    //######################################################################################################
    //######################################################################################################
    public static string[] ArrayToUpper(string[] arr)
    {
        //this method clones a string array and makes all the elements uppercase
        return Array.ConvertAll((string[])arr.Clone(), val => val.ToUpper());
    }
    public static string[] ArrayToLower(string[] arr)
    {
        //this method clones a string array and makes all the elements lowercase
        return Array.ConvertAll((string[])arr.Clone(), val => val.ToLower());
    }
    public static string Truncate(string? input, int length)
    {
        input ??= "";
        return (input.Length > length) ? (input.Substring(0, length).Trim() + "...") : input;
    }
    //############################################
    private static readonly Regex MatchHorizontalWhiteSpaceRegex = new(@"[ \t\u00A0]+", RegexOptions.Compiled);
    private static readonly Regex MatchAllWhiteSpaceRegex = new(@"\s+", RegexOptions.Compiled);
    private static readonly Regex MatchSpaceNextToLineBreaksRegex = new(@"[ \t\u00A0]+(?=[\r\n])|(?<=[\r\n])[ \t\u00A0]+", RegexOptions.Compiled);
    public static string clean(string? str, bool remove_breaks = false)
    {
        //this method takes a string and removes double spaces, removes spaces next to line breaks, trims white space from the beginning and end, and optionally removes line breaks
        str ??= "";
        //c# regex doesn't support \h for horizontal whitespace so use character class subtraction
        //see https://stackoverflow.com/questions/3583111/regular-expression-find-spaces-tabs-space-but-not-newlines
        //UPDATE 5/3/2021: don't do character class subtraction because it's slow
        //remove double spaces
        str = (remove_breaks ? MatchAllWhiteSpaceRegex : MatchHorizontalWhiteSpaceRegex).Replace(str, " ");
        //remove spaces next to line breaks
        str = MatchSpaceNextToLineBreaksRegex.Replace(str, "");
        //remove spaces at beginning and end
        str = str.Trim();
        return str;
    }
    //############################################
    public static string encodeURIComponent(string? str)
    {
        //this method takes a string and escapes characters for use in a URI
        return string.IsNullOrEmpty(str) ? "" : Uri.EscapeDataString(str);
    }
    public static string decodeURIComponent(string? str)
    {
        //this method takes a string and undoes URI encoding
        return string.IsNullOrEmpty(str) ? "" : Uri.UnescapeDataString(str.Replace("+", " "));
    }
    public static string? Base64Encode(string? plainText)
    {
        //this method takes a string and encodes it into a Base64 string
        return string.IsNullOrEmpty(plainText) ? null : Convert.ToBase64String(Encoding.UTF8.GetBytes(plainText));
    }
    public static string? Base64Encode(byte[]? bytes)
    {
        //this method takes a byte array and encodes it into a Base64 string
        return empty(bytes) ? null : Convert.ToBase64String(bytes!);
    }
    public static string? Base64DecodeToString(string? base64EncodedData)
    {
        //this method takes a Base64 string and decodes it to a string
        return string.IsNullOrEmpty(base64EncodedData) ? null : Encoding.UTF8.GetString(Convert.FromBase64String(base64EncodedData));
    }
    public static byte[]? Base64DecodeToBytes(string? base64EncodedData)
    {
        //this method takes a Base64 string and decodes it to a byte array
        return string.IsNullOrEmpty(base64EncodedData) ? null : Convert.FromBase64String(base64EncodedData);
    }
    public static NameValueCollection QueryStringToCollection(string str)
    {
        //this method takes a query string (e.g. color=red&size=13&shape=round) and turns it into a NameValueCollection
        str = Regex.Replace(str, "^[?&]+", "");
        var Collection = new NameValueCollection();
        var Params = str.Split('&');
        string[] Pair;
        for (var i = 0; i < Params.Length; i++)
        {
            Pair = Params[i].Split('=');
            if (Pair.Length == 2 && !String.IsNullOrEmpty(Pair[0]))
            {
                Collection[decodeURIComponent(Pair[0])] = decodeURIComponent(Pair[1]);
            }
        }
        return Collection;
    }
    public static byte[] FileToByteArray(string FilePath)
    {
        //this method takes a file path and returns a byte array of the file
        return File.ReadAllBytes(FilePath);
    }
    public static X509Certificate2? GetCertFromPFX(byte[] PFX_ByteArr, string PFX_Password, int PFX_Index = -1)
    {
        //this method takes the byte array of a .PFX file and the file's password, and returns the certificate at the provided designated PFX_Index
        //if no index is provided, the entire .PFX file is treated as the certificate and is returned
        if (empty(PFX_ByteArr))
        {
            return null;
        }
        if (PFX_Index >= 0)
        {
            var collection = new X509Certificate2Collection();
            if (empty(PFX_Password))
            {
                collection.Import(PFX_ByteArr);
            }
            else
            {
                collection.Import(PFX_ByteArr, PFX_Password, X509KeyStorageFlags.MachineKeySet | X509KeyStorageFlags.PersistKeySet | X509KeyStorageFlags.Exportable);
            }
            return collection[PFX_Index];
        }
        else
        {
            if (empty(PFX_Password))
            {
                return new X509Certificate2(PFX_ByteArr);
            }
            else
            {
                return new X509Certificate2(PFX_ByteArr, PFX_Password, X509KeyStorageFlags.MachineKeySet | X509KeyStorageFlags.PersistKeySet | X509KeyStorageFlags.Exportable);
            }
        }
    }
    public static bool TestAuthorizationHeader(string AuthorizationHeader, string Username, string Password)
    {
        //this method takes the "Authorization" header (Request.Headers["Authorization"]) returned from a client (assuming they were sent a 401 and WWW-Authenticate header),
        //and returns true if the credentials they supplied match the Username and Password
        if (AuthorizationHeader != null && AuthorizationHeader.StartsWith("Basic"))
        {
            var encodedUsernamePassword = AuthorizationHeader.Substring("Basic ".Length).Trim();
            var encoding = Encoding.GetEncoding("iso-8859-1");
            var usernamePassword = encoding.GetString(Convert.FromBase64String(encodedUsernamePassword));
            var seperatorIndex = usernamePassword.IndexOf(":");
            var username = usernamePassword.Substring(0, seperatorIndex);
            var password = usernamePassword.Substring(seperatorIndex + 1);
            if (username == Username && password == Password) { return true; }
        }
        return false;
    }
    public static string EncodeComma(string str)
    {
        //this method encodes a comma for use in CSV strings
        return (str ?? "").Replace("@", "@_").Replace(",", "@-");
    }
    public static string DecodeComma(string str)
    {
        //this method decodes commas that were encoded in CSV strings
        return (str ?? "").Replace("@-", ",").Replace("@_", "@");
    }
    //######################################################################################################
    //######################################################################################################
    public static byte[] ZipToBytes(byte[] bytes, out int UncompressedBytes, out int CompressedBytes)
    {
        //this method takes a byte array and GZip compresses it
        //it also returns the size before and after compression via out parameters
        UncompressedBytes = bytes.Length;
        var Compressed = ZipToBytes(bytes);
        CompressedBytes = Compressed.Length;
        return Compressed;
    }
    public static byte[] ZipToBytes(byte[] data)
    {
        //this method takes a byte array and GZip compresses it
        using (var compressedStream = new MemoryStream())
        {
            using (var zipStream = new GZipStream(compressedStream, CompressionMode.Compress))
            {
                zipStream.Write(data, 0, data.Length);
                return compressedStream.ToArray();
            }
        }
    }
    public static byte[] UnzipToBytes(byte[] data)
    {
        //this method takes a GZip-compressed byte array and decompresses it
        using (var compressedStream = new MemoryStream(data))
        {
            using (var zipStream = new GZipStream(compressedStream, CompressionMode.Decompress))
            {
                using (var resultStream = new MemoryStream())
                {
                    zipStream.CopyTo(resultStream);
                    return resultStream.ToArray();
                }
            }
        }
    }
    public static string BBCode(string? input, bool ConvertBreaks = true)
    {
        if (string.IsNullOrWhiteSpace(input)) { return ""; }
        Match TheMatch;
        //escape all existing @-symbols
        input = (input ?? "").Replace("@", "@_");
        //escape all \[
        input = Regex.Replace(input, @"\G(\\[^\[]|[^\\]*)\\[\[]", "$1@a");
        //escape all \]
        input = Regex.Replace(input, @"\G(\\[^\]]|[^\\]*)\\[\]]", "$1@b");
        //escape html characters
        //the html escape method used here MUST NOT escape forward slashes or square brackets (/, [, ])
        input = FixHTML(input).Value;
        //###################################
        var FontSizeMap = new Dictionary<string, int>
            {
                {"1", 20},
                {"2", 40},
                {"3", 60},
                {"4", 80},
                {"5", 100},
                {"6", 150},
                {"7", 220},
                {"8", 310},
                {"9", 420}
            };
        //###################################
        var c = 0;
        string Key;
        var ElemDictionary = new StringDictionary();
        var PatternArr = new string[]{
                @"\[[ \t\u00A0]*b[ \t\u00A0]*\]([^\[\]]*)\[/[ \t\u00A0]*b[ \t\u00A0]*\]",
                @"\[[ \t\u00A0]*i[ \t\u00A0]*\]([^\[\]]*)\[/[ \t\u00A0]*i[ \t\u00A0]*\]",
                @"\[[ \t\u00A0]*u[ \t\u00A0]*\]([^\[\]]*)\[/[ \t\u00A0]*u[ \t\u00A0]*\]",
                @"\[[ \t\u00A0]*mono[ \t\u00A0]*\]([^\[\]]*)\[/[ \t\u00A0]*mono[ \t\u00A0]*\]",
                @"\[[ \t\u00A0]*line[ \t\u00A0]*\]",
                @"\[[ \t\u00A0]*color[ \t\u00A0]*=[ \t\u00A0]*#?([a-fA-F0-9]{6})[ \t\u00A0]*\]([^\[\]]*)\[/[ \t\u00A0]*color[ \t\u00A0]*\]",
                @"\[[ \t\u00A0]*size[ \t\u00A0]*=[ \t\u00A0]*([0-9]+)[ \t\u00A0]*\]([^\[\]]*)\[/[ \t\u00A0]*size[ \t\u00A0]*\]",
                @"\[[ \t\u00A0]*s[ \t\u00A0]*\]([^\[\]]*)\[/[ \t\u00A0]*s[ \t\u00A0]*\]",
                @"\[[ \t\u00A0]*url[ \t\u00A0]*(?:=([^\[\]]*))?[ \t\u00A0]*\]([^\[\]]*)\[/[ \t\u00A0]*url[ \t\u00A0]*\]"
            };
        var TagRegex = new Regex(string.Join("|", PatternArr), RegexOptions.Singleline | RegexOptions.IgnoreCase);
        while ((TheMatch = TagRegex.Match(input!)).Success)
        {
            //Console.WriteLine(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> BEFORE: " + input + ", TheMatch.Value: " + TheMatch.Value);
            var BoldInner = TheMatch.Groups[1].Value;
            var ItalicInner = TheMatch.Groups[2].Value;
            var UnderlineInner = TheMatch.Groups[3].Value;
            var MonoInner = TheMatch.Groups[4].Value;
            var ColorCode = TheMatch.Groups[5].Value;
            var ColorInner = TheMatch.Groups[6].Value;
            var SizeCode = TheMatch.Groups[7].Value;
            var SizeInner = TheMatch.Groups[8].Value;
            var StrikeInner = TheMatch.Groups[9].Value;
            var UrlCode = TheMatch.Groups[10].Value;
            var UrlInner = TheMatch.Groups[11].Value;
            var Value = "";
            //############################
            if (Regex.IsMatch(TheMatch.Value, @"\[[ \t\u00A0]*b[ \t\u00A0]*\]", RegexOptions.IgnoreCase))
            {
                Value = "<b>" + BoldInner + "</b>";
            }
            else if (Regex.IsMatch(TheMatch.Value, @"\[[ \t\u00A0]*i[ \t\u00A0]*\]", RegexOptions.IgnoreCase))
            {
                Value = "<i>" + ItalicInner + "</i>";
            }
            else if (Regex.IsMatch(TheMatch.Value, @"\[[ \t\u00A0]*u[ \t\u00A0]*\]", RegexOptions.IgnoreCase))
            {
                Value = "<u>" + UnderlineInner + "</u>";
            }
            else if (Regex.IsMatch(TheMatch.Value, @"\[[ \t\u00A0]*mono[ \t\u00A0]*\]", RegexOptions.IgnoreCase))
            {
                Value = "<span class=\"monospace\">" + MonoInner + "</span>";
            }
            else if (Regex.IsMatch(TheMatch.Value, @"\[[ \t\u00A0]*line[ \t\u00A0]*\]", RegexOptions.IgnoreCase))
            {
                Value = "";
            }
            else if (Regex.IsMatch(TheMatch.Value, @"\[[ \t\u00A0]*color[ \t\u00A0]*=", RegexOptions.IgnoreCase))
            {
                Value = "<span style=\"color:#" + ColorCode + ";\">" + ColorInner + "</span>";
            }
            else if (Regex.IsMatch(TheMatch.Value, @"\[[ \t\u00A0]*size[ \t\u00A0]*=", RegexOptions.IgnoreCase))
            {
                Value = "<span style=\"font-size:" + (FontSizeMap.TryGetValue(SizeCode.TrimStart('0'), out var Result) ? Result : 100) + "%;\">" + SizeInner + "</span>";
            }
            else if (Regex.IsMatch(TheMatch.Value, @"\[[ \t\u00A0]*s[ \t\u00A0]*\]", RegexOptions.IgnoreCase))
            {
                Value = "<s>" + StrikeInner + "</s>";
            }
            else if (Regex.IsMatch(TheMatch.Value, @"\[[ \t\u00A0]*url[ \t\u00A0]*=?", RegexOptions.IgnoreCase))
            {
                var Url = (empty(UrlCode) ? UrlInner : UrlCode).Trim();
                Value = "<a href=\"" + FixHTML(Url) + "\" target=\"_blank\">" + FixHTML(UrlInner) + " <span class=\"icomoon\">&#xeec8;</span></a>";
            }
            //############################
            Key = "@(" + c + ")";
            ElemDictionary.Add(Key, Value);
            input = Regex.Replace(input!, Regex.Escape(TheMatch.Value), Key);
            //Console.WriteLine(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> AFTER: " + input + ", TheMatch.Value: " + TheMatch.Value + ", Escaped: " + Regex.Escape(TheMatch.Value));
            c++;
        }
        var TokenRegex = new Regex(@"@\([0-9]+\)", RegexOptions.Singleline | RegexOptions.IgnoreCase);
        while ((TheMatch = TokenRegex.Match(input!)).Success)
        {
            input = Regex.Replace(input!, Regex.Escape(TheMatch.Value), ElemDictionary[TheMatch.Value]!);
        }
        input = input!.Replace("@a", "[");
        input = input.Replace("@b", "]");
        input = input.Replace("@_", "@");
        return ConvertBreaks ? Regex.Replace(input, @"[\r\n]", "<br/>") : input;
    }
}