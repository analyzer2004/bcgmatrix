export default class BaseRenderer {
    constructor(coordinator) {
        this._coordinator = coordinator;
    }

    get coordinator() { return this._coordinator; }
    get chart() { return this._coordinator.chart; }
    get svg() { return this._coordinator.svg; }

    get chartData() { return this.chart.chartData; }
    get measures() { return this.chart.measures; }
    get scales() { return this.chart.scales; }
    get font() { return this.measures.font; }

    get margin() { return this.measures.margin; }
    get chartWidth() { return this.measures.width; }
    get chartHeight() { return this.measures.height; }
    

    renderRect(x, y, width, height, fill, opacity) {
        return this._coordinator.renderRect(x, y, width, height, fill, opacity);
    }
}