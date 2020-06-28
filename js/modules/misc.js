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
        num = parseFloat(num).toFixed(2).toString().split(".");
        let textNum = num[0];
        let sum = "";
    
        let lastDigit = textNum.length - 1;
        for (let i = 0; i < textNum.length; i++) {
            sum += textNum[i] + (((lastDigit - i) % 3 === 0 && i != lastDigit) ? ",": "");
        }
        
        return `${sum}.${num[1]}`;
    }

    static DeformatNumber = (readable) => parseFloat(readable.replace(/[,]/g, ""));

    static get currentDate() {
        let t = new Date();
        return t.getFullYear() + "." + t.getMonth() + "." + t.getDate();
    }

    static FormatDate(date) {
        let d = date.split(".");
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

        for (let pairVal of detailRow.split(";")) {
            pairVal = pairVal.split("=");

            obj[pairVal[0]] = (obj[pairVal[0]] ? obj[pairVal[0]] : 0) + +pairVal[1];
        }
    }

    static Object2Array(obj) {
        let arr = [];
        for (let key in obj) {
            arr.push([key, obj[key]]);
        }
        return arr;
    }
}