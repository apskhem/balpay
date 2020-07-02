import { Tools } from "./misc.js";
import { db, roots, elm, user, records, detailRecords, balance, Summarization } from "../main.js";

export class RootList {
    static balanceEl = document.getElementById("bal-root");

    constructor(type) {
        this.el = document.createElement("div");
        this.nav = document.createElement("nav");
        this.asideHeader = document.createElement("aside");
        this.asideTotal = document.createElement("aside");
        this.listContainer = document.createElement("div");
        this.lists = [];

        this.header = type;
        this.el.id = type + "-root";
        this.el.className = "root";
        this.nav.className = "collapsible-object";
        this.asideTotal.className = "total";
        this.asideTotal.textContent = "0";
        this.listContainer.className = "subroot";

        this.nav.appendChild(this.asideHeader);
        this.nav.appendChild(this.asideTotal);
        this.el.appendChild(this.nav);
        this.el.appendChild(this.listContainer);

        this.addingList = new AddingList(this);

        document.getElementById("main-fiscal-panel").insertBefore(this.el, RootList.balanceEl);
    }

    get header() {
        return this.asideHeader.textContent.slice(0, -1).toLowerCase();
    }

    set header(type) {
        switch (type) {
            case "exp": this.asideHeader.textContent = "Expense:"; break;
            case "inc": this.asideHeader.textContent = "Income:"; break;
            case "len": this.asideHeader.textContent = "Lending:"; break;
            case "deb": this.asideHeader.textContent = "Debt:"; break;
        }
    }

    get total() {
        return Tools.DeformatNumber(this.asideTotal.textContent);
    }

    set total(numVal) {
        this.asideTotal.textContent = (Tools.FormatNumber(numVal) || 0) + user.settings.currency;
    }

    get detail() {
        let detail = "";

        const len = this.lists.length;
        for (let i = 0; i < len; i++) {
            detail += this.lists[i].title + "=" + this.lists[i].value;
            if (i < len - 1) detail += ";";
        }
        return detail;
    }

    set detail(detail) {
        if (detail) {
            for (const list of detail.split(";")) {
                this.lists.push(new ListObject(this, ...list.split("=")));
            }
        }

        this.UpdateSum();
    }

    UpdateSum() {
        let total = 0;
        for (const list of this.lists) total += list.value;

        this.total = total;
    }

    static UpdateBalance() {
        balance.result = balance.final - roots["exp"].total + roots["inc"].total;
        this.balanceEl.children[1].textContent = Tools.FormatNumber(balance.result) + user.settings.currency;
    }
};

class AddingList {
    constructor(ref) {
        this.el = document.createElement("div");
        this.titleInput = document.createElement("input");
        this.valueInput = document.createElement("input");
        this.button = document.createElement("div");
        this.ref = ref;

        this.titleInput.placeholder = "Title";
        this.valueInput.placeholder = "Value";
        this.button.className = "list-adding-btn";
        
        this.el.className = "create-list-grid";

        this.el.appendChild(this.titleInput);
        this.el.appendChild(this.valueInput);
        this.el.appendChild(this.button);

        this.ref.listContainer.appendChild(this.el);

        elm.Add(this.titleInput, {
            "keydown.enter": () => {
                this.valueInput.focus();
            }
        });

        elm.Add(this.valueInput, {
            "keydown.enter": () => {
                this.button.click();
            }
        });

        elm.Add(this.button, {
            "click": () => {
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
                            list.Delete();
                        }
                        else { // less than 0
        
                        }
        
                        foundDuplicated = true;
                        break;
                    }
                }
        
                if (parseFloat(this.valueInput.value) < 0 && !foundDuplicated) return;
                
                if (!foundDuplicated) {
                    const newList = new ListObject(this.ref, this.titleInput.value, this.valueInput.value);
                    this.ref.lists.push(newList);
        
                    this.ref.listContainer.style.maxHeight = this.ref.listContainer.scrollHeight + "px";
                }
        
                // clear input
                this.titleInput.value = "";
                this.valueInput.value = "";
                this.titleInput.blur();
                this.valueInput.blur();
                
                this.ref.UpdateSum();
                RootList.UpdateBalance();
                UpdateChart();
                Summarization();
                db.Request("UPDATE");
            }
        });
    }
};

class ListObject {
    constructor(ref, title, amount) {
        this.container = document.createElement("div");
        this.input = document.createElement("input");
        this.lb = document.createElement("li");
        this.rb = document.createElement("li");
        this.currencySpan = document.createElement("span");
        this.ref = ref;
        this.index = this.ref.lists.length;

        this.backupValue = "0";

        this.input.value = Tools.FormatNumber(amount);
        this.input.min = "0";
        this.currencySpan.textContent = user.settings.currency;
        this.lb.className = "cost";
        this.title = title;

        elm.Add(this.input, {
            "focus": (e, el) => {
                el.value = Tools.DeformatNumber(el.value);
                el.type = "number";
                this.backupValue = el.value;
                el.select();
            },
            "blur": (e, el) => {
                switch (true) {
                    case el.value === this.backupValue: {
                        el.type = "text";
                        el.value = Tools.FormatNumber(el.value);
                    } return;
                    case el.value === "0": {
                        this.Delete();
        
                        // Finalize 
                        this.ref.UpdateSum();
                        RootList.UpdateBalance();
                        UpdateChart();
                        Summarization();
                        db.Request("UPDATE");
                    } return;
                    case el.value < 0 || !el.value: {
                        el.value = this.backupValue;
                    } return;
                }
        
                el.type = "text";
                el.value = Tools.FormatNumber(el.value);
                this.ref.UpdateSum();
                RootList.UpdateBalance();
                UpdateChart();
                Summarization();
                db.Request("UPDATE");
            },
            "keyup.enter": (e, el) => {
                el.blur();
            }
        });

        elm.Add(this.rb, {
            "click" : (e, el) => {
                this.ref.addingList.titleInput.value = this.title;
                this.ref.addingList.valueInput.focus();
            }
        });

        this.lb.appendChild(this.input);
        this.lb.appendChild(this.currencySpan);
        this.container.appendChild(this.rb);
        this.container.appendChild(this.lb);
        this.container.className = "root-list";
        this.ref.listContainer.insertBefore(this.container, this.ref.addingList.el);
    }

    get title() {
        return this.rb.textContent.slice(0, -1);
    }

    set title(title) {
        this.rb.textContent = title + ":";
    }

    get value() {
        return Tools.DeformatNumber(this.input.value);
    }

    set value(val) {
        this.input.value = Tools.FormatNumber(val);
    }

    Delete() {
        this.ref.lists.splice(this.index, 1);
        this.ref.listContainer.removeChild(this.container);
    }
};

export class BarChart {
    constructor(data, settings) {
        
    }
}

function UpdateChart() {
    records.splice(-1, 1, [
        new Date(...Tools.currentDate.split(".")),
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
    document.getElementById("statistics-view").getElementsByClassName("viewed")[0].click();
}