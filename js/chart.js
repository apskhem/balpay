function drawChart() {
    ChartSize();
    let data = new google.visualization.DataTable();
    data.addColumn('date', 'Date');
    data.addColumn('number', 'Balance');
    data.addColumn('number', 'Expenditure');
    data.addColumn('number', 'Income');
    data.addColumn('number', 'Lending');
    data.addColumn('number', 'Debt');

    data.addRows(storedHistory);

    let options = {
        title: '',
        legend: { position: 'bottom' },
        fontName: "Sarabun",
        backgroundColor: { fill:'transparent' },
        colors: ["#85C1E9", '#a52714', '#097138', "#ffc70f", "#5D6D7E"]
    };

    let chart = new google.visualization.LineChart(ID('main_statistics'));

    chart.draw(data, options);
}

function ChartSize() {
    let chart_id = "main_statistics";
    if (TN("main")[0].offsetWidth > 400) {
        ID(chart_id).style.width = TN("main")[0].offsetWidth + 220 + "px";
        ID(chart_id).style.height = "600px";
        ID(chart_id).style.marginLeft = "-100px";
        ID(chart_id).style.marginTop = "-80px";
    }
    else {
        ID(chart_id).style.width = TN("main")[0].offsetWidth + "px";
        ID(chart_id).style.height = "400px";
        ID(chart_id).style.marginTop = "-60px";
    }
}