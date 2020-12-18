var _a;
import { App } from "./lib.core.js";
import { db, roots, user, records, detailRecords, balance, colorset, graph } from "./main.js";
export class Form {
    static alertFormError(input) {
        input.focus();
        input.classList.add("input-error");
    }
    static init() {
        this.setActiveSection("singin");
        this.usernameInput.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                !this.usernameInput.value ? this.alertFormError(this.usernameInput) : this.passwordInput.focus();
            }
            this.usernameInput.classList.remove("input-error");
        });
        this.passwordInput.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                !this.passwordInput.value ? this.alertFormError(this.passwordInput) : this.signInProceedBtn.click();
            }
            this.passwordInput.classList.remove("input-error");
        });
        this.gotoForgotPasswordBtn.addEventListener("click", () => this.setActiveSection("forgotpassword"));
        this.gotoSignUpBtn.addEventListener("click", () => this.setActiveSection("singup"));
        this.gotoSignInBtn.addEventListener("click", () => this.setActiveSection('singin'));
        this.signInProceedBtn.addEventListener("click", () => {
            if (this.usernameInput.disabled || this.passwordInput.disabled)
                return;
            if (!this.usernameInput.value) {
                this.alertFormError(this.usernameInput);
            }
            else if (!this.passwordInput.value) {
                this.alertFormError(this.passwordInput);
            }
            else {
                this.signInProceedBtn.textContent = "Processing Request...";
                this.activeInputs = false;
                db.request("SIGNIN", {
                    "userid": this.usernameInput.value,
                    "password": this.passwordInput.value
                });
            }
        });
        this.signUpProceedBtn.addEventListener("click", () => {
            if (!this.signUpFullNameInput.value)
                this.alertFormError(this.signUpFullNameInput);
            else if (!this.signUpUsernameInput.value)
                this.alertFormError(this.signUpUsernameInput);
            else if (!this.signUpPasswordInput.value)
                this.alertFormError(this.signUpPasswordInput);
            else if (!this.signUpEmailInput.value)
                this.alertFormError(this.signUpEmailInput);
            else {
                this.signUpProceedBtn.textContent = "Processing Request...";
                this.activeInputs = false;
                db.request("SIGNUP", {
                    "userid": this.signUpUsernameInput.value,
                    "password": this.signUpPasswordInput.value,
                    "fullname": this.signUpFullNameInput.value,
                    "email": this.signUpEmailInput.value,
                    "setting": this.signUpCurrencyInput.value || "THB"
                });
            }
        });
    }
    static setActiveSection(section) {
        this.signInSection.remove();
        this.signUpSection.remove();
        this.forgotPasswordSection.remove();
        switch (section) {
            case "singin":
                this.form.appendChild(this.signInSection);
                break;
            case "singup":
                this.form.appendChild(this.signUpSection);
                break;
            case "forgotpassword":
                this.form.appendChild(this.forgotPasswordSection);
                break;
        }
    }
    static get activeInputs() {
        return this.usernameInput.disabled;
    }
    static set activeInputs(value) {
        this.usernameInput.disabled = true;
        this.passwordInput.disabled = true;
        this.signUpUsernameInput.disabled = true;
        this.signUpPasswordInput.disabled = true;
        this.signUpFullNameInput.disabled = true;
        this.signUpEmailInput.disabled = true;
        this.signUpCurrencyInput.disabled = true;
    }
    static get active() {
        return document.body.contains(this.pane);
    }
    static set active(value) {
        value
            ? document.body.appendChild(this.pane)
            : this.pane.remove();
    }
}
Form.pane = document.getElementById("form-module");
Form.form = document.getElementsByTagName("form")[0];
Form.usernameInput = document.getElementById("signin-userid");
Form.passwordInput = document.getElementById("signin-password");
Form.signUpFullNameInput = document.getElementById("signup-fullname");
Form.signUpUsernameInput = document.getElementById("signup-userid");
Form.signUpPasswordInput = document.getElementById("signup-password");
Form.signUpEmailInput = document.getElementById("signup-email");
Form.signUpCurrencyInput = document.getElementById("signup-currency");
Form.signInSection = document.getElementById("signin-form");
Form.signUpSection = document.getElementById("signup-form");
Form.forgotPasswordSection = document.getElementById("forgotmypassword-form");
Form.gotoSignUpBtn = document.getElementById("goto-signup-form-button");
Form.gotoSignInBtn = document.getElementById("goto-signin-form-button");
Form.gotoForgotPasswordBtn = document.getElementById("goto-forget-password-form-button");
Form.signInProceedBtn = document.getElementById("signin-button");
Form.signUpProceedBtn = document.getElementById("signup-button");
export class Main {
    static init() {
        this.pane.removeAttribute("hidden");
        this.active = false;
    }
    static get active() {
        return document.body.contains(this.pane);
    }
    static set active(value) {
        value
            ? document.body.insertBefore(this.pane, this.footer)
            : this.pane.remove();
    }
}
Main.pane = document.getElementsByTagName("main")[0];
Main.footer = document.getElementsByTagName("footer")[0];
export class UserPanel {
}
UserPanel.fullNameEl = document.getElementById("fullname");
UserPanel.todayDateEl = document.getElementById("today-date");
export class GraphSection {
    static updateChart() {
        records.splice(-1, 1, [
            new Date(...App.Utils.todayDate.split(".")),
            balance.result,
            roots["exp"].total,
            roots["inc"].total,
            roots["len"].total,
            roots["deb"].total
        ]);
        detailRecords.splice(-1, 1, [
            roots["exp"].detail,
            roots["inc"].detail,
            roots["len"].detail,
            roots["deb"].detail
        ]);
        this.setActiveModeTo(1);
    }
    static setActiveModeTo(mode) {
        for (const el of this.statModeSelections) {
            el.classList.remove("viewed");
        }
        this.statModeSelections[mode - 1].classList.add("viewed");
        this.statModeSelections[mode - 1].click();
    }
}
GraphSection.statViewEl = document.getElementById("statistics-view");
GraphSection.statModeSelections = (_a = document.getElementById("statistics-view")) === null || _a === void 0 ? void 0 : _a.children;
class ColComparisonBar {
    constructor(chennelEl) {
        this.wrapper = document.createElement("div");
        this.aside1 = document.createElement("aside");
        this.aside2 = document.createElement("aside");
        this.aside3 = document.createElement("aside");
        this.wrapper.appendChild(this.aside1);
        this.wrapper.appendChild(this.aside2);
        this.wrapper.appendChild(this.aside3);
        chennelEl.appendChild(this.wrapper);
    }
    remove() {
        this.wrapper.remove();
    }
}
class ByTimeColComparisonBar extends ColComparisonBar {
    constructor(chennelEl, list, type, lastMonthSpendingLists, spendingLists) {
        super(chennelEl);
        if (lastMonthSpendingLists[type][list]) {
            const last = lastMonthSpendingLists[type][list];
            const current = spendingLists[type][list];
            let color;
            if (current < last) {
                color = type === "expenditure" ? colorset.surplus : colorset.deficit;
                this.aside3.textContent = `-${((1 - current / last) * 100).toLocaleString("en")}%`;
                this.aside2.style.backgroundImage = `linear-gradient(to right, #5D6D7E ${current / last * 100}%, ${color} 0)`;
            }
            else {
                color = type === "expenditure" ? colorset.deficit : colorset.surplus;
                this.aside3.textContent = `+${((current / last - 1) * 100).toLocaleString("en")}%`;
                this.aside2.style.backgroundImage = `linear-gradient(to right, #5D6D7E ${last / current * 100}%, ${color} 0)`;
            }
            this.aside3.style.color = this.aside3.textContent === "+0.00%" ? "black" : color;
        }
        else {
            this.aside3.style.color = this.aside2.style.backgroundColor = type === "expenditure" ? colorset.deficit : colorset.surplus;
            this.aside3.textContent = "NEW";
        }
        this.aside1.textContent = list + ":";
    }
}
class ByAvgColComparisonBar extends ColComparisonBar {
    constructor(chennelEl, list, type, lastMonthSpendingLists, spendingLists, totalAccDate, cd) {
        super(chennelEl);
        if (lastMonthSpendingLists[type][list]) {
            const last = lastMonthSpendingLists[type][list];
            const current = spendingLists[type][list] * (totalAccDate / cd);
            let color;
            if (current < last) {
                color = type === "expenditure" ? colorset.surplus : colorset.deficit;
                this.aside3.textContent = `-${((1 - current / last) * 100).toLocaleString("en")}%`;
                this.aside2.style.backgroundImage = `linear-gradient(to right, #5D6D7E ${current / last * 100}%, ${color} 0)`;
            }
            else {
                color = type === "expenditure" ? colorset.deficit : colorset.surplus;
                this.aside3.textContent = `+${((current / last - 1) * 100).toLocaleString("en")}%`;
                this.aside2.style.backgroundImage = `linear-gradient(to right, #5D6D7E ${last / current * 100}%, ${color} 0)`;
            }
            this.aside3.style.color = this.aside3.textContent === "+0.00%" ? "black" : color;
        }
        else {
            this.aside3.style.color = this.aside2.style.backgroundColor = type === "expenditure" ? colorset.deficit : colorset.surplus;
            this.aside3.textContent = "NEW";
        }
        this.aside1.textContent = list + ":";
    }
}
export class SummarizedSecton {
    static updateConclusion() {
        var _a, _b;
        const [cy, cm, cd] = App.Utils.todayDate.split(".").map(val => +val);
        const month = { expenditure: 0, income: 0 };
        const spendingLists = { expenditure: {}, income: {} };
        const cMonth = { expenditure: 0, income: 0 };
        const lastMonthSpendingLists = { expenditure: {}, income: {} };
        const tcMonth = cm - 1 < 0 ? 11 : cm - 1;
        let totalAccDate = 0;
        for (let z = records.length - 1; z >= 0; z--) {
            if (records[z][0].getMonth() === cm) {
                month.expenditure += records[z][2];
                month.income += records[z][3];
                App.Utils.parseDetail(detailRecords[z][0], spendingLists.expenditure);
                App.Utils.parseDetail(detailRecords[z][1], spendingLists.income);
            }
            else if (records[z][0].getMonth() === tcMonth) {
                cMonth.expenditure += records[z][2];
                cMonth.income += records[z][3];
                App.Utils.parseDetail(detailRecords[z][0], lastMonthSpendingLists.expenditure);
                App.Utils.parseDetail(detailRecords[z][1], lastMonthSpendingLists.income);
                totalAccDate++;
            }
            else
                break;
        }
        this.stmTtlExpEl.textContent = month.expenditure.toLocaleString("en") + user.settings.currency;
        this.stmTtlIncEl.textContent = month.income.toLocaleString("en") + user.settings.currency;
        this.stmAvgExpTextEl.textContent = (month.expenditure / cd).toLocaleString("en") + user.settings.currency;
        this.stmAvgIncTextEl.textContent = (month.income / cd).toLocaleString("en") + user.settings.currency;
        this.stmTtlBalanceTextEl.textContent = month.income >= month.expenditure ? "Surplus" : "Deficit";
        if (this.stmTtlBalanceTextEl.parentElement)
            this.stmTtlBalanceTextEl.parentElement.style.color = month.income >= month.expenditure ? colorset.surplus : colorset.deficit;
        this.stmTtlBalanceEl.textContent = (Math.abs(month.expenditure - month.income)).toLocaleString("en") + user.settings.currency;
        this.stmAvgBalanceTextEl.textContent = "Daily Average " + (month.income >= month.expenditure ? "Surplus" : "Deficit");
        if (this.stmAvgBalanceTextEl.parentElement)
            this.stmAvgBalanceTextEl.parentElement.style.color = month.income >= month.expenditure ? colorset.surplus : colorset.deficit;
        this.stmAvgBalanceEl.textContent = (Math.abs(month.expenditure - month.income) / cd).toLocaleString("en") + user.settings.currency;
        for (const type in spendingLists) {
            const detailEl = type === "expenditure" ? this.stmExpDetailEl : this.stmIncDetailEl;
            detailEl.innerHTML = "";
            for (const list in spendingLists[type]) {
                const block = document.createElement("div");
                const li1 = document.createElement("li");
                const li2 = document.createElement("li");
                const temp = spendingLists[type];
                li1.textContent = list + ":";
                li2.textContent = temp[list].toLocaleString("en") + user.settings.currency;
                block.appendChild(li1);
                block.appendChild(li2);
                detailEl.appendChild(block);
            }
        }
        graph.render("summarized-pie", Object.entries(spendingLists.expenditure), this.stmExpGraphEl);
        graph.render("summarized-pie", Object.entries(spendingLists.income), this.stmIncGraphEl);
        if (!totalAccDate)
            return;
        SummarizedSecton.comparisonBarExpenditure("expenditure", this.byTimeExpEl.children[0].children[1], month.expenditure, cMonth.expenditure);
        SummarizedSecton.comparisonBarExpenditure("income", this.byTimeIncEl.children[0].children[1], month.income, cMonth.income);
        SummarizedSecton.comparisonBarExpenditure("expenditure", this.byAvgExpEl.children[0].children[1], month.expenditure / cd, cMonth.expenditure / totalAccDate);
        SummarizedSecton.comparisonBarExpenditure("income", this.byAvgIncEl.children[0].children[1], month.income / cd, cMonth.income / totalAccDate);
        while (this.byTimeList.length)
            (_a = this.byTimeList.pop()) === null || _a === void 0 ? void 0 : _a.remove();
        while (this.byAvgList.length)
            (_b = this.byAvgList.pop()) === null || _b === void 0 ? void 0 : _b.remove();
        for (const type in spendingLists) {
            for (const list in spendingLists[type]) {
                this.byTimeList.push(new ByTimeColComparisonBar(type === "expenditure" ? this.byTimeExpEl : this.byTimeIncEl, list, type, lastMonthSpendingLists, spendingLists));
            }
            for (const list in spendingLists[type]) {
                this.byAvgList.push(new ByAvgColComparisonBar(type === "expenditure" ? this.byAvgExpEl : this.byAvgIncEl, list, type, lastMonthSpendingLists, spendingLists, totalAccDate, cd));
            }
            for (const list in lastMonthSpendingLists[type]) {
                const temp = spendingLists[type];
                if (temp[list] === undefined) {
                    let block = document.createElement("div");
                    let aside1 = document.createElement("aside");
                    let aside2 = document.createElement("aside");
                    let aside3 = document.createElement("aside");
                    aside2.style.backgroundColor = aside3.style.color = type === "expenditure" ? colorset.surplus : colorset.deficit;
                    aside3.textContent = "-100%";
                    aside1.textContent = list + ":";
                    block.appendChild(aside1);
                    block.appendChild(aside2);
                    block.appendChild(aside3);
                    if (type === "expenditure") {
                        this.byTimeExpEl.appendChild(block);
                        this.byAvgExpEl.appendChild(block.cloneNode(true));
                    }
                    else {
                        this.byTimeIncEl.appendChild(block);
                        this.byAvgIncEl.appendChild(block.cloneNode(true));
                    }
                }
            }
        }
    }
    static comparisonBarExpenditure(type, barElement, refNum, comNum) {
        var _a, _b, _c, _d;
        const nextSibling = barElement.nextElementSibling;
        if (refNum < comNum) {
            const base = (_a = (comNum - refNum) / comNum * 100) !== null && _a !== void 0 ? _a : 0;
            const over = (_b = refNum / comNum * 100) !== null && _b !== void 0 ? _b : 0;
            const color = type === "expenditure" ? colorset.surplus : colorset.deficit;
            nextSibling.textContent = `-${base.toLocaleString("en")}%`;
            nextSibling.style.color = color;
            barElement.style.backgroundImage = `linear-gradient(to right, #5D6D7E ${over}%, ${color} 0)`;
        }
        else {
            const base = (_c = comNum / refNum * 100) !== null && _c !== void 0 ? _c : 0;
            const over = (_d = (refNum - comNum) / refNum * 100) !== null && _d !== void 0 ? _d : 0;
            const color = type === "expenditure" ? colorset.deficit : colorset.surplus;
            nextSibling.textContent = `+${over.toLocaleString("en")}%`;
            nextSibling.style.color = color;
            barElement.style.backgroundImage = `linear-gradient(to right, #5D6D7E ${base}%, ${color} 0)`;
        }
        if (/NaN|undefined/.test(nextSibling.textContent)) {
            nextSibling.textContent = "N/A";
        }
    }
}
SummarizedSecton.stmTtlExpEl = document.getElementById("stm-total-expenditure");
SummarizedSecton.stmTtlIncEl = document.getElementById("stm-total-income");
SummarizedSecton.stmAvgExpTextEl = document.getElementById("stm-average-expenditure");
SummarizedSecton.stmAvgIncTextEl = document.getElementById("stm-average-income");
SummarizedSecton.stmTtlBalanceTextEl = document.getElementById("stm-total-balance-text");
SummarizedSecton.stmTtlBalanceEl = document.getElementById("stm-total-balance");
SummarizedSecton.stmAvgBalanceTextEl = document.getElementById("stm-average-balance-text");
SummarizedSecton.stmAvgBalanceEl = document.getElementById("stm-average-balance");
SummarizedSecton.byTimeExpEl = document.getElementById("by-time-expenditure");
SummarizedSecton.byTimeIncEl = document.getElementById("by-time-income");
SummarizedSecton.byAvgExpEl = document.getElementById("by-average-expenditure");
SummarizedSecton.byAvgIncEl = document.getElementById("by-average-income");
SummarizedSecton.stmExpGraphEl = document.getElementById("stm-expenditure-graph");
SummarizedSecton.stmIncGraphEl = document.getElementById("stm-income-graph");
SummarizedSecton.stmExpDetailEl = document.getElementById("stm-expenditure-detail");
SummarizedSecton.stmIncDetailEl = document.getElementById("stm-income-detail");
SummarizedSecton.byTimeList = [];
SummarizedSecton.byAvgList = [];
