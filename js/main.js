import EventListenerModule from "./modules/event-listener-module.js";
import GoogleAppsScriptDB from "./modules/google-apps-script-db.js";
import GoogleCharts from "./modules/google-charts.js";
import { AppSystem, AutomaticSystem, Tools } from "./modules/misc.js";
import { RootList } from "./modules/app-module.js";

export const elm = new EventListenerModule();
export const db = new GoogleAppsScriptDB("https://script.google.com/macros/s/AKfycbx8PNkzqprtcF5xIjbkvHszP6P5ggWwaAsXdB-fpf7g9BA3bbHT/exec");
export const graph = new GoogleCharts("corechart", "line");
AppSystem.WatchError();

// sever side variable(s)
export const user = {};
export const records = [];
export const detailRecords = [];

export const balance = {
    final: 0, // The balance that not include calulated result of exp. or inc --- form previous record.
    result: 0 // the balnce that include calulated result of exp. or inc.
}

export const roots = {
    exp: new RootList("exp"),
    inc: new RootList("inc"),
    len: new RootList("len"),
    deb: new RootList("deb")
};

// ------------------ //
//  Initial Functions //
// ------------------ //

document.getElementById("today-date").textContent = Tools.FormatDate(Tools.currentDate);
AutomaticSystem.Copyright(document.getElementById("copyright-year"), 2019);

// --------------------------- //
//  Core Fundamental Functions //
// --------------------------- //

export function Summarization() {
    let date = Tools.currentDate.split(".");
    let month = {expenditure: 0, income: 0};
    let spendingLists = {expenditure: {}, income: {}};

    let cMonth = {expenditure: 0, income: 0};
    let lastMonthSpendingLists = {expenditure: {}, income: {}};
    
    const thisMonth = +date[1];
    let tcMonth = thisMonth - 1 < 0 ? 11 : thisMonth - 1;
    let totalComDate = 0;

    for (let z = records.length - 1; z >= 0; z--) {
        // get this month data
        if (records[z][0].getMonth() === thisMonth) {
            month.expenditure += records[z][2];
            month.income += records[z][3];
            Tools.ParseDetail(detailRecords[z][0], spendingLists.expenditure);
            Tools.ParseDetail(detailRecords[z][1], spendingLists.income);
        }

        // get last month data
        if (records[z][0].getMonth() === tcMonth) {
            cMonth.expenditure += records[z][2];
            cMonth.income += records[z][3];
            Tools.ParseDetail(detailRecords[z][0], lastMonthSpendingLists.expenditure);
            Tools.ParseDetail(detailRecords[z][1], lastMonthSpendingLists.income);
            totalComDate++;
        }
    }

    document.getElementById("stm-total-expenditure").textContent = Tools.FormatNumber(month.expenditure) + " " + user.settings.currency;
    document.getElementById("stm-total-income").textContent = Tools.FormatNumber(month.income) + " " + user.settings.currency;
    document.getElementById("stm-average-expenditure").textContent = Tools.FormatNumber(month.expenditure / +date[2]) + " " + user.settings.currency;
    document.getElementById("stm-average-income").textContent = Tools.FormatNumber(month.income / +date[2]) + " " + user.settings.currency;

    document.getElementById("stm-total-balance-text").textContent = month.income >= month.expenditure ? "Surplus" : "Deficit";
    document.getElementById("stm-total-balance-text").parentElement.style.color = month.income >= month.expenditure ? "#4baea0" : "#d45079";
    document.getElementById("stm-total-balance").textContent = Tools.FormatNumber(Math.abs(month.expenditure - month.income)) + " " + user.settings.currency;
    document.getElementById("stm-average-balance-text").textContent = "Daily Average " + (month.income >= month.expenditure ? "Surplus" : "Deficit");
    document.getElementById("stm-average-balance-text").parentElement.style.color = month.income >= month.expenditure ? "#4baea0" : "#d45079";
    document.getElementById("stm-average-balance").textContent = Tools.FormatNumber(Math.abs(month.expenditure - month.income)/ +date[2]) + " " + user.settings.currency;

    // create detail list for sdm
    for (let type in spendingLists) {
        document.getElementById(`stm-${type}-detail`).innerHTML = "";
        for (let list in spendingLists[type]) {
            let block = document.createElement("div");
            let li1 = document.createElement("li");
            let li2 = document.createElement("li");
    
            li1.textContent = list + ":";
            li2.textContent = Tools.FormatNumber(spendingLists[type][list]) + " " + user.settings.currency;
            block.appendChild(li1);
            block.appendChild(li2);

            document.getElementById(`stm-${type}-detail`).appendChild(block);
        }
    }

    // redraw this month chart
    graph.Render("summarized-pie", Tools.Object2Array(spendingLists.expenditure), "#stm-expenditure-graph");
    graph.Render("summarized-pie", Tools.Object2Array(spendingLists.income), "#stm-income-graph");

    /* #### SUMMARIZATION #### */

    if (totalComDate === 0) return;

    ComparisonBarExpenditure("expenditure", document.getElementById("by-time-expenditure").children[0].children[1], month.expenditure, cMonth.expenditure);
    ComparisonBarExpenditure("income", document.getElementById("by-time-income").children[0].children[1], month.income, cMonth.income);
    ComparisonBarExpenditure("expenditure", document.getElementById("by-average-expenditure").children[0].children[1], month.expenditure / +date[2], cMonth.expenditure / totalComDate);
    ComparisonBarExpenditure("income", document.getElementById("by-average-income").children[0].children[1], month.income / +date[2], cMonth.income / totalComDate);

    // create detail list for comparison
    for (const type in spendingLists) {
        while (document.getElementById(`by-time-${type}`).childElementCount > 1) {
            document.getElementById(`by-time-${type}`).removeChild(document.getElementById(`by-time-${type}`).lastChild);
            document.getElementById(`by-average-${type}`).removeChild(document.getElementById(`by-average-${type}`).lastChild);
        }
        
        // by-time expenditure and income
        for (const list in spendingLists[type]) {
            let block = document.createElement("div");
            let aside1 = document.createElement("aside");
            let aside2 = document.createElement("aside");
            let aside3 = document.createElement("aside");

            if (lastMonthSpendingLists[type][list]) {
                const last = lastMonthSpendingLists[type][list];
                const current = spendingLists[type][list];
                let color;

                if (current < last) {
                    color = type === "expenditure" ? "#4baea0" : "#d45079";
                    aside3.textContent = `-${Tools.FormatNumber((last - current) / last * 100)}%`;
                    aside2.style.backgroundImage = `linear-gradient(to right, #5D6D7E ${current / last * 100}%, ${color} 0)`;
                }
                else {
                    color = type === "expenditure" ? "#d45079" : "#4baea0";
                    aside3.textContent = `+${Tools.FormatNumber((current - last) / current * 100)}%`;
                    aside2.style.backgroundImage = `linear-gradient(to right, #5D6D7E ${last / current * 100}%, ${color} 0)`;
                }
                aside3.style.color = aside3.textContent === "+0.00%" ? "black" : color;
            }
            else {
                aside3.style.color = aside2.style.backgroundColor = type === "expenditure" ? "#d45079" : "#4baea0";
                aside3.textContent = "NEW";
            }
    
            aside1.textContent = list + ":";
            block.appendChild(aside1);
            block.appendChild(aside2);
            block.appendChild(aside3);

            document.getElementById(`by-time-${type}`).appendChild(block);
        }

        // by-average expenditure and income
        for (const list in spendingLists[type]) {
            let block = document.createElement("div");
            let aside1 = document.createElement("aside");
            let aside2 = document.createElement("aside");
            let aside3 = document.createElement("aside");

            if (lastMonthSpendingLists[type][list]) {
                const last = lastMonthSpendingLists[type][list] / totalComDate;
                const current = spendingLists[type][list] / +date[2];
                let color;

                if (current < last) {
                    color = type === "expenditure" ? "#4baea0" : "#d45079";
                    aside3.textContent = `-${Tools.FormatNumber((last - current) / last * 100)}%`;
                    aside2.style.backgroundImage = `linear-gradient(to right, #5D6D7E ${current / last * 100}%, ${color} 0)`;
                }
                else {
                    color = type === "expenditure" ? "#d45079" : "#4baea0";
                    aside3.textContent = `+${Tools.FormatNumber((current - last) / current * 100)}%`;
                    aside2.style.backgroundImage = `linear-gradient(to right, #5D6D7E ${last / current * 100}%, ${color} 0)`;
                }
                aside3.style.color = aside3.textContent === "+0.00%" ? "black" : color;
            }
            else {
                aside3.style.color = aside2.style.backgroundColor = type === "expenditure" ? "#d45079" : "#4baea0";
                aside3.textContent = "NEW";
            }

            aside1.textContent = list + ":";
            block.appendChild(aside1);
            block.appendChild(aside2);
            block.appendChild(aside3);

            document.getElementById(`by-average-${type}`).appendChild(block);
        }

        for (const list in lastMonthSpendingLists[type]) {
            if (spendingLists[type][list] === undefined) {
                let block = document.createElement("div");
                let aside1 = document.createElement("aside");
                let aside2 = document.createElement("aside");
                let aside3 = document.createElement("aside");
    
                aside2.style.backgroundColor = aside3.style.color = type === "expenditure" ? "#4baea0" : "#d45079";
                aside3.textContent = "-100%";
    
                aside1.textContent = list + ":";
                block.appendChild(aside1);
                block.appendChild(aside2);
                block.appendChild(aside3);

                document.getElementById(`by-time-${type}`).appendChild(block);
                document.getElementById(`by-average-${type}`).appendChild(block.cloneNode(true));
            }
        }
    }

    function ComparisonBarExpenditure(type, barElement, refNum, comNum) {
        if (refNum < comNum) {
            const base = (comNum - refNum) / comNum * 100;
            const over = refNum / comNum * 100;
            const color = type === "expenditure" ? "#4baea0" : "#d45079";
            barElement.nextElementSibling.textContent = `-${Tools.FormatNumber(base)}%`;
            barElement.nextElementSibling.style.color = color;
            barElement.style.backgroundImage = `linear-gradient(to right, #5D6D7E ${over}%, ${color} 0)`;
        }
        else {
            const base = comNum / refNum * 100;
            const over = (refNum - comNum) / refNum * 100;
            const color = type === "expenditure" ? "#d45079" : "#4baea0";
            barElement.nextElementSibling.textContent = `+${Tools.FormatNumber(over)}%`;
            barElement.nextElementSibling.style.color = color;
            barElement.style.backgroundImage = `linear-gradient(to right, #5D6D7E ${base}%, ${color} 0)`;
        }
    }
}

// ------------------- //
//  Chart Interactions //
// ---------- -------- //
graph.Set("history", "line-chart", {
    "Date": Date,
    "Balance": Number,
    "Expense": Number,
    "Income": Number,
    "Lending": Number,
    "Debt": Number
}, () => {
    return {
        title: "",
        legend: {position: "bottom"},
        fontName: "Cabin",
        backgroundColor: {fill: "transparent"},
        colors: ["#85C1E9", "#d45079", "#4baea0", "#ffc70f", "#5D6D7E"],
        animation: {
            duration: 1000,
            easing: 'out',
        },
    }
});

graph.Set("summarized-pie", "pie-chart", {
    "list": String,
    "spending": Number
}, () => {
    return {
        title: "",
        legend: "none",
        pieSliceText: 'label',
        fontName: "Cabin",
        height: document.getElementsByTagName("main")[0].offsetWidth / 2,
        backgroundColor: { fill:"transparent" }
    }
});

// ----------------------- //
//  Interface Interactions //
// ----------------------- //

const shootError = (inputChannel) => {
    inputChannel.focus();
    inputChannel.classList.add("input-error");
}

// form
elm.Add("#signin-userid", {
    "keydown.enter": (e, el) => {
        !el.value ? shootError(el) : document.getElementById("signin-password").focus();
    },
    "keydown": (e, el) => {
        el.classList.remove("input-error");
    }
});

elm.Add("#signin-password", {
    "keydown.enter": (e, el) => {
        !el.value ? shootError(el) : document.getElementsByClassName("comfirm-button")[0].click();
    },
    "keydown": (e, el) => {
        el.classList.remove("input-error");
    }
});

elm.Add("#goto-forget-password-form-button", {
    "click": () => {

    }
});

elm.Add("#goto-signup-form-button", {
    "click": () => {
        document.getElementById("signup-form").hidden = false;
        document.getElementById("signin-form").hidden = true;
        document.getElementById("forgotmypassword-form").hidden = true;
    }
});

elm.Add("#goto-signin-form-button", {
    "click": () => {
        document.getElementById("signup-form").hidden = true;
        document.getElementById("signin-form").hidden = false;
        document.getElementById("forgotmypassword-form").hidden = true;
    }
});

// sign in button
elm.Add("#signin-button", {
    "click": (e, el) => {
        const inputPasswordEl = document.getElementById("signin-password");
        const inputUsernameEl = document.getElementById("signin-userid");

        // is requesting
        if (inputUsernameEl.disabled || inputPasswordEl.disabled) return;

        if (!inputUsernameEl.value) shootError(inputUsernameEl);
        else if (!inputPasswordEl.value) shootError(inputPasswordEl);
        else {
            el.textContent = "Processing Request...";
            inputUsernameEl.disabled = true;
            inputPasswordEl.disabled = true;

            db.Request("SIGNIN", {
                "userid": inputUsernameEl.value,
                "password": inputPasswordEl.value
            });
        }
    }
});

// collapsible content
elm.Add(".collapsible-object", {
    "click": (e, el) => {
        const detailList = el.nextElementSibling;
        detailList.style.maxHeight = !parseInt(detailList.style.maxHeight) ? detailList.scrollHeight + "px" : 0;
    }
});

// section view
elm.Add(".section-view-grid > aside", {
    "click": (e, el) => {
        for (const child of el.parentElement.children) child.classList.remove("viewed");
    
        el.classList.add("viewed");
    }
});

elm.Add("#statistics-view > *", {
    "click": (e, el) => {
        let queryRecords = [];
        switch (el.textContent) {
            case "All": {
                queryRecords = records;
            } break;
            case "This Month": {
                const thisMonth = +Tools.currentDate.split(".")[1];
                for (const record of records) {
                    if (record[0].getMonth() === thisMonth) queryRecords.push(record);
                }
            } break;
            case "This Week": {
                for (let z = records.length - 1; z > records.length - 8; z--) queryRecords.push(records[z]);
            } break;
        }

        graph.Render("history", queryRecords, "#main_statistics");
    }
});

// view mode
elm.Add("#view-mode > *", {
    "click": (e, el) => {
        switch (el.textContent) {
            case "This Month": {
                document.getElementById("summarized-details").children[2].hidden = false;
                document.getElementById("summarized-details").children[3].hidden = true;
            } break;
            case "Comparison": {
                document.getElementById("summarized-details").children[2].hidden = true;
                document.getElementById("summarized-details").children[3].hidden = false;
            } break;
        }
    }
});

// ---------------------- //
//  Database Interactions //
// ---------------------- //

db.DefaultResponse(res => console.log(res));

db.Response("SIGNIN", (res) => {
    document.getElementById("signin-userid").disabled = false;
    document.getElementById("signin-password").disabled = false;

    if (res.res === "err") {
        document.getElementsByClassName("comfirm-button")[0].textContent = "Username or password is incorrect.";
    }
    else if (res.res === "pass") { // if sign in form is corrected
        // store user data
        user.id = res.userData.USERID;
        user.fullname = res.userData.FULLNAME;
        user.email = res.userData.EMAIL;
        user.settings = JSON.parse(res.userData.USER_SETTINGS);

        // processing records
        for (const dataRow of res.records) {
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

            if (res.records.indexOf(dataRow) === res.records.length - 1) { // record list is today
                roots["exp"].detail = dataRow.DETAIL_EXPENDITURE;
                roots["inc"].detail = dataRow.DETAIL_INCOME;
                roots["len"].detail = dataRow.DETAIL_LENDING;
                roots["deb"].detail = dataRow.DETAIL_DEBT;
            }
            if (res.records.indexOf(dataRow) === res.records.length - 2) { // record list is previous day
                balance.final = dataRow.BALANCE;
            }
        }

        // functions after completing the data request precess
        document.getElementsByClassName("viewed")[0].click();
        RootList.UpdateBalance();
        Summarization();

        // display main screen
        document.getElementsByTagName("main")[0].hidden = false;
        document.getElementsByTagName("footer")[0].hidden = false;
        document.getElementsByClassName("form-container")[0].hidden = true;
        document.body.style.padding = "0 6px";

        // init user settings
        document.getElementsByTagName("title")[0].textContent = "BalPay - " + user.fullname;
        document.getElementById("fullname").textContent = user.fullname;

        // close all newly created list
        for (const expandable of document.getElementsByClassName("collapsible-object")) expandable.nextElementSibling.style.maxHeight = 0;
    }
});

db.DataRequestForm("UPDATE", () => {
    return {
        "user": user.id,
        "date": Tools.currentDate,
        "balance": balance.result,
        "expenditure": roots["exp"].total,
        "income": roots["inc"].total,
        "lending": roots["len"].total,
        "debt": roots["deb"].total,
        "detail_expenditure": roots["exp"].detail,
        "detail_income": roots["inc"].detail,
        "detail_lending": roots["len"].detail,
        "detail_debt": roots["deb"].detail
    }
});