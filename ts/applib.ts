export abstract class App {
    public static readonly title: string = "PathInk";
    public static readonly readonlydeveloper: string = "Apisit Ritreungroj";
    public static readonly since: number = 2020;
    public static readonly version: string = "0.8.0b";
    public static readonly tag: string = "SVL";
    public static readonly saveFormat: string = ".svl";
}

export namespace App {
    
    type ByteUnit = "bytes" | "kB" | "MB" | "GB" | "TB" | "PB" | "EB" | "ZB" | "YB";
    
    export abstract class Window {
        public static cursorX = 0;
        public static cursorY = 0;
    }
    
    export abstract class Utils {

        static get todayDate() {
            let t = new Date();
            return t.getFullYear() + "." + t.getMonth() + "." + t.getDate();
        }

        static GetElementById = <T extends HTMLElement = HTMLElement>(id: string): T => document.getElementById(id) as T;

        static GetChildIndexOf(el: Element): number {
            if (!el.parentElement) return 0;

            let i = 0;
            while (el = el.previousElementSibling as Element) i++;

            return i;
        }

        static FormatNumber(num: number): string {
            const [whole, digit] = num.toFixed(2).toString().split(".");
            let res = "";
        
            const lastLen = whole.length - 1;
            for (let i = 0; i < whole.length; i++) res += whole[i] + ((!((lastLen - i) % 3) && i != lastLen) ? ",": "");
            
            return `${res}.${digit}`;
        }
    
        static DeformatNumber(readable: string): number {
            return parseFloat(readable.replace(/[,]/g, ""));
        }
    
        static FormatDate(date: string): string {
            const d = date.split(".");
            switch (d[1]) {
                case "0": d[1] = "January"; break;
                case "1": d[1] = "February"; break;
                case "2": d[1] = "March"; break;
                case "3": d[1] = "April"; break;
                case "4": d[1] = "May"; break;
                case "5": d[1] = "June"; break;
                case "6": d[1] = "July"; break;
                case "7": d[1] = "August"; break;
                case "8": d[1] = "September"; break;
                case "9": d[1] = "October"; break;
                case "10": d[1] = "November"; break;
                case "11": d[1] = "December"; break;
            }
            return `${d[2]} ${d[1]} ${d[0]}`;
        }
    
        static MonthMaxDate(month: number, year: number): number {
            switch (month) {
                case 0: return 31;
                case 1: return !(year % 4) ? 29: 28;
                case 2: return 31;
                case 3: return 30;
                case 4: return 31;
                case 5: return 30;
                case 6: return 31;
                case 7: return 31;
                case 8: return 30;
                case 9: return 31;
                case 10: return 30;
                case 11: return 31;
                default: return NaN;
            }
        }
    
        static FormatByteSize(fileSize: number, fixedPlace?: ByteUnit) {
            if (fixedPlace) {
                
            }
    
            const units = ["bytes", "kB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
    
            for (const unit of units) {
                if (fileSize > 1023) fileSize /= 1024;
                else return `${fileSize.toFixed(1)} ${unit}`;
            }
            return `${fileSize.toFixed(1)} ${units[4]}`;
        }

        static Copyright(elementId: string, startYear: number): void {
            const el = document.getElementById(elementId) as HTMLElement;
            const recentYear: number = new Date().getFullYear();
    
            el.textContent = startYear === recentYear ? `${startYear}` : `${startYear}-${recentYear}`;
        }

        static ParseDetail(detailRow: string, obj: { [d: string]: any }) {
            if (detailRow === "") return;
    
            for (const pairVal of detailRow.split(";")) {
                const [key, val] = pairVal.split("=");
    
                obj[key] = (obj[key] ? obj[key] : 0) + +val;
            }
        }
    }
}