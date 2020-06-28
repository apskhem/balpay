export default class GoogleAppsScriptDB {
    constructor(link) {
        this.link = link;
        this.callbackFunctions = {};
        this.defaultCallbackFunction = null;
        this.dataRequestForms = {};
    }

    FormatRequestURL(params, action) {
        let url = this.link + "?";

        for (const key in params) {
            let value = params[key];

            if (value instanceof Array) value = value.toString();
            else if (value instanceof Object) value = JSON.stringify(value);

            url += `${key}=${value}&`;
        }

        url += "action=" + action;
        return url;
    }

    Request(action, data, CallbackFunction) {
        let url = this.FormatRequestURL(data || this.dataRequestForms[action](), action);

        axios.get(url)
        .then(res => {
            if (CallbackFunction) {
                CallbackFunction(res.data, data || this.dataRequestForms[action]());
            }
            else if (this.callbackFunctions[action]) {
                this.callbackFunctions[action](res.data, data || this.dataRequestForms[action]());
            }
            else if (this.defaultCallbackFunction) {
                this.defaultCallbackFunction(res.data, data || this.dataRequestForms[action]());
            }
        });
    }

    Response(action, CallbackFunction) {
        if (CallbackFunction === null) {
            delete this.callbackFunctions[action];
        }
        else {
            this.callbackFunctions[action] = CallbackFunction;
        }
    }

    DefaultResponse(CallbackFunction) {
        this.defaultCallbackFunction = CallbackFunction
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