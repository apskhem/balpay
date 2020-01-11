const id = (id) => document.getElementById(id);
const cl = (cl) => document.getElementsByClassName(cl);
const tn = (tn) => document.getElementsByTagName(tn);

window.onerror = (msg, url, lineNo, columnNo, error) => alert(msg);

document.documentElement.addEventListener("keyup", (e) => {
    if (e.code === "Backquote") location.reload();
})

// ------------------ //
//  Initial Functions //
// ------------------ //

id("today-date").textContent = FormatDate(GetCurrentDate());
id("copyright-year").textContent = GetCurrentDate().split(".")[0];

// ----------------- //
//  Helper Functions //
// ----------------- //

const visualizeNum = (num) => { // format number to text ex. 1,000.00
    num = parseFloat(num).toFixed(2).toString().split(".");
    let textNum = num[0];
    let sum = "";

    let lastDigit = textNum.length - 1;
    for (let i = 0; i < textNum.length; i++) {
        sum += textNum[i] + (((lastDigit - i) % 3 == 0 && i != lastDigit) ? ",": "");
    }
    
    return `${sum}.${num[1]}`;
}

// parse value to num of visualized value
const parseNum = (visualizedValue) => parseFloat(visualizedValue.replace(/[,]/g, ""));

function DuplicateListToInput() {
    let textInputOfTheList = this.parentElement.parentElement.nextElementSibling.children[0];
    let numberInputOfTheList = this.parentElement.parentElement.nextElementSibling.children[1]; // not fixed
    textInputOfTheList.value = this.textContent.replace(":", "");
    numberInputOfTheList.focus();
}

function FormatDate(date) {
    let d = date.split(".");
    let m = "";
    switch (d[1]) {
        case "0": m = "January"; break;
        case "1": m = "February"; break;
        case "2": m = "March"; break;
        case "3": m = "April"; break;
        case "4": m = "May"; break;
        case "5": m = "June"; break;
        case "6": m = "July"; break;
        case "7": m = "August"; break;
        case "8": m = "September"; break;
        case "9": m = "October"; break;
        case "10": m = "November"; break;
        case "11": m = "December"; break;
    }
    return `${d[2]} ${m} ${d[0]}`;
}

// update list function
function UpdatingListObject(element) {
    if (element) {
        updatingListObject = element;
        updatingListObject.style.opacity = "0.5";
    }
}

function UpdatedListObject() {
    if (updatingListObject) {
        updatingListObject.style.opacity = "1";
        updatingListObject = undefined;
    }
}

// --------------------------- //
//  Core Fundamental Functions //
// --------------------------- //

let backupValue = 0;
let inputlist = {
    FocusOut: function() {
        const detailObject = this.parentElement.parentElement;
        const channel = this.parentElement.parentElement.parentElement.parentElement.parentElement.id;

        if (this.value == backupValue) {
            this.type = "text";
            this.value = visualizeNum(this.value);
            return;
        }
        else if (this.value == 0) {
            detailObject.parentElement.removeChild(detailObject);
            FinalizeList();
            return;
        }
        else if (this.value < 0 || this.value == "" || this.value == null) {
            this.value = backupValue;
            return;
        }

        this.type = "text";
        this.value = visualizeNum(this.value);
        FinalizeList();

        function FinalizeList() {
            SumValue(channel);
            UpdateBalance();
            UpdateChart();
            SumThisMonth();

            if (this) {
                UpdatingListObject(detailObject);
            }
    
            Database.Update();
        }
    },
    FocusIn: function() {
        this.value = parseNum(this.value);
        this.type = "number";
        backupValue = this.value;
    },
    OnEnter: function(event) {
        if (event.code === "Enter") {
            this.blur();
        }
    }
}

// Create a new list on "Add" button clicked
for (const addFiscalList of cl("add-fiscal-list")) {
    addFiscalList.addEventListener("click", function() {
        let input_title = this.previousElementSibling.previousElementSibling.value;
        let input_amount = this.previousElementSibling.value;

        if (input_title == "") return;
        if (input_amount == "") return;

        if (isReadingRecordsCompleted) {
            const subroot = this.parentElement.parentElement;
            for (const rootList of subroot.getElementsByClassName("root-list")) {
                const existed_title = rootList.children[0].textContent.replace(/[:]/g, "");
                if (input_title == existed_title) {
                    // (if existed value + new input value) is more than or equal 0
                    if (parseNum(rootList.getElementsByTagName("input")[0].value) + parseNum(input_amount) > 0) {
                        let listObj = rootList.getElementsByTagName("input")[0];

                        // value in
                        listObj.value = parseNum(listObj.value) + parseNum(input_amount);

                        // value out
                        listObj.type = "text";
                        listObj.value = visualizeNum(listObj.value);

                        SumValue(subroot.parentElement.id);
                        UpdateBalance();
                        UpdateChart();
                        SumThisMonth();
                        UpdatingListObject(rootList);
                        Database.Update();
                    }
                    else if (parseNum(rootList.getElementsByTagName("input")[0].value) + parseNum(input_amount) == 0) {
                        rootList.parentElement.removeChild(rootList);

                        SumValue(subroot.parentElement.id);
                        UpdateBalance();
                        UpdateChart();
                        SumThisMonth();
                        Database.Update();
                    }

                    ResetInputNewList(this.previousElementSibling);
                    return;
                }
            }
        }

        if (input_amount < 1) return;

        ResetInputNewList(this.previousElementSibling);

        // create new list element
        let rootdiv = document.createElement("div");
        let input = document.createElement("input");
        let li1 = document.createElement("li");
        let li2 = document.createElement("li");
        let spanCurrency = document.createElement("span");

        input.value = visualizeNum(input_amount);
        input.min = "0";
        input.addEventListener("focusin", inputlist.FocusIn);
        input.addEventListener("focusout", inputlist.FocusOut);
        input.addEventListener("keyup", inputlist.OnEnter);
        spanCurrency.textContent = " " + defaultCurrency;
        li1.classList.add("cost");
        li2.textContent = input_title + ":";
        li2.addEventListener("click", DuplicateListToInput);

        li1.appendChild(input);
        li1.appendChild(spanCurrency);
        rootdiv.appendChild(li2);
        rootdiv.appendChild(li1);
        rootdiv.classList.add("root-list");
        this.parentElement.previousElementSibling.appendChild(rootdiv);

        //finalize
        this.parentElement.parentElement.style.maxHeight = this.parentElement.parentElement.scrollHeight + "px";
        SumValue(this.parentElement.parentElement.parentElement.id);
        UpdateBalance();

        if (isReadingRecordsCompleted) {
            UpdateChart();
            SumThisMonth();
            UpdatingListObject(rootdiv);
            Database.Update();
        }

        function ResetInputNewList(obj) {
            obj.previousElementSibling.value = "";
            obj.value = "";
            obj.previousElementSibling.blur();
            obj.blur();
        }
    });
}

// create spend list in defined channel
function CreateList(channel, title, amount) {
    switch (channel) {
        case "fiscal-expenditure": CreatePosition(cl("create-list-grid")[0]); break;
        case "fiscal-income": CreatePosition(cl("create-list-grid")[1]); break;
        case "fiscal-lending": CreatePosition(cl("create-list-grid")[2]); break;
        case "fiscal-debt": CreatePosition(cl("create-list-grid")[3]); break;
    }

    function CreatePosition(ch) {
        ch.children[0].value = title;
        ch.children[1].value = amount;
        ch.children[2].click();
    }
}

function UpdateChart() {
    records[records.length - 1] = [
        new Date(...GetCurrentDate().split(".")),
        finance.balance.result,
        GetTotalValue("fiscal-expenditure"),
        GetTotalValue("fiscal-income"),
        GetTotalValue("fiscal-lending"),
        GetTotalValue("fiscal-debt")
    ];

    detailRecords[detailRecords.length - 1] = [
        GetDetails("fiscal-expenditure"),
        GetDetails("fiscal-income"),
        GetDetails("fiscal-lending"),
        GetDetails("fiscal-debt")
    ];

    // redraw statistics chart
    google.charts.setOnLoadCallback(HistoryGraph);
}

// Sum all the detail in each channel
function SumValue(channel) {
    if (channel) {
        let total = 0;
        for (const cost of id(channel).getElementsByClassName("cost")) {
            total += parseNum(cost.children[0].value);
        }
        id(channel).getElementsByClassName("total")[0].textContent = visualizeNum(total) + " " + defaultCurrency;
    }
    else {
        SumValue("fiscal-expenditure");
        SumValue("fiscal-income");
        SumValue("fiscal-lending");
        SumValue("fiscal-debt");
    }
}

function SumThisMonth() {
    let date = GetCurrentDate().split(".");
    let month = {expenditure: 0, income: 0};
    let spendingLists = {expenditure: new Object(), income: new Object()};

    let z = records.length - 1;
    while (records[z][0].getMonth() == date[1]) {
        month.expenditure += records[z][2];
        month.income += records[z][3];
        ParseDetail(detailRecords[z][0], spendingLists.expenditure);
        ParseDetail(detailRecords[z--][1], spendingLists.income);
    }

    id("this-month-total-expenditure").textContent = visualizeNum(month.expenditure) + " " + defaultCurrency;
    id("this-month-total-income").textContent = visualizeNum(month.income) + " " + defaultCurrency;
    id("this-month-average-expenditure").textContent = visualizeNum(month.expenditure / parseFloat(date[2])) + " " + defaultCurrency;
    id("this-month-average-income").textContent = visualizeNum(month.income / parseFloat(date[2])) + " " + defaultCurrency;

    id("this-month-total-balance-text").textContent = (month.income >= month.expenditure) ? "Surplus" : "Deficit";
    id("this-month-total-balance-text").parentElement.style.color = (month.income >= month.expenditure) ? "#097138" : "#9e0000";
    id("this-month-total-balance").textContent = visualizeNum(Math.abs(month.expenditure - month.income)) + " " + defaultCurrency;
    id("this-month-average-balance-text").textContent = "Daily Average " + ((month.income >= month.expenditure) ? "Surplus" : "Deficit");
    id("this-month-average-balance-text").parentElement.style.color = (month.income >= month.expenditure) ? "#097138" : "#9e0000";
    id("this-month-average-balance").textContent = visualizeNum(Math.abs(month.expenditure - month.income)/parseFloat(date[2])) + " " + defaultCurrency;

    // create detail list
    for (let type in spendingLists) {
        id(`this-month-${type}-detail`).innerHTML = "";
        for (let list in spendingLists[type]) {
            let block = document.createElement("div");
            let li1 = document.createElement("li");
            let li2 = document.createElement("li");
    
            li1.textContent = list + ":";
            li2.textContent = visualizeNum(spendingLists[type][list]) + " " + defaultCurrency;
            block.appendChild(li1);
            block.appendChild(li2);

            id(`this-month-${type}-detail`).appendChild(block);
        }
    }

    // redraw this month chart
    google.charts.setOnLoadCallback(function() {
        ThisMonthGraph(Object2Array(spendingLists.expenditure), "this-month-expenditure-graph");
        ThisMonthGraph(Object2Array(spendingLists.income), "this-month-income-graph");
    });

    // helper functions
    function ParseDetail(detailRow, obj) {
        if (detailRow == "") return;

        for (let pairVal of detailRow.split(";")) {
            pairVal = pairVal.split("=");

            obj[pairVal[0]] = obj[pairVal[0]] ? obj[pairVal[0]] + parseFloat(pairVal[1]) : parseFloat(pairVal[1]);
        }
    }

    function Object2Array(obj) {
        let arr = [];
        for (let key in obj) {
            arr.push([key, obj[key]]);
        }
        return arr;
    }
}

// adjust the balance and text it
function UpdateBalance() {
    finance.balance.result = finance.balance.final - GetTotalValue("fiscal-expenditure") + GetTotalValue("fiscal-income");
    id("fiscal-balance").children[0].textContent = visualizeNum(finance.balance.result) + " " + defaultCurrency;
}

function GetTotalValue(channel) {
    return parseNum(id(channel).getElementsByClassName("total")[0].textContent);
}

// get database-keyed spending detail
function GetDetails(channel) {
    let detail = "";
    for (let i = 0; i < id(channel).getElementsByClassName("root-list").length; i++) {
        const rootList = id(channel).getElementsByClassName("root-list")[i];
        detail += rootList.firstChild.textContent.replace(/[:]/g, "") + "=" + parseNum(rootList.getElementsByTagName("input")[0].value);

        if (i < id(channel).getElementsByClassName("root-list").length - 1)
            detail += ";";
    }
    return detail;
}

// ----------------------- //
//  Interface Interactions //
// ----------------------- //

// collapsible content
for (const expandable of cl("expandable")) {
    expandable.addEventListener("click", function() {
        let detailList = this.nextElementSibling;
        detailList.style.maxHeight = (detailList.style.maxHeight == "0px") ? detailList.scrollHeight + "px" : 0;
    });
}

// write the currency
let defaultCurrency = "THB";
for (const tagname of tn("span")) {
    tagname.textContent = defaultCurrency;
}

function KeyToEnterTitle(obj) {
    if (event.keyCode == 13)
        obj.nextElementSibling.focus();
}

function KeyToEnterAmount(obj) {
    if (event.keyCode == 13)
        obj.nextElementSibling.click();
}