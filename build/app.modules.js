import { GraphSection, SummarizedSecton } from "./app.panels.js";
import { App } from "./lib.core.js";
import { db, roots, user, balance } from "./main.js";
export class RootList {
    constructor(type) {
        this.wrapper = document.createElement("div");
        this.nav = document.createElement("nav");
        this.asideHeader = document.createElement("li");
        this.asideTotal = document.createElement("li");
        this.listContainer = document.createElement("div");
        this.lists = [];
        this.addingList = new AddingList(this);
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
    get header() {
        var _a, _b;
        return (_b = (_a = this.asideHeader.textContent) === null || _a === void 0 ? void 0 : _a.slice(0, -1).toLowerCase()) !== null && _b !== void 0 ? _b : "";
    }
    set header(type) {
        switch (type) {
            case "exp":
                this.asideHeader.textContent = "Expense:";
                break;
            case "inc":
                this.asideHeader.textContent = "Income:";
                break;
            case "len":
                this.asideHeader.textContent = "Lending:";
                break;
            case "deb":
                this.asideHeader.textContent = "Debt:";
                break;
        }
    }
    get total() {
        var _a;
        return App.Utils.deformatNumber((_a = this.asideTotal.textContent) !== null && _a !== void 0 ? _a : "");
    }
    set total(value) {
        this.asideTotal.textContent = (value.toLocaleString("en") || 0) + user.settings.currency;
    }
    get detail() {
        let detail = "";
        const len = this.lists.length;
        for (let i = 0; i < len; i++) {
            detail += this.lists[i].title + "=" + this.lists[i].value;
            if (i < len - 1)
                detail += ";";
        }
        return detail;
    }
    set detail(value) {
        if (value) {
            for (const list of value.split(";")) {
                const title = list.split("=")[0];
                const amount = +list.split("=")[1];
                this.lists.push(new ListObject(this, title, amount));
            }
        }
        this.updateSum();
    }
    updateSum() {
        let total = 0;
        for (const list of this.lists)
            total += list.value;
        this.total = total;
    }
    static UpdateBalance() {
        balance.result = balance.final - roots["exp"].total + roots["inc"].total;
        this.balanceEl.children[1].textContent = balance.result.toLocaleString("en") + user.settings.currency;
    }
}
RootList.mainFiscalPanel = document.getElementById("main-fiscal-panel");
RootList.balanceEl = document.getElementById("bal-root");
class AddingList {
    constructor(ref) {
        this.el = document.createElement("div");
        this.titleInput = document.createElement("input");
        this.valueInput = document.createElement("input");
        this.thumbContainerEl = document.createElement("div");
        this.thumbDotEl = document.createElement("div");
        this.thumbIcon = document.createElement("i");
        this.thumbLineEl = document.createElement("div");
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
        this.titleInput.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                e.preventDefault();
                this.valueInput.focus();
            }
        });
        this.valueInput.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                e.preventDefault();
                this.thumbIcon.click();
            }
        });
        this.thumbIcon.addEventListener("click", () => {
            if (!this.titleInput.value || !this.valueInput.value || !parseFloat(this.valueInput.value))
                return;
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
                    else {
                    }
                    foundDuplicated = true;
                    break;
                }
            }
            if (parseFloat(this.valueInput.value) < 0 && !foundDuplicated)
                return;
            if (!foundDuplicated) {
                const newList = new ListObject(this.ref, this.titleInput.value, +this.valueInput.value);
                this.ref.lists.push(newList);
                this.ref.listContainer.style.maxHeight = this.ref.listContainer.scrollHeight + "px";
            }
            this.titleInput.value = "";
            this.valueInput.value = "";
            this.titleInput.blur();
            this.valueInput.blur();
            this.ref.updateSum();
            RootList.UpdateBalance();
            GraphSection.updateChart();
            SummarizedSecton.updateConclusion();
            db.request("UPDATE");
        });
    }
}
class ListObject {
    constructor(ref, title, amount) {
        this.container = document.createElement("div");
        this.input = document.createElement("input");
        this.lb = document.createElement("li");
        this.rb = document.createElement("li");
        this.currencySpan = document.createElement("span");
        this.thumbContainerEl = document.createElement("div");
        this.thumbDotEl = document.createElement("div");
        this.thumbIcon = document.createElement("i");
        this.thumbLineEl = document.createElement("div");
        this.backupValue = "0";
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
            this.ref.updateSum();
            RootList.UpdateBalance();
            GraphSection.updateChart();
            SummarizedSecton.updateConclusion();
            db.request("UPDATE");
        });
        this.input.addEventListener("focus", () => {
            this.input.value = App.Utils.deformatNumber(this.input.value) + "";
            this.input.type = "number";
            this.backupValue = this.input.value;
            this.input.select();
        });
        this.input.addEventListener("blur", () => {
            switch (true) {
                case this.input.value === this.backupValue:
                    {
                        this.input.type = "text";
                        this.input.value = (+this.input.value).toLocaleString("en");
                    }
                    return;
                case this.input.value === "0":
                    {
                        this.thumbIcon.click();
                    }
                    return;
                case this.input.valueAsNumber < 0 || !this.input.value:
                    {
                        this.input.value = this.backupValue;
                    }
                    return;
            }
            this.input.type = "text";
            this.input.value = (+this.input.value).toLocaleString("en");
            this.ref.updateSum();
            RootList.UpdateBalance();
            GraphSection.updateChart();
            SummarizedSecton.updateConclusion();
            db.request("UPDATE");
        });
        this.input.addEventListener("keyup", (e) => {
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
    get title() {
        var _a, _b;
        return (_b = (_a = this.rb.textContent) === null || _a === void 0 ? void 0 : _a.slice(0, -1)) !== null && _b !== void 0 ? _b : "";
    }
    set title(value) {
        this.rb.textContent = value + ":";
    }
    get value() {
        return App.Utils.deformatNumber(this.input.value);
    }
    set value(value) {
        this.input.value = value.toLocaleString("en");
    }
    delete() {
        this.ref.lists.splice(this.index, 1);
        this.ref.listContainer.removeChild(this.container);
    }
}
