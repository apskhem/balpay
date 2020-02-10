google.charts.load("current", {"packages":["corechart", "line"]});

function HistoryGraph() {
    ChartSize();
    let data = new google.visualization.DataTable();
    data.addColumn("date", "Date");
    data.addColumn("number", "Balance");
    data.addColumn("number", "Expenditure");
    data.addColumn("number", "Income");
    data.addColumn("number", "Lending");
    data.addColumn("number", "Debt");

    data.addRows(records);

    const options = {
        title: "",
        legend: { position: "bottom" },
        fontName: "Sarabun",
        backgroundColor: { fill:"transparent" },
        colors: ["#85C1E9", "#a52714", "#097138", "#ffc70f", "#5D6D7E"]
    };

    let graph = new google.visualization.LineChart(id("main_statistics"));

    graph.draw(data, options);
}

function ChartSize() {
    const main = tn("main")[0];
    const graph = id("main_statistics");
    if (main.offsetWidth > 450) {
        graph.style.width = main.offsetWidth + 250 + "px";
        graph.style.height = "540px";
        graph.style.marginLeft = "-125px";
        graph.style.marginTop = "-80px";
    }
    else {
        graph.style.width = main.offsetWidth + 50 + "px";
        graph.style.height = "400px";
        graph.style.marginLeft = "-30px";
        graph.style.marginTop = "-60px";
    }
}

function ThisMonthGraph(dataRecords, locationID) {
    let data = new google.visualization.DataTable();
    data.addColumn("string", "List");
    data.addColumn("number", "Spending");

    data.addRows(dataRecords);

    const options = {
        title: "",
        legend: "none",
        pieSliceText: 'label',
        fontName: "Sarabun",
        height: tn("main")[0].offsetWidth/2.0,
        backgroundColor: { fill:"transparent" }
    };

    let graph = new google.visualization.PieChart(id(locationID));

    graph.draw(data, options);
}