// sever side variable(s)
const user = {};
const records = [];
const detailRecords = [];

const finance = {
    exp: 0,
    inc: 0,
    len: 0,
    deb: 0,
    balance: {
        final: 0, // The balance that not include calulated result of exp. or inc --- form previous record.
        today: 0, // for saving the leastest balanace --- from today's record.
        result: 0 // the balnce that include calulated result of exp. or inc.
    }
};

const detail = {
    exp: "",
    inc: "",
    len: "",
    deb: ""
};

// systematic variable(s)
let wasRecordsRead = false;

// update list function
class PendingList {
    constructor() {
        this.pendingList = [];
    }

    Push(el) {
        if (!el) return;

        for (const list of this.pendingList) {
            if (el === list) return;
        }

        this.pendingList.push(el);
        el.style.opacity = "0.5";
    }

    Pop() {
        if (this.pendingList.length) {
            const el = this.pendingList.shift();
            el.style.opacity = "1";
            return el;
        }
    }
}

class RequestURL {
    constructor(dbURL) {
        this.source = dbURL;
    }

    Format(param, action, callback) {
        let url = this.source + "?";

        if (callback) url += `callback=${callback}&`;

        for (const key in param) url += `${key}=${param[key]}&`;

        url += "action=" + action;
        return url;
    }
}

let url = new RequestURL("https://script.google.com/macros/s/AKfycbx8PNkzqprtcF5xIjbkvHszP6P5ggWwaAsXdB-fpf7g9BA3bbHT/exec");
let pendingList = new PendingList();

class Database {
    static Insert() {
        const req = {
            "user": user.id,
            "date": Tools.currentDate,
            "balance": finance.balance.final,
            "expenditure": 0,
            "income": 0,
            "lending": roots["len"].total,
            "debt": roots["deb"].total,
            "detail_expenditure": "",
            "detail_income": "",
            "detail_lending": roots["len"].detail,
            "detail_debt": roots["deb"].detail
        };

        jQuery.ajax({
            crossDomain: true,
            url: url.Format(req, "INSERT", "RequestResponse.Feedback"),
            method: "GET",
            dataType: "jsonp"
        });
    }

    static Update() {
        const req = {
            "user": user.id,
            "date": Tools.currentDate,
            "balance": finance.balance.result,
            "expenditure": roots["exp"].total,
            "income": roots["inc"].total,
            "lending": roots["len"].total,
            "debt": roots["deb"].total,
            "detail_expenditure": roots["exp"].detail,
            "detail_income": roots["inc"].detail,
            "detail_lending": roots["len"].detail,
            "detail_debt": roots["deb"].detail
        };
    
        jQuery.ajax({
            crossDomain: true,
            url: url.Format(req, "UPDATE", "RequestResponse.Feedback"),
            method: "GET",
            dataType: "jsonp"
        });
    }

    static ProcessRecordData(userRecords) {
        let finalRecordDate;
        for (const dataRow of userRecords) {
            records.push([
                new Date(...dataRow.DATE.split(".")),
                dataRow.BALANCE,
                dataRow.EXPENDITURE,
                dataRow.INCOME,
                dataRow.LENDING,
                dataRow.DEBT
            ]);

            detailRecords.push([
                dataRow.DETAIL_EXPENDITURE,
                dataRow.DETAIL_INCOME,
                dataRow.DETAIL_LENDING,
                dataRow.DETAIL_DEBT
            ]);

            if (userRecords.indexOf(dataRow) === userRecords.length - 1) { // is today
                finalRecordDate = dataRow.DATE;
                finance.balance.today = dataRow.BALANCE;
                finance.exp = dataRow.EXPENDITURE;
                finance.inc = dataRow.INCOME;
                finance.len = dataRow.LENDING;
                finance.deb = dataRow.DEBT;
                detail.exp = dataRow.DETAIL_EXPENDITURE;
                detail.inc = dataRow.DETAIL_INCOME;
                detail.len = dataRow.DETAIL_LENDING;
                detail.deb = dataRow.DETAIL_DEBT;
            }
            if (userRecords.indexOf(dataRow) === userRecords.length - 2) { // is previous day
                finance.balance.final = dataRow.BALANCE;
            }
        }

        if (Tools.currentDate === finalRecordDate) {
            for (const channel in detail) {
                roots[channel].detail = detail[channel];
            }

            for (const root in roots) roots[root].UpdateSum();
        }
        else { // create new list for new day
            records.push([new Date(...Tools.currentDate.split(".")), finance.balance.today, 0, 0, finance.len, finance.deb]);
            detailRecords.push(["", "", detail.len, detail.deb]);

            finance.balance.final = finance.balance.today;
            finance.exp = 0;
            finance.inc = 0;
            roots["len"].detail = detail.len;
            roots["deb"].detail = detail.deb;
            for (const root in roots) roots[root].UpdateSum();

            Database.Insert();
        }

        // functions after completing the data request precess
        google.charts.setOnLoadCallback(GraphSet.History);
        RootList.UpdateBalance();
        Summarization();
        wasRecordsRead = true;

        // display main screen
        document.getElementsByTagName("main")[0].hidden = false;
        document.getElementsByTagName("footer")[0].hidden = false;
        document.getElementsByTagName("header")[0].hidden = true;
        document.body.style.padding = "0 6px";

        // init user settings
        document.getElementsByTagName("title")[0].textContent = "Balpay - " + user.fullname;
        document.getElementById("fullname").textContent = user.fullname;

        // close all newly created list
        for (const expandable of document.getElementsByClassName("collapsible-object")) {
            expandable.nextElementSibling.style.maxHeight = 0;
        }
    }

    static GetUserSettingsData() {
        const req = {
            "userid": document.getElementById("signin-userid").value,
            "password": document.getElementById("signin-password").value
        }
    
        jQuery.ajax({
            crossDomain: true,
            url: url.Format(req, "SIGN_IN", "RequestResponse.SignIn"),
            method: "GET",
            dataType: "jsonp"
        });
    }
}

class RequestResponse {
    static Feedback(res) {
        console.log(res.result);
        pendingList.Pop();
    }

    static SignIn(res) {
        document.getElementById("signin-userid").disabled = false;
        document.getElementById("signin-password").disabled = false;
    
        if (res.result === "error") {
            switch (res.error) {
                case "id": {
                    Form.ShootInputError("signin-userid");
                    document.getElementsByClassName("comfirm-button")[0].textContent = "User ID didn't exist.";
                } break;
                case "password": {
                    Form.ShootInputError("signin-password");
                    document.getElementsByClassName("comfirm-button")[0].textContent = "Password is incorrect.";
                } break;
            }
        }
        else if (res.result === "pass") { // if sign in form is corrected
            // store user data

            user.id = res.userData.USERID;
            user.fullname = res.userData.FULLNAME;
            user.email = res.userData.EMAIL;
            user.settings = ParseUserSettings(res.userData.USER_SETTINGS);

            Database.ProcessRecordData(Object.values(res.records));
        }
    
        function ParseUserSettings(dataObj) {
            let parsedObj = {};
            for (let pairVal of dataObj.split(";")) {
                pairVal = pairVal.split("=");
                parsedObj[pairVal[0]] = pairVal[1];
            }
            return parsedObj;
        }
    }
}