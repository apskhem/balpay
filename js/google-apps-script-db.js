export default class GoogleAppsScriptDB {
    constructor(link) {
        this.link = link;
        this.callbackFns = {};
        this.defaultCallbackFn = null;
        this.dataRequestForms = {};
    }
    FormatRequestURL(params, action) {
        let url = this.link + "?";
        for (const key in params) {
            let value = params[key];
            if (value instanceof Array)
                value = value.toString();
            else if (value instanceof Object)
                value = JSON.stringify(value);
            url += `${key}=${value}&`;
        }
        url += "action=" + action;
        return url;
    }
    Request(action, data, CallbackFn) {
        let url = this.FormatRequestURL(data !== null && data !== void 0 ? data : this.dataRequestForms[action](), action);
        axios.get(url).then((res) => {
            if (CallbackFn) {
                CallbackFn(res.data, data !== null && data !== void 0 ? data : this.dataRequestForms[action]());
            }
            else if (this.callbackFns[action]) {
                this.callbackFns[action](res.data, data !== null && data !== void 0 ? data : this.dataRequestForms[action]());
            }
            else if (this.defaultCallbackFn) {
                this.defaultCallbackFn(res.data, data !== null && data !== void 0 ? data : this.dataRequestForms[action]());
            }
        });
    }
    Response(action, CallbackFunction) {
        if (CallbackFunction === null) {
            delete this.callbackFns[action];
        }
        else {
            this.callbackFns[action] = CallbackFunction;
        }
    }
    DefaultResponse(CallbackFunction) {
        this.defaultCallbackFn = CallbackFunction;
    }
    DataRequestForm(action, dataRequestForm) {
        if (dataRequestForm === null) {
            delete this.dataRequestForms[action];
        }
        else {
            this.dataRequestForms[action] = dataRequestForm;
        }
    }
}
