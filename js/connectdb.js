var script_url = "https://script.google.com/macros/s/AKfycbx8PNkzqprtcF5xIjbkvHszP6P5ggWwaAsXdB-fpf7g9BA3bbHT/exec";

function today() {
    var time = new Date();
    return time.getFullYear() + "." + time.getMonth() + "." + time.getDate();
}

var leastRecordDate;

// sever side variable(s)
var user = "";

var finalBalance; // The balance that not include calulated result of exp. or inc --- form previous record.
var todayBalance; // for saving the leastest balanace --- from today's record.
var resultBalance; // the balnce that include calulated result of exp. or inc.
var today_expenditure;
var today_income;
var today_lending;
var today_debt;
var detail_expenditure;
var detail_income;
var detail_lending;
var detail_debt;

var storedHistory = [];

// systematic variable(s)
var isCompleteReadData = false;

var updatingListObject;

// data send builder
function URLQuery(source, req, action, callback) {
    var url = source + "?";
    if (callback == "" || callback == null || callback == undefined) { }
    else { url += "callback=" + callback + "&"; }

    for (var i = 0; i < req.length; i++) {
        url += req[i][0] + "=" + req[i][1] + "&";
    }
    url += "action=" + action;
    return url;
}

function InsertReq() {

    var req = [
        ["user", user],
        ["date", today()],
        ["balance", finalBalance],
        ["expenditure", 0],
        ["income", 0],
        ["lending", GetSpendValue("fiscal-lending")],
        ["debt", GetSpendValue("fiscal-debt")],
        ["detail_expenditure", ""],
        ["detail_income", ""],
        ["detail_lending", GetSpendDetail("fiscal-lending")],
        ["detail_debt", GetSpendDetail("fiscal-debt")]
    ];

    var url = URLQuery(script_url, req, "insert", "ReqResponse");

    var request = jQuery.ajax({
        crossDomain: true,
        url: url,
        method: "GET",
        dataType: "jsonp"
    });
}

// print the returned data
function ReqResponse(e) {
    // $("#end").html(e.result);
    console.log(e.result);
    if (updatingListObject != undefined) {
        updatingListObject.style.opacity = "1";
        updatingListObject = undefined;
    }
}

function ReadReq() {
    var req = [
        ["user", user]
    ];

    var url = URLQuery(script_url, req, "read");

    $.getJSON(url, function(json) {
        for (var i = 0; i < json.records.length; i++) {
            var partInProcess = [];
            var recordDate = json.records[i].DATE;
            var dt = recordDate.split(".");
            partInProcess.push(new Date(dt[0], dt[1], dt[2]));
            partInProcess.push(json.records[i].BALANCE);
            partInProcess.push(json.records[i].EXPENDITURE);
            partInProcess.push(json.records[i].INCOME);
            partInProcess.push(json.records[i].LENDING);
            partInProcess.push(json.records[i].DEBT);

            storedHistory.push(partInProcess);

            if (i == json.records.length - 1) {
                leastRecordDate = dt[0] + "." + dt[1] + "." + dt[2];
                todayBalance = json.records[i].BALANCE;
                today_expenditure = json.records[i].EXPENDITURE;
                today_income = json.records[i].INCOME;
                today_lending = json.records[i].LENDING;
                today_debt = json.records[i].DEBT;
                detail_expenditure = json.records[i].DETAIL_EXPENDITURE;
                detail_income = json.records[i].DETAIL_INCOME;
                detail_lending = json.records[i].DETAIL_LENDING;
                detail_debt = json.records[i].DETAIL_DEBT;
            }
            if (i == json.records.length - 2)
                finalBalance = json.records[i].BALANCE;
        }

        if (today() == leastRecordDate) {
            QueryDataDetail("fiscal-expenditure", today_expenditure, detail_expenditure);
            QueryDataDetail("fiscal-income", today_income, detail_income);
            QueryDataDetail("fiscal-lending", today_lending, detail_lending);
            QueryDataDetail("fiscal-debt", today_debt, detail_debt);                
            SumTheCost();
        }
        else { // create new list for new day
            var dt = today().split(".");
            var newRecord = [new Date(dt[0], dt[1], dt[2]),todayBalance,0,0,today_lending,today_debt];
            storedHistory.push(newRecord);
            finalBalance = todayBalance;
            today_expenditure = 0;
            today_income = 0;
            QueryDataDetail("fiscal-lending", today_lending, detail_lending);
            QueryDataDetail("fiscal-debt", today_debt, detail_debt);  
            SumTheCost();

            InsertReq();
        }

        // functions after completing the data request precess
        google.charts.load('current', {'packages':['corechart', 'line']});
        google.charts.setOnLoadCallback(drawChart);
        AdjustBalance();
        isCompleteReadData = true;
    });

    // functions for completing lists during the process
    function QueryDataDetail(channel, q_today, q_detail) {
        var emptychanneltext = "";
        switch (channel) {
            case "fiscal-expenditure" : emptychanneltext = "$expenditure"; break;
            case "fiscal-income" : emptychanneltext = "$income"; break;
            case "fiscal-lending" : emptychanneltext = "$lending"; break;
            case "fiscal-debt" : emptychanneltext = "$debt"; break;
            default: emptychanneltext = "$null"; break;
        }

        if (q_detail == "") {
            if (q_today > 0) {
                CreateList(channel, emptychanneltext, q_today);
            }
        }
        else {
            var q_totalamount = 0;
            var q = q_detail.split(";");
            for (var i = 0; i < q.length; i++) {
                var q_title = q[i].split("=")[0];
                var q_amount = parseFloat(q[i].split("=")[1]);
                q_totalamount += q_amount;
                CreateList(channel, q_title, q_amount);
            }
            if (q_totalamount != q_today) {
                var q_amount = q_today - q_totalamount;
                CreateList(channel, emptychanneltext, q_amount);
            }
        }
    }
}

function UpdateReq() {

    var req = [
        ["user", user],
        ["date", today()],
        ["balance", resultBalance],
        ["expenditure", GetSpendValue("fiscal-expenditure")], 
        ["income", GetSpendValue("fiscal-income")],
        ["lending", GetSpendValue("fiscal-lending")],
        ["debt", GetSpendValue("fiscal-debt")],
        ["detail_expenditure", GetSpendDetail("fiscal-expenditure")],
        ["detail_income", GetSpendDetail("fiscal-income")],
        ["detail_lending", GetSpendDetail("fiscal-lending")],
        ["detail_debt", GetSpendDetail("fiscal-debt")]
    ];

    var url = URLQuery(script_url, req, "update", "ReqResponse");
 
    var request = jQuery.ajax({
      crossDomain: true,
      url: url ,
      method: "GET",
      dataType: "jsonp"
    });
}