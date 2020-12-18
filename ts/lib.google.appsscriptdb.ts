declare const axios: any; // for supporting axios

interface ServerResponse {
    data: ServerData;
}

interface ServerData {
    [data: string]: any;
}

interface RequestParamFormat {
    [key: string]: string | [] | {};
}

type CallbackFunction = (responseData: { [key: string]: any }, oldData?: { [key: string]: any } ) => void;
type DataRequestFormFunction = () => RequestParamFormat;

export default class GoogleAppsScriptDB {

    public readonly callbackfnMap = new Map<string, CallbackFunction>();
    public defaultResponsefn: CallbackFunction | null = null;
    public readonly dataRequestForms = new Map<string, DataRequestFormFunction>();

    public readonly link: string;

    public constructor(link: string) {
        this.link = link;
    }

    private formatRequestURL(params: RequestParamFormat, action: string): string {
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

    public request(action: string, data?: RequestParamFormat, callbackfn?: CallbackFunction): void {
        const d = this.dataRequestForms.get(action)?.();

        if (!data && !d) throw new Error("The action hasn't been specified.");

        const url = this.formatRequestURL(data ?? d as RequestParamFormat, action);

        axios.get(url).then((res: ServerResponse) => {
            if (callbackfn) {
                callbackfn(res.data, data ?? d);
            }
            else if (this.callbackfnMap.get(action)) {
                this.callbackfnMap.get(action)?.(res.data, data ?? d);
            }
            else if (this.defaultResponsefn) {
                this.defaultResponsefn(res.data, data ?? d);
            }
        });
    }

    public setResponseAction(action: string, callbackfn: CallbackFunction | null): void {
        if (callbackfn) {
            this.callbackfnMap.set(action, callbackfn);
        }
        else {
            this.callbackfnMap.delete(action);
        }
    }

    public setDataRequestForm(action: string, dataRequestForm: DataRequestFormFunction | null): void {
        if (dataRequestForm) {
            this.dataRequestForms.set(action, dataRequestForm);
        }
        else {
            this.dataRequestForms.delete(action);
        }
    }
}