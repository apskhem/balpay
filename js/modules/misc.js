export class AppSystem {
    static WatchError() {
        window.onerror = (msg, url, lineNo, columnNo, error) => alert(`${msg}\nAT: ${lineNo}-${columnNo} ${url.split("/").pop()}`);
    }
}

export class AutomaticSystem {
    static Copyright(element, startYear) {
        const recentYear = new Date().getFullYear();
        element.textContent = (startYear === recentYear) ? startYear : `${startYear}-${recentYear}`;
    }
}

export class Tools {
    static FormatNumber(num) {
        const [whole, digit] = parseFloat(num).toFixed(2).toString().split(".");
        let res = "";
    
        const lastLen = whole.length - 1;
        for (let i = 0; i < whole.length; i++) res += whole[i] + ((!((lastLen - i) % 3) && i != lastLen) ? ",": "");
        
        return `${res}.${digit}`;
    }

    static DeformatNumber = (readable) => parseFloat(readable.replace(/[,]/g, ""));

    static get currentDate() {
        let t = new Date();
        return t.getFullYear() + "." + t.getMonth() + "." + t.getDate();
    }

    static FormatDate(date) {
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

    static ParseDetail(detailRow, obj) {
        if (detailRow === "") return;

        for (const pairVal of detailRow.split(";")) {
            const [key, val] = pairVal.split("=");

            obj[key] = (obj[key] ? obj[key] : 0) + +val;
        }
    }
}