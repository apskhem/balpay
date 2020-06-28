export default class GoogleCharts {
    constructor(...packages) {
        this.packages = packages;
        this.charts = {};
        this.src = google;

        this.src.charts.load("current", { "packages": packages });
    }

    Set(chartName, type, dataForm, options, defaultDataForm, defaultRenderEl) {
        this.charts[chartName] = {
            "type": type,
            "form": dataForm,
            "options": options,
            "data": defaultDataForm,
            "element": defaultRenderEl
        };
    }

    Render(chartName, data, renderEl) {
        this.src.charts.setOnLoadCallback(() => {
            const prototype = this.charts[chartName];
            const dataTable = new this.src.visualization.DataTable();
    
            for (const header in prototype.form) dataTable.addColumn(prototype.form[header].name.toLowerCase(), header);
    
            dataTable.addRows(data);
    
            let chart;
            switch (prototype.type) {
                case "line-chart": chart = new this.src.visualization.LineChart(document.querySelector(renderEl)); break;
                case "pie-chart": chart = new this.src.visualization.PieChart(document.querySelector(renderEl)); break;
            }
    
            chart.draw(dataTable, prototype.options());
        });
    }
}