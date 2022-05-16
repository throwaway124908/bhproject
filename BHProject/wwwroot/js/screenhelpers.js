const ScreenHelpers = (function () {
    let VhTestElem = null;
    let HtmlElem = document.getElementsByTagName("html")[0];
    let IsMobile = /mobile/i.test(navigator.userAgent);
    //#############
    let ViewportHeightFuncList = {};
    let ViewportHeightFuncCounter = 0;
    let LastViewportHeight = null;
    let ViewportHeightFunc = function (SpecificKey = null) {
        let FireSingleEvent = SpecificKey != null;
        let CurrentViewportHeight = HtmlElem.clientHeight;
        if (LastViewportHeight !== CurrentViewportHeight || FireSingleEvent) {
            //window.ViewportHeight has changed if we make it here
            LastViewportHeight = CurrentViewportHeight;
            //#############
            if (FireSingleEvent) {
                ViewportHeightFuncList[SpecificKey]();
            } else {
                for (let Key in ViewportHeightFuncList) {
                    if (ViewportHeightFuncList.hasOwnProperty(Key)) {
                        ViewportHeightFuncList[Key]();
                    }
                }
            }
        }
    };
    window.addEventListener("resize", function () { ViewportHeightFunc(); });
    //#############
    let _addViewportHeightChangeEvent = function (Func, FireEvent = false) {
        typeof (Func) != "undefined" || err("Func is not defined.");
        let Key = ViewportHeightFuncCounter.toString();
        ViewportHeightFuncList[Key] = Func;
        ViewportHeightFuncCounter++;
        FireEvent && ViewportHeightFunc(Key);
        return function () {
            ViewportHeightFuncList.hasOwnProperty(Key) || err("function has already been removed.");
            delete ViewportHeightFuncList[Key];
        };
    };
    //#############
    let OrientationFuncList = {};
    let OrientationFuncCounter = 0;
    let LastIsVertical = null;
    let OrientationFunc = function (SpecificKey = null) {
        let FireSingleEvent = SpecificKey != null;
        let CurrentIsVertical = HtmlElem.clientHeight > HtmlElem.clientWidth;
        if (LastIsVertical !== CurrentIsVertical || FireSingleEvent) {
            //the screen orientation has changed if we make it here
            LastIsVertical = CurrentIsVertical;
            //#############
            if (FireSingleEvent) {
                OrientationFuncList[SpecificKey](CurrentIsVertical);
            } else {
                for (let Key in OrientationFuncList) {
                    if (OrientationFuncList.hasOwnProperty(Key)) {
                        OrientationFuncList[Key](CurrentIsVertical);
                    }
                }
            }
        }
    };
    window.addEventListener("resize", function () { OrientationFunc(); });
    //#############
    let _addOrientationChangeEvent = function (Func, FireEvent = false) {
        typeof (Func) != "undefined" || err("Func is not defined.");
        let Key = OrientationFuncCounter.toString();
        OrientationFuncList[Key] = Func;
        OrientationFuncCounter++;
        FireEvent && OrientationFunc(Key);
        return function () {
            OrientationFuncList.hasOwnProperty(Key) || err("function has already been removed.");
            delete OrientationFuncList[Key];
        };
    };
    let _vhUnitOffset = function () {
        //FIX FOR THE SAFARI VH UNIT QUIRK
        if (VhTestElem == null) {
            VhTestElem = document.body.appendChild(document.createElement("div"));
            VhTestElem.style.cssText = DefaultStyles.GetDivStyle();
            VhTestElem.style.position = "fixed";
            VhTestElem.style.top = "0px";
            VhTestElem.style.left = "0px";
            VhTestElem.style.width = "0px";
            VhTestElem.style.zIndex = "1000";
            VhTestElem.style.backgroundColor = "red";
            VhTestElem.style.height = "100vh";
            VhTestElem.style.overflow = "hidden";
        }
        return VhTestElem.offsetHeight - HtmlElem.clientHeight;
    };
    let _isIframe = function () {
        let Parent;
        try {
            //window.parent will throw an exception if it's cross-origin,
            //which proves we're in an iframe
            Parent = window.parent;
        } catch (e) {
            return true;
        }
        return Parent != window;
    };
    return {
        get addViewportHeightChangeEvent() {
            return _addViewportHeightChangeEvent;
        },
        get addOrientationChangeEvent() {
            return _addOrientationChangeEvent;
        },
        get cssPageWidth() {
            return window.innerWidth;
        },
        get viewportWidth() {
            /*
            When clientWidth is used on the root element (the <html> element, or on <body> if the document is in quirks mode),
            the viewport's width (excluding any scrollbar) is returned. This is a special case of clientWidth.
            */
            return HtmlElem.clientWidth;
        },
        get viewportHeight() {
            /*
            When clientHeight is used on the root element (the <html> element, or on <body> if the document is in quirks mode),
            the viewport's height (excluding any scrollbar) is returned. This is a special case of clientHeight.
            */
            return HtmlElem.clientHeight;
        },
        get vhUnitOffset() {
            return _vhUnitOffset();
        },
        get isVertical() {
            return HtmlElem.clientHeight > HtmlElem.clientWidth;
        },
        get isMobile() {
            return IsMobile;
        },
        get isIframe() {
            return _isIframe;
        }
    };
})();