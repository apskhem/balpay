const id = (id) => document.getElementById(id);
const cl = (cl) => document.getElementsByClassName(cl);
const tn = (tn) => document.getElementsByTagName(tn);
const create = (tn) => document.createElement(tn);

window.onerror = (msg, url, lineNo, columnNo, error) => alert(`${msg}\nAT: ${lineNo}-${columnNo} ${url.split("/").pop()}`);

class AutomaticSystem {
    static Copyright(element, startYear) {
        const recentYear = new Date().getFullYear();
        element.textContent = (startYear === recentYear) ? startYear : `${startYear}-${recentYear}`;
    }
}

class AppToolset {
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

    static DeformatNumber(readable) {
        return parseFloat(readable.replace(/[,]/g, ""));
    }

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

// ------------------ //
//  Initial Functions //
// ------------------ //

id("today-date").textContent = AppToolset.FormatDate(AppToolset.currentDate);
AutomaticSystem.Copyright(id("copyright-year"), 2019);

// --------------------------- //
//  Core Fundamental Functions //
// --------------------------- //

const inputlist = {
    backupValue: "0",
    FocusOut() {
        const detailObject = this.parentElement.parentElement;
        const channel = this.parentElement.parentElement.parentElement.parentElement.parentElement.id;

        if (this.value === inputlist.backupValue) {
            this.type = "text";
            this.value = AppToolset.FormatNumber(this.value);
            return;
        }
        else if (this.value === "0") {
            detailObject.parentElement.removeChild(detailObject);
            FinalizeList();
            return;
        }
        else if (this.value < 0 || this.value === "") {
            this.value = inputlist.backupValue;
            return;
        }

        this.type = "text";
        this.value = AppToolset.FormatNumber(this.value);
        FinalizeList();

        function FinalizeList() {
            SumList(channel);
            UpdateBalance();
            UpdateChart();
            SumThisMonth();

            if (this) {
                pendingList.Push(detailObject);
            }
    
            Database.Update();
        }
    },
    FocusIn() {
        this.value = AppToolset.DeformatNumber(this.value);
        this.type = "number";
        inputlist.backupValue = this.value;
    },
    OnEnter(event) {
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

        if (input_title === "") return;
        if (input_amount === "") return;

        if (wasRecordsRead) {
            const subroot = this.parentElement.parentElement;
            for (const rootList of subroot.getElementsByClassName("root-list")) {
                const existed_title = rootList.children[0].textContent.replace(/[:]/g, "");
                if (input_title === existed_title) {
                    // (if existed value + new input value) is more than or equal 0
                    if (AppToolset.DeformatNumber(rootList.getElementsByTagName("input")[0].value) + AppToolset.DeformatNumber(input_amount) > 0) {
                        let listObj = rootList.getElementsByTagName("input")[0];

                        // value in
                        listObj.value = AppToolset.DeformatNumber(listObj.value) + AppToolset.DeformatNumber(input_amount);

                        // value out
                        listObj.type = "text";
                        listObj.value = AppToolset.FormatNumber(listObj.value);

                        SumList(subroot.parentElement.id);
                        UpdateBalance();
                        UpdateChart();
                        SumThisMonth();
                        pendingList.Push(rootList);
                        Database.Update();
                    }
                    else if (AppToolset.DeformatNumber(rootList.getElementsByTagName("input")[0].value) + AppToolset.DeformatNumber(input_amount) === 0) {
                        rootList.parentElement.removeChild(rootList);

                        SumList(subroot.parentElement.id);
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
        let rootdiv = create("div");
        let input = create("input");
        let li1 = create("li");
        let li2 = create("li");
        let spanCurrency = create("span");

        input.value = AppToolset.FormatNumber(input_amount);
        input.min = "0";
        input.addEventListener("focusin", inputlist.FocusIn);
        input.addEventListener("focusout", inputlist.FocusOut);
        input.addEventListener("keyup", inputlist.OnEnter);
        spanCurrency.textContent = " " + user.settings.currency;
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
        SumList(this.parentElement.parentElement.parentElement.id);
        UpdateBalance();

        if (wasRecordsRead) {
            UpdateChart();
            SumThisMonth();
            pendingList.Push(rootdiv);
            Database.Update();
        }

        function ResetInputNewList(obj) {
            obj.previousElementSibling.value = "";
            obj.value = "";
            obj.previousElementSibling.blur();
            obj.blur();
        }

        function DuplicateListToInput() {
            const textInputOfTheList = this.parentElement.parentElement.nextElementSibling.children[0];
            const numberInputOfTheList = this.parentElement.parentElement.nextElementSibling.children[1]; // not fixed
            textInputOfTheList.value = this.textContent.replace(":", "");
            numberInputOfTheList.focus();
        }
    });
}

// create spend list in defined channel
function CreateList(channel, title, amount) {
    const ch = id(channel).getElementsByClassName("create-list-grid")[0];

    ch.children[0].value = title;
    ch.children[1].value = amount;
    ch.children[2].click();
}

function UpdateChart() {
    records[records.length - 1] = [
        new Date(...AppToolset.currentDate.split(".")),
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
function SumList(channel) {
    if (channel) {
        let total = 0;
        for (const cost of id(channel).getElementsByClassName("cost")) {
            total += AppToolset.DeformatNumber(cost.children[0].value);
        }
        id(channel).getElementsByClassName("total")[0].textContent = AppToolset.FormatNumber(total) + " " + user.settings.currency;
    }
    else {
        SumList("fiscal-expenditure");
        SumList("fiscal-income");
        SumList("fiscal-lending");
        SumList("fiscal-debt");
    }
}

function SumThisMonth() {
    let date = AppToolset.currentDate.split(".");
    let month = {expenditure: 0, income: 0};
    let spendingLists = {expenditure: {}, income: {}};

    let z = records.length - 1;
    const thisMonth = +date[1]
    while (records[z][0].getMonth() === thisMonth) {
        month.expenditure += records[z][2];
        month.income += records[z][3];
        AppToolset.ParseDetail(detailRecords[z][0], spendingLists.expenditure);
        AppToolset.ParseDetail(detailRecords[z--][1], spendingLists.income);
    }

    id("this-month-total-expenditure").textContent = AppToolset.FormatNumber(month.expenditure) + " " + user.settings.currency;
    id("this-month-total-income").textContent = AppToolset.FormatNumber(month.income) + " " + user.settings.currency;
    id("this-month-average-expenditure").textContent = AppToolset.FormatNumber(month.expenditure / +date[2]) + " " + user.settings.currency;
    id("this-month-average-income").textContent = AppToolset.FormatNumber(month.income / +date[2]) + " " + user.settings.currency;

    id("this-month-total-balance-text").textContent = (month.income >= month.expenditure) ? "Surplus" : "Deficit";
    id("this-month-total-balance-text").parentElement.style.color = (month.income >= month.expenditure) ? "#097138" : "#9e0000";
    id("this-month-total-balance").textContent = AppToolset.FormatNumber(Math.abs(month.expenditure - month.income)) + " " + user.settings.currency;
    id("this-month-average-balance-text").textContent = "Daily Average " + ((month.income >= month.expenditure) ? "Surplus" : "Deficit");
    id("this-month-average-balance-text").parentElement.style.color = (month.income >= month.expenditure) ? "#097138" : "#9e0000";
    id("this-month-average-balance").textContent = AppToolset.FormatNumber(Math.abs(month.expenditure - month.income)/ +date[2]) + " " + user.settings.currency;

    // create detail list
    for (let type in spendingLists) {
        id(`this-month-${type}-detail`).innerHTML = "";
        for (let list in spendingLists[type]) {
            let block = create("div");
            let li1 = create("li");
            let li2 = create("li");
    
            li1.textContent = list + ":";
            li2.textContent = AppToolset.FormatNumber(spendingLists[type][list]) + " " + user.settings.currency;
            block.appendChild(li1);
            block.appendChild(li2);

            id(`this-month-${type}-detail`).appendChild(block);
        }
    }

    // redraw this month chart
    google.charts.setOnLoadCallback(() => {
        ThisMonthGraph(AppToolset.Object2Array(spendingLists.expenditure), "this-month-expenditure-graph");
        ThisMonthGraph(AppToolset.Object2Array(spendingLists.income), "this-month-income-graph");
    });
}

// adjust the balance and text it
function UpdateBalance() {
    finance.balance.result = finance.balance.final - GetTotalValue("fiscal-expenditure") + GetTotalValue("fiscal-income");
    id("fiscal-balance").children[0].textContent = AppToolset.FormatNumber(finance.balance.result) + " " + user.settings.currency;
}

function GetTotalValue(channel) {
    return AppToolset.DeformatNumber(id(channel).getElementsByClassName("total")[0].textContent);
}

// get database-keyed spending detail
function GetDetails(channel) {
    let detail = "";
    for (let i = 0; i < id(channel).getElementsByClassName("root-list").length; i++) {
        const rootList = id(channel).getElementsByClassName("root-list")[i];
        detail += rootList.firstChild.textContent.replace(/[:]/g, "") + "=" + AppToolset.DeformatNumber(rootList.getElementsByTagName("input")[0].value);

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
        detailList.style.maxHeight = (detailList.style.maxHeight === "0px") ? detailList.scrollHeight + "px" : 0;
    });
}

function KeyToEnterTitle(obj) {
    if (event.keyCode === 13)
        obj.nextElementSibling.focus();
}

function KeyToEnterAmount(obj) {
    if (event.keyCode === 13)
        obj.nextElementSibling.click();
}