const XHR = (function () {
    let Queue = [];
    let Active = false;
    let XHRObject = new XMLHttpRequest();
    let BuildRequestObject = function (Method, Url, Callback, FormDataObj, OnError, OnAbort, OnTimeout) {
        return {
            Method: Method,
            Url: Url,
            Callback: Callback,
            FormDataObj: FormDataObj,
            OnError: OnError,
            OnAbort: OnAbort,
            OnTimeout: OnTimeout
        };
    };
    let ValidateRequestObject = function (Method, Url, Callback, Form, OnError, OnAbort, OnTimeout, AppendFields) {
        Method = Contoso.nvl(Method).toLowerCase();
        Contoso.is_string(Url) || Contoso.err("Url must be a string.");
        Method === "get" || Method === "post" || Contoso.err("Method must be 'get' or 'post'.");
        Callback = Contoso.is_defined(Callback) ? ((Callback == null || Contoso.is_function(Callback)) ? Callback : Contoso.err("Callback must be null or a function.")) : null;
        OnError = Contoso.is_defined(OnError) ? ((OnError == null || Contoso.is_function(OnError)) ? OnError : Contoso.err("optional arg OnError must be null or a function (if provided).")) : null;
        OnTimeout = Contoso.is_defined(OnTimeout) ? ((OnTimeout == null || Contoso.is_function(OnTimeout)) ? OnTimeout : Contoso.err("optional arg OnTimeout must be null or a function (if provided).")) : null;
        OnAbort = Contoso.is_defined(OnAbort) ? ((OnAbort == null || Contoso.is_function(OnAbort)) ? OnAbort : Contoso.err("optional arg OnAbort must be null or a function (if provided).")) : null;
        let FormDataObj = null;
        if (Method === "post") {
            AppendFields = Contoso.is_defined(AppendFields) ? ((AppendFields == null || Contoso.is_object(AppendFields)) ? AppendFields : Contoso.err("optional arg AppendFields must be null or a function (if provided).")) : null;
            let FormIsFormData = Contoso.is_formdata(Form);
            let FormIsElement = Contoso.is_element(Form);
            let FormIsObject = !FormIsFormData && !FormIsElement && Contoso.is_object(Form);
            !FormIsElement || Form.tagName.toUpperCase() === "FORM" || Contoso.err("<" + Form.tagName + "> element detected - only <form> elements are supported.");
            FormIsFormData || FormIsElement || FormIsObject || Contoso.err("Form must be a FormData object, an Element, or an object literal.");
            if (FormIsObject) {
                FormDataObj = new FormData();
                for (let Key in Form) {
                    if (Form.hasOwnProperty(Key)) {
                        FormDataObj.append(Key, Contoso.nvl(Form[Key]));
                    }
                }
            } else if (FormIsElement) {
                FormDataObj = new FormData(Form);
            } else {
                FormDataObj = Form;
            }
            //add extra fields to payload if there are any
            for (let Key in AppendFields) {
                if (AppendFields.hasOwnProperty(Key)) {
                    FormDataObj.append(Key, Contoso.nvl(AppendFields[Key]));
                }
            }
        }
        return BuildRequestObject(Method, Url, Callback, FormDataObj, OnError, OnAbort, OnTimeout);
    };
    let AddToQueue = function (RequestObj) {
        Queue.push(RequestObj);
    };
    let TryAdvanceQueue = function () {
        if (!Active && Queue.length > 0) {
            Active = true;
            let RequestObj = Queue.shift();
            Run(RequestObj);
        }
    };
    let Run = function (RequestObj) {
        let OnLoad = function (Errored = false, Aborted = false, TimedOut = false) {
            if (!OnloadFired) {
                XHRObject.onload = null;
                /*have to use a setTimeout with delay of 1ms so that Safari doesn't throw an "Errors occurred in opening the page" error message.*/
                setTimeout(function () {
                    OnloadFired = true;
                    Active = false;
                    _response = "";
                    _JSON = null;
                    /*remove control characters and remove spaces at beginning and end*/
                    _response = Contoso.RemoveControlCharacters(XHRObject.responseText).trim();
                    try {
                        _JSON = JSON.parse(_response);
                    } catch (e) {
                        _JSON = null;
                    }
                    if (Errored) {
                        Contoso.is_function(CurRequestObj.OnError) && CurRequestObj.OnError.call(ReturnObj);
                    } else if (Aborted) {
                        Contoso.is_function(CurRequestObj.OnAbort) && CurRequestObj.OnAbort.call(ReturnObj);
                    } else if (TimedOut) {
                        Contoso.is_function(CurRequestObj.OnTimeout) && CurRequestObj.OnTimeout.call(ReturnObj);
                    } else {
                        Contoso.is_function(CurRequestObj.Callback) && CurRequestObj.Callback.call(ReturnObj);
                    }
                    TryAdvanceQueue();
                }, 1);
            }
        };
        //build a new request object to take advantage of javascript object property intellisense
        let CurRequestObj = BuildRequestObject(RequestObj.Method, RequestObj.Url, RequestObj.Callback, RequestObj.FormDataObj, RequestObj.OnError, RequestObj.OnAbort, RequestObj.OnTimeout);
        let OnloadFired = false;
        XHRObject.open(CurRequestObj.Method, CurRequestObj.Url, true);
        //################################
        let ErroredOut = false;
        XHRObject.onerror = function () {
            if (!ErroredOut) {
                ErroredOut = true;
                OnLoad(true, false, false);
            }
        };
        XHRObject.onabort = function () {
            if (!ErroredOut) {
                ErroredOut = true;
                OnLoad(false, true, false);
            }
        };
        XHRObject.ontimeout = function () {
            if (!ErroredOut) {
                ErroredOut = true;
                OnLoad(false, false, true);
            }
        };
        //################################
        //IE9 and under do not support onerror/onabort/ontimeout
        //so check if anything has been downloaded before readyState is 4
        //if nothing has been downloaded then an error occurred
        //let SomethingDownloaded = false;
        //let ReadyStateChangeFunc = function () {
        //    SomethingDownloaded = (XHRObject.readyState === 3) ? true : SomethingDownloaded;
        //    if (!ErroredOut && !SomethingDownloaded && XHRObject.readyState === 4) {
        //        ErroredOut = true;
        //        OnLoad(true);
        //    }
        //};
        //XHRObject.onreadystatechange = ReadyStateChangeFunc;
        //no need to support IE9 anymore
        XHRObject.onreadystatechange = null;
        //################################
        XHRObject.onload = function () {
            OnLoad();
        };
        XHRObject.setRequestHeader("X-Requested-With", "xmlhttprequest");
        //################################
        if (CurRequestObj.Method === "get") {
            XHRObject.send("");
        } else {
            //the browser sets the Content-Type header if you send FormData
            //XHRObject.setRequestHeader("Content-Type", "multipart/form-data");
            XHRObject.send(CurRequestObj.FormDataObj);
        }
    };
    //################################
    let _response = "";
    let _JSON = null;
    let _get = function (Url, Callback = null, AppendFields = null, OnError = null, OnAbort = null, OnTimeout = null) {
        let RequestObj = ValidateRequestObject("get", Url, Callback, null, OnError, OnAbort, OnTimeout, AppendFields);
        AddToQueue(RequestObj);
        TryAdvanceQueue();
    };
    let _post = function (Form, Url, Callback = null, AppendFields = null, OnError = null, OnAbort = null, OnTimeout = null) {
        let RequestObj = ValidateRequestObject("post", Url, Callback, Form, OnError, OnAbort, OnTimeout, AppendFields);
        AddToQueue(RequestObj);
        TryAdvanceQueue();
    };
    //################################
    let ReturnObj = {
        get response() {
            return _response;
        }, get JSON() {
            return _JSON;
        }, get get() {
            return _get;
        }, get post() {
            return _post;
        }
    };
    return ReturnObj;
})();