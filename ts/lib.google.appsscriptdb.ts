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

    public doGetRequest(action: string, data?: RequestParamFormat, callbackfn?: CallbackFunction): void {
        const d = this.dataRequestForms.get(action)?.();

        if (!data && !d) throw new Error("The action hasn't been specified.");

        const url = this.formatRequestURL(data ?? d as RequestParamFormat, action);
        const req = new XMLHttpRequest();

        req.responseType = "json";
        
        req.open("GET", url, true);
        req.onload = (e) => {
            const cur = e.currentTarget as XMLHttpRequest;

            if (req.readyState === 4 && (req.status === 200 || !req.status)) {
                if (callbackfn) {
                    callbackfn(cur.response, data ?? d);
                }
                else if (this.callbackfnMap.get(action)) {
                    this.callbackfnMap.get(action)?.(cur.response, data ?? d);
                }
                else if (this.defaultResponsefn) {
                    this.defaultResponsefn(cur.response, data ?? d);
                }
            }
            else {
                throw new Error("Request is unsuccessful");
            }
        }
        req.send();
    }

    public doPostRequest(action: string, data?: RequestParamFormat, callbackfn?: CallbackFunction): void {
        const d = this.dataRequestForms.get(action)?.();

        if (!data && !d) throw new Error("The action hasn't been specified.");

        const req = new XMLHttpRequest();

        req.responseType = "json";
        req.setRequestHeader("Content-Type", "application/json");
        req.open("POST", `${this.link}?action=${action}`, true);
        req.onload = (e) => {
            const cur = e.currentTarget as XMLHttpRequest;

            if (req.readyState === 4 && (req.status === 200 || !req.status)) {
                
            }
            else {
                throw new Error("Request is unsuccessful");
            }
        }
        req.send(JSON.stringify(data ?? d));
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