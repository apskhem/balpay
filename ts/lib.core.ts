export namespace App {
    
    export abstract class Utils {

        static get todayDate() {
            const t = new Date();
            
            return t.getFullYear() + "." + t.getMonth() + "." + t.getDate();
        }
    
        static deformatNumber = (readable: string) => parseFloat(readable.replace(/[,]/g, ""));
    
        static formatDate(date: string): string {
            const d = date.split(".");
            switch (d[1]) {
                case "0": d[1] = "Jan"; break;
                case "1": d[1] = "Feb"; break;
                case "2": d[1] = "Mar"; break;
                case "3": d[1] = "Apr"; break;
                case "4": d[1] = "May"; break;
                case "5": d[1] = "Jun"; break;
                case "6": d[1] = "Jul"; break;
                case "7": d[1] = "Aug"; break;
                case "8": d[1] = "Sep"; break;
                case "9": d[1] = "Oct"; break;
                case "10": d[1] = "Nov"; break;
                case "11": d[1] = "Dec"; break;
            }
            return `${d[2]}, ${d[1]}. ${d[0]}`;
        }
    
        static getLastDayOfMonth(month: number, year: number): number {
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
                default: throw new Error("Cannot get last day of the specific month");
            }
        }

        static initCopyRight(el: HTMLElement, startYear: number): void {
            if (!el) return;

            const recentYear = new Date().getFullYear();
    
            el.textContent = startYear === recentYear ? `${startYear}` : `${startYear}-${recentYear}`;
        }

        static parseDetail(detailRow: string, obj: { [d: string]: any }) {
            if (detailRow === "") return;
    
            for (const pairVal of detailRow.split(";")) {
                const [key, val] = pairVal.split("=");
    
                obj[key] = (obj[key] ? obj[key] : 0) + +val;
            }
        }
    }
}