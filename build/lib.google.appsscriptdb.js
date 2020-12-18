export default class GoogleAppsScriptDB {
    constructor(link) {
        this.callbackfnMap = new Map();
        this.defaultResponsefn = null;
        this.dataRequestForms = new Map();
        this.link = link;
    }
    formatRequestURL(params, action) {
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
    request(action, data, callbackfn) {
        var _a;
        const d = (_a = this.dataRequestForms.get(action)) === null || _a === void 0 ? void 0 : _a();
        if (!data && !d)
            throw new Error("The action hasn't been specified.");
        const url = this.formatRequestURL(data !== null && data !== void 0 ? data : d, action);
        axios.get(url).then((res) => {
            var _a;
            if (callbackfn) {
                callbackfn(res.data, data !== null && data !== void 0 ? data : d);
            }
            else if (this.callbackfnMap.get(action)) {
                (_a = this.callbackfnMap.get(action)) === null || _a === void 0 ? void 0 : _a(res.data, data !== null && data !== void 0 ? data : d);
            }
            else if (this.defaultResponsefn) {
                this.defaultResponsefn(res.data, data !== null && data !== void 0 ? data : d);
            }
        });
    }
    setResponseAction(action, callbackfn) {
        if (callbackfn) {
            this.callbackfnMap.set(action, callbackfn);
        }
        else {
            this.callbackfnMap.delete(action);
        }
    }
    setDataRequestForm(action, dataRequestForm) {
        if (dataRequestForm) {
            this.dataRequestForms.set(action, dataRequestForm);
        }
        else {
            this.dataRequestForms.delete(action);
        }
    }
}
