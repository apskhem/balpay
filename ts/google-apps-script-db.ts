declare const axios: { [key: string]: any }; // for supporting axios

interface ServerResponse {
    data: ServerData;
}

interface ServerData {
    [data: string]: any;
}

interface RequestParamFormat {
    [key: string]: string | [] | {};
}

type CallbackFunction = (res: { [key: string]: any }, oldData?: { [key: string]: any } ) => void;
type DataRequestFormFunction = () => RequestParamFormat;

export default class GoogleAppsScriptDB {

    public readonly callbackFns: { [action: string]: CallbackFunction } = {};
    public defaultCallbackFn: CallbackFunction | null = null;
    public readonly dataRequestForms: { [action: string]: DataRequestFormFunction } = {};

    public constructor(public readonly link: string) { }

    private FormatRequestURL(params: RequestParamFormat, action: string) {
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

    public Request(action: string, data?: RequestParamFormat, CallbackFn?: CallbackFunction) {
        let url = this.FormatRequestURL(data ?? this.dataRequestForms[action](), action);

        axios.get(url)/* do get */.then((res: ServerResponse) => {
            if (CallbackFn) {
                CallbackFn(res.data, data ?? this.dataRequestForms[action]());
            }
            else if (this.callbackFns[action]) {
                this.callbackFns[action](res.data, data ?? this.dataRequestForms[action]());
            }
            else if (this.defaultCallbackFn) {
                this.defaultCallbackFn(res.data, data ?? this.dataRequestForms[action]());
            }
        });
    }

    public Response(action: string, CallbackFunction: CallbackFunction) {
        if (CallbackFunction === null) {
            delete this.callbackFns[action];
        }
        else {
            this.callbackFns[action] = CallbackFunction;
        }
    }

    public DefaultResponse(CallbackFunction: CallbackFunction) {
        this.defaultCallbackFn = CallbackFunction;
    }

    public DataRequestForm(action: string, dataRequestForm: DataRequestFormFunction) {
        if (dataRequestForm === null) {
            delete this.dataRequestForms[action];
        }
        else {
            this.dataRequestForms[action] = dataRequestForm;
        }
    }
}