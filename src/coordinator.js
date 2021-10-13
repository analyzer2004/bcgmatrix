import ScatterChart from "./renderers/scatterchart.js";
import Cell from "./renderers/cell.js";
import Rule from "./renderers/rule.js";
import Grip from "./renderers/grip.js";

export default class Coordinator {
    constructor(chart) {
        this._chart = chart;
        this._svg = null;
        this._colors = new Colors();

        this._scatterChart = null;
        this._ruleX = null;
        this._ruleY = null;
        this._grip = null;

        this._questionMarks = null;
        this._stars = null;
        this._dogs = null;
        this._cows = null;
    }

    get chart() { return this._chart; }
    get width() { return this.chart.measures.width; }
    get height() { return this.chart.measures.height; }
    get svg() { return this._svg; }
    get colors() { return this._colors; }
    get scatterChart() { return this._scatterChart; }

    render() {
        this._renderSvg();
        this._renderBackground();

        this._renderLabels();
        this._scatterChart = new ScatterChart(this).render();
        this._renderRules();
    }

    _renderSvg() {
        const { width, height } = this;

        this._svg = d3.select(this.chart.container)
            .append("svg")
            .attr("viewBox", [0, 0, width, height])
            .attr("width", width)
            .attr("height", height);
        this.chart.measures.font.applyTo(this._svg);
    }

    _renderBackground() {
        this.renderRect(0, 0, this.width, this.height, this._colors.background);
    }

    _renderLabels() {
        const
            zones = this.chart.zones,
            { x, y, xr, yr, xc, yc } = this._getScales(),
            m = this.chart.measures.margin,
            w = this.width - m.right - xc,
            h = this.height - m.bottom - yc;
        
        this._questionMarks = new Cell(this._svg, xr[0], yr[1], w, h, zones.questionMarks).render();
        this._stars = new Cell(this._svg, xc, yr[1], w, h, zones.stars).render();
        this._dogs = new Cell(this._svg, xr[0], yc, w, h, zones.dogs).render();
        this._cows = new Cell(this._svg, xc, yc, w, h, zones.cows).render();
    }

    _renderRules() {
        const
            m = this.chart.measures.margin,
            w = this.width - m.right - m.left,
            h = this.height - m.bottom - m.top,
            { x, y, xr, yr, xc, yc } = this._getScales();

        this._ruleX = new Rule(this, xc, yr[0], xc, yr[1]);
        this._ruleX.onmove = xp => {
            const
                left = w - (w - xp) - m.left,
                right = w - left;
                
            this._questionMarks.width = left;
            this._dogs.width = left;
            this._stars.width = right;
            this._cows.width = right;
            this._stars.x = xp;            
            this._cows.x = xp;
            this._grip.x = xp;
            this._scatterChart.xLevel = x.invert(xp);
        }
        this._ruleX.render();

        this._ruleY = new Rule(this, xr[0], yc, xr[1], yc);
        this._ruleY.onmove = yp => {
            const
                top = h - (h - yp) - m.top,
                bottom = h - top;

            this._questionMarks.height = top;
            this._stars.height = top;
            this._dogs.height = bottom;
            this._cows.height = bottom;
            this._dogs.y = yp;
            this._cows.y = yp;
            this._grip.y = yp;
            this._scatterChart.yLevel = y.invert(yp);
        }
        this._ruleY.render();

        this._grip = new Grip(this, xc, yc);
        this._grip.onmove = (xp, yp) => {
            this._ruleX.position = xp;
            this._ruleY.position = yp;
        }
        this._grip.render();
    }

    _getScales() {
        const            
            x = this.chart.scales.x,
            y = this.chart.scales.y,
            xr = x.range(),
            yr = y.range(),
            xc = x(this.chart.scales.xDefault),
            yc = y(this.chart.scales.yDefault);
        return { x, y, xr, yr, xc, yc };
    }

    renderRect(x, y, width, height, fill, opacity) {
        return this._svg.append("rect")
            .attr("x", x)
            .attr("y", y)
            .attr("width", width)
            .attr("height", height)
            .attr("fill", fill)
            .attr("opacity", opacity);
    }
}

class Colors {
    constructor() {
        this.rule = "#aaa";
        this.text = "black";
        this.ticks = "black";
        this.background = "none";
    }
}