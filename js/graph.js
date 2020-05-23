google.charts.load("current", { "packages": ["corechart", "line"] });

class GraphSet {
    static History() {
        const data = new google.visualization.DataTable();
        data.addColumn("date", "Date");
        data.addColumn("number", "Balance");
        data.addColumn("number", "Expenditure");
        data.addColumn("number", "Income");
        data.addColumn("number", "Lending");
        data.addColumn("number", "Debt");
    
        data.addRows(records);
    
        const options = {
            title: "",
            legend: {position: "bottom"},
            fontName: "Sarabun",
            backgroundColor: {fill: "transparent"},
            colors: ["#85C1E9", "#d45079", "#4baea0", "#ffc70f", "#5D6D7E"],
            animation: {
                duration: 1000,
                easing: 'out',
            },
        };
    
        let graph = new google.visualization.LineChart(document.getElementById("main_statistics"));

        // adjust graph size
        const main = document.getElementsByTagName("main")[0];
        const chart = document.getElementById("main_statistics");
    
        if (main.offsetWidth > 450) {
            chart.style.width = main.offsetWidth + 250 + "px";
            chart.style.height = "540px";
            chart.style.marginLeft = "-125px";
            chart.style.marginTop = "-80px";
        }
        else {
            chart.style.width = main.offsetWidth + 50 + "px";
            chart.style.height = "400px";
            chart.style.marginLeft = "-30px";
            chart.style.marginTop = "-60px";
        }

        graph.draw(data, options);
    
        for (const child of document.getElementById("statistics-view").children) {
            child.addEventListener("click", function() {
                data.removeRows(0, records.length);
    
                switch (this.textContent) {
                    case "All": {
                        data.addRows(records);
                    } break;
                    case "This Month": {
                        const thisMonth = +Tools.currentDate.split(".")[1];
                        for (const record of records) {
                            if (record[0].getMonth() === thisMonth) {
                                data.addRow(record);
                            }
                        }
                    } break;
                    case "This Week": {
                        for (let z = records.length - 1; z > records.length - 8; z--) {
                            data.addRow(records[z]);
                        }
                    } break;
                }
    
                graph.draw(data, options);
            });
        }
    }

    static SummarizedThisMonth(dataRecords, locationID) {
        let data = new google.visualization.DataTable();
        data.addColumn("string", "List");
        data.addColumn("number", "Spending");
    
        data.addRows(dataRecords);
    
        const options = {
            title: "",
            legend: "none",
            pieSliceText: 'label',
            fontName: "Sarabun",
            height: document.getElementsByTagName("main")[0].offsetWidth/2.0,
            backgroundColor: { fill:"transparent" }
        };
    
        let graph = new google.visualization.PieChart(document.getElementById(locationID));
    
        graph.draw(data, options);
    }
};