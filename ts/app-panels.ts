import { App } from "./applib.js";
import { db, roots, user, records, detailRecords, balance, colorset, graph } from "./__main__.js"

type anyobj = { [d: string]: any };;

export class Form {

    public static readonly pane: HTMLElement = document.getElementById("form-module") as HTMLElement;
    public static readonly form: HTMLFormElement = document.getElementsByTagName("form")[0] as HTMLFormElement;

    public static readonly usernameInput: HTMLInputElement = document.getElementById("signin-userid") as HTMLInputElement;
    public static readonly passwordInput: HTMLInputElement = document.getElementById("signin-password") as HTMLInputElement;

    public static readonly signUpFullNameInput: HTMLInputElement = document.getElementById("signup-fullname") as HTMLInputElement;
    public static readonly signUpUsernameInput: HTMLInputElement = document.getElementById("signup-userid") as HTMLInputElement;
    public static readonly signUpPasswordInput: HTMLInputElement = document.getElementById("signup-password") as HTMLInputElement;
    public static readonly signUpEmailInput: HTMLInputElement = document.getElementById("signup-email") as HTMLInputElement;
    public static readonly signUpCurrencyInput: HTMLInputElement = document.getElementById("signup-currency") as HTMLInputElement;

    public static readonly signInSection: HTMLElement = document.getElementById("signin-form") as HTMLElement;
    public static readonly signUpSection: HTMLElement = document.getElementById("signup-form") as HTMLElement;
    public static readonly forgotPasswordSection: HTMLElement = document.getElementById("forgotmypassword-form") as HTMLElement;

    public static readonly gotoSignUpBtn: HTMLElement = document.getElementById("goto-signup-form-button") as HTMLElement;
    public static readonly gotoSignInBtn: HTMLElement = document.getElementById("goto-signin-form-button") as HTMLElement;
    public static readonly gotoForgotPasswordBtn: HTMLElement = document.getElementById("goto-forget-password-form-button") as HTMLElement;
    public static readonly signInProceedBtn: HTMLElement = document.getElementById("signin-button") as HTMLElement;
    public static readonly signUpProceedBtn: HTMLElement = document.getElementById("signup-button") as HTMLElement;

    public static AlertInputError(input: HTMLInputElement): void {
        input.focus();
        input.classList.add("input-error");
    }

    public static Init(): void {
        this.SetActiveSection("singin");

        this.usernameInput.addEventListener("keydown", (e: KeyboardEvent) => {
            if (e.key === "Enter") {
                !this.usernameInput.value ? this.AlertInputError(this.usernameInput) : this.passwordInput.focus();
            }
            
            this.usernameInput.classList.remove("input-error");
        });
        
        this.passwordInput.addEventListener("keydown", (e: KeyboardEvent) => {
            if (e.key === "Enter") {
                !this.passwordInput.value ? this.AlertInputError(this.passwordInput) : this.signInProceedBtn.click();
            }
            
            this.passwordInput.classList.remove("input-error");
        });
        
        this.gotoForgotPasswordBtn.addEventListener("click", () => this.SetActiveSection("forgotpassword"));
        this.gotoSignUpBtn.addEventListener("click", () => this.SetActiveSection("singup"));
        this.gotoSignInBtn.addEventListener("click", () => this.SetActiveSection('singin'));
        
        this.signInProceedBtn.addEventListener("click", () => {
            // is requesting
            if (this.usernameInput.disabled || this.passwordInput.disabled) return;
        
            if (!this.usernameInput.value) {
                this.AlertInputError(this.usernameInput);
            }
            else if (!this.passwordInput.value) {
                this.AlertInputError(this.passwordInput);
            }
            else {
                this.signInProceedBtn.textContent = "Processing Request...";
                
                this.activeInputs = false;
        
                db.Request("SIGNIN", {
                    "userid": this.usernameInput.value,
                    "password": this.passwordInput.value
                });
            }
        });

        this.signUpProceedBtn.addEventListener("click", () => {
            if (!this.signUpFullNameInput.value) this.AlertInputError(this.signUpFullNameInput);
            else if (!this.signUpUsernameInput.value) this.AlertInputError(this.signUpUsernameInput);
            else if (!this.signUpPasswordInput.value) this.AlertInputError(this.signUpPasswordInput);
            else if (!this.signUpEmailInput.value) this.AlertInputError(this.signUpEmailInput);
            else {
                this.signUpProceedBtn.textContent = "Processing Request...";

                this.activeInputs = false;

                db.Request("SIGNUP", {
                    "userid": this.signUpUsernameInput.value,
                    "password": this.signUpPasswordInput.value,
                    "fullname": this.signUpFullNameInput.value,
                    "email": this.signUpEmailInput.value,
                    "setting": this.signUpCurrencyInput.value || "THB"
                });
            }
        });
    }

    public static SetActiveSection(section: "singin" | "singup" | "forgotpassword"): void {
        this.signInSection.remove();
        this.signUpSection.remove();
        this.forgotPasswordSection.remove();

        switch (section) {
            case "singin": this.form.appendChild(this.signInSection); break;
            case "singup": this.form.appendChild(this.signUpSection); break;
            case "forgotpassword": this.form.appendChild(this.forgotPasswordSection); break;
        }
    }

    public static get activeInputs(): boolean {
        return this.usernameInput.disabled;
    }

    public static set activeInputs(value: boolean) {
        this.usernameInput.disabled = true;
        this.passwordInput.disabled = true;

        this.signUpUsernameInput.disabled = true;
        this.signUpPasswordInput.disabled = true;
        this.signUpFullNameInput.disabled = true;
        this.signUpEmailInput.disabled = true;
        this.signUpCurrencyInput.disabled = true;
    }

    public static get active(): boolean {
        return document.body.contains(this.pane);
    }

    public static set active(value: boolean) {
        value
        ? document.body.appendChild(this.pane)
        : this.pane.remove();
    }
}

export class Main {

    public static readonly pane: HTMLElement = document.getElementsByTagName("main")[0] as HTMLElement;
    public static readonly footer: HTMLElement = document.getElementsByTagName("footer")[0] as HTMLElement;

    public static Init(): void {
        this.pane.removeAttribute("hidden");
        this.active = false;
    }

    public static get active(): boolean {
        return document.body.contains(this.pane);
    }

    public static set active(value: boolean) {
        value
        ? document.body.insertBefore(this.pane, this.footer)
        : this.pane.remove();
    }
}

export class UserPanel {
    
    public static readonly fullNameEl: HTMLElement = document.getElementById("fullname") as HTMLElement;
    public static readonly todayDateEl: HTMLElement = document.getElementById("today-date") as HTMLElement;

}

export class GraphSection {

    public static readonly statViewEl: HTMLElement = document.getElementById("statistics-view") as HTMLElement;
    public static readonly statModeSelections: HTMLCollectionOf<HTMLElement> = document.getElementById("statistics-view")?.children as HTMLCollectionOf<HTMLElement>;

    public static UpdateChart() {
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
        this.SetActiveMode(1);
    }

    public static SetActiveMode(mode: 1 | 2 | 3): void {
        for (const el of this.statModeSelections) {
            el.classList.remove("viewed");
        }

        this.statModeSelections[mode - 1].classList.add("viewed");
        this.statModeSelections[mode - 1].click();
    }
}

abstract class ColComparisonBar {

    public readonly wrapper: HTMLDivElement = document.createElement("div") as HTMLDivElement;
    public readonly aside1: HTMLElement = document.createElement("aside") as HTMLElement;
    public readonly aside2: HTMLElement = document.createElement("aside") as HTMLElement;
    public readonly aside3: HTMLElement = document.createElement("aside") as HTMLElement;

    public constructor(chennelEl: HTMLElement) {
        this.wrapper.appendChild(this.aside1);
        this.wrapper.appendChild(this.aside2);
        this.wrapper.appendChild(this.aside3);

        chennelEl.appendChild(this.wrapper);
    }

    public Remove(): void {
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
                this.aside3.textContent = `-${App.Utils.FormatNumber((1 - current / last) * 100)}%`;
                this.aside2.style.backgroundImage = `linear-gradient(to right, #5D6D7E ${current / last * 100}%, ${color} 0)`;
            }
            else {
                color = type === "expenditure" ? colorset.deficit : colorset.surplus;
                this.aside3.textContent = `+${App.Utils.FormatNumber((current / last - 1) * 100)}%`;
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
                this.aside3.textContent = `-${App.Utils.FormatNumber((1 - current / last) * 100)}%`;
                this.aside2.style.backgroundImage = `linear-gradient(to right, #5D6D7E ${current / last * 100}%, ${color} 0)`;
            }
            else {
                color = type === "expenditure" ? colorset.deficit : colorset.surplus;
                this.aside3.textContent = `+${App.Utils.FormatNumber((current / last - 1) * 100)}%`;
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
    
    public static readonly stmTtlExpEl: HTMLElement = document.getElementById("stm-total-expenditure") as HTMLElement;
    public static readonly stmTtlIncEl: HTMLElement = document.getElementById("stm-total-income") as HTMLElement;
    public static readonly stmAvgExpTextEl: HTMLElement = document.getElementById("stm-average-expenditure") as HTMLElement;
    public static readonly stmAvgIncTextEl: HTMLElement = document.getElementById("stm-average-income") as HTMLElement;
    public static readonly stmTtlBalanceTextEl: HTMLElement = document.getElementById("stm-total-balance-text") as HTMLElement;
    public static readonly stmTtlBalanceEl: HTMLElement = document.getElementById("stm-total-balance") as HTMLElement;
    public static readonly stmAvgBalanceTextEl: HTMLElement = document.getElementById("stm-average-balance-text") as HTMLElement;
    public static readonly stmAvgBalanceEl: HTMLElement = document.getElementById("stm-average-balance") as HTMLElement;

    public static readonly byTimeExpEl: HTMLElement = document.getElementById("by-time-expenditure") as HTMLElement;
    public static readonly byTimeIncEl: HTMLElement = document.getElementById("by-time-income") as HTMLElement;
    public static readonly byAvgExpEl: HTMLElement = document.getElementById("by-average-expenditure") as HTMLElement;
    public static readonly byAvgIncEl: HTMLElement = document.getElementById("by-average-income") as HTMLElement;

    public static readonly stmExpGraphEl: HTMLElement = document.getElementById("stm-expenditure-graph") as HTMLElement;
    public static readonly stmIncGraphEl: HTMLElement = document.getElementById("stm-income-graph") as HTMLElement;

    public static readonly stmExpDetailEl: HTMLElement = document.getElementById("stm-expenditure-detail") as HTMLElement;
    public static readonly stmIncDetailEl: HTMLElement = document.getElementById("stm-income-detail") as HTMLElement;

    public static readonly byTimeList: ByTimeColComparisonBar[] = [];
    public static readonly byAvgList: ByTimeColComparisonBar[] = [];

    public static UpdateSummarization(): void {
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
                App.Utils.ParseDetail(detailRecords[z][0], spendingLists.expenditure);
                App.Utils.ParseDetail(detailRecords[z][1], spendingLists.income);
            }
    
            // get last month data
            else if (records[z][0].getMonth() === tcMonth) {
                cMonth.expenditure += records[z][2];
                cMonth.income += records[z][3];
                App.Utils.ParseDetail(detailRecords[z][0], lastMonthSpendingLists.expenditure);
                App.Utils.ParseDetail(detailRecords[z][1], lastMonthSpendingLists.income);
                totalAccDate++;
            }
    
            else break;
        }
    
        this.stmTtlExpEl.textContent = App.Utils.FormatNumber(month.expenditure) + user.settings.currency;
        this.stmTtlIncEl.textContent = App.Utils.FormatNumber(month.income) + user.settings.currency;
        this.stmAvgExpTextEl.textContent = App.Utils.FormatNumber(month.expenditure / cd) + user.settings.currency;
        this.stmAvgIncTextEl.textContent = App.Utils.FormatNumber(month.income / cd) + user.settings.currency;
    
        this.stmTtlBalanceTextEl.textContent = month.income >= month.expenditure ? "Surplus" : "Deficit";

        if (this.stmTtlBalanceTextEl.parentElement)
            this.stmTtlBalanceTextEl.parentElement.style.color = month.income >= month.expenditure ? colorset.surplus : colorset.deficit;
        this.stmTtlBalanceEl.textContent = App.Utils.FormatNumber(Math.abs(month.expenditure - month.income)) + user.settings.currency;
        this.stmAvgBalanceTextEl.textContent = "Daily Average " + (month.income >= month.expenditure ? "Surplus" : "Deficit");

        if (this.stmAvgBalanceTextEl.parentElement)
            this.stmAvgBalanceTextEl.parentElement.style.color = month.income >= month.expenditure ? colorset.surplus : colorset.deficit;
        this.stmAvgBalanceEl.textContent = App.Utils.FormatNumber(Math.abs(month.expenditure - month.income)/ cd) + user.settings.currency;
    
        // create detail list for sdm
        for (const type in spendingLists) {
            const detailEl = type === "expenditure" ? this.stmExpDetailEl : this.stmIncDetailEl;

            detailEl.innerHTML = "";
            for (const list in spendingLists[type as "expenditure" | "income"]) {
                const block = document.createElement("div");
                const li1 = document.createElement("li");
                const li2 = document.createElement("li");

                const temp = spendingLists[type as "expenditure" | "income"] as any;
        
                li1.textContent = list + ":";
                li2.textContent = App.Utils.FormatNumber(temp[list]) + user.settings.currency;
                block.appendChild(li1);
                block.appendChild(li2);
    
                detailEl.appendChild(block);
            }
        }
    
        // redraw this month chart
        graph.Render("summarized-pie", Object.entries(spendingLists.expenditure), this.stmExpGraphEl);
        graph.Render("summarized-pie", Object.entries(spendingLists.income), this.stmIncGraphEl);
    
        /* #### SUMMARIZATION #### */
    
        if (!totalAccDate) return;
    
        SummarizedSecton.ComparisonBarExpenditure("expenditure", this.byTimeExpEl.children[0].children[1] as HTMLElement, month.expenditure, cMonth.expenditure);
        SummarizedSecton.ComparisonBarExpenditure("income", this.byTimeIncEl.children[0].children[1] as HTMLElement, month.income, cMonth.income);
        SummarizedSecton.ComparisonBarExpenditure("expenditure", this.byAvgExpEl.children[0].children[1] as HTMLElement, month.expenditure / cd, cMonth.expenditure / totalAccDate);
        SummarizedSecton.ComparisonBarExpenditure("income", this.byAvgIncEl.children[0].children[1] as HTMLElement, month.income / cd, cMonth.income / totalAccDate);

        // remove old lists
        while (this.byTimeList.length) this.byTimeList.pop()?.Remove();
        while (this.byAvgList.length) this.byAvgList.pop()?.Remove();
    
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

    public static ComparisonBarExpenditure(type: string, barElement: HTMLElement, refNum: number, comNum: number) {
        const nextSibling = barElement.nextElementSibling as HTMLElement;

        if (refNum < comNum) {
            const base = (comNum - refNum) / comNum * 100 ?? 0;
            const over = refNum / comNum * 100 ?? 0;
            const color = type === "expenditure" ? colorset.surplus : colorset.deficit;
            nextSibling.textContent = `-${App.Utils.FormatNumber(base)}%`;
            nextSibling.style.color = color;
            barElement.style.backgroundImage = `linear-gradient(to right, #5D6D7E ${over}%, ${color} 0)`;
        }
        else {
            const base = comNum / refNum * 100 ?? 0;
            const over = (refNum - comNum) / refNum * 100 ?? 0;
            const color = type === "expenditure" ? colorset.deficit : colorset.surplus;
            nextSibling.textContent = `+${App.Utils.FormatNumber(over)}%`;
            nextSibling.style.color = color;
            barElement.style.backgroundImage = `linear-gradient(to right, #5D6D7E ${base}%, ${color} 0)`;
        }

        if (/NaN|undefined/.test(nextSibling.textContent)) {
            nextSibling.textContent = "N/A";
        }
    }
}