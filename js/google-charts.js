export default class GoogleCharts {
    constructor(...packages) {
        this.charts = {};
        this.src = google;
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
            "data": defaultDataForm !== null && defaultDataForm !== void 0 ? defaultDataForm : null,
            "element": defaultRenderEl !== null && defaultRenderEl !== void 0 ? defaultRenderEl : null
        };
    }
    Render(chartName, data, toRenderEl) {
        this.src.charts.setOnLoadCallback(() => {
            const prototype = this.charts[chartName];
            const dataTable = new this.src.visualization.DataTable();
            for (const header in prototype.form) {
                dataTable.addColumn(prototype.form[header].name.toLowerCase(), header);
            }
            dataTable.addRows(data);
            let chart;
            switch (prototype.type) {
                case "line-chart":
                    chart = new this.src.visualization.LineChart(toRenderEl);
                    break;
                case "pie-chart":
                    chart = new this.src.visualization.PieChart(toRenderEl);
                    break;
            }
            chart.draw(dataTable, prototype.options());
        });
    }
}
