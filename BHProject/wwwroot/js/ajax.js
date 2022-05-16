
function AjaxWrapper(Url, Form, SuccessFunc, UndoDisableOnSuccess, FailureFunc) {
    UndoDisableOnSuccess = Contoso.is_boolean(UndoDisableOnSuccess) ? UndoDisableOnSuccess : false;
    let OnError = function () {
        clearInterval(RequestTimer);
        Contoso.is_function(UndoDisable) && UndoDisable();
        Contoso.popup_alert("Connection failed. Waited " + Contoso.roundFloat(t / 1000, 1) + "s");
    };
    let OnAbort = function () {
        clearInterval(RequestTimer);
        Contoso.is_function(UndoDisable) && UndoDisable();
        Contoso.popup_alert("Connection was aborted. Waited " + Contoso.roundFloat(t / 1000, 1) + "s");
    };
    let OnTimeout = function () {
        clearInterval(RequestTimer);
        Contoso.is_function(UndoDisable) && UndoDisable();
        Contoso.popup_alert("Connection timed out. Waited " + Contoso.roundFloat(t / 1000, 1) + "s");
    };
    let Callback = function () {
        let Success = function () {
            UndoDisableOnSuccess && Contoso.is_function(UndoDisable) && UndoDisable();
            Contoso.is_function(SuccessFunc) && SuccessFunc.call(this);
        };
        let Fail = function () {
            Contoso.is_function(UndoDisable) && UndoDisable();
            Contoso.is_function(FailureFunc) && FailureFunc.call(this);
            if (this["RequireLogin"]) {
                GetLoginPopup();
            } else {
                let Msg = Contoso.NewLinesToBR(Contoso.FixHTML(this["ReturnVal"]));
                if (this["RefreshPage"]) {
                    let Html = '';
                    if (!Contoso.empty(Msg)) {
                        Html += '<div class="marginbottom">' + Msg + '</div>';
                    }
                    Html += 'Click \'Reload\' to reload the page.';
                    let ReloadFunc = function () {
                        Contoso.LockAndFreezeBody();
                        Contoso.RevisitPage();
                    };
                    let TheConfirmPopupObj = Contoso.popup_confirm(Html, ReloadFunc, null, 'Reload Page', false, false);
                    TheConfirmPopupObj.YesButton.value = "Reload";
                    TheConfirmPopupObj.NoButton.value = "Cancel";
                } else {
                    Contoso.popup_alert(Msg);
                }
            }
        };
        ReadXHRResponse(Success, Fail);
    };
    let t = 0;
    let RequestTimer = setInterval(function () { t += 100; }, 100);
    XHR.post(Form, Url, Callback, null, OnError, OnAbort, OnTimeout);
    let UndoDisable = Contoso.LockAndFreezeBody();
}

function ReadXHRResponse(Success, Fail) {
    let Obj = XHR.JSON;
    let StateOK = Contoso.is_object(Obj);
    let SuccessOK = StateOK && Contoso.is_boolean(Obj["Success"]);
    let ReturnValOK = StateOK && (Contoso.is_string(Obj["ReturnVal"]) || Obj["ReturnVal"] === null);
    let ReturnVal2OK = StateOK && (Contoso.is_string(Obj["ReturnVal2"]) || Obj["ReturnVal2"] === null);
    let RefreshPageOK = StateOK && Contoso.is_boolean(Obj["RefreshPage"]);
    let RequireLoginOK = StateOK && Contoso.is_boolean(Obj["RequireLogin"]);
    if (!StateOK || !SuccessOK || !ReturnValOK || !ReturnVal2OK || !RefreshPageOK || !RequireLoginOK) {
        Obj = { Success: false, ReturnVal: XHR.response, ReturnVal2: "", RefreshPage: false, RequireLogin: false };
        alert("JSON malformed or unfamiliar.");
        console.log("JSON malformed or unfamiliar.");
        Contoso.is_function(Fail) && Fail.call(Obj);
    } else if (Obj["Success"] === false) {
        Contoso.is_function(Fail) && Fail.call(Obj);
    } else {
        Contoso.is_function(Success) && Success.call(Obj);
    }
}

//############################################################################################################################################################################
//############################################################################################################################################################################
//############################################################################################################################################################################
//############################################################################################################################################################################


function EditReasons(Form, SuccessFunc, UndoDisableOnSuccess, FailureFunc) {
    AjaxWrapper("/api/EditReasons", Form, SuccessFunc, UndoDisableOnSuccess, FailureFunc);
}
