const ID = (id) => document.getElementById(id);
const CL = (cl) => document.getElementsByClassName(cl);
const TN = (tn) => document.getElementsByTagName(tn);

document.documentElement.addEventListener("keyup", function(event) {
    if (event.code === "Backquote") location.reload();
})

// helper functions
function NumberFormat(num) {
    var n = parseFloat(num).toFixed(2);
    var newnum = n.toString().split(".")[0];
    var sum = "";
    var loop = newnum.length - 1;
    for (var i = 0; i < newnum.length; i++) {
        if (loop-- % 3 == 0 && i != newnum.length - 1)
            sum += newnum[i] + ",";
        else 
            sum += newnum[i]
    }
    return sum + "." + n.toString().split(".")[1];
}

function AddExistedAmount(position, amount) {
    // value in
    var position_value = parseFloat(position.value.replace(/[,]/g, ""));
    var in_value = parseFloat(amount) + position_value;
    position.value = in_value;

    // value out
    position.type = "text";
    position.value = NumberFormat(position.value);
    SumTheCost(position.parentElement.parentElement.parentElement.parentElement.parentElement.id);
    AdjustBalance();
    UpdateChart();
    position.parentElement.parentElement.style.opacity = "0.5";
    updatingListObject = position.parentElement.parentElement;

    // save data to the server
    UpdateReq();
}

function DuplicateListToInput() {
    var textInputOfTheList = this.parentElement.parentElement.nextElementSibling.children[0];
    var numberInputOfTheList = this.parentElement.parentElement.nextElementSibling.children[1]; // not fixed
    textInputOfTheList.value = this.textContent.replace(":", "");
    numberInputOfTheList.focus();
}

// collapsible content
for (var i = 0; i < CL("expandable").length; i++) {
    CL("expandable")[i].addEventListener("click", function() {
        if (this.nextElementSibling.style.maxHeight == "0px") 
            this.nextElementSibling.style.maxHeight = this.nextElementSibling.scrollHeight + "px";
        else
            this.nextElementSibling.style.maxHeight = 0;
    })
}

// write the currency
var defaultCurrency = "THB"
for (var i = 0; i < TN("span").length; i++) {
    TN("span")[i].innerHTML = defaultCurrency;
}

var backupValue = 0;

var inputlist = {
    out: function() {
        var wholeObject = this.parentElement.parentElement;
        var channel = this.parentElement.parentElement.parentElement.parentElement.parentElement.id;
        if (this.value == backupValue) {
            this.type = "text";
            this.value = NumberFormat(this.value.replace(/[,]/g, ""));
            return;
        }
        else if (this.value == 0) {
            var place = this.parentElement.parentElement.parentElement
            for (var i = 0; i < place.childElementCount; i++) {
                if (place.getElementsByTagName("input")[i].value == 0) {
                    place.removeChild(place.children[i]);
                    FinalizeList();
                    return;
                }
            }
            alert("error occured! please restart the webpage.");
            return;
        }
        else if (this.value < 0 || this.value == "" || this.value == null) {
            this.value = backupValue;
            return;
        }

        this.type = "text";
        this.value = NumberFormat(this.value.replace(/[,]/g, ""));
        FinalizeList();

        function FinalizeList() {
            SumTheCost(channel);
            AdjustBalance();
            UpdateChart();
            wholeObject.style.opacity = "0.5";
            updatingListObject = wholeObject;
    
            // save data to the server
            UpdateReq();
        }
    },
    in: function() {
        this.value = this.value.replace(/[,]/g, "");
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
for (var i = 0; i < CL("add-fiscal-list").length; i++) {
    CL("add-fiscal-list")[i].addEventListener("click", function() {
        var input_title = this.previousElementSibling.previousElementSibling.value;
        var input_amount = this.previousElementSibling.value;

        if (input_title == "") return;
        if (input_amount == "" || input_amount < 1) return;

        this.previousElementSibling.previousElementSibling.value = "";
        this.previousElementSibling.value = "";
        this.previousElementSibling.previousElementSibling.blur();
        this.previousElementSibling.blur();

        if (isCompleteReadData) {
            var rootid = this.parentElement.parentElement;
            for (var i = 0; i < rootid.getElementsByClassName("rootcost").length; i++) {
                var existed_title = rootid.getElementsByClassName("rootcost")[i].firstChild.textContent.replace(/[:]/g, "");
                if (input_title == existed_title) {
                    AddExistedAmount(rootid.getElementsByTagName("input")[i], input_amount);
                    return;
                }
            }
        }

        var rootdiv = document.createElement("div");
        var input = document.createElement("input");
        var li1 = document.createElement("li");
        var li2 = document.createElement("li");
        var span = document.createElement("span");

        input.value = NumberFormat(input_amount);
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
        rootdiv.classList.add("rootcost");
        this.parentElement.previousElementSibling.appendChild(rootdiv);

        //finalize
        this.parentElement.parentElement.style.maxHeight = this.parentElement.parentElement.scrollHeight + "px";
        SumTheCost(this.parentElement.parentElement.parentElement.id);
        AdjustBalance();

        if (isCompleteReadData) {
            UpdateChart();
            UpdateReq();
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
        default: alert(); break;
    }

    function CreatePosition(ch) {
        ch.children[0].value = title;
        ch.children[1].value = amount;
        ch.children[2].click();
    }
}

function UpdateChart() {
    var dt = today().split(".");
    storedHistory[storedHistory.length - 1] = [
        new Date(dt[0], dt[1], dt[2]),
        resultBalance,
        GetSpendValue("fiscal-expenditure"),
        GetSpendValue("fiscal-income"),
        GetSpendValue("fiscal-lending"),
        GetSpendValue("fiscal-debt")
    ];

    // redraw statistic chart
    google.charts.load('current', {'packages':['corechart', 'line']});
    google.charts.setOnLoadCallback(drawChart);
}

// Sum all the detail in each channel
function SumTheCost(channel) {
    if (channel == null) {
        SumTheCost("fiscal-expenditure");
        SumTheCost("fiscal-income");
        SumTheCost("fiscal-lending");
        SumTheCost("fiscal-debt");
        return;
    }

    var total = 0;
    for (var i = 0; i < ID(channel).getElementsByClassName("cost").length; i++) {
        total += parseFloat(ID(channel).getElementsByClassName("cost")[i].children[0].value.replace(/[,]/g, ""));
    }
    ID(channel).getElementsByClassName("total")[0].innerHTML = NumberFormat(total) + " " + defaultCurrency;
}

// adjust the balance and text it
function AdjustBalance() {
    resultBalance = finalBalance - GetSpendValue("fiscal-expenditure") + GetSpendValue("fiscal-income");
    ID("fiscal-balance").children[0].textContent = NumberFormat(resultBalance) + " " + defaultCurrency;
}

function GetSpendValue(channel) {
    var unformattedNumber = ID(channel).getElementsByClassName("total")[0].textContent.split(" ")[0];
    return parseFloat(unformattedNumber.replace(/[,]/g, ""));
}

function GetSpendDetail(channel) {
    var detail = "";
    for (var i = 0; i < ID(channel).getElementsByClassName("rootcost").length; i++) {
        var rootcost = ID(channel).getElementsByClassName("rootcost")[i];
        detail += rootcost.firstChild.textContent.replace(/[:]/g, "") + "=" + 
        rootcost.getElementsByTagName("input")[0].value.replace(/[,]/g, "");
        if (i < ID(channel).getElementsByClassName("rootcost").length - 1)
            detail += ";";
    }
    return detail;
}

function KeyToEnterTitle(o) {
    if (event.keyCode == 13) {
        o.nextElementSibling.focus();
    }
}

function KeyToEnterAmount(o) {
    if (event.keyCode == 13) {
        o.nextElementSibling.click();
    }
}