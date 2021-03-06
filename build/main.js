import GoogleAppsScriptDB from "./lib.google.appsscriptdb.js";
import GoogleCharts from "./lib.google.charts.js";
import { App } from "./lib.core.js";
import { RootList } from "./app.modules.js";
import { FormPane, GraphSection, MainPane, ConclusionSection, UserRibbonSection } from "./app.panels.js";
export const db = new GoogleAppsScriptDB("https://script.google.com/macros/s/AKfycbx8PNkzqprtcF5xIjbkvHszP6P5ggWwaAsXdB-fpf7g9BA3bbHT/exec");
export const graph = new GoogleCharts("corechart", "line");
export const user = {
    id: "",
    fullname: "",
    email: "",
    settings: {
        currency: ""
    }
};
export const records = [];
export const detailRecords = [];
export const balance = {
    final: 0,
    result: 0
};
export const roots = {
    exp: new RootList("exp"),
    inc: new RootList("inc"),
    len: new RootList("len"),
    deb: new RootList("deb")
};
export const colorset = {
    deficit: "#d45079",
    surplus: "#4baea0"
};
class BalPayApp {
    static start() {
        var _a, _b, _c;
        UserRibbonSection.todayDateEl.textContent = App.Utils.formatDate(App.Utils.todayDate);
        App.Utils.initCopyRight(document.getElementById("copyright-year"), 2019);
        graph.set("history", "line-chart", {
            "Date": Date,
            "Balance": Number,
            "Expense": Number,
            "Income": Number,
            "Lending": Number,
            "Debt": Number
        }, () => {
            return {
                title: "",
                legend: { position: "bottom" },
                fontName: "Cabin",
                backgroundColor: { fill: "transparent" },
                colors: ["#85C1E9", colorset.deficit, colorset.surplus, "#ffc70f", "#5D6D7E"],
                animation: {
                    duration: 1000,
                    easing: 'out',
                },
            };
        });
        graph.set("summarized-pie", "pie-chart", {
            "list": String,
            "spending": Number
        }, () => {
            return {
                title: "",
                legend: "none",
                pieSliceText: 'label',
                fontName: "Cabin",
                height: document.getElementsByTagName("main")[0].offsetWidth / 2,
                backgroundColor: { fill: "transparent" }
            };
        });
        FormPane.init();
        for (const el of document.getElementsByClassName("collapsible-object")) {
            el.addEventListener("click", function () {
                const nextSiblingEl = el.nextElementSibling;
                nextSiblingEl.style.maxHeight = !parseInt(nextSiblingEl.style.maxHeight) ? nextSiblingEl.scrollHeight + "px" : "0";
            });
        }
        for (const el of document.getElementsByClassName("section-view-grid")) {
            for (const child of el.children) {
                child.addEventListener("click", function () {
                    var _a;
                    (_a = this.parentElement) === null || _a === void 0 ? void 0 : _a.getElementsByClassName("viewed")[0].classList.remove("viewed");
                    this.classList.add("viewed");
                });
            }
        }
        for (const el of (_a = document.getElementById("statistics-view")) === null || _a === void 0 ? void 0 : _a.children) {
            el.addEventListener("click", function () {
                const graphEl = document.getElementById("statistics-chart");
                switch (el.textContent) {
                    case "All":
                        graph.render("history", records, graphEl);
                        break;
                    case "This Month":
                        graph.render("history", records.slice(-App.Utils.todayDate.split(".")[2]), graphEl);
                        break;
                    case "This Week":
                        graph.render("history", records.slice(-7), graphEl);
                        break;
                }
            });
        }
        for (const el of (_b = document.getElementById("view-mode")) === null || _b === void 0 ? void 0 : _b.children) {
            el.addEventListener("click", function () {
                if (!el.dataset.index)
                    return;
                const detailSectionEl = document.getElementById("details-sections");
                for (const el of detailSectionEl.children) {
                    el.hidden = true;
                }
                detailSectionEl.children[+el.dataset.index].hidden = false;
            });
        }
        db.defaultResponsefn = (res) => console.log(res);
        db.setResponseAction("SIGNUP", (res) => {
            FormPane.signUpSection.isRequesting = false;
            if (res.err) {
                switch (res.err) {
                    case "id":
                        FormPane.signUpSection.loggingText = "Username is already taken.";
                        break;
                    default: FormPane.signUpSection.loggingText = "Email is already taken.";
                }
            }
            else if (res.done) {
                FormPane.signUpSection.loggingText = "Proceeding is done, please return to sign in.";
            }
        });
        db.setResponseAction("SIGNIN", (res, old) => {
            var _a;
            FormPane.signInSection.isRequesting = false;
            if (res.err || !res.pass) {
                FormPane.signInSection.confirmBtn.textContent = "Username or password is incorrect.";
                return;
            }
            user.id = res.userData.USERID;
            user.fullname = res.userData.FULLNAME;
            user.email = res.userData.EMAIL;
            user.settings = JSON.parse(res.userData.USER_SETTINGS);
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
                if (res.records.indexOf(dataRow) === res.records.length - 1) {
                    roots["exp"].detail = dataRow.DETAIL_EXPENDITURE;
                    roots["inc"].detail = dataRow.DETAIL_INCOME;
                    roots["len"].detail = dataRow.DETAIL_LENDING;
                    roots["deb"].detail = dataRow.DETAIL_DEBT;
                }
                if (res.records.indexOf(dataRow) === res.records.length - 2) {
                    balance.final = dataRow.BALANCE;
                }
            }
            MainPane.present = true;
            FormPane.present = false;
            RootList.UpdateBalance();
            ConclusionSection.updateConclusion();
            GraphSection.setActiveModeTo(1);
            document.head.title = "BalPay - " + user.fullname;
            UserRibbonSection.fullNameEl.textContent = user.fullname;
            FormPane.signInSection.confirmBtn.textContent = "Sign In";
            for (const expandable of document.getElementsByClassName("collapsible-object")) {
                const nextSiblingEl = expandable.nextElementSibling;
                nextSiblingEl.style.maxHeight = "0";
            }
            if (old) {
                localStorage.setItem("userid", old.userid);
                localStorage.setItem("password", old.password);
            }
            (_a = document.getElementById("loading-page")) === null || _a === void 0 ? void 0 : _a.remove();
        });
        db.setDataRequestForm("UPDATE", () => {
            return {
                "user": user.id,
                "date": App.Utils.todayDate,
                "balance": balance.result,
                "expenditure": roots["exp"].total,
                "income": roots["inc"].total,
                "lending": roots["len"].total,
                "debt": roots["deb"].total,
                "detail_expenditure": roots["exp"].detail,
                "detail_income": roots["inc"].detail,
                "detail_lending": roots["len"].detail,
                "detail_debt": roots["deb"].detail
            };
        });
        MainPane.init();
        UserRibbonSection.init();
        if (!this.checkLocalStorage()) {
            (_c = document.getElementById("loading-page")) === null || _c === void 0 ? void 0 : _c.remove();
        }
    }
    static checkLocalStorage() {
        const userid = localStorage.getItem("userid");
        const password = localStorage.getItem("password");
        if (!userid || !password)
            return false;
        db.doGetRequest("SIGNIN", { userid, password });
        return true;
    }
}
window.onload = () => BalPayApp.start();
