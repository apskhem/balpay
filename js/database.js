// sever side variable(s)
let user = "";
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
let isReadingRecordsCompleted = false;

let updatingListObject;

function GetCurrentDate() {
    let time = new Date();
    return time.getFullYear() + "." + time.getMonth() + "." + time.getDate();
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

const Database = {
    Insert: function() {
        const req = {
            "user": user,
            "date": GetCurrentDate(),
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
            url: url.Format(req, "insert", "requestResponse.Feedback"),
            method: "GET",
            dataType: "jsonp"
        });
    },
    Update: function() {
        if (isDevmode) return;

        const req = {
            "user": user,
            "date": GetCurrentDate(),
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
            url: url.Format(req, "update", "requestResponse.Feedback"),
            method: "GET",
            dataType: "jsonp"
        });
    },
    GetUserRecordData: function() {
        const req = {"user": user};
    
        $.getJSON(url.Format(req, "read"), (json) => {
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
    
                if (json.records.indexOf(dataRow) == json.records.length - 1) { // is today
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
                if (json.records.indexOf(dataRow) == json.records.length - 2) { // is previous day
                    finance.balance.final = dataRow.BALANCE;
                }
            }
    
            if (GetCurrentDate() == finalRecordDate) {
                for (const financeList in detail) {
                    ParseAndCreateList("fiscal-" + financeList, finance[financeList], detail[financeList]);
                }             
                SumValue();
            }
            else { // create new list for new day
                records.push([new Date(...GetCurrentDate().split(".")), finance.balance.today, 0, 0, finance.lending, finance.debt]);
                detailRecords.push(["", "", detail.lending, detail.debt]);

                finance.balance.final = finance.balance.today;
                finance.expenditure = 0;
                finance.income = 0;
                ParseAndCreateList("fiscal-lending", finance.lending, detail.lending);
                ParseAndCreateList("fiscal-debt", finance.debt, detail.debt);  
                SumValue();
    
                Database.Insert();
            }
    
            // functions after completing the data request precess
            google.charts.setOnLoadCallback(HistoryGraph);
            UpdateBalance();
            SumThisMonth();
            isReadingRecordsCompleted = true;

            // close all newly created list
            for (const expandable of cl("expandable")) {
                expandable.nextElementSibling.style.maxHeight = 0;
            }
        });
    
        // functions for completing lists during the process
        function ParseAndCreateList(channel, q_today, q_detail) {
            const emptyDetailText = "$" + channel.split("-")[1];
    
            if (q_detail == "") {
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
    },
    GetUserSettingsData: function() {
        const req = {
            "userid": id("signin-userid").value,
            "password": id("signin-password").value
        }
    
        jQuery.ajax({
            crossDomain: true,
            url: url.Format(req, "signIn", "requestResponse.SignIn"),
            method: "GET",
            dataType: "jsonp"
        });
    }
}

// never use
const requestResponse = {
    Feedback: (res) => {
        console.log(res.result);
        UpdatedListObject();
    },
    SignIn: (res) => {
        id("signin-userid").disabled = false;
        id("signin-password").disabled = false;
    
        if (res.result == "error") {
            if (res.error == "id") {
                ShootError("signin-userid");
                id("signin-button").textContent = "User ID didn't exist.";
            }
            if (res.error == "password") {
                ShootError("signin-password");
                id("signin-button").textContent = "Password is incorrect.";
            }
        }
        else if (res.result == "pass") { // if sign in form is corrected
            user = id("signin-userid").value;
    
            Database.GetUserRecordData();
    
            tn("main")[0].style.display = "block";
            tn("footer")[0].style.display = "block";
            id("form").style.display = "none";
    
            // init user settings
            tn("title")[0].textContent = "Balpay - " + res.userData.FULLNAME;
            id("fullname").textContent = res.userData.FULLNAME;
    
            const userSettings = ParseUserSettings(res.userData.USER_SETTINGS);
    
            defaultCurrency = userSettings.currency;
            for (const tagname of tn("span")) {
                tagname.textContent = defaultCurrency;
            }
        }
    
        function ParseUserSettings(dataObj) {
            let parsedObj = new Object();
            for (let pairVal of dataObj.split(";")) {
                pairVal = pairVal.split("=");
                parsedObj[pairVal[0]] = pairVal[1];
            }
            return parsedObj;
        }
    }
}