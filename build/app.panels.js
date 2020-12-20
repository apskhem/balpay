var _a;
import { App } from "./lib.core.js";
import { db, roots, user, records, detailRecords, balance, colorset, graph } from "./main.js";
class FormSection {
    constructor(id) {
        this.onsectionchange = null;
        const t = document.getElementById(id);
        if (!t)
            throw new Error("Cannot find the specific element");
        this.el = t;
    }
    alertFormError(input) {
        input.focus();
        input.classList.add("input-error");
    }
}
class SignInSection extends FormSection {
    constructor() {
        super("signin-form");
        this.usernameInput = document.getElementById("signin-userid");
        this.passwordInput = document.getElementById("signin-password");
        this.gotoSignUpBtn = document.getElementById("goto-signup-form-button");
        this.gotoForgotPasswordBtn = document.getElementById("goto-forget-password-form-button");
        this.confirmBtn = document.getElementById("signin-button");
        this.usernameInput.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                e.preventDefault();
                this.passwordInput.focus();
            }
            this.usernameInput.classList.remove("input-error");
        });
        this.passwordInput.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                e.preventDefault();
                this.confirmBtn.click();
            }
            this.passwordInput.classList.remove("input-error");
        });
        this.gotoForgotPasswordBtn.addEventListener("click", () => { var _a; return (_a = this.onsectionchange) === null || _a === void 0 ? void 0 : _a.call(this, "forgotpassword"); });
        this.gotoSignUpBtn.addEventListener("click", () => { var _a; return (_a = this.onsectionchange) === null || _a === void 0 ? void 0 : _a.call(this, "singup"); });
        this.confirmBtn.addEventListener("click", () => {
            if (this.isRequesting || !this.validate())
                return;
            this.confirmBtn.textContent = "Processing Request...";
            this.isRequesting = true;
            this.unfocus();
            db.doGetRequest("SIGNIN", {
                "userid": this.usernameInput.value,
                "password": this.passwordInput.value
            });
        });
    }
    static getInstance() {
        var _a;
        return (_a = this.__instance__) !== null && _a !== void 0 ? _a : (this.__instance__ = new SignInSection());
    }
    get isRequesting() {
        return this.el.classList.contains("requesting");
    }
    set isRequesting(value) {
        value ? this.el.classList.add("requesting") : this.el.classList.remove("requesting");
    }
    validate() {
        if (!this.usernameInput.value) {
            this.alertFormError(this.usernameInput);
            return false;
        }
        else if (!this.passwordInput.value) {
            this.alertFormError(this.passwordInput);
            return false;
        }
        return true;
    }
    unfocus() {
        this.usernameInput.blur();
        this.passwordInput.blur();
    }
}
SignInSection.__instance__ = null;
class SignUpSection extends FormSection {
    constructor() {
        super("signup-form");
        this.fullNameInput = document.getElementById("signup-fullname");
        this.usernameInput = document.getElementById("signup-userid");
        this.passwordInput = document.getElementById("signup-password");
        this.emailInput = document.getElementById("signup-email");
        this.currencyInput = document.getElementById("signup-currency");
        this.gotoSignInBtn = document.getElementById("goto-signin-form-button");
        this.confirmBtn = document.getElementById("signup-button");
        this.confirmBtn.addEventListener("click", () => {
            if (this.isRequesting || !this.validate())
                return;
            this.confirmBtn.textContent = "Processing Request...";
            this.isRequesting = true;
            this.unfocus();
            db.doGetRequest("SIGNUP", {
                "userid": this.usernameInput.value,
                "password": this.passwordInput.value,
                "fullname": this.fullNameInput.value,
                "email": this.emailInput.value,
                "setting": this.currencyInput.value || "THB"
            });
        });
        this.gotoSignInBtn.addEventListener("click", () => { var _a; return (_a = this.onsectionchange) === null || _a === void 0 ? void 0 : _a.call(this, "singin"); });
    }
    static getInstance() {
        var _a;
        return (_a = this.__instance__) !== null && _a !== void 0 ? _a : (this.__instance__ = new SignUpSection());
    }
    get isRequesting() {
        return this.el.classList.contains("requesting");
    }
    set isRequesting(value) {
        value ? this.el.classList.add("requesting") : this.el.classList.remove("requesting");
    }
    set loggingText(value) {
        this.confirmBtn.textContent = `${value}`;
    }
    reset() {
        this.usernameInput.value = "";
        this.passwordInput.value = "";
        this.fullNameInput.value = "";
        this.emailInput.value = "";
        this.currencyInput.value = "";
    }
    validate() {
        if (!this.fullNameInput.value) {
            this.alertFormError(this.fullNameInput);
            return false;
        }
        else if (!this.usernameInput.value) {
            this.alertFormError(this.usernameInput);
            return false;
        }
        else if (!this.passwordInput.value) {
            this.alertFormError(this.passwordInput);
            return false;
        }
        else if (!this.emailInput.value) {
            this.alertFormError(this.emailInput);
            return false;
        }
        return true;
    }
    unfocus() {
        this.fullNameInput.blur();
        this.usernameInput.blur();
        this.passwordInput.blur();
        this.emailInput.blur();
        this.currencyInput.blur();
    }
}
SignUpSection.__instance__ = null;
class ForgotPasswordSection extends FormSection {
    constructor() {
        super("forgotmypassword-form");
        this.gotoSignInBtn = document.getElementById("goto-signin-from-forgotpass");
        this.gotoSignInBtn.addEventListener("click", () => { var _a; return (_a = this.onsectionchange) === null || _a === void 0 ? void 0 : _a.call(this, "singin"); });
    }
    static getInstance() {
        var _a;
        return (_a = this.__instance__) !== null && _a !== void 0 ? _a : (this.__instance__ = new ForgotPasswordSection());
    }
}
ForgotPasswordSection.__instance__ = null;
export class FormPane {
    static init() {
        this.setActiveSection("singin");
        this.signInSection.onsectionchange = (type) => this.setActiveSection(type);
        this.signUpSection.onsectionchange = (type) => this.setActiveSection(type);
        this.forgotPasswordSection.onsectionchange = (type) => this.setActiveSection(type);
    }
    static setActiveSection(section) {
        this.signInSection.el.remove();
        this.signUpSection.el.remove();
        this.forgotPasswordSection.el.remove();
        switch (section) {
            case "singin":
                this.form.appendChild(this.signInSection.el);
                break;
            case "singup":
                this.form.appendChild(this.signUpSection.el);
                break;
            case "forgotpassword":
                this.form.appendChild(this.forgotPasswordSection.el);
                break;
        }
    }
    static get present() {
        return document.body.contains(this.pane);
    }
    static set present(value) {
        value
            ? document.body.appendChild(this.pane)
            : this.pane.remove();
    }
}
FormPane.pane = document.getElementById("form-module");
FormPane.form = document.getElementsByTagName("form")[0];
FormPane.signInSection = SignInSection.getInstance();
FormPane.signUpSection = SignUpSection.getInstance();
FormPane.forgotPasswordSection = ForgotPasswordSection.getInstance();
export class MainPane {
    static init() {
        this.pane.removeAttribute("hidden");
        this.present = false;
    }
    static get present() {
        return document.body.contains(this.pane);
    }
    static set present(value) {
        value
            ? document.body.insertBefore(this.pane, this.footer)
            : this.pane.remove();
    }
}
MainPane.pane = document.getElementsByTagName("main")[0];
MainPane.footer = document.getElementsByTagName("footer")[0];
export class UserRibbonSection {
    static init() {
        this.overviewIcon.addEventListener("click", () => {
        });
        this.historyIcon.addEventListener("click", () => {
        });
        this.settingIcon.addEventListener("click", () => {
        });
        this.signOutIcon.addEventListener("click", () => {
            localStorage.clear();
            MainPane.present = false;
            FormPane.present = true;
            document.head.title = "BalPay - Sign In";
            document.body.appendChild(document.getElementsByTagName("footer")[0]);
        });
    }
}
UserRibbonSection.fullNameEl = document.getElementById("fullname");
UserRibbonSection.todayDateEl = document.getElementById("today-date");
UserRibbonSection.overviewIcon = document.getElementById("user-overview-icon");
UserRibbonSection.historyIcon = document.getElementById("user-history-icon");
UserRibbonSection.settingIcon = document.getElementById("user-setting-icon");
UserRibbonSection.signOutIcon = document.getElementById("user-sign-out-icon");
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
export class ConclusionSection {
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
        ConclusionSection.comparisonBarExpenditure("expenditure", this.byTimeExpEl.children[0].children[1], month.expenditure, cMonth.expenditure);
        ConclusionSection.comparisonBarExpenditure("income", this.byTimeIncEl.children[0].children[1], month.income, cMonth.income);
        ConclusionSection.comparisonBarExpenditure("expenditure", this.byAvgExpEl.children[0].children[1], month.expenditure / cd, cMonth.expenditure / totalAccDate);
        ConclusionSection.comparisonBarExpenditure("income", this.byAvgIncEl.children[0].children[1], month.income / cd, cMonth.income / totalAccDate);
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
ConclusionSection.stmTtlExpEl = document.getElementById("stm-total-expenditure");
ConclusionSection.stmTtlIncEl = document.getElementById("stm-total-income");
ConclusionSection.stmAvgExpTextEl = document.getElementById("stm-average-expenditure");
ConclusionSection.stmAvgIncTextEl = document.getElementById("stm-average-income");
ConclusionSection.stmTtlBalanceTextEl = document.getElementById("stm-total-balance-text");
ConclusionSection.stmTtlBalanceEl = document.getElementById("stm-total-balance");
ConclusionSection.stmAvgBalanceTextEl = document.getElementById("stm-average-balance-text");
ConclusionSection.stmAvgBalanceEl = document.getElementById("stm-average-balance");
ConclusionSection.byTimeExpEl = document.getElementById("by-time-expenditure");
ConclusionSection.byTimeIncEl = document.getElementById("by-time-income");
ConclusionSection.byAvgExpEl = document.getElementById("by-average-expenditure");
ConclusionSection.byAvgIncEl = document.getElementById("by-average-income");
ConclusionSection.stmExpGraphEl = document.getElementById("stm-expenditure-graph");
ConclusionSection.stmIncGraphEl = document.getElementById("stm-income-graph");
ConclusionSection.stmExpDetailEl = document.getElementById("stm-expenditure-detail");
ConclusionSection.stmIncDetailEl = document.getElementById("stm-income-detail");
ConclusionSection.byTimeList = [];
ConclusionSection.byAvgList = [];
