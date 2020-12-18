declare const google: Google;

interface Google {
    charts: {
        load: (a: string, b: {}) => void;
        setOnLoadCallback: Function;
    };

    visualization: {
        DataTable: any;
        LineChart: any;
        PieChart: any;
    }
}

interface DataForm {
    [d: string]: any; 
}

interface ChartData {
    [d: string]: {
        type: string;
        form: DataForm,
        options: Function;
        data: {} | null;
        element: HTMLElement | null;
    }
}

export default class GoogleCharts {

    public readonly packages: string[];
    public readonly charts: ChartData = {};
    public readonly src: Google = google;

    public constructor(...packages: string[]) {
        this.packages = packages;
        this.charts = {};
        this.src = google;

        this.src.charts.load("current", { "packages": packages });
    }

    public set(chartName: string, type: string, dataForm: DataForm, options: Function, defaultDataForm?: {}, defaultRenderEl?: HTMLLIElement): void {
        this.charts[chartName] = {
            "type": type,
            "form": dataForm,
            "options": options,
            "data": defaultDataForm ?? null,
            "element": defaultRenderEl ?? null
        };
    }

    public render(chartName: string, data: {}, toRenderEl: HTMLElement): void {
        this.src.charts.setOnLoadCallback(() => {
            const prototype = this.charts[chartName];
            const dataTable = new this.src.visualization.DataTable();
    
            for (const header in prototype.form) {
                dataTable.addColumn(prototype.form[header].name.toLowerCase(), header);
            }
    
            dataTable.addRows(data);
    
            let chart;
            switch (prototype.type) {
                case "line-chart": chart = new this.src.visualization.LineChart(toRenderEl); break;
                case "pie-chart": chart = new this.src.visualization.PieChart(toRenderEl); break;
            }
    
            chart.draw(dataTable, prototype.options());
        });
    }
}