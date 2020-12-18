import { GraphSection, SummarizedSecton } from "./app.panels.js";
import { App } from "./lib.core.js";
import { db, roots, user, balance } from "./main.js";

export class RootList {

    public static readonly mainFiscalPanel = document.getElementById("main-fiscal-panel") as HTMLElement;
    public static readonly balanceEl = document.getElementById("bal-root") as HTMLElement;

    public readonly wrapper = document.createElement("div");
    public readonly nav = document.createElement("nav");
    public readonly asideHeader = document.createElement("li");
    public readonly asideTotal = document.createElement("li");
    public readonly listContainer = document.createElement("div");
    public readonly lists: ListObject[] = [];

    public readonly addingList = new AddingList(this);

    public constructor(type: string) {
        this.header = type;
        this.wrapper.id = type + "-root";
        this.wrapper.className = "root";
        this.nav.className = "collapsible-object";
        this.asideTotal.className = "total";
        this.asideTotal.textContent = "0";
        this.listContainer.className = "subroot";

        this.nav.appendChild(this.asideHeader);
        this.nav.appendChild(this.asideTotal);
        this.wrapper.appendChild(this.nav);
        this.wrapper.appendChild(this.listContainer);

        RootList.mainFiscalPanel.insertBefore(this.wrapper, RootList.balanceEl);
    }

    public get header() {
        return this.asideHeader.textContent?.slice(0, -1).toLowerCase() ?? "";
    }

    public set header(type) {
        switch (type) {
            case "exp": this.asideHeader.textContent = "Expense:"; break;
            case "inc": this.asideHeader.textContent = "Income:"; break;
            case "len": this.asideHeader.textContent = "Lending:"; break;
            case "deb": this.asideHeader.textContent = "Debt:"; break;
        }
    }

    public get total(): number {
        return App.Utils.deformatNumber(this.asideTotal.textContent ?? "");
    }

    public set total(value: number) {
        this.asideTotal.textContent = (value.toLocaleString("en") || 0) + user.settings.currency;
    }

    public get detail(): string {
        let detail = "";

        const len = this.lists.length;
        for (let i = 0; i < len; i++) {
            detail += this.lists[i].title + "=" + this.lists[i].value;
            if (i < len - 1) detail += ";";
        }
        return detail;
    }

    public set detail(value: string) {
        if (value) {
            for (const list of value.split(";")) {
                const title = list.split("=")[0];
                const amount = +list.split("=")[1];
                this.lists.push(new ListObject(this, title, amount));
            }
        }

        this.updateSum();
    }

    public updateSum(): void {
        let total = 0;
        for (const list of this.lists) total += list.value;

        this.total = total;
    }

    public static UpdateBalance(): void {
        balance.result = balance.final - roots["exp"].total + roots["inc"].total;
        this.balanceEl.children[1].textContent = balance.result.toLocaleString("en") + user.settings.currency;
    }
}

class AddingList {

    public readonly el = document.createElement("div");
    public readonly titleInput = document.createElement("input");
    public readonly valueInput = document.createElement("input");

    public readonly thumbContainerEl = document.createElement("div");
    public readonly thumbDotEl = document.createElement("div");
    public readonly thumbIcon = document.createElement("i");
    public readonly thumbLineEl = document.createElement("div");

    public readonly ref: RootList;

    public constructor(ref: RootList) {
        this.ref = ref;

        this.titleInput.type = "text";
        this.titleInput.placeholder = "Title";
        this.valueInput.type = "number";
        this.valueInput.placeholder = "Value";
        
        this.el.className = "create-list-grid";
        this.thumbContainerEl.className = "thumb-block";
        this.thumbIcon.className = "fas fa-plus thumb-icon";
        this.thumbDotEl.className = "thumb-dot";
        this.thumbLineEl.className = "thumb-line";

        this.thumbContainerEl.appendChild(this.thumbLineEl);
        this.thumbContainerEl.appendChild(this.thumbDotEl);
        this.thumbContainerEl.appendChild(this.thumbIcon);
        this.el.appendChild(this.thumbContainerEl);
        this.el.appendChild(this.titleInput);
        this.el.appendChild(this.valueInput);

        this.ref.listContainer.appendChild(this.el);

        this.titleInput.addEventListener("keydown", (e: KeyboardEvent) => {
            if (e.key === "Enter") {
                e.preventDefault()
                this.valueInput.focus();
            }
        });

        this.valueInput.addEventListener("keydown", (e: KeyboardEvent) => {
            if (e.key === "Enter") {
                e.preventDefault()
                this.thumbIcon.click();
            }
        });

        this.thumbIcon.addEventListener("click", () => {
            if (!this.titleInput.value || !this.valueInput.value || !parseFloat(this.valueInput.value)) return;
        
            // check for duplicated title
            let foundDuplicated = false;
            for (const list of this.ref.lists) {
                if (this.titleInput.value === list.title) {
                    const newVal = list.value + parseFloat(this.valueInput.value);
                    if (newVal > 0) {
                        list.value = newVal;
                    }
                    else if (!newVal) {
                        list.delete();
                    }
                    else { // less than 0
    
                    }
    
                    foundDuplicated = true;
                    break;
                }
            }
    
            if (parseFloat(this.valueInput.value) < 0 && !foundDuplicated) return;
            
            if (!foundDuplicated) {
                const newList = new ListObject(this.ref, this.titleInput.value, +this.valueInput.value);
                this.ref.lists.push(newList);
    
                this.ref.listContainer.style.maxHeight = this.ref.listContainer.scrollHeight + "px";
            }
    
            // clear input
            this.titleInput.value = "";
            this.valueInput.value = "";
            this.titleInput.blur();
            this.valueInput.blur();
            
            this.ref.updateSum();
            RootList.UpdateBalance();
            GraphSection.updateChart();
            SummarizedSecton.updateConclusion();
            db.doGetRequest("UPDATE");
        });
    }
}

class ListObject {

    public readonly container = document.createElement("div") as HTMLElement;
    public readonly input = document.createElement("input") as HTMLInputElement;
    public readonly lb = document.createElement("li") as HTMLLIElement;
    public readonly rb = document.createElement("li") as HTMLLIElement;
    public readonly currencySpan: HTMLSpanElement = document.createElement("span") as HTMLSpanElement;

    public readonly thumbContainerEl = document.createElement("div");
    public readonly thumbDotEl = document.createElement("div");
    public readonly thumbIcon = document.createElement("i");
    public readonly thumbLineEl = document.createElement("div");
    
    public backupValue: string = "0";
    
    public readonly index: number;
    public readonly ref: RootList;

    public constructor(ref: RootList, title: string, amount: number) {
        this.ref = ref;
        this.index = this.ref.lists.length;

        this.thumbContainerEl.className = "thumb-block";
        this.thumbIcon.className = "fas fa-times thumb-icon";
        this.thumbDotEl.className = "thumb-dot";
        this.thumbLineEl.className = "thumb-line";

        this.input.value = amount.toLocaleString("en");
        this.input.min = "0";
        this.currencySpan.textContent = user.settings.currency;
        this.lb.className = "cost";
        this.title = title;

        this.thumbIcon.addEventListener("click", () => {
            this.delete();
    
            // Finalize 
            this.ref.updateSum();
            RootList.UpdateBalance();
            GraphSection.updateChart();
            SummarizedSecton.updateConclusion();
            db.doGetRequest("UPDATE");
        });

        this.input.addEventListener("focus", () => {
            this.input.value = App.Utils.deformatNumber(this.input.value) + "";
            this.input.type = "number";
            this.backupValue = this.input.value;
            this.input.select();
        });

        this.input.addEventListener("blur", () => {
            switch (true) {
                case this.input.value === this.backupValue: {
                    this.input.type = "text";
                    this.input.value = (+this.input.value).toLocaleString("en");
                } return;
                case this.input.value === "0": {
                    this.thumbIcon.click();
                } return;
                case this.input.valueAsNumber < 0 || !this.input.value: {
                    this.input.value = this.backupValue;
                } return;
            }
    
            this.input.type = "text";
            this.input.value = (+this.input.value).toLocaleString("en");
            this.ref.updateSum();
            RootList.UpdateBalance();
            GraphSection.updateChart();
            SummarizedSecton.updateConclusion();
            db.doGetRequest("UPDATE");
        });

        this.input.addEventListener("keyup", (e: KeyboardEvent) => {
            if (e.key === "Enter") {
                this.input.blur();
            }
        });

        this.rb.addEventListener("click", () => {
            this.ref.addingList.titleInput.value = this.title;
            this.ref.addingList.valueInput.focus();
        });

        this.thumbContainerEl.appendChild(this.thumbLineEl);
        this.thumbContainerEl.appendChild(this.thumbDotEl);
        this.thumbContainerEl.appendChild(this.thumbIcon);
        this.lb.appendChild(this.input);
        this.lb.appendChild(this.currencySpan);
        this.container.appendChild(this.thumbContainerEl);
        this.container.appendChild(this.rb);
        this.container.appendChild(this.lb);
        this.container.className = "root-list";
        this.ref.listContainer.insertBefore(this.container, this.ref.addingList.el);
    }

    public get title(): string {
        return this.rb.textContent?.slice(0, -1) ?? "";
    }

    public set title(value: string) {
        this.rb.textContent = value + ":";
    }

    public get value(): number {
        return App.Utils.deformatNumber(this.input.value);
    }

    public set value(value: number) {
        this.input.value = value.toLocaleString("en");
    }

    public delete() {
        this.ref.lists.splice(this.index, 1);
        this.ref.listContainer.removeChild(this.container);
    }
}