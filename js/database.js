// sever side variable(s)
let user = {};
let records = [];
let detailRecords = [];

let finance = {
    expenditure: 0,
    income: 0,
    lending: 0,
    debt: 0,
    balance: {
        final: 0, // The balance that not include calulated result of exp. or inc --- form previous record.
        today: 0, // for saving the leastest balanace --- from today's record.
        result: 0 // the balnce that include calulated result of exp. or inc.
    }
}

let detail = {
    expenditure: "",
    income: "",
    lending: "",
    debt: ""
}

// systematic variable(s)
let wasRecordsRead = false;

// update list function
class PendingList {
    constructor() {
        this.pendingList = [];
    }

    Push(element) {
        if (element) {
            for (const list of this.pendingList) {
                if (element in list) return;
            }

            this.pendingList.push(element);
            element.style.opacity = "0.5";
        }
    }

    Pop() {
        if (this.pendingList.length > 0) {
            const element = this.pendingList.shift();
            element.style.opacity = "1";
            return element;
        }
    }
}

class RequestURL {
    constructor(dbURL) {
        this.source = dbURL;
    }

    Format(param, action, callback) {
        let url = this.source + "?";

        if (callback)
            url += `callback=${callback}&`;

        for (const key in param)
            url += `${key}=${param[key]}&`;

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
            "date": AppToolset.currentDate,
            "balance": finance.balance.final,
            "expenditure": 0,
            "income": 0,
            "lending": GetTotalValue("fiscal-lending"),
            "debt": GetTotalValue("fiscal-debt"),
            "detail_expenditure": "",
            "detail_income": "",
            "detail_lending": GetDetails("fiscal-lending"),
            "detail_debt": GetDetails("fiscal-debt")
        };

        jQuery.ajax({
            crossDomain: true,
            url: url.Format(req, "INSERT", "RequestResponse.Feedback"),
            method: "GET",
            dataType: "jsonp"
        });
    }

    static Update() {
        if (isDevmode) return;

        const req = {
            "user": user.id,
            "date": AppToolset.currentDate,
            "balance": finance.balance.result,
            "expenditure": GetTotalValue("fiscal-expenditure"),
            "income": GetTotalValue("fiscal-income"),
            "lending": GetTotalValue("fiscal-lending"),
            "debt": GetTotalValue("fiscal-debt"),
            "detail_expenditure": GetDetails("fiscal-expenditure"),
            "detail_income": GetDetails("fiscal-income"),
            "detail_lending": GetDetails("fiscal-lending"),
            "detail_debt": GetDetails("fiscal-debt")
        };
    
        jQuery.ajax({
            crossDomain: true,
            url: url.Format(req, "UPDATE", "RequestResponse.Feedback"),
            method: "GET",
            dataType: "jsonp"
        });
    }

    static GetUserRecordData(userID) {
        const req = {"user": userID};
    
        $.getJSON(url.Format(req, "READ"), (json) => {
            let finalRecordDate;
            for (const dataRow of json.records) {
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
    
                if (json.records.indexOf(dataRow) === json.records.length - 1) { // is today
                    finalRecordDate = dataRow.DATE;
                    finance.balance.today = dataRow.BALANCE;
                    finance.expenditure = dataRow.EXPENDITURE;
                    finance.income = dataRow.INCOME;
                    finance.lending = dataRow.LENDING;
                    finance.debt = dataRow.DEBT;
                    detail.expenditure = dataRow.DETAIL_EXPENDITURE;
                    detail.income = dataRow.DETAIL_INCOME;
                    detail.lending = dataRow.DETAIL_LENDING;
                    detail.debt = dataRow.DETAIL_DEBT;
                }
                if (json.records.indexOf(dataRow) === json.records.length - 2) { // is previous day
                    finance.balance.final = dataRow.BALANCE;
                }
            }
    
            if (AppToolset.currentDate === finalRecordDate) {
                for (const financeList in detail) {
                    ParseAndCreateList("fiscal-" + financeList, finance[financeList], detail[financeList]);
                }             
                SumList();
            }
            else { // create new list for new day
                records.push([new Date(...AppToolset.currentDate.split(".")), finance.balance.today, 0, 0, finance.lending, finance.debt]);
                detailRecords.push(["", "", detail.lending, detail.debt]);

                finance.balance.final = finance.balance.today;
                finance.expenditure = 0;
                finance.income = 0;
                ParseAndCreateList("fiscal-lending", finance.lending, detail.lending);
                ParseAndCreateList("fiscal-debt", finance.debt, detail.debt);  
                SumList();
    
                Database.Insert();
            }
    
            // functions after completing the data request precess
            google.charts.setOnLoadCallback(HistoryGraph);
            UpdateBalance();
            SumThisMonth();
            wasRecordsRead = true;

            // display main screen
            tn("main")[0].style.display = "block";
            tn("footer")[0].style.display = "block";
            tn("header")[0].style.display = "none";
            document.body.style.padding = "0 6px";
    
            // init user settings
            tn("title")[0].textContent = "Balpay - " + user.fullname;
            id("fullname").textContent = user.fullname;

            // close all newly created list
            for (const expandable of cl("expandable")) {
                expandable.nextElementSibling.style.maxHeight = 0;
            }
        });
    
        // functions for completing lists during the process
        function ParseAndCreateList(channel, q_today, q_detail) {
            const emptyDetailText = "$" + channel.split("-")[1];
    
            if (q_detail === "") {
                if (q_today > 0) {
                    CreateList(channel, emptyDetailText, q_today);
                }
            }
            else {
                let q_totalamount = 0;
    
                for (const list of q_detail.split(";")) {
                    let q_title = list.split("=")[0];
                    let q_amount = parseFloat(list.split("=")[1]);
                    q_totalamount += q_amount;
                    CreateList(channel, q_title, q_amount);
                }
                if (q_totalamount != q_today) {
                    let q_amount = q_today - q_totalamount;
                    CreateList(channel, emptyDetailText, q_amount);
                }
            }
        }
    }

    static GetUserSettingsData() {
        const req = {
            "userid": id("signin-userid").value,
            "password": id("signin-password").value
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
        id("signin-userid").disabled = false;
        id("signin-password").disabled = false;
    
        if (res.result === "error") {
            switch (res.error) {
                case "id": {
                    Form.ShootError("signin-userid");
                    cl("comfirm-button")[0].textContent = "User ID didn't exist.";
                } break;
                case "password": {
                    Form.ShootError("signin-password");
                    cl("comfirm-button")[0].textContent = "Password is incorrect.";
                } break;
            }
        }
        else if (res.result === "pass") { // if sign in form is corrected
            cl("comfirm-button")[0].textContent = "Initializing...";

            Database.GetUserRecordData(res.userData.USERID);

            // store user data
            user = {
                id: res.userData.USERID,
                fullname: res.userData.FULLNAME,
                email: res.userData.EMAIL,
                settings: ParseUserSettings(res.userData.USER_SETTINGS)
            }
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