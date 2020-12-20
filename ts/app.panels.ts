import { App } from "./lib.core.js";
import { db, roots, user, records, detailRecords, balance, colorset, graph } from "./main.js";

type FormSectionType = "singin" | "singup" | "forgotpassword";

abstract class FormSection {

    public readonly el: HTMLElement;

    public onsectionchange: ((type: FormSectionType) => void) | null = null;

    public constructor(id: string) {
        const t = document.getElementById(id);

        if (!t) throw new Error("Cannot find the specific element");

        this.el = t;
    }

    public alertFormError(input: HTMLInputElement): void {
        input.focus();
        input.classList.add("input-error");
    }
}

class SignInSection extends FormSection {

    private static __instance__: SignInSection | null = null;
    public static getInstance(): SignInSection {
        return this.__instance__ ?? (this.__instance__ = new SignInSection());
    }

    public readonly usernameInput = document.getElementById("signin-userid") as HTMLInputElement;
    public readonly passwordInput = document.getElementById("signin-password") as HTMLInputElement;

    public readonly gotoSignUpBtn = document.getElementById("goto-signup-form-button") as HTMLElement;
    public readonly gotoForgotPasswordBtn = document.getElementById("goto-forget-password-form-button") as HTMLElement;

    public readonly confirmBtn = document.getElementById("signin-button") as HTMLElement;

    private constructor() {
        super("signin-form");

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

        this.gotoForgotPasswordBtn.addEventListener("click", () => this.onsectionchange?.("forgotpassword"));
        this.gotoSignUpBtn.addEventListener("click", () => this.onsectionchange?.("singup"));

        this.confirmBtn.addEventListener("click", () => {
            if (this.isRequesting || !this.validate()) return;
        
            this.confirmBtn.textContent = "Processing Request...";
            this.isRequesting = true;
            this.unfocus();
    
            db.doGetRequest("SIGNIN", {
                "userid": this.usernameInput.value,
                "password": this.passwordInput.value
            });
        });
    }

    public get isRequesting(): boolean {
        return this.el.classList.contains("requesting");
    }

    public set isRequesting(value: boolean) {
        value ? this.el.classList.add("requesting") : this.el.classList.remove("requesting");
    }

    public validate(): boolean {
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

    public unfocus(): void {
        this.usernameInput.blur();
        this.passwordInput.blur();
    }
}

class SignUpSection extends FormSection {

    private static __instance__: SignUpSection | null = null;
    public static getInstance(): SignUpSection {
        return this.__instance__ ?? (this.__instance__ = new SignUpSection());
    }

    public readonly fullNameInput = document.getElementById("signup-fullname") as HTMLInputElement;
    public readonly usernameInput = document.getElementById("signup-userid") as HTMLInputElement;
    public readonly passwordInput = document.getElementById("signup-password") as HTMLInputElement;
    public readonly emailInput = document.getElementById("signup-email") as HTMLInputElement;
    public readonly currencyInput = document.getElementById("signup-currency") as HTMLInputElement;

    public readonly gotoSignInBtn = document.getElementById("goto-signin-form-button") as HTMLElement;

    public readonly confirmBtn = document.getElementById("signup-button") as HTMLElement;
    
    private constructor() {
        super("signup-form");

        this.confirmBtn.addEventListener("click", () => {
            if (this.isRequesting || !this.validate()) return;

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

        this.gotoSignInBtn.addEventListener("click", () => this.onsectionchange?.("singin"));
    }

    public get isRequesting(): boolean {
        return this.el.classList.contains("requesting");
    }

    public set isRequesting(value: boolean) {
        value ? this.el.classList.add("requesting") : this.el.classList.remove("requesting");
    }

    public set loggingText(value: string | number) {
        this.confirmBtn.textContent = `${value}`;
    }

    public reset(): void {
        this.usernameInput.value = "";
        this.passwordInput.value = "";
        this.fullNameInput.value = "";
        this.emailInput.value = "";
        this.currencyInput.value = "";
    }

    public validate(): boolean {
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

    public unfocus(): void {
        this.fullNameInput.blur();
        this.usernameInput.blur();
        this.passwordInput.blur();
        this.emailInput.blur();
        this.currencyInput.blur();
    }
}

class ForgotPasswordSection extends FormSection {

    private static __instance__: ForgotPasswordSection | null = null;
    public static getInstance(): ForgotPasswordSection {
        return this.__instance__ ?? (this.__instance__ = new ForgotPasswordSection());
    }

    public readonly gotoSignInBtn = document.getElementById("goto-signin-from-forgotpass") as HTMLElement;
    
    private constructor() {
        super("forgotmypassword-form");

        this.gotoSignInBtn.addEventListener("click", () => this.onsectionchange?.("singin"));
    }
}

export class FormPane {

    public static readonly pane = document.getElementById("form-module") as HTMLElement;
    public static readonly form = document.getElementsByTagName("form")[0] as HTMLFormElement;

    public static readonly signInSection = SignInSection.getInstance();
    public static readonly signUpSection  = SignUpSection.getInstance();
    public static readonly forgotPasswordSection = ForgotPasswordSection.getInstance();

    public static init(): void {
        this.setActiveSection("singin");

        this.signInSection.onsectionchange = (type) => this.setActiveSection(type);
        this.signUpSection.onsectionchange = (type) => this.setActiveSection(type);
        this.forgotPasswordSection.onsectionchange = (type) => this.setActiveSection(type);
    }

    public static setActiveSection(section: FormSectionType): void {
        this.signInSection.el.remove();
        this.signUpSection.el.remove();
        this.forgotPasswordSection.el.remove();

        switch (section) {
            case "singin": this.form.appendChild(this.signInSection.el); break;
            case "singup": this.form.appendChild(this.signUpSection.el); break;
            case "forgotpassword": this.form.appendChild(this.forgotPasswordSection.el); break;
        }
    }

    public static get present(): boolean {
        return document.body.contains(this.pane);
    }

    public static set present(value: boolean) {
        value
        ? document.body.appendChild(this.pane)
        : this.pane.remove();
    }
}

export class MainPane {

    public static readonly pane = document.getElementsByTagName("main")[0] as HTMLElement;
    public static readonly footer = document.getElementsByTagName("footer")[0] as HTMLElement;

    public static init(): void {
        this.pane.removeAttribute("hidden");
        this.present = false;
    }

    public static get present(): boolean {
        return document.body.contains(this.pane);
    }

    public static set present(value: boolean) {
        value
        ? document.body.insertBefore(this.pane, this.footer)
        : this.pane.remove();
    }
}

export class UserRibbonSection {
    
    public static readonly fullNameEl = document.getElementById("fullname") as HTMLElement;
    public static readonly todayDateEl = document.getElementById("today-date") as HTMLElement;

    public static readonly overviewIcon  = document.getElementById("user-overview-icon") as HTMLElement;
    public static readonly historyIcon = document.getElementById("user-history-icon") as HTMLElement;
    public static readonly settingIcon = document.getElementById("user-setting-icon") as HTMLElement;
    public static readonly signOutIcon = document.getElementById("user-sign-out-icon") as HTMLElement;

    public static init(): void {
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

export class GraphSection {

    public static readonly statViewEl = document.getElementById("statistics-view") as HTMLElement;
    public static readonly statModeSelections: HTMLCollectionOf<HTMLElement> = document.getElementById("statistics-view")?.children as HTMLCollectionOf<HTMLElement>;

    public static updateChart(): void {
        records.splice(-1, 1, [
            new Date(...App.Utils.todayDate.split(".") as []),
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
    
        // redraw statistics chart
        this.setActiveModeTo(1);
    }

    public static setActiveModeTo(mode: 1 | 2 | 3): void {
        for (const el of this.statModeSelections) {
            el.classList.remove("viewed");
        }

        this.statModeSelections[mode - 1].classList.add("viewed");
        this.statModeSelections[mode - 1].click();
    }
}

abstract class ColComparisonBar {

    public readonly wrapper: HTMLDivElement = document.createElement("div") as HTMLDivElement;
    public readonly aside1 = document.createElement("aside") as HTMLElement;
    public readonly aside2 = document.createElement("aside") as HTMLElement;
    public readonly aside3 = document.createElement("aside") as HTMLElement;

    public constructor(chennelEl: HTMLElement) {
        this.wrapper.appendChild(this.aside1);
        this.wrapper.appendChild(this.aside2);
        this.wrapper.appendChild(this.aside3);

        chennelEl.appendChild(this.wrapper);
    }

    public remove(): void {
        this.wrapper.remove();
    }
}

class ByTimeColComparisonBar extends ColComparisonBar {

    public constructor(chennelEl: HTMLElement, list: string, type: "expenditure" | "income", lastMonthSpendingLists: anyobj, spendingLists: anyobj) {
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

    public constructor(chennelEl: HTMLElement, list: string, type: "expenditure" | "income", lastMonthSpendingLists: anyobj, spendingLists: anyobj, totalAccDate: number, cd: number) {
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
    
    public static readonly stmTtlExpEl = document.getElementById("stm-total-expenditure") as HTMLElement;
    public static readonly stmTtlIncEl = document.getElementById("stm-total-income") as HTMLElement;
    public static readonly stmAvgExpTextEl = document.getElementById("stm-average-expenditure") as HTMLElement;
    public static readonly stmAvgIncTextEl = document.getElementById("stm-average-income") as HTMLElement;
    public static readonly stmTtlBalanceTextEl = document.getElementById("stm-total-balance-text") as HTMLElement;
    public static readonly stmTtlBalanceEl = document.getElementById("stm-total-balance") as HTMLElement;
    public static readonly stmAvgBalanceTextEl = document.getElementById("stm-average-balance-text") as HTMLElement;
    public static readonly stmAvgBalanceEl = document.getElementById("stm-average-balance") as HTMLElement;

    public static readonly byTimeExpEl = document.getElementById("by-time-expenditure") as HTMLElement;
    public static readonly byTimeIncEl = document.getElementById("by-time-income") as HTMLElement;
    public static readonly byAvgExpEl = document.getElementById("by-average-expenditure") as HTMLElement;
    public static readonly byAvgIncEl = document.getElementById("by-average-income") as HTMLElement;

    public static readonly stmExpGraphEl = document.getElementById("stm-expenditure-graph") as HTMLElement;
    public static readonly stmIncGraphEl = document.getElementById("stm-income-graph") as HTMLElement;

    public static readonly stmExpDetailEl = document.getElementById("stm-expenditure-detail") as HTMLElement;
    public static readonly stmIncDetailEl = document.getElementById("stm-income-detail") as HTMLElement;

    public static readonly byTimeList: ByTimeColComparisonBar[] = [];
    public static readonly byAvgList: ByTimeColComparisonBar[] = [];

    public static updateConclusion(): void {
        const [cy, cm, cd] = App.Utils.todayDate.split(".").map(val => +val);
        const month = { expenditure: 0, income: 0 };
        const spendingLists = { expenditure: {}, income: {} };
    
        const cMonth = { expenditure: 0, income: 0 };
        const lastMonthSpendingLists = { expenditure: {}, income: {} };
        
        const tcMonth = cm - 1 < 0 ? 11 : cm - 1; // month of last year
        let totalAccDate = 0;
    
        for (let z = records.length - 1; z >= 0; z--) {
            // get this month data
            if (records[z][0].getMonth() === cm) {
                month.expenditure += records[z][2];
                month.income += records[z][3];
                App.Utils.parseDetail(detailRecords[z][0], spendingLists.expenditure);
                App.Utils.parseDetail(detailRecords[z][1], spendingLists.income);
            }
    
            // get last month data
            else if (records[z][0].getMonth() === tcMonth) {
                cMonth.expenditure += records[z][2];
                cMonth.income += records[z][3];
                App.Utils.parseDetail(detailRecords[z][0], lastMonthSpendingLists.expenditure);
                App.Utils.parseDetail(detailRecords[z][1], lastMonthSpendingLists.income);
                totalAccDate++;
            }
    
            else break;
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
    
        // create detail list for sdm
        for (const type in spendingLists) {
            const detailEl = type === "expenditure" ? this.stmExpDetailEl : this.stmIncDetailEl;

            detailEl.innerHTML = "";
            for (const list in spendingLists[type as "expenditure" | "income"]) {
                const block = document.createElement("div");
                const li1 = document.createElement("li");
                const li2 = document.createElement("li");

                const temp = spendingLists[type as "expenditure" | "income"] as { [key: string]: number };
        
                li1.textContent = list + ":";
                li2.textContent = temp[list].toLocaleString("en") + user.settings.currency;
                block.appendChild(li1);
                block.appendChild(li2);
    
                detailEl.appendChild(block);
            }
        }
    
        // redraw this month chart
        graph.render("summarized-pie", Object.entries(spendingLists.expenditure), this.stmExpGraphEl);
        graph.render("summarized-pie", Object.entries(spendingLists.income), this.stmIncGraphEl);
    
        /* #### SUMMARIZATION #### */
    
        if (!totalAccDate) return;
    
        ConclusionSection.comparisonBarExpenditure("expenditure", this.byTimeExpEl.children[0].children[1] as HTMLElement, month.expenditure, cMonth.expenditure);
        ConclusionSection.comparisonBarExpenditure("income", this.byTimeIncEl.children[0].children[1] as HTMLElement, month.income, cMonth.income);
        ConclusionSection.comparisonBarExpenditure("expenditure", this.byAvgExpEl.children[0].children[1] as HTMLElement, month.expenditure / cd, cMonth.expenditure / totalAccDate);
        ConclusionSection.comparisonBarExpenditure("income", this.byAvgIncEl.children[0].children[1] as HTMLElement, month.income / cd, cMonth.income / totalAccDate);

        // remove old lists
        while (this.byTimeList.length) this.byTimeList.pop()?.remove();
        while (this.byAvgList.length) this.byAvgList.pop()?.remove();
    
        // create detail list for comparison
        for (const type in spendingLists) {
            // by-time expenditure and income
            for (const list in spendingLists[type as "expenditure" | "income"]) {
                this.byTimeList.push(new ByTimeColComparisonBar(
                    type === "expenditure" ? this.byTimeExpEl : this.byTimeIncEl, 
                    list, 
                    type as "expenditure" | "income", 
                    lastMonthSpendingLists, 
                    spendingLists));
                
            }
    
            // by-average expenditure and income
            for (const list in spendingLists[type as "expenditure" | "income"]) {
                this.byAvgList.push(new ByAvgColComparisonBar(
                    type === "expenditure" ? this.byAvgExpEl : this.byAvgIncEl, 
                    list, 
                    type as "expenditure" | "income", 
                    lastMonthSpendingLists, 
                    spendingLists,
                    totalAccDate,
                    cd));
            }
    
            for (const list in lastMonthSpendingLists[type as "expenditure" | "income"]) {
                const temp = spendingLists[type as "expenditure" | "income"] as any;

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

    public static comparisonBarExpenditure(type: string, barElement: HTMLElement, refNum: number, comNum: number) {
        const nextSibling = barElement.nextElementSibling as HTMLElement;

        if (refNum < comNum) {
            const base = (comNum - refNum) / comNum * 100 ?? 0;
            const over = refNum / comNum * 100 ?? 0;
            const color = type === "expenditure" ? colorset.surplus : colorset.deficit;
            nextSibling.textContent = `-${base.toLocaleString("en")}%`;
            nextSibling.style.color = color;
            barElement.style.backgroundImage = `linear-gradient(to right, #5D6D7E ${over}%, ${color} 0)`;
        }
        else {
            const base = comNum / refNum * 100 ?? 0;
            const over = (refNum - comNum) / refNum * 100 ?? 0;
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