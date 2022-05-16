using System.Web;
using System.Collections.ObjectModel;
using System.Diagnostics;
using System.Text;
using System.Text.RegularExpressions;
public interface IMarkupElement
{
    public string TagOuterHTML { get; }
    public string TagName { get; }
    public int Number { get; }
    public int Position { get; }
    public bool IsStub { get; }
    public bool IsOpener { get; }
    public bool IsCloser { get; }
    public IMarkupElement? Parent { get; }
    public ReadOnlyDictionary<string, string> Attributes { get; }
}
public sealed class MarkupReader
{
    private sealed class Element : IMarkupElement
    {
        public Element(string TagOuterHTML, string TagName, int Number, int Position, bool IsStub, bool IsOpener, bool IsCloser)
        {
            this.TagOuterHTML = TagOuterHTML;
            this.TagName = TagName;
            this.Number = Number;
            this.Position = Position;
            this.IsStub = IsStub;
            this.IsOpener = IsOpener;
            this.IsCloser = IsCloser;
            this._attributes = new(delegate ()
            {
                var TheDictionary = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);
                var AttributeMatches = AttributeRegex.Matches(TagOuterHTML);
                foreach (Match TheMatch in AttributeMatches)
                {
                    var Key = TheMatch.Groups[1].Value;
                    var Val = HttpUtility.HtmlDecode(TheMatch.Groups[2].Value);
                    TheDictionary.Add(Key, Val);
                }
                return new(TheDictionary);
            });
        }
        public string TagOuterHTML { get; set; }
        public string TagName { get; set; }
        public int Number { get; set; }
        public int Position { get; set; }
        public bool IsStub { get; set; }
        public bool IsOpener { get; set; }
        public bool IsCloser { get; set; }
        public IMarkupElement? Parent { get; set; }
        public Element? Opener { get; set; }
        public Element? Closer { get; set; }
        public int SkipCount { get; set; }
        private static readonly Regex AttributeRegex = new(@"(?:(?!^)\G|\s)([\p{L}0-9_-]+)\s*=\s*(?:""([^""]*)""|'([^']*)')", RegexOptions.IgnoreCase | RegexOptions.Compiled);
        private Lazy<ReadOnlyDictionary<string, string>> _attributes;
        public ReadOnlyDictionary<string, string> Attributes { get { return _attributes.Value; } }
    }
    private static readonly ReadOnlyCollection<IMarkupElement> EmptyList = new List<IMarkupElement>().AsReadOnly();
    private readonly ReadOnlyCollection<IMarkupElement> ReadOnlyMatchList;
    private readonly Dictionary<string, List<IMarkupElement>> MatchListDict = new(StringComparer.OrdinalIgnoreCase);
    public ReadOnlyCollection<IMarkupElement> GetTagsByName(string TagName, string? ParentTagName1 = null, string? ParentTagName2 = null)
    {
        TagName = TagName ?? throw new ArgumentNullException(nameof(TagName));
        if (ParentTagName1 != null && ParentTagName1.Length == 0) { throw new Exception("ParentTagName1 cannot be an empty string"); }
        if (ParentTagName2 != null && ParentTagName2.Length == 0) { throw new Exception("ParentTagName2 cannot be an empty string"); }
        if (MatchListDict.TryGetValue(TagName, out var TheList))
        {
            if (ParentTagName1 != null && ParentTagName2 != null)
            {
                TheList = TheList.Where(delegate (IMarkupElement x)
                {
                    var IsParent1Match = string.Equals(x.Parent?.TagName, ParentTagName1, StringComparison.OrdinalIgnoreCase);
                    var IsParent2Match = string.Equals(x.Parent?.Parent?.TagName, ParentTagName2, StringComparison.OrdinalIgnoreCase);
                    return IsParent1Match && IsParent2Match;
                }).ToList();
            }
            else if (ParentTagName1 != null) { TheList = TheList.Where(x => string.Equals(x.Parent?.TagName, ParentTagName1, StringComparison.OrdinalIgnoreCase)).ToList(); }
            else if (ParentTagName2 != null) { TheList = TheList.Where(x => string.Equals(x.Parent?.Parent?.TagName, ParentTagName2, StringComparison.OrdinalIgnoreCase)).ToList(); }
            return TheList.AsReadOnly();
        }
        else { return EmptyList; }
    }
    public ReadOnlyCollection<IMarkupElement> GetAllTags() { return ReadOnlyMatchList; }
    private static readonly Regex ExtractTagNameRegex = new(@"^</?([^\s>]+).*", RegexOptions.IgnoreCase | RegexOptions.Compiled);
    private static string GetTagNameFromOuterHTML(string OuterHTML) { return ExtractTagNameRegex.Replace(OuterHTML, "$1").ToLower(); }
    private static readonly Regex IsStubRegex = new(@"^<(?:\?|!--)|/>$", RegexOptions.Compiled);
    private static void GetTagType(string OuterHTML, out bool IsStub, out bool IsOpener, out bool IsCloser)
    {
        IsStub = IsStubRegex.IsMatch(OuterHTML);
        IsCloser = !IsStub && OuterHTML.IndexOf("</") == 0;
        IsOpener = !IsStub && !IsCloser;
    }
    private MarkupReader(MarkupType TheMarkupType, string input)
    {
        List<IMarkupElement> TempMatchList = new();
        var IsHTML = TheMarkupType == MarkupType.HTML;
        List<Element> WaitingOnCloserList = new();
        var Matches = (IsHTML ? HTMLTagsRegex : XMLTagsRegex).Value.Matches(input);
        Func<Match, string> GetTagOuterHTML = IsHTML switch
        {
            true => delegate (Match TheMatch)
            {
                var ScriptCapture = TheMatch.Groups[1].Value;
                var StyleCapture = TheMatch.Groups[2].Value;
                return !string.IsNullOrEmpty(ScriptCapture) ? ScriptCapture : (!string.IsNullOrEmpty(StyleCapture) ? StyleCapture : TheMatch.Value);
            }
            ,
            false => delegate (Match TheMatch) { return TheMatch.Value; }
        };
        foreach (Match TheMatch in Matches)
        {
            var TagOuterHTML = GetTagOuterHTML(TheMatch);
            var TagName = GetTagNameFromOuterHTML(TagOuterHTML);
            GetTagType(TagOuterHTML, out var IsStub, out var IsOpener, out var IsCloser);
            var TheTuple = new Element(TagOuterHTML, TagName, TempMatchList.Count, TheMatch.Index, IsStub, IsOpener, IsCloser);
            if (IsCloser)
            {
                Element? Opener = null;
                var WaitListRemovalCount = -1;
                for (var i = 0; i < WaitingOnCloserList.Count; i++)
                {
                    WaitListRemovalCount = i;
                    if (WaitingOnCloserList[i].TagName == TagName)
                    {
                        Opener = WaitingOnCloserList[i];
                        break;
                    }
                }
                if (Opener == null)
                {
                    TheTuple.IsOpener = false;
                    TheTuple.IsCloser = false;
                    TheTuple.IsStub = true;
                }
                else
                {
                    //<add key="StaticFileCacheSeconds" value="259200"> //added to WaitingOnCloserList
                    //  <hey> //added to WaitingOnCloserList, and *NOT* removed when the </add> closer was reached
                    //    <add key="SerializeTransactions" value="yes"> //added to WaitingOnCloserList
                    //  	<text> //added to WaitingOnCloserList, but removed when the </add> closer was reached
                    //      <abc />
                    //    </add>
                    //    </b>
                    //    </text>
                    //  </hey>
                    //</appSettings>
                    WaitingOnCloserList.RemoveRange(0, WaitListRemovalCount + 1);
                    Opener.SkipCount = TheTuple.Number - Opener.Number - 1;
                    TheTuple.Opener = Opener;
                    Opener.Closer = TheTuple;
                    //update all child elements with the proper parent
                    for (var i = Opener.Number + 1; i < TheTuple.Number; i++)
                    {
                        var TheElement = (Element)TempMatchList[i];
                        TheElement.Parent = Opener;
                        if ((TheElement.IsOpener && TheElement.Closer == null) || (TheElement.IsCloser && TheElement.Opener == null))
                        {
                            TheElement.IsOpener = false;
                            TheElement.IsCloser = false;
                            TheElement.IsStub = true;
                        }
                        i += TheElement.SkipCount;
                    }
                }
            }
            else if (IsOpener) { WaitingOnCloserList.Insert(0, TheTuple); }
            TempMatchList.Add(TheTuple);
            if (MatchListDict.TryGetValue(TagName, out var MatchResult)) { MatchResult.Add(TheTuple); }
            else { MatchListDict[TagName] = new() { TheTuple }; }
        }
        WaitingOnCloserList.ForEach(delegate (Element TheElement)
        {
            TheElement.IsOpener = false;
            TheElement.IsCloser = false;
            TheElement.IsStub = true;
        });
        ReadOnlyMatchList = TempMatchList.AsReadOnly();
    }
    private enum MarkupType { XML, HTML }
    public static MarkupReader ParseXML(string input, out double ParseSeconds)
    {
        var ParseTimer = Stopwatch.StartNew();
        var Instance = new MarkupReader(MarkupType.XML, input);
        ParseSeconds = ParseTimer.Elapsed.TotalSeconds;
        return Instance;
    }
    public static MarkupReader ParseHTML(string input, out double ParseSeconds)
    {
        var ParseTimer = Stopwatch.StartNew();
        var Instance = new MarkupReader(MarkupType.HTML, input);
        ParseSeconds = ParseTimer.Elapsed.TotalSeconds;
        return Instance;
    }
    private static readonly Lazy<Regex> XMLTagsRegex = new(delegate ()
    {
        var Pattern = "";
        Pattern += @"<[^/\s](?!--)[^""'<>/]*(?:(?:""[^""]*""|'[^']*')[^""'<>/]*)*/?>|</[^""'<>/]*(?";
        Pattern += @":(?:""[^""]*""|'[^']*')[^""'<>/]*)*>|<!--(?:[^-]+|(?:-[^-])+|(?:--[^>])+)*-->";
        //File.WriteAllText(Environment.CurrentDirectory + "/pattern.txt", Pattern);
        return new Regex(Pattern, RegexOptions.IgnoreCase | RegexOptions.Singleline | RegexOptions.Compiled);
    });
    private static readonly Lazy<Regex> HTMLTagsRegex = new(delegate ()
    {
        var Pattern = "";
        Pattern += @"(<script(?=[\s>])[^""'<>/]*(?:(?:""[^""]*""|'[^']*')[^""'<>/]*)*>)(?:[^<]+|(?:<[^/])+|(?:</[^s])+|(?:</s[";
        Pattern += @"^c])+|(?:</sc[^r])+|(?:</scr[^i])+|(?:</scri[^p])+|(?:</scrip[^t])+|(?:</script[^\s>])+)*|(<style(?=[\s>]";
        Pattern += @")[^""'<>/]*(?:(?:""[^""]*""|'[^']*')[^""'<>/]*)*>)(?:[^<]+|(?:<[^/])+|(?:</[^s])+|(?:</s[^t])+|(?:</st[^y";
        Pattern += @"])+|(?:</sty[^l])+|(?:</styl[^e])+|(?:</style[^\s>])+)*|<[^/\s](?!--)[^""'<>/]*(?:(?:""[^""]*""|'[^']*')[^";
        Pattern += @"""'<>/]*)*/?>|</[^""'<>/]*(?:(?:""[^""]*""|'[^']*')[^""'<>/]*)*>|<!--(?:[^-]+|(?:-[^-])+|(?:--[^>])+)*-->";
        //File.WriteAllText(Environment.CurrentDirectory + "/pattern.txt", Pattern);
        return new Regex(Pattern, RegexOptions.IgnoreCase | RegexOptions.Singleline | RegexOptions.Compiled);
    });
    //##################################
    //##################################
    //the regex term "[\\s\\u3000-[\\r\\n]]" means all white space minus line breaks
    private static readonly Regex RemoveSpaceLongerThan1CharRegex = new(@"[ \t\u00A0]{2,}", RegexOptions.Compiled);
    //"Threefer" consists of RemoveSpaceBeforeTagCloseChar, RemoveSpaceNextToBreak, RemoveSpaceBetweenRowsCols
    private static readonly Regex ThreeferRegex = new(@"\s+(?=/?>)|[ \t\u00A0]+(?=[\r\n])|(?<=[\r\n])[ \t\u00A0]+|(?<=</t[rhd]>)\s+(?=<t[rhd])", RegexOptions.IgnoreCase | RegexOptions.Compiled);
    private static readonly Lazy<Regex> RemoveSpacesBetweenTagAndInnerHTMLRegex = new(delegate ()
    {
        var Pattern = "";
        Pattern += @"(<script(?=[\s>])[^""'<>/]*(?:(?:""[^""]*""|'[^']*')[^""'<>/]*)*>)\s*((?:[^<]+|(?:<[^/])+|(?:</[^s";
        Pattern += @"])+|(?:</s[^c])+|(?:</sc[^r])+|(?:</scr[^i])+|(?:</scri[^p])+|(?:</scrip[^t])+|(?:</script[^\s>])+";
        Pattern += @")*)\s*(</script(?=[\s>])[^""'<>/]*(?:(?:""[^""]*""|'[^']*')[^""'<>/]*)*>)|(<style(?=[\s>])[^""'<>/";
        Pattern += @"]*(?:(?:""[^""]*""|'[^']*')[^""'<>/]*)*>)\s*((?:[^<]+|(?:<[^/])+|(?:</[^s])+|(?:</s[^t])+|(?:</st[";
        Pattern += @"^y])+|(?:</sty[^l])+|(?:</styl[^e])+|(?:</style[^\s>])+)*)\s*(</style(?=[\s>])[^""'<>/]*(?:(?:""[^";
        Pattern += @"""]*""|'[^']*')[^""'<>/]*)*>)|(<[^/\s](?!--)[^""'<>/]*(?:(?:""[^""]*""|'[^']*')[^""'<>/]*)*/?>)\s*|";
        Pattern += @"\s*(</[^""'<>/]*(?:(?:""[^""]*""|'[^']*')[^""'<>/]*)*>)|(<!--(?:[^-]+|(?:-[^-])+|(?:--[^>])+)*-->)";
        //File.WriteAllText(Environment.CurrentDirectory + "/pattern.txt", Pattern);
        return new Regex(Pattern, RegexOptions.IgnoreCase | RegexOptions.Singleline | RegexOptions.Compiled);
    });
    public static string CleanHTML(string input)
    {
        input = RemoveSpacesBetweenTagAndInnerHTMLRegex.Value.Replace(input, "$1$2$3$4$5$6$7$8$9");
        input = RemoveSpaceLongerThan1CharRegex.Replace(input, " ");
        input = ThreeferRegex.Replace(input, "");
        return input;
    }
}