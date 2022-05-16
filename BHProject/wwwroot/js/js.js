const Contoso = (function () {
    let obj = {
        AllWhiteSpaceRegex: /\s+/g,
        NonBreakWhiteSpaceRegex: /(?:(?![\r\n])\s)+/g,

        is_defined: (function () {
            return function (input) {
                return typeof input !== "undefined";
            };
        })(),

        empty: (function () {
            return function (input) {
                return !Contoso.is_defined(input) || input === null || input === "" || input === false || ((Contoso.is_array(input) || Contoso.is_collection(input)) && input.length === 0);
            };
        })(),

        getID: (function () {
            return function (id) {
                return document.getElementById(id);
            };
        })(),

        err: (function () {
            return function (msg) {
                throw new Error(msg);
            };
        })(),

        nvl: (function () {
            return function (input) {
                return (Contoso.is_defined(input) && input != null) ? input.toString() : "";
            };
        })(),

        NewLinesToBR: (function () {
            let LineBreakRegex = /\n/g;
            return function (input) {
                return Contoso.nvl(input).replace(LineBreakRegex, "<br/>");
            };
        })(),

        is_array: (function () {
            return function (input) {
                return Array.isArray(input);
            };
        })(),

        is_collection: (function () {
            return function (input) {
                return HTMLCollection.prototype.isPrototypeOf(input) || NodeList.prototype.isPrototypeOf(input);
            };
        })(),

        is_formdata: (function () {
            return function (input) {
                return Contoso.is_native(FormData) && FormData.prototype.isPrototypeOf(input);
            };
        })(),

        is_boolean: (function () {
            return function (input) {
                return typeof input === "boolean";
            };
        })(),

        is_number: (function () {
            return function (input) {
                return typeof input === "number";
            };
        })(),

        is_integer: (function () {
            return function (value) {
                return Contoso.is_number(value) && (value | 0) === value;
            };
        })(),

        is_string: (function () {
            return function (input) {
                return typeof input === "string";
            };
        })(),

        is_symbol: (function () {
            return function (input) {
                return typeof input === "symbol";
            };
        })(),

        is_function: (function () {
            return function (input) {
                //IE8 and below returns "object" when getting the type of a function, IE9+ returns "function"
                return typeof input === "function";
            };
        })(),

        is_object: (function () {
            return function (input) {
                return typeof input === "object" && input !== null;
            };
        })(),

        is_numeric: (function () {
            let IsNumericRegex = /^-?[0-9]+$|^-?[0-9]*\.[0-9]+$/;
            return function (input) {
                return IsNumericRegex.test(Contoso.nvl(input));
            };
        })(),

        ToInt: (function () {
            return function (input, fallback = null) {
                return Contoso.is_numeric(input) ? parseInt(input) : (Contoso.is_number(fallback) ? parseInt(fallback) : 0);
            };
        })(),

        ToFloat: (function () {
            return function (input, fallback = null) {
                return Contoso.is_numeric(input) ? parseFloat(input) : (Contoso.is_number(fallback) ? parseFloat(fallback) : 0);
            };
        })(),

        is_element: (function () {
            return function (input) {
                return !Contoso.empty(input) && Contoso.is_number(input.nodeType) && input.nodeType === 1 && Contoso.is_native(input.appendChild);
            };
        })(),

        is_native: (function () {
            let IsNativeCodeRegex = /^\s*function\s*[a-z0-9]+\s*\(\s*\)\s*{\s*\[native\s*code]\s*}\s*$/i;
            return function (input) {
                return !Contoso.is_string(input) && IsNativeCodeRegex.test(Contoso.nvl(input));
            };
        })(),

        GetConstructorName: (function () {
            let MatchFunctionRegex = /^\s*function/i;
            let ExtractFunctionNameRegex = /^function\s*([^(\s]+).*/gs;
            return function (input) {
                //normally we could return input.constructor.name
                //but IE (even version 11) doesn't support the "name" property
                //return input.constructor.name;
                if (input == null) {
                    return null;
                } else {
                    let obj = input.constructor;
                    while (obj != null && !MatchFunctionRegex.test(Contoso.nvl(obj))) {
                        obj = obj.constructor;
                    }
                    return (obj == null) ? "" : obj.replace(ExtractFunctionNameRegex, "$1");
                }
            };
        })(),

        NumberIsEven: (function () {
            return function (input) {
                return input % 2 === 0;
            };
        })(),

        NumberIsOdd: (function () {
            return function (input) {
                return !Contoso.NumberIsEven(input);
            };
        })(),

        RandomInt: (function () {
            return function (min = 1000000000, max = 2147483647) {
                min <= max || Contoso.err("RandomInt error: min must be less than or equal to max.");
                return Math.floor((Math.random() * ((max - min) + 1)) + min);
            };
        })(),

        moveChildren: (function () {
            return function (oldParent, newParent) {
                while (oldParent.childNodes.length > 0) {
                    newParent.appendChild(oldParent.childNodes[0]);
                }
            };
        })(),

        ReplaceElementWithHTML: (function () {
            return function (oldElem, outerHTML) {
                oldElem.parentNode != null || Contoso.err("ReplaceElementWithHTML error: oldElem must have a parent node.");
                let parentNode = oldElem.parentNode;
                let nextSibling = oldElem.nextSibling;
                //remove white space (especially line breaks) from the beginning and end of the outerHTML
                //so that text nodes don't accidentally get created
                oldElem.outerHTML = outerHTML.trim();
                return (nextSibling == null) ? parentNode.lastChild : nextSibling.previousSibling;
            };
        })(),

        SetTranslateX: (function () {
            let TranslateXRegex = /translateX\([^)]+\)|none/ig;
            return function (Elem, X) {
                Elem.style.transform = Contoso.clean("translateX(" + X + "px) " + Elem.style.transform.replace(TranslateXRegex, ""));
            };
        })(),

        SetTranslateY: (function () {
            let TranslateYRegex = /translateY\([^)]+\)|none/ig;
            return function (Elem, Y) {
                Elem.style.transform = Contoso.clean("translateX(" + Y + "px) " + Elem.style.transform.replace(TranslateYRegex, ""));
            };
        })(),

        SetScale: (function () {
            let ScaleRegex = /scale\([^)]+\)|none/ig;
            return function (Elem, S) {
                Elem.style.transform = Contoso.clean("scale(" + S + "," + S + ") " + Elem.style.transform.replace(ScaleRegex, ""));
            };
        })(),
        //###############################################################################################################
        //###############################################################################################################
        //###############################################################################################################
        //###############################################################################################################,
        ArrayContains: (function () {
            return function (arr, value, ignoreCase = false) {
                if (ignoreCase) {
                    value = Contoso.is_string(value) ? value.toUpperCase() : value;
                    for (let i = 0; i < arr.length; i++) {
                        if (arr[i] === value || (Contoso.is_string(arr[i]) && arr[i].toUpperCase() === value)) {
                            return true;
                        }
                    }
                    return false;
                } else {
                    return arr.indexOf(value) > -1;
                }
            };
        })(),

        RemoveFromArray: (function () {
            return function (arr, value, ignoreCase = false) {
                if (ignoreCase) {
                    value = Contoso.is_string(value) ? value.toUpperCase() : value;
                    for (let i = 0; i < arr.length; i++) {
                        if (arr[i] === value || (Contoso.is_string(arr[i]) && arr[i].toUpperCase() === value)) {
                            arr.splice(i, 1);
                            i--;
                        }
                    }
                } else {
                    for (let i = 0; i < arr.length; i++) {
                        if (arr[i] === value) {
                            arr.splice(i, 1);
                            i--;
                        }
                    }
                }
            };
        })(),

        ArrayDifference: (function () {
            return function (ArrayToModify, ReferenceArray, ignoreCase = false) {
                for (let i = 0; i < ArrayToModify.length; i++) {
                    if (Contoso.ArrayContains(ReferenceArray, ArrayToModify[i], ignoreCase)) {
                        ArrayToModify.splice(i, 1);
                        i--;
                    }
                }
            };
        })(),

        UniqueArray: (function () {
            return function (arr) {
                let j = {};
                arr.forEach(function (v) {
                    j[v + '::' + typeof v] = v;
                });
                return Object.keys(j).map(function (v) {
                    return j[v];
                });
            };
        })(),
        //###############################################################################################################
        //###############################################################################################################
        //###############################################################################################################
        //###############################################################################################################,

        InDOM: (function () {
            let html = document.getElementsByTagName("html")[0];
            return function (Element) {
                return html.contains(Element);
            };
        })(),

        ElementIsVisible: (function () {
            return function (Elem) {
                while (Elem != null && Elem !== document.body.parentNode.parentNode) {
                    if (!Contoso.InDOM(Elem)) {
                        return false;
                    } else if (Elem.style.display === "none" || Elem.style.visibility === "hidden" || Elem.style.opacity === "0") {
                        return false;
                    } else if (Contoso.GetStyle(Elem, "display") === "none" || Contoso.GetStyle(Elem, "visibility") === "hidden" || Contoso.GetStyle(Elem, "opacity") === "0") {
                        return false;
                    }
                    Elem = Elem.parentNode;
                }
                return Elem != null;
            };
        })(),

        hexToRgb: (function () {
            let shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
            let ResultRegex = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i;
            return function (hex) {
                //a version of hexToRgb() that also parses a shorthand hex triplet such as "#03F"
                //from https://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb
                //Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
                hex = Contoso.nvl(hex).replace(shorthandRegex, function (m, r, g, b) {
                    return r + r + g + g + b + b;
                });
                let result = ResultRegex.exec(hex);
                return (result == null) ? null : {
                    r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16)
                };
            };
        })(),

        preg_quote: (function () {
            let EscapeRegex = /[.?*+^$[\]\\(){}|-]/g;
            return function (str) {
                return Contoso.nvl(str).replace(EscapeRegex, "\\$&");
            };
        })(),

        CollectionToArray: (function () {
            return function (collection) {
                Contoso.is_collection(collection) || Contoso.err("CollectionToArray error: input is not a collection.");
                return Array.prototype.slice.call(collection, 0);
            };
        })(),

        RemoveControlCharacters: (function () {
            let ControlCharRegex = /[\x00-\x09\x0B\x0C\x0E-\x1F\x7F]/ig;
            return function (input) {
                return Contoso.nvl(input).replace(ControlCharRegex, "");
            };
        })(),

        clean: (function () {
            return function (str, remove_breaks = false) {
                //this method takes a string and removes double spaces,
                //trims white space from the beginning and end, and optionally removes line breaks
                str = Contoso.nvl(str).trim();
                str = remove_breaks ? str.replace(Contoso.AllWhiteSpaceRegex, " ") : str.replace(Contoso.NonBreakWhiteSpaceRegex, " ");
                return str;
            };
        })(),

        AddClass: (function () {
            return function (elem, className) {
                if (!Contoso.HasClass(elem, className)) {
                    elem.className = Contoso.clean(elem.className + " " + className);
                }
            };
        })(),

        RemoveClass: (function () {
            return function (elem, className) {
                if (Contoso.HasClass(elem, className)) {
                    let RegexObj = new RegExp("(^|\\s+)" + Contoso.preg_quote(className.replace(Contoso.AllWhiteSpaceRegex, "")) + "(\\s+|$)", "i");
                    elem.className = Contoso.clean(elem.className.replace(RegexObj, "$1$2"));
                }
            };
        })(),

        HasClass: (function () {
            return function (elem, className) {
                //make uppercase and remove any whitespace from input
                Contoso.empty(className) && Contoso.err("className cannot be empty");
                className = className.toUpperCase().replace(Contoso.AllWhiteSpaceRegex, "");
                let AllClassNames = elem.className.toUpperCase().trim();
                if (AllClassNames.indexOf(className + " ") === 0) {
                    //at beginning
                    return true;
                } else if (AllClassNames.indexOf(" " + className + " ") > -1) {
                    //in the middle somewhere
                    return true;
                } else {
                    let EndIndex;
                    if ((EndIndex = AllClassNames.indexOf(" " + className)) > -1 && EndIndex === (AllClassNames.length - (className.length + 1))) {
                        //at the end
                        return true;
                    } else if (AllClassNames === className) {
                        //is the only class on the element
                        return true;
                    }
                }
                return false;
            };
        })(),

        SwapClass: (function () {
            let WildCardRegex = /\\\*/g;
            return function (elem, oldClass, newClass) {
                //set newClass to an empty string to remove the class altogether
                Contoso.is_element(elem) || Contoso.err("elem must be an element ('" + Contoso.nvl(elem) + "' detected)");
                Contoso.empty(oldClass) && Contoso.err("oldClass cannot be empty");
                Contoso.empty(newClass) && Contoso.err("newClass cannot be empty");
                oldClass = oldClass.replace(Contoso.AllWhiteSpaceRegex, "");
                newClass = newClass.replace(Contoso.AllWhiteSpaceRegex, "");
                //put an asterisk anywhere in oldClass to act as a wildcard
                let RegexObj = new RegExp("^" + Contoso.preg_quote(oldClass).replace(WildCardRegex, ".*") + "$", "i");
                let classArr = Contoso.clean(elem.className).split(" ");
                for (let i = 0; i < classArr.length; i++) {
                    classArr[i] = classArr[i].replace(RegexObj, newClass);
                }
                classArr = Contoso.UniqueArray(classArr);
                elem.className = Contoso.clean(classArr.join(" "));
            };
        })(),

        GetStyle: (function () {
            return function (elem, propertyName) {
                //propertyName must use CSS case, e.g. "border-width", not "borderWidth"
                Contoso.is_element(elem) || Contoso.err("elem must be an element (" + Contoso.nvl(elem) + " detected)");
                Contoso.is_string(propertyName) || Contoso.err("propertyName must be a string.");
                return window.getComputedStyle(elem, null).getPropertyValue(propertyName);
            };
        })(),

        FillElems: (function () {
            return function (ClassName, Value) {
                let Elems = document.getElementsByClassName(ClassName);
                for (let i = 0; i < Elems.length; i++) {
                    Elems[i].innerHTML = Value;
                }
            };
        })(),

        EvalScriptElements: (function () {
            return function (Container) {
                //evaluate script tag content
                let ScriptContent = "";
                let ScriptTags = Container.getElementsByTagName("script");
                for (let i = 0; i < ScriptTags.length; i++) {
                    ScriptContent += ScriptTags[i].innerHTML + "\n";
                }
                //the following attempt to run eval in global scope does not work in IE8.
                //eval.call(window, ScriptContent);
                //found this technique at http://perfectionkills.com/global-eval-what-are-the-options/
                //"According to ES5, all of these are indirect calls and should execute code in global scope."
                (function (e) {
                    e(ScriptContent);
                })(eval);
            };
        })(),

        findCharCodes: (function () {
            let htmlRefs = {};
            htmlRefs["\u0026"] = "\u0026amp;";
            htmlRefs["\u003c"] = "\u0026lt;";
            htmlRefs["\u003e"] = "\u0026gt;";
            htmlRefs["\u00a0"] = "\u0026nbsp;";
            htmlRefs["\u00a1"] = "\u0026iexcl;";
            htmlRefs["\u00a2"] = "\u0026cent;";
            htmlRefs["\u00a3"] = "\u0026pound;";
            htmlRefs["\u00a4"] = "\u0026curren;";
            htmlRefs["\u00a5"] = "\u0026yen;";
            htmlRefs["\u00a6"] = "\u0026brvbar;";
            htmlRefs["\u00a7"] = "\u0026sect;";
            htmlRefs["\u00a8"] = "\u0026uml;";
            htmlRefs["\u00a9"] = "\u0026copy;";
            htmlRefs["\u00aa"] = "\u0026ordf;";
            htmlRefs["\u00ab"] = "\u0026laquo;";
            htmlRefs["\u00ac"] = "\u0026not;";
            htmlRefs["\u00ad"] = "\u0026shy;";
            htmlRefs["\u00ae"] = "\u0026reg;";
            htmlRefs["\u00af"] = "\u0026macr;";
            htmlRefs["\u00b0"] = "\u0026deg;";
            htmlRefs["\u00b1"] = "\u0026plusmn;";
            htmlRefs["\u00b2"] = "\u0026sup2;";
            htmlRefs["\u00b3"] = "\u0026sup3;";
            htmlRefs["\u00b4"] = "\u0026acute;";
            htmlRefs["\u00b5"] = "\u0026micro;";
            htmlRefs["\u00b6"] = "\u0026para;";
            htmlRefs["\u00b7"] = "\u0026middot;";
            htmlRefs["\u00b8"] = "\u0026cedil;";
            htmlRefs["\u00b9"] = "\u0026sup1;";
            htmlRefs["\u00ba"] = "\u0026ordm;";
            htmlRefs["\u00bb"] = "\u0026raquo;";
            htmlRefs["\u00bc"] = "\u0026frac14;";
            htmlRefs["\u00bd"] = "\u0026frac12;";
            htmlRefs["\u00be"] = "\u0026frac34;";
            htmlRefs["\u00bf"] = "\u0026iquest;";
            htmlRefs["\u00c0"] = "\u0026Agrave;";
            htmlRefs["\u00c1"] = "\u0026Aacute;";
            htmlRefs["\u00c2"] = "\u0026Acirc;";
            htmlRefs["\u00c3"] = "\u0026Atilde;";
            htmlRefs["\u00c4"] = "\u0026Auml;";
            htmlRefs["\u00c5"] = "\u0026Aring;";
            htmlRefs["\u00c6"] = "\u0026AElig;";
            htmlRefs["\u00c7"] = "\u0026Ccedil;";
            htmlRefs["\u00c8"] = "\u0026Egrave;";
            htmlRefs["\u00c9"] = "\u0026Eacute;";
            htmlRefs["\u00ca"] = "\u0026Ecirc;";
            htmlRefs["\u00cb"] = "\u0026Euml;";
            htmlRefs["\u00cc"] = "\u0026Igrave;";
            htmlRefs["\u00cd"] = "\u0026Iacute;";
            htmlRefs["\u00ce"] = "\u0026Icirc;";
            htmlRefs["\u00cf"] = "\u0026Iuml;";
            htmlRefs["\u00d0"] = "\u0026ETH;";
            htmlRefs["\u00d1"] = "\u0026Ntilde;";
            htmlRefs["\u00d2"] = "\u0026Ograve;";
            htmlRefs["\u00d3"] = "\u0026Oacute;";
            htmlRefs["\u00d4"] = "\u0026Ocirc;";
            htmlRefs["\u00d5"] = "\u0026Otilde;";
            htmlRefs["\u00d6"] = "\u0026Ouml;";
            htmlRefs["\u00d7"] = "\u0026times;";
            htmlRefs["\u00d8"] = "\u0026Oslash;";
            htmlRefs["\u00d9"] = "\u0026Ugrave;";
            htmlRefs["\u00da"] = "\u0026Uacute;";
            htmlRefs["\u00db"] = "\u0026Ucirc;";
            htmlRefs["\u00dc"] = "\u0026Uuml;";
            htmlRefs["\u00dd"] = "\u0026Yacute;";
            htmlRefs["\u00de"] = "\u0026THORN;";
            htmlRefs["\u00df"] = "\u0026szlig;";
            htmlRefs["\u00e0"] = "\u0026agrave;";
            htmlRefs["\u00e1"] = "\u0026aacute;";
            htmlRefs["\u00e2"] = "\u0026acirc;";
            htmlRefs["\u00e3"] = "\u0026atilde;";
            htmlRefs["\u00e4"] = "\u0026auml;";
            htmlRefs["\u00e5"] = "\u0026aring;";
            htmlRefs["\u00e6"] = "\u0026aelig;";
            htmlRefs["\u00e7"] = "\u0026ccedil;";
            htmlRefs["\u00e8"] = "\u0026egrave;";
            htmlRefs["\u00e9"] = "\u0026eacute;";
            htmlRefs["\u00ea"] = "\u0026ecirc;";
            htmlRefs["\u00eb"] = "\u0026euml;";
            htmlRefs["\u00ec"] = "\u0026igrave;";
            htmlRefs["\u00ed"] = "\u0026iacute;";
            htmlRefs["\u00ee"] = "\u0026icirc;";
            htmlRefs["\u00ef"] = "\u0026iuml;";
            htmlRefs["\u00f0"] = "\u0026eth;";
            htmlRefs["\u00f1"] = "\u0026ntilde;";
            htmlRefs["\u00f2"] = "\u0026ograve;";
            htmlRefs["\u00f3"] = "\u0026oacute;";
            htmlRefs["\u00f4"] = "\u0026ocirc;";
            htmlRefs["\u00f5"] = "\u0026otilde;";
            htmlRefs["\u00f6"] = "\u0026ouml;";
            htmlRefs["\u00f7"] = "\u0026divide;";
            htmlRefs["\u00f8"] = "\u0026oslash;";
            htmlRefs["\u00f9"] = "\u0026ugrave;";
            htmlRefs["\u00fa"] = "\u0026uacute;";
            htmlRefs["\u00fb"] = "\u0026ucirc;";
            htmlRefs["\u00fc"] = "\u0026uuml;";
            htmlRefs["\u00fd"] = "\u0026yacute;";
            htmlRefs["\u00fe"] = "\u0026thorn;";
            htmlRefs["\u00ff"] = "\u0026yuml;";
            htmlRefs["\u0152"] = "\u0026OElig;";
            htmlRefs["\u0153"] = "\u0026oelig;";
            htmlRefs["\u0160"] = "\u0026Scaron;";
            htmlRefs["\u0161"] = "\u0026scaron;";
            htmlRefs["\u0178"] = "\u0026Yuml;";
            htmlRefs["\u0192"] = "\u0026fnof;";
            htmlRefs["\u02c6"] = "\u0026circ;";
            htmlRefs["\u02dc"] = "\u0026tilde;";
            htmlRefs["\u0391"] = "\u0026Alpha;";
            htmlRefs["\u0392"] = "\u0026Beta;";
            htmlRefs["\u0393"] = "\u0026Gamma;";
            htmlRefs["\u0394"] = "\u0026Delta;";
            htmlRefs["\u0395"] = "\u0026Epsilon;";
            htmlRefs["\u0396"] = "\u0026Zeta;";
            htmlRefs["\u0397"] = "\u0026Eta;";
            htmlRefs["\u0398"] = "\u0026Theta;";
            htmlRefs["\u0399"] = "\u0026Iota;";
            htmlRefs["\u039a"] = "\u0026Kappa;";
            htmlRefs["\u039b"] = "\u0026Lambda;";
            htmlRefs["\u039c"] = "\u0026Mu;";
            htmlRefs["\u039d"] = "\u0026Nu;";
            htmlRefs["\u039e"] = "\u0026Xi;";
            htmlRefs["\u039f"] = "\u0026Omicron;";
            htmlRefs["\u03a0"] = "\u0026Pi;";
            htmlRefs["\u03a1"] = "\u0026Rho;";
            htmlRefs["\u03a3"] = "\u0026Sigma;";
            htmlRefs["\u03a4"] = "\u0026Tau;";
            htmlRefs["\u03a5"] = "\u0026Upsilon;";
            htmlRefs["\u03a6"] = "\u0026Phi;";
            htmlRefs["\u03a7"] = "\u0026Chi;";
            htmlRefs["\u03a8"] = "\u0026Psi;";
            htmlRefs["\u03a9"] = "\u0026Omega;";
            htmlRefs["\u03b1"] = "\u0026alpha;";
            htmlRefs["\u03b2"] = "\u0026beta;";
            htmlRefs["\u03b3"] = "\u0026gamma;";
            htmlRefs["\u03b4"] = "\u0026delta;";
            htmlRefs["\u03b5"] = "\u0026epsilon;";
            htmlRefs["\u03b6"] = "\u0026zeta;";
            htmlRefs["\u03b7"] = "\u0026eta;";
            htmlRefs["\u03b8"] = "\u0026theta;";
            htmlRefs["\u03b9"] = "\u0026iota;";
            htmlRefs["\u03ba"] = "\u0026kappa;";
            htmlRefs["\u03bb"] = "\u0026lambda;";
            htmlRefs["\u03bc"] = "\u0026mu;";
            htmlRefs["\u03bd"] = "\u0026nu;";
            htmlRefs["\u03be"] = "\u0026xi;";
            htmlRefs["\u03bf"] = "\u0026omicron;";
            htmlRefs["\u03c0"] = "\u0026pi;";
            htmlRefs["\u03c1"] = "\u0026rho;";
            htmlRefs["\u03c2"] = "\u0026sigmaf;";
            htmlRefs["\u03c3"] = "\u0026sigma;";
            htmlRefs["\u03c4"] = "\u0026tau;";
            htmlRefs["\u03c5"] = "\u0026upsilon;";
            htmlRefs["\u03c6"] = "\u0026phi;";
            htmlRefs["\u03c7"] = "\u0026chi;";
            htmlRefs["\u03c8"] = "\u0026psi;";
            htmlRefs["\u03c9"] = "\u0026omega;";
            htmlRefs["\u03d1"] = "\u0026thetasym;";
            htmlRefs["\u03d2"] = "\u0026upsih;";
            htmlRefs["\u03d6"] = "\u0026piv;";
            htmlRefs["\u2002"] = "\u0026ensp;";
            htmlRefs["\u2003"] = "\u0026emsp;";
            htmlRefs["\u2009"] = "\u0026thinsp;";
            htmlRefs["\u200c"] = "\u0026zwnj;";
            htmlRefs["\u200d"] = "\u0026zwj;";
            htmlRefs["\u200e"] = "\u0026lrm;";
            htmlRefs["\u200f"] = "\u0026rlm;";
            htmlRefs["\u2013"] = "\u0026ndash;";
            htmlRefs["\u2014"] = "\u0026mdash;";
            htmlRefs["\u2018"] = "\u0026lsquo;";
            htmlRefs["\u2019"] = "\u0026rsquo;";
            htmlRefs["\u201a"] = "\u0026sbquo;";
            htmlRefs["\u201c"] = "\u0026ldquo;";
            htmlRefs["\u201d"] = "\u0026rdquo;";
            htmlRefs["\u201e"] = "\u0026bdquo;";
            htmlRefs["\u2020"] = "\u0026dagger;";
            htmlRefs["\u2021"] = "\u0026Dagger;";
            htmlRefs["\u2022"] = "\u0026bull;";
            htmlRefs["\u2026"] = "\u0026hellip;";
            htmlRefs["\u2030"] = "\u0026permil;";
            htmlRefs["\u2032"] = "\u0026prime;";
            htmlRefs["\u2033"] = "\u0026Prime;";
            htmlRefs["\u2039"] = "\u0026lsaquo;";
            htmlRefs["\u203a"] = "\u0026rsaquo;";
            htmlRefs["\u203e"] = "\u0026oline;";
            htmlRefs["\u2044"] = "\u0026frasl;";
            htmlRefs["\u20ac"] = "\u0026euro;";
            htmlRefs["\u2111"] = "\u0026image;";
            htmlRefs["\u2118"] = "\u0026weierp;";
            htmlRefs["\u211c"] = "\u0026real;";
            htmlRefs["\u2122"] = "\u0026trade;";
            htmlRefs["\u2135"] = "\u0026alefsym;";
            htmlRefs["\u2190"] = "\u0026larr;";
            htmlRefs["\u2191"] = "\u0026uarr;";
            htmlRefs["\u2192"] = "\u0026rarr;";
            htmlRefs["\u2193"] = "\u0026darr;";
            htmlRefs["\u2194"] = "\u0026harr;";
            htmlRefs["\u21b5"] = "\u0026crarr;";
            htmlRefs["\u21d0"] = "\u0026lArr;";
            htmlRefs["\u21d1"] = "\u0026uArr;";
            htmlRefs["\u21d2"] = "\u0026rArr;";
            htmlRefs["\u21d3"] = "\u0026dArr;";
            htmlRefs["\u21d4"] = "\u0026hArr;";
            htmlRefs["\u2200"] = "\u0026forall;";
            htmlRefs["\u2202"] = "\u0026part;";
            htmlRefs["\u2203"] = "\u0026exist;";
            htmlRefs["\u2205"] = "\u0026empty;";
            htmlRefs["\u2207"] = "\u0026nabla;";
            htmlRefs["\u2208"] = "\u0026isin;";
            htmlRefs["\u2209"] = "\u0026notin;";
            htmlRefs["\u220b"] = "\u0026ni;";
            htmlRefs["\u220f"] = "\u0026prod;";
            htmlRefs["\u2211"] = "\u0026sum;";
            htmlRefs["\u2212"] = "\u0026minus;";
            htmlRefs["\u2217"] = "\u0026lowast;";
            htmlRefs["\u221a"] = "\u0026radic;";
            htmlRefs["\u221d"] = "\u0026prop;";
            htmlRefs["\u221e"] = "\u0026infin;";
            htmlRefs["\u2220"] = "\u0026ang;";
            htmlRefs["\u2227"] = "\u0026and;";
            htmlRefs["\u2228"] = "\u0026or;";
            htmlRefs["\u2229"] = "\u0026cap;";
            htmlRefs["\u222a"] = "\u0026cup;";
            htmlRefs["\u222b"] = "\u0026int;";
            htmlRefs["\u2234"] = "\u0026there4;";
            htmlRefs["\u223c"] = "\u0026sim;";
            htmlRefs["\u2245"] = "\u0026cong;";
            htmlRefs["\u2248"] = "\u0026asymp;";
            htmlRefs["\u2260"] = "\u0026ne;";
            htmlRefs["\u2261"] = "\u0026equiv;";
            htmlRefs["\u2264"] = "\u0026le;";
            htmlRefs["\u2265"] = "\u0026ge;";
            htmlRefs["\u2282"] = "\u0026sub;";
            htmlRefs["\u2283"] = "\u0026sup;";
            htmlRefs["\u2284"] = "\u0026nsub;";
            htmlRefs["\u2286"] = "\u0026sube;";
            htmlRefs["\u2287"] = "\u0026supe;";
            htmlRefs["\u2295"] = "\u0026oplus;";
            htmlRefs["\u2297"] = "\u0026otimes;";
            htmlRefs["\u22a5"] = "\u0026perp;";
            htmlRefs["\u22c5"] = "\u0026sdot;";
            htmlRefs["\u2308"] = "\u0026lceil;";
            htmlRefs["\u2309"] = "\u0026rceil;";
            htmlRefs["\u230a"] = "\u0026lfloor;";
            htmlRefs["\u230b"] = "\u0026rfloor;";
            htmlRefs["\u2329"] = "\u0026lang;";
            htmlRefs["\u232a"] = "\u0026rang;";
            htmlRefs["\u25ca"] = "\u0026loz;";
            htmlRefs["\u2660"] = "\u0026spades;";
            htmlRefs["\u2663"] = "\u0026clubs;";
            htmlRefs["\u2665"] = "\u0026hearts;";
            htmlRefs["\u2666"] = "\u0026diams;";
            let javaEscapes = {};
            javaEscapes[String.fromCharCode(9)] = "\\t"; // \t
            javaEscapes[String.fromCharCode(10)] = "\\n"; // \n
            javaEscapes[String.fromCharCode(13)] = "\\r"; // \r
            javaEscapes[String.fromCharCode(34)] = "\\\""; // "
            return function (input) {
                //from http://www.mauvecloud.net/charsets/CharCodeFinder.html
                let outputtype = "java";
                let returnVal = null;
                if (input.length <= 0) {
                    returnVal = "";
                } else {
                    if (outputtype === "decimal") {
                        returnVal = input.charCodeAt(0).toString(10);
                        for (let i = 1; i < input.length; i++) {
                            returnVal += ", " + input.charCodeAt(i).toString(10);
                        }
                    } else if (outputtype === "hexadecimal") {
                        returnVal = "0x" + input.charCodeAt(0).toString(16);
                        for (let i = 1; i < input.length; i++) {
                            returnVal += ", 0x" + input.charCodeAt(i).toString(16);
                        }
                    } else if (outputtype === "html") {
                        returnVal = "";
                        for (let i = 0; i < input.length; i++) {
                            let c = input.charAt(i);
                            if (htmlRefs[c] != null) {
                                returnVal += htmlRefs[c];
                            } else if (c < "\u007F") {
                                returnVal += c;
                            } else {
                                returnVal += "&#x" + c.charCodeAt(0).toString(16) + ";";
                            }
                        }
                    } else if (outputtype === "java") {
                        returnVal = "";
                        for (let i = 0; i < input.length; i++) {
                            let c = input.charCodeAt(i);
                            c = input.charAt(i);
                            if (javaEscapes[c] != null) {
                                returnVal += javaEscapes[c];
                            } else if (c >= "\u0020" && c < "\u007F") {
                                returnVal += c;
                            } else {
                                c = c.charCodeAt(0);
                                returnVal += "\\u";
                                if (c < 0x1000) returnVal += "0";
                                if (c < 0x0100) returnVal += "0";
                                if (c < 0x0010) returnVal += "0";
                                returnVal += c.toString(16);
                            }
                        }
                    }
                }
                return returnVal;
            };
        })(),

        roundFloat: (function () {
            return function (input, places) {
                Contoso.is_number(input) || Contoso.err("input must be a number");
                return parseFloat(input.toFixed(places));
            };
        })(),

        AddCommas: (function () {
            let AddCommasRegex = /\B(?=(\d{3})+(?!\d))/g;
            return function (x) {
                let parts = Contoso.nvl(x).split(".");
                parts[0] = parts[0].replace(AddCommasRegex, ",");
                return parts.join(".");
            };
        })(),

        FixPrice: (function () {
            let NoDecimalRegex = /^[0-9]+$/i;
            let StartingDecimalRegex = /^\./i;
            return function (input) {
                Contoso.is_numeric(input) || Contoso.err("FixPrice error: input must be numeric");
                input = Contoso.roundFloat(parseFloat(input), 2).toString();
                if (NoDecimalRegex.test(input)) {
                    input = input + ".00";
                } else {
                    if (StartingDecimalRegex.test(input)) {
                        input = "0" + input;
                    }
                    if (/\.[0-9]$/i.test(input)) {
                        input = input + "0";
                    }
                }
                return Contoso.AddCommas(input);
            };
        })(),

        repeatString: (function () {
            return function (pattern, count) {
                if (count < 1) {
                    return '';
                }
                let result = '';
                while (count > 1) {
                    if (Contoso.NumberIsOdd(count)) { //if count is odd, then 1, else 0
                        result += pattern;
                    }
                    count >>= 1;
                    pattern += pattern;
                }
                return result + pattern;
            };
        })(),

        FocusFirstTextInput: (function () {
            return function (ContainerElem) {
                let Inputs = Contoso.GetInputs(ContainerElem);
                for (let i = 0; i < Inputs.length; i++) {
                    let Elem = Inputs[i];
                    let Tag = Elem.tagName.toUpperCase();
                    let TypeAttr = Contoso.nvl(Elem.getAttribute("type")).toUpperCase();
                    if (Contoso.ElementIsVisible(Elem) && !Elem.disabled && TypeAttr !== "HIDDEN" && TypeAttr !== "RADIO" && TypeAttr !== "CHECKBOX") {
                        Elem.focus();
                        if ((Tag === "INPUT" && (TypeAttr === "TEXT" || TypeAttr === "PASSWORD")) || Tag === "TEXTAREA") {
                            Elem.setSelectionRange(Elem.value.length, Elem.value.length);
                        }
                        break;
                    }
                }
            };
        })(),

        toRoman: (function () {
            return function (num) {
                Contoso.is_numeric(num) || Contoso.err("num is not numeric.");
                num = Contoso.is_number(num) ? num : parseFloat(num);
                Contoso.is_integer(num) || Contoso.err("num must be an integer.");
                let str = "";
                let roman = {
                    M: 1000, CM: 900, D: 500, CD: 400, C: 100, XC: 90, L: 50, XL: 40, X: 10, IX: 9, V: 5, IV: 4, I: 1
                };
                for (let key in roman) {
                    if (roman.hasOwnProperty(key)) {
                        let q = Math.floor(num / roman[key]);
                        num -= q * roman[key];
                        str += Contoso.repeatString(key, q);
                    }
                }
                return str;
            };
        })(),

        GetCoords: (function () {
            return function (elem) {
                Contoso.is_element(elem) || Contoso.err("coords error: input must be an element.");
                let rect = elem.getBoundingClientRect();
                let scrollLeft = window.scrollX || document.documentElement.scrollLeft;
                let scrollTop = window.scrollY || document.documentElement.scrollTop;
                return {
                    top: rect.top + scrollTop, left: rect.left + scrollLeft, width: rect.width, height: rect.height
                }
            };
        })(),

        FixHTML: (function () {
            let AmpersandRegex = /&/g;
            let LessThanRegex = /</g;
            let GreaterThanRegex = />/g;
            let DoubleQuoteRegex = /"/g;
            let SingleQuoteRegex = /'/g;
            return function (input) {
                input = Contoso.nvl(input);
                input = input.replace(AmpersandRegex, "&#38;");
                input = input.replace(LessThanRegex, "&#60;");
                input = input.replace(GreaterThanRegex, "&#62;");
                input = input.replace(DoubleQuoteRegex, "&#34;");
                //do NOT escape forward slash or it will break BBCode
                //input = input.replace(/\//g, "&#47;");
                input = input.replace(SingleQuoteRegex, "&#39;");
                return input;
            };
        })(),

        BeautifyJson: (function () {
            return function (str) {
                let Obj = null;
                try {
                    Obj = JSON.parse(str);
                } catch (e) {
                    return e;
                }
                return (Obj == null) ? "null" : JSON.stringify(Obj, null, 2);
            };
        })(),

        //############################################################################################################################################################################
        //############################################################################################################################################################################
        //############################################################################################################################################################################
        //############################################################################################################################################################################

        GetScrollHeight: (function () {
            return function () {
                let BodyElem = document.body;
                let HTMLElem = document.body.parentNode;
                if (Math.abs(HTMLElem.scrollHeight - BodyElem.scrollHeight) > 1) {
                    let ErrMsg = "";
                    ErrMsg += "GetScrollHeight error: <\HTML> and <BODY> scrollHeights must be the same to return an accurate value.\n";
                    ErrMsg += "<\HTML> scrollHeight: '" + HTMLElem.scrollHeight + "',\n<BODY> scrollHeight: '" + BodyElem.scrollHeight + "'\n";
                    ErrMsg += "<\HTML> cssText: '" + HTMLElem.style.cssText + "',\n<BODY> cssText: '" + BodyElem.style.cssText + "'";
                    Contoso.err(ErrMsg);
                }
                return Math.max(HTMLElem.scrollHeight, BodyElem.scrollHeight);
            };
        })(),

        GetScrollPosition: (function () {
            return function () {
                let BodyElem = document.body;
                let HTMLElem = document.body.parentNode;
                return HTMLElem.scrollTop + BodyElem.scrollTop;
            };
        })(),

        SetScrollPosition: (function () {
            return function (input) {
                let BodyElem = document.body;
                let HTMLElem = document.body.parentNode;
                HTMLElem.scrollTop = input;
                BodyElem.scrollTop = input;
            };
        })(),

        ScrollToBottomOfPage: (function () {
            return function (input) {
                Contoso.SetScrollPosition(Contoso.GetScrollHeight());
            };
        })(),

        LockAndFreezeBody: (function () {
            return function () {
                let UndoFreeze = Contoso.FreezeBody();
                let UndoLock = Contoso.LockContainer(document.body);
                return function () {
                    UndoLock();
                    UndoFreeze();
                };
            };
        })(),

        DisableContainer: (function () {
            let InputTagRegex = /BUTTON|SELECT|TEXTAREA|INPUT/i;
            return function (Container, HideContainer = false) {
                Contoso.is_element(Container) || Contoso.err("DisableContainer error: Container is not an element.");
                Container === document.body.parentNode && Contoso.err("LockContainer error: Container cannot be the HTML element.");
                //#################################
                let ParentElem = Container.parentNode;
                while (ParentElem != null && ParentElem !== document.body.parentNode) {
                    Contoso.is_boolean(ParentElem.__xinactive) && ParentElem.__xinactive && Contoso.err("DisableContainer error: cannot disable a child of a disabled container.");
                    ParentElem = ParentElem.parentNode;
                }
                //#################################
                Container.__xinactive = true;
                let OriginalCssText = Container.style.cssText;
                let FocusedElem = document.activeElement;
                let Children = Container.getElementsByTagName("*");
                let ElemArray = [];
                for (let i = -1; i < Children.length; i++) {
                    let Elem = (i === -1) ? Container : Children[i];
                    let Tag = Elem.tagName.toUpperCase();
                    if (i > -1 && Contoso.is_boolean(Elem.__xinactive) && Elem.__xinactive) {
                        //if elem is already disabled, skip over it
                        i = i + Elem.getElementsByTagName("*").length;
                    } else if (InputTagRegex.test(Tag)) {
                        Elem.__xdisabled = Elem.disabled;
                        Elem.disabled = true;
                        Elem.blur();
                        ElemArray.push(Elem);
                    }
                }
                if (HideContainer) {
                    Container.style.display = "none";
                }
                //#################################
                let AlreadyUndone = false;
                return function () {
                    if (!AlreadyUndone) {
                        let TheParent = Container.parentNode;
                        while (TheParent != null && TheParent !== document.body.parentNode) {
                            !Contoso.is_boolean(TheParent.__xinactive) || !TheParent.__xinactive || Contoso.err("DisableContainer error: cannot enable a child of a disabled container.");
                            TheParent = TheParent.parentNode;
                        }
                        AlreadyUndone = true;
                        Container.__xinactive = false;
                        Container.style.cssText = OriginalCssText;
                        //#################################
                        for (let i = 0; i < ElemArray.length; i++) {
                            let Elem = ElemArray[i];
                            Elem.disabled = Elem.__xdisabled;
                        }
                        //#################################
                        if (FocusedElem != null) {
                            FocusedElem.focus();
                        }
                    }
                    return null;
                };
            };
        })(),

        LockContainer: (function () {
            return function (Container, ShowOverlay = true) {
                Contoso.is_element(Container) || Contoso.err("LockContainer error: Container is not an element.");
                Container === document.body.parentNode && Contoso.err("LockContainer error: Container cannot be the HTML element.");
                Contoso.is_boolean(Container.__xlocked) && Container.__xlocked && Contoso.err("LockContainer error: Container is already locked");
                //#######
                let ParentElem = Container.parentNode;
                while (ParentElem != null && ParentElem !== document.body.parentNode.parentNode) {
                    Contoso.is_boolean(ParentElem.__xinactive) && ParentElem.__xinactive && Contoso.err("LockContainer error: cannot lock a child of a locked container.");
                    ParentElem = ParentElem.parentNode;
                }
                //#######
                Container.__xlocked = true;
                let TheEvent = function (event) {
                    event.stopPropagation();
                    event.preventDefault();
                };
                let TheOptions = { capture: true, passive: false };
                let EventNamesArr = [];
                for (let Key in Container) {
                    if (Key.indexOf("on") === 0) {
                        let EventName = Key.substring(2);
                        //don't disable keydown or else the developer window F12 shortcut won't work (among other ones)
                        if (EventName !== "keydown" && EventName !== "contextmenu" && EventName !== "error" && EventName !== "load") {
                            EventNamesArr.push(EventName);
                            Container.addEventListener(EventName, TheEvent, TheOptions);
                        }
                    }
                }
                //#################################
                //#################################
                let OverlayContainer = null;
                let OriginalCssText = Container.style.cssText;
                let OriginalScrollTop = Container.scrollTop;
                //#######
                if (ShowOverlay) {
                    let OverlayColor = "rgba(0,0,0,0.25)";
                    Contoso.GetStyle(Container, "position") === "static" && Contoso.err("LockContainer error: if ShowOverlay is true, the container must NOT be position:static.");
                    OverlayContainer = document.createElement("div");
                    OverlayContainer.style.cssText = DefaultStyles.GetDivStyle();
                    if (Container === document.body) {
                        OverlayContainer.style.position = "fixed";
                        OverlayContainer.style.top = "0px";
                    } else {
                        OverlayContainer.style.position = "absolute";
                        OverlayContainer.style.top = OriginalScrollTop + "px";
                        Container.style.overflowX = "hidden";
                        Container.style.overflowY = "hidden";
                    }
                    OverlayContainer.style.right = "0px";
                    OverlayContainer.style.bottom = "0px";
                    OverlayContainer.style.left = "0px";
                    OverlayContainer.style.width = "auto";
                    OverlayContainer.style.height = "auto";
                    OverlayContainer.style.backgroundColor = OverlayColor;
                    OverlayContainer.style.zIndex = "2147483647";
                    let SpinnerHTML = "";
                    SpinnerHTML += "<table style=\"" + DefaultStyles.GetTableStyle() + "\">";
                    SpinnerHTML += "<tr style=\"" + DefaultStyles.GetTrStyle() + "\">";
                    SpinnerHTML += "<td style=\"" + DefaultStyles.GetTdStyle() + "\">";
                    SpinnerHTML += "<span class=\"icon-spinner-7\"></span>";
                    SpinnerHTML += "</td>";
                    SpinnerHTML += "</tr>";
                    SpinnerHTML += "</table>";
                    OverlayContainer.innerHTML = SpinnerHTML;
                    let table = OverlayContainer.getElementsByTagName("table")[0];
                    table.style.width = "100%";
                    table.style.height = "100%";
                    let td = OverlayContainer.getElementsByTagName("td")[0];
                    td.style.textAlign = "center";
                    td.style.color = "#ffffff";
                    let span = OverlayContainer.getElementsByTagName("span")[0];
                    Container.appendChild(OverlayContainer);
                    //#######
                    OverlayContainer.style.opacity = "0";
                    anime({
                        targets: OverlayContainer, opacity: 1, easing: "linear", duration: 1500, complete: function () {
                        }
                    });
                }
                //#######
                if (Container !== document.body) {
                    Container.scrollTop = OriginalScrollTop;
                }
                //#################################
                //#################################
                return function () { //return a function that unlocks the body
                    Container.__xlocked = false;
                    //#######
                    if (OverlayContainer != null) {
                        OverlayContainer.parentNode.removeChild(OverlayContainer);
                    }
                    if (Container !== document.body) {
                        Container.style.cssText = OriginalCssText;
                        Container.scrollTop = OriginalScrollTop;
                    }
                    //#######
                    for (let i = 0; i < EventNamesArr.length; i++) {
                        Container.removeEventListener(EventNamesArr[i], TheEvent, TheOptions);
                    }
                };
            };
        })(),

        FreezeBody: (function () {
            return function () {
                let BodyElem = document.body;
                let HTMLElem = document.body.parentNode;
                if (Contoso.is_boolean(HTMLElem.__xfrozen) && HTMLElem.__xfrozen) {
                    //in case a popup is active that already froze the body
                    return function () {
                    };
                } else {
                    HTMLElem.__xfrozen = true;
                    //#################################################
                    //freeze the background
                    //ipod touch 6th generation uses the body element for scroll
                    //ipod touch 7th generation and iphone uses the html element for scroll
                    let OriginalHTMLScroll = HTMLElem.scrollTop;
                    let OriginalBodyScroll = BodyElem.scrollTop;
                    let ScrollSum = OriginalHTMLScroll + OriginalBodyScroll;
                    //#######################
                    let BodyScrollBar = BodyElem.scrollHeight > BodyElem.clientHeight;
                    let HTMLScrollBar = HTMLElem.scrollHeight > HTMLElem.clientHeight;
                    //#######################
                    let OriginalHTMLStyle = HTMLElem.style.cssText;
                    let OriginalBodyStyle = BodyElem.style.cssText;
                    //#######################
                    //hide iframes when freezing the body and the page is scrolled.
                    //otherwise, on mobile Safari, if the page is scrolled down and then frozen, all absolute-positioned elements that contain one or more iframes will
                    //momentarily jump down to the current scroll position, then back up (it happens for about a tenth of a second).
                    //like mentioned before, this only happens on mobile Safari.
                    let AllIframes = null;
                    if (ScrollSum > 0 && ScreenHelpers.isMobile) {
                        AllIframes = Contoso.CollectionToArray(document.getElementsByTagName("iframe"));
                        for (let i = 0; i < AllIframes.length; i++) {
                            let TheIframe = AllIframes[i];
                            TheIframe.__xvisibility = TheIframe.style.visibility;
                            TheIframe.style.visibility = "hidden";
                        }
                    }
                    //#######################
                    HTMLElem.style.width = "100%";
                    HTMLElem.style.height = "100%";
                    HTMLElem.style.margin = "0px";
                    HTMLElem.style.borderWidth = "0px";
                    HTMLElem.style.padding = "0px";
                    HTMLElem.style.position = "relative";
                    HTMLElem.style.overflowX = "hidden";
                    HTMLElem.style.overflowY = (BodyScrollBar || HTMLScrollBar) ? "scroll" : "hidden";
                    //#######################
                    BodyElem.style.width = "100%";
                    BodyElem.style.height = "auto";
                    BodyElem.style.margin = "0px";
                    BodyElem.style.borderWidth = "0px";
                    BodyElem.style.padding = "0px";
                    BodyElem.style.position = "absolute";
                    BodyElem.style.overflowX = "hidden";
                    BodyElem.style.overflowY = "hidden";
                    BodyElem.style.top = "-" + ScrollSum + "px";
                    BodyElem.style.right = "auto";
                    BodyElem.style.bottom = "0px";
                    BodyElem.style.left = "auto";
                    //#######################
                    HTMLElem.scrollTop = 0;
                    BodyElem.scrollTop = 0;
                    return function () {
                        HTMLElem.__xfrozen = false;
                        //#######################
                        if (AllIframes != null) {
                            for (let i = 0; i < AllIframes.length; i++) {
                                let TheIframe = AllIframes[i];
                                TheIframe.style.visibility = TheIframe.__xvisibility;
                            }
                        }
                        //#######################
                        HTMLElem.style.cssText = OriginalHTMLStyle;
                        BodyElem.style.cssText = OriginalBodyStyle;
                        HTMLElem.scrollTop = OriginalHTMLScroll;
                        BodyElem.scrollTop = OriginalBodyScroll;
                    };
                }
            };
        })(),

        //############################################################################################################################################################################
        //############################################################################################################################################################################
        //############################################################################################################################################################################
        //############################################################################################################################################################################,
        GetRadioHelperObject: (function () {
            return function (RadioInputArray) {
                //input must be an array so we can use the indexOf method
                //make it an array in case it's a collection
                let ElementArray = [];
                for (let i = 0; i < RadioInputArray.length; i++) {
                    Contoso.is_element(RadioInputArray[i]) || Contoso.err("GetRadioHelperObject error: not an element. (" + (typeof (RadioInputArray[i])) + ")");
                    ElementArray.push(RadioInputArray[i]);
                }
                let _onchange = function () {
                };
                let _SelectedElem = null;
                let _SelectedIndex = -1;
                //#################################
                //#################################
                let LastName = "";
                //make sure all the radio input names are the same, and uncheck all other radios that come after the _SelectedIndex
                for (let i = 0; i < ElementArray.length; i++) {
                    let Name = ElementArray[i].name.toUpperCase();
                    i === 0 || LastName === Name || Contoso.err("GetRadioHelperObject error: radio input names are different.");
                    LastName = Name;
                    if (_SelectedIndex === -1) {
                        if (ElementArray[i].checked) {
                            _SelectedIndex = i;
                        }
                    } else {
                        ElementArray[i].checked = false;
                    }
                }
                //if no radio inputs were checked, then check the first one by default
                if (_SelectedIndex === -1 && ElementArray.length > 0) {
                    _SelectedIndex = 0;
                    ElementArray[0].checked = true;
                }
                //#################################
                //#################################
                let RadioHelperObject = {
                    get value() {
                        if (_SelectedElem === null) {
                            for (let i = 0; i < ElementArray.length; i++) {
                                if (ElementArray[i].checked) {
                                    _SelectedElem = ElementArray[i];
                                    break;
                                }
                            }
                        }
                        return (_SelectedElem === null) ? null : _SelectedElem.value;
                    },
                    set value(newValue) {
                        let Exists = false;
                        //first see if value exists
                        for (let i = 0; i < ElementArray.length; i++) {
                            if (ElementArray[i].value === newValue) {
                                _SelectedElem = ElementArray[i];
                                _SelectedIndex = i;
                                Exists = true;
                                break;
                            }
                        }
                        if (Exists) {
                            for (let i = 0; i < ElementArray.length; i++) {
                                ElementArray[i].checked = i === _SelectedIndex;
                            }
                        }
                    },
                    set onchange(func) {
                        _onchange = func;
                    },
                    get onchange() {
                        return _onchange;
                    },
                    get SelectedElem() {
                        return _SelectedElem;
                    },
                    get SelectedIndex() {
                        return _SelectedIndex;
                    }
                };
                //#################################
                //#################################
                //onchange is only called when a radio button is checked, not unchecked.
                //it is also only called when a radio button is clicked or its "click()" method is called,
                //and not simply when the "checked" property is made true with javascript
                for (let i = 0; i < ElementArray.length; i++) {
                    ElementArray[i].addEventListener("change", function () {
                        _SelectedElem = this;
                        for (let c = 0; c < ElementArray.length; c++) {
                            if (ElementArray[c] === this) {
                                _SelectedIndex = c;
                            } else {
                                ElementArray[c].checked = false;
                            }
                        }
                        _onchange.call(RadioHelperObject);
                    });
                }
                return RadioHelperObject;
            };
        })(),

        getChildNodeArray: (function () {
            return function (Elem, Recursive = true, NodeTypeFilter = -1) {
                /*
                Node Types
                1   Element
                2   Attr
                3   Text
                4   CDATASection
                5   EntityReference
                6   Entity
                7   ProcessingInstruction
                8   Comment
                9   Document
                10  DocumentType
                11  DocumentFragment
                12  Notation
                */
                //is_element(Elem) || err("getChildNodeArray error: argument 1 must be an element.");
                let nodes = [];
                let AllTags = Elem.getElementsByTagName("*");
                for (let i = -1; i < (Recursive ? AllTags.length : 0); i++) {
                    let childNodes = ((i === -1) ? Elem : AllTags[i]).childNodes;
                    for (let n = 0; n < childNodes.length; n++) {
                        if (childNodes[n].nodeType === NodeTypeFilter || NodeTypeFilter === -1) {
                            nodes.push(childNodes[n]);
                        }
                    }
                }
                return nodes;
            };
        })(),

        GetInputs: (function () {
            return function (Container) {
                return Contoso.CollectionToArray(Container.querySelectorAll("BUTTON,INPUT,SELECT,TEXTAREA"));
            };
        })(),

        GetFileInputs: (function () {
            return function (Form) {
                (Contoso.is_element(Form) && Form.tagName.toUpperCase() === "FORM") || Contoso.err("GetFileInputs error: Form parameter must be a <\FORM> element.");
                let FileInputs = [];
                for (let i = 0; i < Form.elements.length; i++) {
                    if (Form.elements[i].tagName.toUpperCase() === "INPUT" && Form.elements[i].type.toUpperCase() === "FILE") {
                        FileInputs.push(Form.elements[i]);
                    }
                }
                return FileInputs;
            };
        })(),

        //############################################################################################################################################################################
        //############################################################################################################################################################################
        //############################################################################################################################################################################
        //############################################################################################################################################################################,
        decodeURIComponentFixed: (function () {
            let PlusSignRegex = /\+/g;
            return function (input) {
                return decodeURIComponent(Contoso.nvl(input).replace(PlusSignRegex, " "));
            };
        })(),

        QueryStringToObject: (function () {
            let QuestionMarkAmpersandRegex = /^[?&]+/;
            return function (Q_str) {
                //this function parses a Q_str into a key=value object
                //if no argument provided then use current query string
                Q_str = (Contoso.is_string(Q_str) ? Q_str : window.location.search).replace(QuestionMarkAmpersandRegex, "");
                let Q_obj = {};
                let params = Q_str.split("&");
                for (let i = 0; i < params.length; i++) {
                    let pair = params[i].split("=");
                    if (pair.length === 2 && !Contoso.empty(pair[0])) {
                        //have to replace plus sign with a space because some encoding functions turn the space into a plus
                        Q_obj[Contoso.decodeURIComponentFixed(pair[0])] = Contoso.decodeURIComponentFixed(pair[1]);
                    }
                }
                return Q_obj;
            };
        })(),

        ObjectToQueryString: (function () {
            let BeginningAmpersandRegex = /^&+/;
            return function (Q_obj) {
                //this function converts a {key:value} Q_obj into a Q_str
                let Q_str = "";
                for (let property in Q_obj) {
                    if (Q_obj.hasOwnProperty(property)) {
                        if (Array.isArray(Q_obj[property])) {
                            for (let i = 0; i < Q_obj[property].length; i++) {
                                Q_str = Q_str + "&" + encodeURIComponent(property) + "=" + encodeURIComponent(Q_obj[property][i]);
                            }
                        } else {
                            Q_str = Q_str + "&" + encodeURIComponent(property) + "=" + encodeURIComponent(Q_obj[property]);
                        }
                    }
                }
                Q_str = Q_str.replace(BeginningAmpersandRegex, "");
                return Q_str;
            };
        })(),

        //############################################################################################################################################################################
        //############################################################################################################################################################################
        //############################################################################################################################################################################
        //############################################################################################################################################################################,

        LineObject: (function () {
            return function (Elem1, Elem2, Container, CustomStyleObj = null) {
                let _this = this;
                let _el1 = Elem1;
                let _el2 = Elem2;
                Contoso.InDOM(Container) || Contoso.err("LineObject error: Container must be in the DOM.");
                let Line = document.createElement("div");
                Line.style.cssText = DefaultStyles.GetDivStyle();
                Line.style.position = "absolute";
                Line.style.height = "0px";
                Line.style.backgroundColor = "#FF00FF";
                Line.style.transformOrigin = "left top";
                Line.style["-ms-transform-origin"] = "left top";
                Container.appendChild(Line);
                if (Contoso.is_object(CustomStyleObj)) {
                    for (let Key in Line.style) {
                        if (CustomStyleObj.hasOwnProperty(Key)) {
                            Line.style[Key] = CustomStyleObj[Key];
                        }
                    }
                }
                let _updateCoords = function (_Elem1 = null, _Elem2 = null) {
                    _Elem1 = (_Elem1 != null) ? _Elem1 : _el1;
                    _Elem2 = (_Elem2 != null) ? _Elem2 : _el2;
                    Contoso.InDOM(_Elem1) || Contoso.err("LineObject error: Elem1 is not in the DOM.");
                    Contoso.InDOM(_Elem2) || Contoso.err("LineObject error: Elem2 is not in the DOM.");
                    let Coords1 = Contoso.GetCoords(_Elem1);
                    let Coords2 = Contoso.GetCoords(_Elem2);
                    let opp = Math.abs(Coords1.left - Coords2.left);
                    let adj = Math.abs(Coords1.top - Coords2.top);
                    let hyp = Math.sqrt(Math.pow(opp, 2) + Math.pow(adj, 2));
                    let theta = 90 - (Math.atan(opp / adj) * (180 / Math.PI));
                    Line.style.top = Coords1.top + "px";
                    Line.style.left = Coords1.left + "px";
                    Line.style.width = Math.round(hyp) + "px";
                    theta = (Coords1.left <= Coords2.left) ? theta : (theta + 180) * -1;
                    theta = (Coords1.top <= Coords2.top) ? theta : theta * -1;
                    Line.style.transform = "rotate(" + theta + "deg)";
                    Line.style["-ms-transform"] = "rotate(" + theta + "deg)";
                };
                _updateCoords(Elem1, Elem2);
                this.elem = Line;
                this.updateCoords = _updateCoords;
                this.kill = function () {
                    _this.updateCoords = null;
                    Line.parentNode.removeChild(Line);
                    Line = null;
                };
            };
        })(),

        //############################################################################################################################################################################
        //############################################################################################################################################################################
        //############################################################################################################################################################################
        //############################################################################################################################################################################,

        getCookie: (function () {
            return function (key) {
                let re = new RegExp("(?:^|;\\s*)" + Contoso.preg_quote(encodeURIComponent(key)) + "\\s*=\\s*([^;=]*)", "ig");
                let match = re.exec(document.cookie);
                return (match !== null) ? Contoso.decodeURIComponentFixed(match[1]) : "";
            };
        })(),

        setCookie: (function () {
            return function (key, value, expire_days = null) {
                /*
                I know this is old, but hopefully this helps someone in the future.
                You cannot have a blank expires=; value in a cookie in IE11.
                You just have to leave the expires field out altogether.
                https://stackoverflow.com/questions/22690114/internet-explorer-11-wont-set-cookies-on-a-site
                */
                Contoso.empty(key) && Contoso.err("setCookie error: key cannot be empty");
                let expires = "";
                if (expire_days != null) {
                    let d = new Date();
                    d.setTime(d.getTime() + (expire_days * 24 * 60 * 60 * 1000));
                    expires = "expires=" + d.toUTCString() + ";";
                }
                document.cookie = encodeURIComponent(key) + "=" + encodeURIComponent(value) + ";samesite=lax;path=/;" + expires;
            };
        })(),

        //############################################################################################################################################################################
        //############################################################################################################################################################################
        //############################################################################################################################################################################
        //############################################################################################################################################################################

        //############################################################################
        //############################################################################
        //############################################################################
        //############################################################################,

        popup_alert: (function () {
            return function (msg = "", okfunc = null, title = "Alert", forceclose = true) {
                let ContentHtml = '';
                ContentHtml += '<div class="paddingall5">';
                ContentHtml += msg;
                ContentHtml += '</div>';
                let FooterHtml = '';
                FooterHtml += '<div class="textcenter">';
                FooterHtml += '<input type="button" value="OK"/>';
                FooterHtml += '</div>';
                let PopupOptions = {
                    title: title, content: ContentHtml, footer: FooterHtml, width: "auto"
                };
                let alert_popup = GetPopupInstance();
                alert_popup.show(PopupOptions);
                let Button = alert_popup.footer.getElementsByTagName("input")[0];
                Button.onclick = function () {
                    forceclose && alert_popup.kill();
                    Contoso.is_function(okfunc) && okfunc.call(alert_popup);
                };
                return alert_popup;
            };
        })(),

        popup_alert_close: (function () {
            return function (msg = "", cancelfunc = null, title = "Alert", forceclose = true) {
                let ContentHtml = '';
                ContentHtml += '<div class="paddingall5">';
                ContentHtml += msg;
                ContentHtml += '</div>';
                let FooterHtml = '';
                FooterHtml += '<div class="textcenter">';
                FooterHtml += '<input class="gray" type="button" value="Close"/>';
                FooterHtml += '</div>';
                let PopupOptions = {
                    title: title, content: ContentHtml, footer: FooterHtml, width: "auto"
                };
                let alert_popup = GetPopupInstance();
                alert_popup.show(PopupOptions);
                let Button = alert_popup.footer.getElementsByTagName("input")[0];
                Button.onclick = function () {
                    forceclose && alert_popup.kill();
                    Contoso.is_function(cancelfunc) && cancelfunc.call(alert_popup);
                };
                return alert_popup;
            };
        })(),

        popup_alert_blackout: (function () {
            return function (msg = "", title = "Alert") {
                let html = '';
                html += '<table style="height:100%;">';
                html += '<tr>';
                html += '<td class="">';
                html += msg;
                html += '</td>';
                html += '</tr>';
                html += '</table>';
                let PopupOptions = {
                    title: title,
                    content: html,
                    width: "auto",
                    height: "100%",
                    blackout: true,
                    showCloseButton: true
                };
                let alert_popup = GetPopupInstance();
                alert_popup.show(PopupOptions);
                return alert_popup;
            };
        })(),

        popup_confirm: (function () {
            return function (msg = "", yesfunc = null, nofunc = null, title = "Confirm", challenge = false, forceclose = true) {
                let NumA = Contoso.RandomInt(1, 10);
                let NumB = Contoso.RandomInt(1, 10);
                let html = '';
                html += '<div class="paddingall5">';
                html += '<div>';
                html += msg;
                html += '</div>';
                if (challenge) {
                    html += '<div class="margintop textcenter" style="' + (challenge ? "" : "display:none;") + '">';
                    html += '<table class="center nowrap padh5">';
                    html += '<tr>';
                    html += '<td>Solve to continue: ' + NumA + ' + ' + NumB + ' =</td>';
                    html += '<td><input class="" type="text" value="" style="width:4ch;"/></td>';
                    html += '</tr>';
                    html += '</table>';
                    html += '</div>';
                }
                html += '</div>';
                let FooterHtml = '';
                FooterHtml += '<div class="textcenter">';
                FooterHtml += '<input class="" type="button" style="width:70px;" value="Yes"/>';
                FooterHtml += '<input class="marginleft20" type="button" style="width:70px;" value="No" maxlength="2"/>';
                FooterHtml += '</div>';
                let PopupOptions = {
                    title: title, content: html, footer: FooterHtml, width: "auto"
                };
                let confirm_popup = GetPopupInstance();
                confirm_popup.show(PopupOptions);
                let YesButton = confirm_popup.footer.getElementsByTagName("input")[0];
                let NoButton = confirm_popup.footer.getElementsByTagName("input")[1];
                if (challenge) {
                    let AnswerInput = confirm_popup.content.getElementsByTagName("input")[0];
                    let challenge_func = function () {
                        let Answer = Contoso.is_numeric(AnswerInput.value) ? parseInt(AnswerInput.value) : -1;
                        YesButton.disabled = ((NumA + NumB) !== Answer);
                    };
                    AnswerInput.oninput = challenge_func;
                    AnswerInput.onchange = challenge_func;
                }
                YesButton.disabled = challenge;
                YesButton.onclick = function () {
                    forceclose && confirm_popup.kill();
                    Contoso.is_function(yesfunc) && yesfunc.call(confirm_popup);
                };
                NoButton.onclick = function () {
                    confirm_popup.kill();
                    Contoso.is_function(nofunc) && nofunc.call(confirm_popup);
                };
                let MessageDiv = confirm_popup.content.firstElementChild.firstElementChild;
                return {
                    YesButton: YesButton, NoButton: NoButton, MessageDiv: MessageDiv, PopupObject: confirm_popup
                };
            };
        })(),

        RevisitPage: (function () {
            return function () {
                location.href = location.href + "";
            };
        })()
    };
    Object.freeze(obj);
    return obj;
})();