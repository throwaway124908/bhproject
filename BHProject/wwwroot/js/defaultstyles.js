const DefaultStyles = (function () {
    let DivStyleObj = {
        "display": "block",
        "vertical-align": "top",
        //###########################
        "border-radius": "0px",
        "background-color": "transparent",
        "width": "auto",
        "height": "auto",
        "min-width": "0",
        "max-width": "none",
        "min-height": "0",
        "max-height": "none",
        "box-sizing": "border-box",
        "position": "static",
        "padding": "0",
        "margin": "0",
        "border-width": "0",
        "border-style": "solid",
        "outline-width": "0",
        "outline-style": "solid",
        "outline-offset": "0",
        "text-align": "left",
        "font-size": "inherit",
        "line-height": "normal",
        "touch-action": "manipulation",
        "-ms-touch-action": "manipulation",
        "-webkit-overflow-scrolling": "touch",
        "border-color": "#000000",
        "outline-color": "#000000",
        "overflow": "visible",
        "top": "auto",
        "right": "auto",
        "bottom": "auto",
        "left": "auto",
        "overflow-wrap": "inherit",
        "word-wrap": "inherit",
        "word-break": "inherit"
    };
    let SpanStyleObj = {
        "display": "inline",
        "vertical-align": "baseline",
        //###########################
        "border-radius": "0px",
        "background-color": "transparent",
        "width": "auto",
        "height": "auto",
        "min-width": "0",
        "max-width": "none",
        "min-height": "0",
        "max-height": "none",
        "box-sizing": "border-box",
        "position": "static",
        "padding": "0",
        "margin": "0",
        "border-width": "0",
        "border-style": "solid",
        "outline-width": "0",
        "outline-style": "solid",
        "outline-offset": "0",
        "text-align": "left",
        "font-size": "inherit",
        "line-height": "normal",
        "touch-action": "manipulation",
        "-ms-touch-action": "manipulation",
        "-webkit-overflow-scrolling": "touch",
        "border-color": "#000000",
        "outline-color": "#000000",
        "overflow": "visible",
        "top": "auto",
        "right": "auto",
        "bottom": "auto",
        "left": "auto",
        "overflow-wrap": "inherit",
        "word-wrap": "inherit",
        "word-break": "inherit"
    };
    let TableStyleObj = {
        "display": "table",
        "vertical-align": "baseline",
        //###########################
        "border-radius": "0px",
        "background-color": "transparent",
        "width": "auto",
        "height": "auto",
        "min-width": "0",
        "max-width": "none",
        "min-height": "0",
        "max-height": "none",
        "table-layout": "auto",
        "border-spacing": "0",
        "border-collapse": "collapse",
        "box-sizing": "border-box",
        "position": "static",
        "padding": "0",
        "margin": "0",
        "border-width": "0",
        "border-style": "solid",
        "outline-width": "0",
        "outline-style": "solid",
        "outline-offset": "0",
        "text-align": "left",
        "font-size": "inherit",
        "line-height": "normal",
        "touch-action": "manipulation",
        "-ms-touch-action": "manipulation",
        "-webkit-overflow-scrolling": "touch",
        "border-color": "#000000",
        "outline-color": "#000000",
        "overflow": "visible",
        "top": "auto",
        "right": "auto",
        "bottom": "auto",
        "left": "auto",
        "overflow-wrap": "inherit",
        "word-wrap": "inherit",
        "word-break": "inherit"
    };
    let TrStyleObj = {
        "display": "table-row",
        "vertical-align": "baseline",
        //###########################
        "border-radius": "0px",
        "background-color": "transparent",
        "width": "auto",
        "height": "auto",
        "min-width": "0",
        "max-width": "none",
        "min-height": "0",
        "max-height": "none",
        "box-sizing": "border-box",
        "position": "static",
        "padding": "0",
        "margin": "0",
        "border-width": "0",
        "border-style": "solid",
        "outline-width": "0",
        "outline-style": "solid",
        "outline-offset": "0",
        "text-align": "left",
        "font-size": "inherit",
        "line-height": "normal",
        "touch-action": "manipulation",
        "-ms-touch-action": "manipulation",
        "-webkit-overflow-scrolling": "touch",
        "border-color": "#000000",
        "outline-color": "#000000",
        "overflow": "visible",
        "top": "auto",
        "right": "auto",
        "bottom": "auto",
        "left": "auto",
        "overflow-wrap": "inherit",
        "word-wrap": "inherit",
        "word-break": "inherit"
    };
    let TdStyleObj = {
        "display": "table-cell",
        "vertical-align": "middle",
        //###########################
        "border-radius": "0px",
        "background-color": "transparent",
        "width": "auto",
        "height": "auto",
        "min-width": "0",
        "max-width": "none",
        "min-height": "0",
        "max-height": "none",
        "box-sizing": "border-box",
        "position": "static",
        "padding": "0",
        "margin": "0",
        "border-width": "0",
        "border-style": "solid",
        "outline-width": "0",
        "outline-style": "solid",
        "outline-offset": "0",
        "text-align": "left",
        "font-size": "inherit",
        "line-height": "normal",
        "touch-action": "manipulation",
        "-ms-touch-action": "manipulation",
        "-webkit-overflow-scrolling": "touch",
        "border-color": "#000000",
        "outline-color": "#000000",
        "overflow": "visible",
        "top": "auto",
        "right": "auto",
        "bottom": "auto",
        "left": "auto",
        "overflow-wrap": "inherit",
        "word-wrap": "inherit",
        "word-break": "inherit"
    };
    let RegEx = /([^;:]*):((?:[^;:']|'(?:[^\\']|\\.)*')*)(?:;|$)/g;
    let StyleToObj = function (CustomStyle) {
        CustomStyle = Contoso.clean(Contoso.nvl(CustomStyle));
        let CustomStyleObj = {};
        let TheMatch;
        while ((TheMatch = RegEx.exec(CustomStyle)) != null) {
            CustomStyleObj[Contoso.clean(TheMatch[1].toLowerCase(), true)] = Contoso.clean(TheMatch[2]);
        }
        return CustomStyleObj;
    };
    let ObjToStyle = function (StyleObj) {
        let StyleString = "";
        for (let key in StyleObj) {
            if (StyleObj.hasOwnProperty(key)) {
                StyleString += key + ":" + StyleObj[key] + ";";
            }
        }
        return StyleString;
    };
    let ModifyDefaultStyle = function (CustomStyleString, DefaultStyleObj) {
        let CustomStyleObj = StyleToObj(CustomStyleString);
        let NewStyleObj = {};
        for (let key in DefaultStyleObj) {
            if (DefaultStyleObj.hasOwnProperty(key)) {
                if (CustomStyleObj.hasOwnProperty(key)) {
                    NewStyleObj[key] = CustomStyleObj[key];
                    delete CustomStyleObj[key];
                } else {
                    NewStyleObj[key] = DefaultStyleObj[key];
                }
            }
        }
        return ObjToStyle(NewStyleObj) + ObjToStyle(CustomStyleObj);
    };
    let DefaultDivString = null;
    let DefaultSpanString = null;
    let DefaultTableString = null;
    let DefaultTrString = null;
    let DefaultTdString = null;
    let GetDefaultDivString = function () {
        return (DefaultDivString == null) ? (DefaultDivString = ObjToStyle(DivStyleObj)) : DefaultDivString;
    };
    let GetDefaultSpanString = function () {
        return (DefaultSpanString == null) ? (DefaultSpanString = ObjToStyle(SpanStyleObj)) : DefaultSpanString;
    };
    let GetDefaultTableString = function () {
        return (DefaultTableString == null) ? (DefaultTableString = ObjToStyle(TableStyleObj)) : DefaultTableString;
    };
    let GetDefaultTrString = function () {
        return (DefaultTrString == null) ? (DefaultTrString = ObjToStyle(TrStyleObj)) : DefaultTrString;
    };
    let GetDefaultTdString = function () {
        return (DefaultTdString == null) ? (DefaultTdString = ObjToStyle(TdStyleObj)) : DefaultTdString;
    };
    return {
        get GetDivStyle() {
            return function (CustomString) {
                return Contoso.empty(CustomString) ? GetDefaultDivString() : ModifyDefaultStyle(CustomString, DivStyleObj);
            };
        },
        get GetSpanStyle() {
            return function (CustomString) {
                return Contoso.empty(CustomString) ? GetDefaultSpanString() : ModifyDefaultStyle(CustomString, SpanStyleObj);
            };
        },
        get GetTableStyle() {
            return function (CustomString) {
                return Contoso.empty(CustomString) ? GetDefaultTableString() : ModifyDefaultStyle(CustomString, TableStyleObj);
            };
        },
        get GetTrStyle() {
            return function (CustomString) {
                return Contoso.empty(CustomString) ? GetDefaultTrString() : ModifyDefaultStyle(CustomString, TrStyleObj);
            };
        },
        get GetTdStyle() {
            return function (CustomString) {
                return Contoso.empty(CustomString) ? GetDefaultTdString() : ModifyDefaultStyle(CustomString, TdStyleObj);
            };
        }
    };
})();