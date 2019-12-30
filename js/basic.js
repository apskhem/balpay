const ID = (id) => document.getElementById(id);
const CL = (cl) => document.getElementsByClassName(cl);
const TN = (tn) => document.getElementsByTagName(tn);

window.onerror = (msg, url, lineNo, columnNo, error) => alert(msg);

document.documentElement.addEventListener("keyup", function(event) {
    if (event.code === "Backquote") location.reload();
})

// ------------------ //
//  Initial Functions //
// ------------------ //

ID("today-date").textContent = today();

// ----------------- //
//  Helper Functions //
// ----------------- //

function visualizeNum(num) { // format number to text ex. 1,000.00
    num = parseFloat(num).toFixed(2).toString().split(".");
    let intNum = num[0];
    let sum = "";

    for (let i = 0; i < intNum.length; i++) {
        if (((intNum.length - 1) - i) % 3 == 0 && i != intNum.length - 1)
            sum += intNum[i] + ",";
        else 
            sum += intNum[i];
    }
    
    return `${sum}.${num[1]}`;
}

// parse value to num of visualized value
function parseNum(visualizedValue) {
    return parseFloat(visualizedValue.replace(/[,]/g, ""));
}

function AddExistedAmount(list_obj, amount) {
    // value in
    list_obj.value = parseNum(list_obj.value) + parseNum(amount);

    // value out
    list_obj.type = "text";
    list_obj.value = visualizeNum(list_obj.value);
    SumValue(list_obj.parentElement.parentElement.parentElement.parentElement.parentElement.id);
    AdjustBalance();
    UpdateChart();
    list_obj.parentElement.parentElement.style.opacity = "0.5";
    updatingListObject = list_obj.parentElement.parentElement;

    // save data to the server
    UpdateReq();
}

function DuplicateListToInput() {
    let textInputOfTheList = this.parentElement.parentElement.nextElementSibling.children[0];
    let numberInputOfTheList = this.parentElement.parentElement.nextElementSibling.children[1]; // not fixed
    textInputOfTheList.value = this.textContent.replace(":", "");
    numberInputOfTheList.focus();
}

// --------------------------- //
//  Core Fundamental Functions //
// --------------------------- //

let backupValue = 0;
let inputlist = {
    out: function() {
        const detailObject = this.parentElement.parentElement;
        const channel = this.parentElement.parentElement.parentElement.parentElement.parentElement.id;

        if (this.value == backupValue) {
            this.type = "text";
            this.value = visualizeNum(parseNum(this.value));
            return;
        }
        else if (this.value == 0) {
            detailObject.parentElement.removeChild(detailObject);
            FinalizeList();
            return;
        }
        else if (this.value < 0 || this.value == "" || this.value == null) {
            this.value = backupValue;
            return;
        }

        this.type = "text";
        this.value = visualizeNum(parseNum(this.value));
        FinalizeList();

        function FinalizeList() {
            SumValue(channel);
            AdjustBalance();
            UpdateChart();

            if (this) {
                detailObject.style.opacity = "0.5";
                updatingListObject = detailObject;
            }
    
            // save data to the server
            UpdateReq();
        }
    },
    in: function() {
        this.value = parseNum(this.value);
        this.type = "number";
        backupValue = this.value;
    },
    enter: function(event) {
        if (event.code === "Enter") {
            this.blur();
        }
    }
}

// Create a new list on "Add" button clicked
for (const addFiscalList of CL("add-fiscal-list")) {
    addFiscalList.addEventListener("click", function() {
        let input_title = this.previousElementSibling.previousElementSibling.value;
        let input_amount = this.previousElementSibling.value;

        if (input_title == "") return;
        if (input_amount == "") return;

        if (isCompleteReadData) {
            const subroot = this.parentElement.parentElement;
            for (const detailList of subroot.getElementsByClassName("root-list")) {
                const existed_title = detailList.children[0].textContent.replace(/[:]/g, "");
                if (input_title == existed_title) {
                    // (if existed value + new input value) is more than or equal 0
                    if (parseNum(detailList.getElementsByTagName("input")[0].value) + parseNum(input_amount) > 0) {
                        AddExistedAmount(detailList.getElementsByTagName("input")[0], input_amount);
                    }
                    else if (parseNum(detailList.getElementsByTagName("input")[0].value) + parseNum(input_amount) == 0) {
                        detailList.parentElement.removeChild(detailList);

                        SumValue(subroot.parentElement.id);
                        AdjustBalance();
                        UpdateChart();

                        // save data to the server
                        UpdateReq();
                    }

                    ResetInputNewList(this.previousElementSibling);
                    return;
                }
            }
        }

        if (input_amount < 1) return;

        ResetInputNewList(this.previousElementSibling);

        // create new list element
        let rootdiv = document.createElement("div");
        let input = document.createElement("input");
        let li1 = document.createElement("li");
        let li2 = document.createElement("li");
        let span = document.createElement("span");

        input.value = visualizeNum(input_amount);
        input.min = "0";
        input.addEventListener("focusin", inputlist.in);
        input.addEventListener("focusout", inputlist.out);
        input.addEventListener("keyup", inputlist.enter);
        input.onfocusout = inputlist.out;
        span.textContent = " " + defaultCurrency;
        li1.classList.add("cost");
        li2.textContent = input_title + ":";
        li2.addEventListener("click", DuplicateListToInput);

        li1.appendChild(input);
        li1.appendChild(span);
        rootdiv.appendChild(li2);
        rootdiv.appendChild(li1);
        rootdiv.classList.add("root-list");
        this.parentElement.previousElementSibling.appendChild(rootdiv);

        //finalize
        this.parentElement.parentElement.style.maxHeight = this.parentElement.parentElement.scrollHeight + "px";
        SumValue(this.parentElement.parentElement.parentElement.id);
        AdjustBalance();

        if (isCompleteReadData) {
            UpdateChart();
            UpdateReq();
        }

        function ResetInputNewList(obj) {
            obj.previousElementSibling.value = "";
            obj.value = "";
            obj.previousElementSibling.blur();
            obj.blur();
        }
    })
}

// create spend list in defined channel
function CreateList(channel, title, amount) {
    switch (channel) {
        case "fiscal-expenditure": CreatePosition(CL("create-list-grid")[0]); break;
        case "fiscal-income": CreatePosition(CL("create-list-grid")[1]); break;
        case "fiscal-lending": CreatePosition(CL("create-list-grid")[2]); break;
        case "fiscal-debt": CreatePosition(CL("create-list-grid")[3]); break;
    }

    function CreatePosition(ch) {
        ch.children[0].value = title;
        ch.children[1].value = amount;
        ch.children[2].click();
    }
}

function UpdateChart() {
    storedHistory[storedHistory.length - 1] = [
        new Date(...today().split(".")),
        finance.balance.result,
        GetTotalValue("fiscal-expenditure"),
        GetTotalValue("fiscal-income"),
        GetTotalValue("fiscal-lending"),
        GetTotalValue("fiscal-debt")
    ];

    // redraw statistic chart
    google.charts.load('current', {'packages':['corechart', 'line']});
    google.charts.setOnLoadCallback(drawChart);
}

// Sum all the detail in each channel
function SumValue(channel) {
    if (channel == undefined) {
        SumValue("fiscal-expenditure");
        SumValue("fiscal-income");
        SumValue("fiscal-lending");
        SumValue("fiscal-debt");
        return;
    }

    let total = 0;
    for (const cost of ID(channel).getElementsByClassName("cost")) {
        total += parseNum(cost.children[0].value);
    }
    ID(channel).getElementsByClassName("total")[0].textContent = visualizeNum(total) + " " + defaultCurrency;
}

// adjust the balance and text it
function AdjustBalance() {
    finance.balance.result = finance.balance.final - GetTotalValue("fiscal-expenditure") + GetTotalValue("fiscal-income");
    ID("fiscal-balance").children[0].textContent = visualizeNum(finance.balance.result) + " " + defaultCurrency;
}

function GetTotalValue(channel) {
    let unformattedNumber = ID(channel).getElementsByClassName("total")[0].textContent.split(" ")[0];
    return parseNum(unformattedNumber);
}

// get database-keyed spending detail
function GetDetails(channel) {
    let detail = "";
    for (let i = 0; i < ID(channel).getElementsByClassName("root-list").length; i++) {
        let detailList = ID(channel).getElementsByClassName("root-list")[i];
        detail += detailList.firstChild.textContent.replace(/[:]/g, "") + "=" + parseNum(detailList.getElementsByTagName("input")[0].value);

        if (i < ID(channel).getElementsByClassName("root-list").length - 1)
            detail += ";";
    }
    return detail;
}

// ----------------------- //
//  Interface Interactions //
// ----------------------- //

// collapsible content
for (const expandable of CL("expandable")) {
    expandable.addEventListener("click", function() {
        if (this.nextElementSibling.style.maxHeight == "0px") 
            this.nextElementSibling.style.maxHeight = this.nextElementSibling.scrollHeight + "px";
        else
            this.nextElementSibling.style.maxHeight = 0;
    })
}

// write the currency
let defaultCurrency = "THB"
for (const tagname of TN("span")) {
    tagname.textContent = defaultCurrency;
}

function KeyToEnterTitle(obj) {
    if (event.keyCode == 13)
        obj.nextElementSibling.focus();
}

function KeyToEnterAmount(obj) {
    if (event.keyCode == 13)
        obj.nextElementSibling.click();
}