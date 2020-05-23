window.onerror = (msg, url, lineNo, columnNo, error) => alert(`${msg}\nAT: ${lineNo}-${columnNo} ${url.split("/").pop()}`);

class AutomaticSystem {
    static Copyright(element, startYear) {
        const recentYear = new Date().getFullYear();
        element.textContent = (startYear === recentYear) ? startYear : `${startYear}-${recentYear}`;
    }
};

class Tools {
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

    static DeformatNumber = (readable) => parseFloat(readable.replace(/[,]/g, ""));

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
};

// ------------------ //
//  Initial Functions //
// ------------------ //

document.getElementById("today-date").textContent = Tools.FormatDate(Tools.currentDate);
AutomaticSystem.Copyright(document.getElementById("copyright-year"), 2019);

// --------------------------- //
//  Core Fundamental Functions //
// --------------------------- //

class RootList {
    static balanceEl = document.getElementById("bal-root")

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
        this.asideTotal.textContent = Tools.FormatNumber(numVal) + user.settings.currency;
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
        if (!detail) return;

        for (const list of detail.split(";")) {
            this.lists.push(new ListObject(this, ...list.split("=")));
        }
    }

    UpdateSum() {
        let total = 0;
        for (const list of this.lists) total += list.value;

        this.total = total;
    }

    static UpdateBalance() {
        finance.balance.result = finance.balance.final - roots["exp"].total + roots["inc"].total;
        this.balanceEl.children[1].textContent = Tools.FormatNumber(finance.balance.result) + " " + user.settings.currency;
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

        this.button.addEventListener("click", this.EventClick);
    }

    ClearInput() {
        this.titleInput.value = "";
        this.valueInput.value = "";
        this.titleInput.blur();
        this.valueInput.blur();
    }

    // create new list
    EventClick = () => {
        if (!this.titleInput.value || !this.valueInput.value || !parseFloat(this.valueInput.value)) return;

        // check for duplicated title
        let foundDuplicated = false;
        for (const list of this.ref.lists) {
            if (this.titleInput.value === list.title) {
                const newVal = list.value + parseFloat(this.valueInput.value);
                if (newVal > 0) {
                    list.value = newVal;
                    pendingList.Push(list.el);
                }
                else if (!newVal) {
                    list.Delete();
                }
                else { // less than 0

                }

                foundDuplicated = true;
            }
        }

        if (parseFloat(this.valueInput.value) < 0) return;
        
        if (!foundDuplicated) {
            const newList = new ListObject(this.ref, this.titleInput.value, this.valueInput.value);
            this.ref.lists.push(newList);

            this.ref.listContainer.style.maxHeight = this.ref.listContainer.scrollHeight + "px";
            pendingList.Push(newList.el);
        }

        this.ClearInput();
        
        this.ref.UpdateSum();
        RootList.UpdateBalance();
        UpdateChart();
        Summarization();
        Database.Update();
    }
};

class ListObject {
    constructor(ref, title, amount) {
        this.obj = document.createElement("div");
        this.input = document.createElement("input");
        this.lb = document.createElement("li");
        this.rb = document.createElement("li");
        this.currencySpan = document.createElement("span");
        this.ref = ref;
        this.index = this.ref.lists.length;

        this.backupValue = "0";

        this.input.value = Tools.FormatNumber(amount);
        this.input.min = "0";
        this.input.addEventListener("focusin", this.EventFocusIn);
        this.input.addEventListener("focusout", this.EventFocusOut);
        this.input.addEventListener("keyup", this.EventKeyUp);
        this.currencySpan.textContent = user.settings.currency;
        this.lb.className = "cost";
        this.title = title;
        this.rb.addEventListener("click", this.EventClick);

        this.lb.appendChild(this.input);
        this.lb.appendChild(this.currencySpan);
        this.obj.appendChild(this.rb);
        this.obj.appendChild(this.lb);
        this.obj.className = "root-list";
        this.ref.listContainer.insertBefore(this.obj, this.ref.addingList.el);
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
        this.ref.listContainer.removeChild(this.el);
    }

    // Duplicating this list title to input
    EventClick = () => {
        this.ref.addingList.titleInput.value = this.title;
        this.ref.addingList.valueInput.focus();
    }

    EventFocusIn = () => {
        this.input.value = Tools.DeformatNumber(this.input.value);
        this.input.type = "number";
        this.backupValue = this.input.value;
    }

    EventFocusOut = () => {
        switch (true) {
            case this.input.value === this.backupValue: {
                this.input.type = "text";
                this.input.value = Tools.FormatNumber(this.input.value);
            } return;
            case this.input.value === "0": {
                this.Delete();

                // Finalize 
                this.ref.UpdateSum();
                RootList.UpdateBalance();
                UpdateChart();
                Summarization();
                Database.Update();
            } return;
            case this.input.value < 0 || !this.input.value: {
                this.input.value = this.backupValue;
            } return;
        }

        this.input.type = "text";
        this.input.value = Tools.FormatNumber(this.input.value);
        this.ref.UpdateSum();
        RootList.UpdateBalance();
        UpdateChart();
        Summarization();

        if (this.el) pendingList.Push(this.el);
    
        Database.Update();
    }

    EventKeyUp = (e) => {
        if (e.keyCode === 13) this.input.blur();
    }
};

function UpdateChart() {
    records[records.length - 1] = [
        new Date(...Tools.currentDate.split(".")),
        finance.balance.result,
        roots["exp"].total,
        roots["inc"].total,
        roots["len"].total,
        roots["deb"].total
    ];

    detailRecords[detailRecords.length - 1] = [
        roots["exp"].detail,
        roots["inc"].detail,
        roots["len"].detail,
        roots["deb"].detail
    ];

    // redraw statistics chart
    google.charts.setOnLoadCallback(GraphSet.History);
}

function Summarization() {
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
    google.charts.setOnLoadCallback(() => {
        GraphSet.SummarizedThisMonth(Tools.Object2Array(spendingLists.expenditure), "stm-expenditure-graph");
        GraphSet.SummarizedThisMonth(Tools.Object2Array(spendingLists.income), "stm-income-graph");
    });

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

const roots = {
    exp: new RootList("exp"),
    inc: new RootList("inc"),
    len: new RootList("len"),
    deb: new RootList("deb")
};

// ----------------------- //
//  Interface Interactions //
// ----------------------- //

// collapsible content
for (const expandable of document.getElementsByClassName("collapsible-object")) {
    expandable.addEventListener("click", function() {
        let detailList = this.nextElementSibling;
        detailList.style.maxHeight = (detailList.style.maxHeight === "0px") ? detailList.scrollHeight + "px" : 0;
    });
}

// add list input on enter
for (const element of document.getElementsByClassName("create-list-grid")) {
    element.children[0].addEventListener("keydown", function() {
        if (event.keyCode === 13)
            this.nextElementSibling.focus();
    });

    element.children[1].addEventListener("keydown", function() {
        if (event.keyCode === 13)
            this.nextElementSibling.click();
    });
}

// section view
for (const element of document.getElementsByClassName("section-view-grid")) {
    for (const rootChild of element.children) {
        rootChild.addEventListener("click", function() {
        
            for (const child of this.parentElement.children)
                child.classList.remove("viewed");
    
            this.classList.add("viewed");
        });
    }
}

// view mode
for (const child of document.getElementById("view-mode").children) {
    child.addEventListener("click", function() {
        switch (this.textContent) {
            case "This Month": {
                document.getElementById("summarized-details").children[2].hidden = false;
                document.getElementById("summarized-details").children[3].hidden = true;
            } break;
            case "Comparison": {
                document.getElementById("summarized-details").children[2].hidden = true;
                document.getElementById("summarized-details").children[3].hidden = false;
            } break;
        }
    });
}