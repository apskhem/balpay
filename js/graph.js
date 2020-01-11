google.charts.load("current", {"packages":["corechart", "line"]});
google.charts.load("current", {"packages":["corechart"]});

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
    const graphID = "main_statistics";
    if (tn("main")[0].offsetWidth > 400) {
        id(graphID).style.width = tn("main")[0].offsetWidth + 250 + "px";
        id(graphID).style.height = "540px";
        id(graphID).style.marginLeft = "-125px";
        id(graphID).style.marginTop = "-80px";
    }
    else {
        id(graphID).style.width = tn("main")[0].offsetWidth + 50 + "px";
        id(graphID).style.height = "400px";
        id(graphID).style.marginLeft = "-30px";
        id(graphID).style.marginTop = "-60px";
    }
}

function ThisMonthGraph(dataRecords, locationID) {
    let data = new google.visualization.DataTable();
    data.addColumn("string", "List");
    data.addColumn("number", "Spending");

    console.log(dataRecords)

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

    id(locationID).style.marginTop = "-80px";
}