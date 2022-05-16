function GetPopupInstance() {
    let UndoFreeze = null;
    let MainDivClicked = false;
    let MasterDiv = null;
    let TitleDivHeight = 36;
    let FooterDivHeight = 36;
    let MainDivBorderWidth = 0;
    let CloseFunc = null;
    let RemoveViewportHeightEventFunc = null;
    let FixMinVal = function (input, name) {
        input = Contoso.nvl(input).toLowerCase();
        let re = /^(?:0+(?:\.0+)?|-?[0-9]+(?:\.[0-9]+)?(?:px|%))$/i;
        re.test(input) || Contoso.err(name + " must be '0', a pixel value (e.g. '100px'), or a percentage value (e.g. '30%'). '" + input + "' is invalid.");
        return input.replace(/0$/, "0px"); //add 'px' to 0 values
    };
    let FixMaxVal = function (input, name) {
        input = Contoso.nvl(input).toLowerCase();
        let re = /^(?:none|0+(?:\.0+)?|-?[0-9]+(?:\.[0-9]+)?(?:px|%))$/i;
        re.test(input) || Contoso.err(name + " must be 'none', '0', a pixel value (e.g. '100px'), or a percentage value (e.g. '30%'). '" + input + "' is invalid.");
        return input.replace(/0$/, "0px"); //add 'px' to 0 values
    };
    let FixMainVal = function (input, name) {
        input = Contoso.nvl(input).toLowerCase();
        let re = /^(?:auto|0+(?:\.0+)?|-?[0-9]+(?:\.[0-9]+)?(?:px|%))$/i;
        re.test(input) || Contoso.err(name + " must be 'auto', '0', a pixel value (e.g. '100px'), or a percentage value (e.g. '30%'). '" + input + "' is invalid.");
        return input.replace(/0$/, "0px"); //add 'px' to 0 values
    };
    let _show = function (Opts) {
        if (MasterDiv == null) {
            let EnableBlackout = Contoso.is_boolean(Opts.blackout) ? Opts.blackout : false;
            let Options = {
                blackout: EnableBlackout,
                zIndex: Contoso.is_number(Opts.zIndex) ? Opts.zIndex : 1000,
                screenOpacity: EnableBlackout ? "0.85" : (Contoso.is_number(Opts.screenOpacity) ? Opts.screenOpacity : "0.5"),
                titleBackgroundColor: EnableBlackout ? "transparent" : (Contoso.is_string(Opts.titleBackgroundColor) ? Opts.titleBackgroundColor : ""), //stylesheet: popup_titleBackgroundColor
                footerBackgroundColor: EnableBlackout ? "transparent" : (Contoso.is_string(Opts.footerBackgroundColor) ? Opts.footerBackgroundColor : ""), //stylesheet: popup_footerBackgroundColor
                contentBackgroundColor: EnableBlackout ? "transparent" : (Contoso.is_string(Opts.contentBackgroundColor) ? Opts.contentBackgroundColor : ""), //stylesheet: popup_contentBackgroundColor
                fontFamily: Contoso.is_string(Opts.fontFamily) ? Opts.fontFamily : "", //stylesheet: popup_fontFamily
                showCloseButton: Contoso.is_boolean(Opts.showCloseButton) ? Opts.showCloseButton : false,
                //################
                width: FixMainVal((Contoso.is_defined(Opts.width) ? Opts.width : "auto"), "width"),
                minWidth: FixMinVal((Contoso.is_defined(Opts.minWidth) ? Opts.minWidth : "272px"), "minWidth"),
                maxWidth: FixMaxVal((Contoso.is_defined(Opts.maxWidth) ? Opts.maxWidth : "600px"), "maxWidth"),
                //################
                height: FixMainVal((Contoso.is_defined(Opts.height) ? Opts.height : "auto"), "height"),
                minHeight: FixMinVal((Contoso.is_defined(Opts.minHeight) ? Opts.minHeight : "0px"), "minWidth"),
                maxHeight: FixMaxVal((Contoso.is_defined(Opts.maxHeight) ? Opts.maxHeight : "none"), "maxWidth"),
                //################
                verticalPadding: EnableBlackout ? 0 : (Contoso.is_number(Opts.verticalPadding) ? Opts.verticalPadding : 20),
                textColor: EnableBlackout ? "#ffffff" : (Contoso.is_string(Opts.textColor) ? Opts.textColor : ""), //stylesheet: popup_textColor
                borderColor: EnableBlackout ? "#ffffff" : (Contoso.is_string(Opts.borderColor) ? Opts.borderColor : ""), //stylesheet: popup_borderColor
                borderRadius: Contoso.is_number(Opts.borderRadius) ? Opts.borderRadius : 10,
                shadowWidth: EnableBlackout ? 0 : (Contoso.is_number(Opts.shadowWidth) ? Opts.shadowWidth : 20),
                title: Contoso.is_string(Opts.title) ? Opts.title : "",
                content: Contoso.is_string(Opts.content) ? Opts.content : "",
                footer: Contoso.is_string(Opts.footer) ? Opts.footer : "",
                blurClose: Contoso.is_boolean(Opts.blurClose) ? Opts.blurClose : false,
                onClose: Contoso.is_function(Opts.onClose) ? Opts.onClose : null
            };
            UndoFreeze = Contoso.FreezeBody();
            //#################################################
            let html = '';
            html += '<div class="screen" style="' + DefaultStyles.GetDivStyle() + '"></div>';
            html += '<table class="maintable" style="' + DefaultStyles.GetTableStyle() + '">';
            html += '<tr style="' + DefaultStyles.GetTrStyle() + '">';
            html += '<td class="maintd" style="' + DefaultStyles.GetTdStyle() + '">';
            html += '<div class="maindiv" style="' + DefaultStyles.GetDivStyle() + '">';
            if (!Contoso.empty(Options.title)) {
                html += '<div class="titlediv" style="' + DefaultStyles.GetDivStyle() + '">';
                html += '<table class="titletable" style="' + DefaultStyles.GetTableStyle() + '">';
                html += '<tr style="' + DefaultStyles.GetTrStyle() + '">';
                html += '<td class="titletd1" style="' + DefaultStyles.GetTdStyle() + '">';
                html += '<table class="titlefixedtable" style="' + DefaultStyles.GetTableStyle() + '">';
                html += '<tr style="' + DefaultStyles.GetTrStyle() + '">';
                html += '<td class="titlefixedtd" style="' + DefaultStyles.GetTdStyle() + '">';
                html += '</td>';
                html += '</tr>';
                html += '</table>';
                html += '</td>';
                html += '<td class="titletd2" style="' + DefaultStyles.GetTdStyle() + '">';
                html += '<div style="' + DefaultStyles.GetDivStyle() + '">&#xed6d;</div>';
                html += '</td>';
                html += '</tr>';
                html += '</table>';
                html += '</div>';
            }
            html += '<div class="contentdiv" style="' + DefaultStyles.GetDivStyle() + '">';
            html += '</div>';
            if (!Contoso.empty(Options.footer)) {
                html += '<div class="footerdiv" style="' + DefaultStyles.GetDivStyle() + '">';
                html += '<table class="footertable" style="' + DefaultStyles.GetTableStyle() + '">';
                html += '<tr style="' + DefaultStyles.GetTrStyle() + '">';
                html += '<td class="footertd" style="' + DefaultStyles.GetTdStyle() + '">';
                html += '</td>';
                html += '</tr>';
                html += '</table>';
                html += '</div>';
            }
            html += '</div>';
            html += '</td>';
            html += '</tr>';
            html += '</table>';
            //#################################################
            MasterDiv = document.createElement("div");
            MasterDiv.style.cssText = DefaultStyles.GetDivStyle();
            MasterDiv.style.position = "fixed";
            MasterDiv.style.top = "0px";
            MasterDiv.style.left = "0px";
            MasterDiv.style.width = "100%";
            MasterDiv.style.height = "100%";
            MasterDiv.style.zIndex = Contoso.nvl(Options.zIndex);
            MasterDiv.innerHTML = html;
            MasterDiv.style.overflow = "hidden";
            MasterDiv.onclick = function () {
                if (!MainDivClicked) {
                    //call screen click events
                    if (Options.blurClose) {
                        if (CloseFunc == null) {
                            _kill();
                        } else {
                            CloseFunc();
                        }
                    }
                }
                MainDivClicked = false;
            };
            //MasterDiv.style.backgroundColor = "rgba(0,0,0,0.5)";
            //#################################################
            let MainTable = MasterDiv.getElementsByClassName("maintable")[0];
            MainTable.style.width = "100%";
            MainTable.style.height = "100%";
            //have to give the main table overflow:hidden so the underlay screen doesn't cause a scrollbar to appear
            MainTable.style.overflow = "hidden";
            MainTable.style.position = "relative";
            MainTable.style.tableLayout = "fixed";
            //#################################################
            let MainTD = MasterDiv.getElementsByClassName("maintd")[0];
            MainTD.style.height = "100%";
            MainTD.style.textAlign = "center";
            MainTD.style.verticalAlign = "middle";
            //have to give the main td position:static or else it will stretch the page in MS Edge browser
            MainTD.style.position = "static";
            //#################################################
            let Screen = MasterDiv.getElementsByClassName("screen")[0];
            Screen.style.width = "100%";
            Screen.style.height = "100%";
            Screen.style.position = "absolute";
            Screen.style.top = "0px";
            Screen.style.left = "0px";
            Screen.style.backgroundColor = "rgba(0,0,0," + Options.screenOpacity + ")";
            //#################################################
            let MainDiv = MasterDiv.getElementsByClassName("maindiv")[0];
            MainDiv.style.position = "relative";
            MainDiv.style.zIndex = "2";
            MainDiv.style.verticalAlign = "top";
            MainDiv.style.display = "inline-block";
            MainDiv.style.width = Options.width;
            MainDiv.style.minWidth = Options.minWidth;
            MainDiv.style.maxWidth = Options.maxWidth;
            MainDiv.style.wordWrap = "break-word";
            MainDiv.style.overflowWrap = "break-word";
            MainDiv.style.height = "auto";
            MainDiv.style.minHeight = "0px";
            MainDiv.style.maxHeight = "none";
            MainDiv.style.margin = "0px auto";
            MainDiv.style.boxShadow = "0px 0px " + Options.shadowWidth + "px 0px rgba(0,0,0,1)";
            MainDiv.style.borderRadius = Options.borderRadius + "px";
            MainDiv.style.borderWidth = MainDivBorderWidth + "px";
            /*
            MainDiv.style.opacity = "0";
            MainDiv.style.transform = "scale(0,0)";
            anime({
                targets: MainDiv,
                opacity: 1,
                scale: 1,
                easing: "easeOutCubic",
                duration: 200,
                complete: function () {
                }
            });
            */
            //###########
            Contoso.AddClass(MainDiv, "popup_contentBackgroundColor");
            MainDiv.style.backgroundColor = Options.contentBackgroundColor;
            //###########
            Contoso.AddClass(MainDiv, "popup_borderColor");
            MainDiv.style.borderColor = Options.borderColor;
            //###########
            Contoso.AddClass(MainDiv, "popup_textColor");
            MainDiv.style.color = Options.textColor;
            //###########
            Contoso.AddClass(MainDiv, "popup_fontFamily");
            if (Contoso.empty(Opts.fontFamily)) {
                MainDiv.style.removeProperty("font-family");
            } else {
                MainDiv.style.fontFamily = Opts.fontFamily;
            }
            //###########
            MainDiv.style.overflow = "hidden";
            MainDiv.onclick = function () {
                MainDivClicked = true;
            };
            //#################################################
            //TitleDiv is used elsewhere so declare it outside this if-statement
            let TitleDiv = null;
            let CloseButton = null;
            if (!Contoso.empty(Options.title)) {
                TitleDiv = MasterDiv.getElementsByClassName("titlediv")[0];
                TitleDiv.style.padding = "0px 0px 0px 5px";
                //titlediv needs to have a set height for the ContentDiv dimensions to be accurate
                TitleDiv.style.height = TitleDivHeight + "px";
                TitleDiv.style.borderBottomWidth = MainDivBorderWidth + "px";
                TitleDiv.style.borderColor = MainDiv.style.borderColor;
                //###########
                Contoso.AddClass(TitleDiv, "popup_titleBackgroundColor");
                TitleDiv.style.backgroundColor = Options.titleBackgroundColor;
                //###########
                let TitleTable = MasterDiv.getElementsByClassName("titletable")[0];
                TitleTable.style.width = "100%";
                TitleTable.style.height = "100%";
                //###########
                let TitleTd1 = MasterDiv.getElementsByClassName("titletd1")[0];
                TitleTd1.style.height = "100%";
                //###########
                let TitleFixedTable = MasterDiv.getElementsByClassName("titlefixedtable")[0];
                TitleFixedTable.style.width = "100%";
                TitleFixedTable.style.height = "100%";
                TitleFixedTable.style.tableLayout = "fixed";
                //###########
                let TitleFixedTd = MasterDiv.getElementsByClassName("titlefixedtd")[0];
                TitleFixedTd.style.whiteSpace = "nowrap";
                TitleFixedTd.style.height = "100%";
                TitleFixedTd.style.overflow = "hidden";
                TitleFixedTd.style.textOverflow = "ellipsis";
                TitleFixedTd.style.fontWeight = "bold";
                TitleFixedTd.innerHTML = Options.title;
                //###########
                let TitleTd2 = MasterDiv.getElementsByClassName("titletd2")[0];
                TitleTd2.style.width = "0.01%";
                if (!Options.showCloseButton) {
                    TitleTd2.style.display = "none";
                }
                //###########
                let CloseButtonSize = TitleDivHeight - 4;
                let CloseButtonFontSize = TitleDivHeight - 6;
                TitleTd2.style.paddingRight = 2 + "px";
                CloseButton = TitleTd2.getElementsByTagName("*")[0];
                CloseButton.style.width = CloseButtonSize + "px";
                CloseButton.style.height = CloseButtonSize + "px";
                CloseButton.style.lineHeight = CloseButtonSize + "px";
                CloseButton.style.textAlign = "center";
                CloseButton.style.fontFamily = "Icomoon";
                CloseButton.style.fontSize = CloseButtonFontSize + "px";
                //CloseButton.style.fontFamily = "Monaco,Consolas,Menlo,Lucida Console";
                CloseButton.style.cursor = "pointer";
                CloseButton.style.userSelect = "none";
                if (Options.blackout) {
                } else {
                    CloseButton.style.borderWidth = "1px";
                    CloseButton.style.backgroundColor = "#c0c0c0";
                }
                CloseButton.onclick = function () {
                    if (CloseFunc == null) {
                        _kill();
                    } else {
                        CloseFunc();
                    }
                };
            }
            //#################################################
            let ContentDiv = MasterDiv.getElementsByClassName("contentdiv")[0];
            ContentDiv.style.padding = "0px";
            ContentDiv.style.overflow = "auto";
            ContentDiv.style.position = "relative";
            ContentDiv.innerHTML = Options.content;
            //###############
            if (!Contoso.empty(Options.footer)) {
                let FooterDiv = MasterDiv.getElementsByClassName("footerdiv")[0];
                FooterDiv.style.display = Contoso.empty(Options.footer) ? "none" : "block";
                FooterDiv.style.borderColor = MainDiv.style.borderColor;
                FooterDiv.style.borderTopWidth = MainDivBorderWidth + "px";
                FooterDiv.style.height = FooterDivHeight + "px";
                //###############
                Contoso.AddClass(FooterDiv, "popup_footerBackgroundColor");
                FooterDiv.style.backgroundColor = Options.footerBackgroundColor;
                //###############
                let FooterTable = MasterDiv.getElementsByClassName("footertable")[0];
                FooterTable.style.width = "100%";
                FooterTable.style.height = "100%";
                //###########
                let FooterTd = MasterDiv.getElementsByClassName("footertd")[0];
                FooterTd.style.height = "100%";
                FooterTd.style.wordBreak = "break-all"; //use word-break:break-all because the td can't be in a fixed table
                FooterTd.innerHTML = Options.footer;
                //###########
                _footer = FooterTd;
            }
            //#################################################
            _master = MasterDiv;
            _content = ContentDiv;
            _closeButton = CloseButton;
            CloseFunc = Options.onClose;
            //######################################
            let GetUnit = function (input) {
                return input.replace(/[0-9.]+/g, "");
            };
            let GetNumber = function (input) {
                input = input.replace(/[^0-9.]+/g, "");
                return Contoso.empty(input) ? 100 : parseFloat(input); //use '100' if not a number so it can be used as a percentage when the unit is 'none'
            };
            let HeightUnit = GetUnit(Options.height);
            let MinHeightUnit = GetUnit(Options.minHeight);
            let MaxHeightUnit = GetUnit(Options.maxHeight);
            let HeightNumber = GetNumber(Options.height);
            let MinHeightNumber = GetNumber(Options.minHeight);
            let MaxHeightNumber = GetNumber(Options.maxHeight);
            //######################################
            let Height1 = MainDivBorderWidth * 2;
            let Height2 = Contoso.empty(Options.title) ? 0 : TitleDivHeight;
            let Height3 = Contoso.empty(Options.footer) ? 0 : FooterDivHeight;
            let Height4 = Options.verticalPadding * 2;
            let CalcSum = Height1 + Height2 + Height3 + Height4;
            if (ScreenHelpers.isMobile) {
                let SetContentDivHeight = function () {
                    ContentDiv.style.height = (HeightUnit === "auto") ? "auto" : ((HeightUnit === "%") ? (((ScreenHelpers.viewportHeight * (HeightNumber / 100)) - CalcSum) + "px") : ((HeightNumber - CalcSum) + "px"));
                    ContentDiv.style.minHeight = (MinHeightUnit === "%") ? (((ScreenHelpers.viewportHeight * (MinHeightNumber / 100)) - CalcSum) + "px") : ((MinHeightNumber - CalcSum) + "px");
                    ContentDiv.style.maxHeight = (MaxHeightUnit === "none" || MaxHeightUnit === "%") ? (((ScreenHelpers.viewportHeight * (MaxHeightNumber / 100)) - CalcSum) + "px") : ((MaxHeightNumber - CalcSum) + "px");
                };
                RemoveViewportHeightEventFunc = ScreenHelpers.addViewportHeightChangeEvent(SetContentDivHeight, true);
            } else {
                ContentDiv.style.height = (HeightUnit === "auto") ? "auto" : ((HeightUnit === "%") ? ("calc((100vh * " + (HeightNumber / 100) + ") - " + CalcSum + "px)") : ((HeightNumber - CalcSum) + "px"));
                ContentDiv.style.minHeight = (MinHeightUnit === "%") ? ("calc((100vh * " + (MinHeightNumber / 100) + ") - " + CalcSum + "px)") : ((MinHeightNumber - CalcSum) + "px");
                ContentDiv.style.maxHeight = (MaxHeightUnit === "none" || MaxHeightUnit === "%") ? ("calc((100vh * " + (MaxHeightNumber / 100) + ") - " + CalcSum + "px)") : ((MaxHeightNumber - CalcSum) + "px");
            }
            //#################################################
            document.body.appendChild(MasterDiv);
            //#################################################
            Contoso.EvalScriptElements(MasterDiv);
        }
    };
    //##########
    let _kill = function () {
        if (MasterDiv != null) {
            MasterDiv.parentNode.removeChild(MasterDiv);
            MasterDiv = null;
            UndoFreeze();
            //##########
            _master = null;
            _content = null;
            _footer = null;
            _closeButton = null;
            //##########
            RemoveViewportHeightEventFunc != null && RemoveViewportHeightEventFunc();
            RemoveViewportHeightEventFunc = null;
        }
    };
    let _hide = function () {
        if (MasterDiv != null) {
            MasterDiv.style.display = "none";
        }
    };
    let _unhide = function () {
        if (MasterDiv != null) {
            MasterDiv.style.display = "block";
        }
    };
    //##########
    let _master = null;
    let _content = null;
    let _footer = null;
    let _closeButton = null;
    //#####################################################
    return {
        get show() {
            return _show;
        },
        get kill() {
            return _kill;
        },
        get hide() {
            return _hide;
        },
        get unhide() {
            return _unhide;
        },
        get master() {
            return _master;
        },
        get content() {
            return _content;
        },
        get footer() {
            return _footer;
        },
        get closeButton() {
            return _closeButton;
        }
    };
}