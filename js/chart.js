function drawChart() {
    ChartSize();
    var data = new google.visualization.DataTable();
    data.addColumn('date', 'Date');
    data.addColumn('number', 'Balance');
    data.addColumn('number', 'Expenditure');
    data.addColumn('number', 'Income');
    data.addColumn('number', 'Lending');
    data.addColumn('number', 'Debt');

    for (var i = 0; i < storedHistory.length; i++) {
        data.addRows([
            storedHistory[i]
        ]);
    }

    var options = {
        title: '',
        legend: { position: 'bottom' },
        fontName: "K2D",
        backgroundColor: { fill:'transparent' },
        colors: ["#85C1E9", '#a52714', '#097138', "#ffc70f", "#5D6D7E"]
    };

    var chart = new google.visualization.LineChart(ID('main_statistics'));

    chart.draw(data, options);
}

function ChartSize() {
    var chart_channel = "main_statistics";
    if (TN("main")[0].offsetWidth > 400) {
        ID(chart_channel).style.width = TN("main")[0].offsetWidth + 220 + "px";
        ID(chart_channel).style.height = "600px";
        ID(chart_channel).style.marginLeft = "-100px";
        ID(chart_channel).style.marginTop = "-80px";
    }
    else {
        ID(chart_channel).style.width = TN("main")[0].offsetWidth + "px";
        ID(chart_channel).style.height = "400px";
        ID(chart_channel).style.marginTop = "-60px";
    }
}