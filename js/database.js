// sever side variable(s)
let user = "";
let storedHistory = [];

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
let isCompleteReadData = false;

let updatingListObject;

function today() {
    let time = new Date();
    return time.getFullYear() + "." + time.getMonth() + "." + time.getDate();
}

// data sending url builder -- param should be like [[,]]
function RequestURL(param, action, callback) {
    const db_source = "https://script.google.com/macros/s/AKfycbx8PNkzqprtcF5xIjbkvHszP6P5ggWwaAsXdB-fpf7g9BA3bbHT/exec";
    let url = db_source + "?";

    if (callback)
        url += `callback=${callback}&`;

    for (const req of param) {
        url += `${req[0]}=${req[1]}&`;
    }

    url += "action=" + action;
    return url;
}

const Database = {
    Insert: function() {
        const req = [
            ["user", user],
            ["date", today()],
            ["balance", finance.balance.final],
            ["expenditure", 0],
            ["income", 0],
            ["lending", GetTotalValue("fiscal-lending")],
            ["debt", GetTotalValue("fiscal-debt")],
            ["detail_expenditure", ""],
            ["detail_income", ""],
            ["detail_lending", GetDetails("fiscal-lending")],
            ["detail_debt", GetDetails("fiscal-debt")]
        ];

        const request = jQuery.ajax({
            crossDomain: true,
            url: RequestURL(req, "insert", "ReqResponse"),
            method: "GET",
            dataType: "jsonp"
        });
    },
    Update: function() {
        if (isDevmode) return;

        const req = [
            ["user", user],
            ["date", today()],
            ["balance", finance.balance.result],
            ["expenditure", GetTotalValue("fiscal-expenditure")], 
            ["income", GetTotalValue("fiscal-income")],
            ["lending", GetTotalValue("fiscal-lending")],
            ["debt", GetTotalValue("fiscal-debt")],
            ["detail_expenditure", GetDetails("fiscal-expenditure")],
            ["detail_income", GetDetails("fiscal-income")],
            ["detail_lending", GetDetails("fiscal-lending")],
            ["detail_debt", GetDetails("fiscal-debt")]
        ];
    
        const request = jQuery.ajax({
        crossDomain: true,
        url: RequestURL(req, "update", "ReqResponse"),
        method: "GET",
        dataType: "jsonp"
        });
    },
    GetUserRecordData: function() {
        let req = [
            ["user", user]
        ];
    
        let url = RequestURL(req, "read");
    
        $.getJSON(url, (json) => {
            let finalRecordDate;
            for (const dataRow of json.records) {
                let listingHistory = [];
    
                listingHistory.push(new Date(...dataRow.DATE.split(".")));
                listingHistory.push(dataRow.BALANCE);
                listingHistory.push(dataRow.EXPENDITURE);
                listingHistory.push(dataRow.INCOME);
                listingHistory.push(dataRow.LENDING);
                listingHistory.push(dataRow.DEBT);
    
                storedHistory.push(listingHistory);
    
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
    
            if (today() == finalRecordDate) {
                for (const financeList in detail) {
                    QueryDataDetail("fiscal-" + financeList, finance[financeList], detail[financeList]);
                }             
                SumValue();
            }
            else { // create new list for new day
                let newRecord = [new Date(...today().split(".")), finance.balance.today, 0, 0, finance.lending, finance.debt];
                storedHistory.push(newRecord);
                finance.balance.final = finance.balance.today;
                finance.expenditure = 0;
                finance.income = 0;
                QueryDataDetail("fiscal-lending", finance.lending, detail.lending);
                QueryDataDetail("fiscal-debt", finance.debt, detail.debt);  
                SumValue();
    
                Database.Insert();
            }
    
            // functions after completing the data request precess
            google.charts.load('current', {'packages':['corechart', 'line']});
            google.charts.setOnLoadCallback(drawChart);
            AdjustBalance();
            isCompleteReadData = true;

            // close all newly created list
            for (const expandable of CL("expandable")) {
                expandable.nextElementSibling.style.maxHeight = 0;
            }
        });
    
        // functions for completing lists during the process
        function QueryDataDetail(channel, q_today, q_detail) {
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
        let req = [
            ["userid", ID("signin-userid").value],
            ["password", ID("signin-password").value]
        ];
    
        let request = jQuery.ajax({
            crossDomain: true,
            url: RequestURL(req, "signIn", "SignInResponse"),
            method: "GET",
            dataType: "jsonp"
        });
    }
};

// print the returned data
function ReqResponse(e) {
    console.log(e.result);
    if (updatingListObject) {
        updatingListObject.style.opacity = "1";
        updatingListObject = undefined;
    }
}

function SignInResponse(e) {
    ID("signin-userid").disabled = false;
    ID("signin-password").disabled = false;

    if (e.result == "error") {
        ID("signin-troubleshoot").style.color = "red";
        if (e.error == "id") {
            ShootError("signin-userid");
            ID("signin-troubleshoot").textContent = "User ID didn't exist.";
        }
        if (e.error == "password") {
            ShootError("signin-password");
            ID("signin-troubleshoot").textContent = "Password is incorrect.";
        }
    }
    else if (e.result == "pass") { // if sign in form is corrected
        user = ID("signin-userid").value;

        Database.GetUserRecordData();

        TN("main")[0].style.display = "block";
        TN("footer")[0].style.display = "block";
        ID("form").style.display = "none";

        // init user settings
        TN("title")[0].textContent = "Balpay - " + e.userData.FULLNAME;
        ID("fullname").textContent = e.userData.FULLNAME;
    }
}