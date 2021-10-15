import { ScatterChart, Highlight } from "./renderers/scatterchart.js";
import Cell from "./renderers/cell.js";
import Rule from "./renderers/rule.js";
import Grip from "./renderers/grip.js";

export default class Coordinator {
    constructor(chart) {
        this._chart = chart;
        this._svg = null;
        this._colors = new Colors();

        this._scatterChart = new ScatterChart(this);
        this._ruleX = null;
        this._ruleY = null;
        this._grip = null;

        this._questionMarks = null;
        this._stars = null;
        this._dogs = null;
        this._cows = null;

        this.highlight = Highlight.none;
        this.showTicksOnRules = true;
        this.xInitValue = null;
        this.yInitValue = null;
        this.onrulechange = null;
    }

    get chart() { return this._chart; }
    get width() { return this.chart.measures.width; }
    get height() { return this.chart.measures.height; }
    get svg() { return this._svg; }
    get colors() { return this._colors; }
    get scatterChart() { return this._scatterChart; }

    render() {
        this._validateInitValues();
        this._renderSvg();
        this._renderBackground();

        this._renderLabels();
        this._renderScatterChart();
        this._renderRules();
    }

    dispose() {
        if (this._ruleX) this._ruleX.dispose();
        if (this._ruleY) this._ruleY.dispose();
        if (this._grip) this._grip.dispose();
    }

    _validateInitValues() {
        const
            x = this.chart.scales.x,
            y = this.chart.scales.y,
            validate = (scale, value, defaultValue) => {
                if (value) {
                    const domain = scale.domain();
                    return value >= domain[0] && value <= domain[1] ? value : defaultValue;
                }
                else {
                    return defaultValue;
                }
            }

        this.xInitValue = validate(x, this.xInitValue, this.chart.scales.xDefault);
        this.yInitValue = validate(y, this.yInitValue, this.chart.scales.yDefault);
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
            w = this.width - m.right,
            h = this.height - m.bottom;

        this._questionMarks = new Cell(this._svg, xr[0], yr[1], xc - xr[0], yc - yr[1], zones.questionMarks).render();
        this._stars = new Cell(this._svg, xc, yr[1], w - xc, yc - yr[1], zones.stars).render();
        this._dogs = new Cell(this._svg, xr[0], yc, xc - xr[0], h - yc, zones.dogs).render();
        this._cows = new Cell(this._svg, xc, yc, w - xc, h - yc, zones.cows).render();
        this._questionMarks.onclick = this._stars.onclick = this._dogs.onclick = this._cows.onclick = e => {
            this._scatterChart.hideAnnotation();
        };
    }

    _renderScatterChart() {
        this._scatterChart.xLevel = this.xInitValue;
        this._scatterChart.yLevel = this.yInitValue;
        this._scatterChart.highlight = this.highlight;
        this._scatterChart.showTooltip = this.showTooltip;
        this._scatterChart.showAnnotation = this.showAnnotation;
        this._scatterChart.render();
    }

    _renderRules() {
        const
            that = this,
            m = this.chart.measures.margin,
            w = this.width - m.right - m.left,
            h = this.height - m.bottom - m.top,
            { x, y, xr, yr, xc, yc } = this._getScales();
        
        this._ruleX = new Rule(this, xc, yr[0], xc, yr[1]);
        this._ruleX.showTicks = this.showTicksOnRules;
        this._ruleX.onmove = moveX;
        this._ruleX.onreset = resetX;
        this._ruleX.onchange = () => change(1, this._ruleX.position, this._ruleX.value);
        this._ruleX.render();
        
        this._ruleY = new Rule(this, xr[0], yc, xr[1], yc);
        this._ruleY.showTicks = this.showTicksOnRules;
        this._ruleY.onmove = moveY;
        this._ruleY.onreset = resetY;
        this._ruleY.onchange = () => change(2, this._ruleY.position, this._ruleY.value);
        this._ruleY.render();

        this._grip = new Grip(this, xc, yc);
        this._grip.onmove = (xp, yp) => {
            this._ruleX.position = xp;
            this._ruleY.position = yp;
        }
        this._grip.onreset = e => {
            resetX();
            resetY();
        }
        this._grip.onchange = () => {
            change(1, this._ruleX.position, this._ruleX.value);
            change(2, this._ruleY.position, this._ruleY.value);
        }
        this._grip.render();

        function moveX(xp) {
            const
                left = w - (w - xp) - m.left,
                right = w - left;

            that._questionMarks.width = left;
            that._dogs.width = left;
            that._stars.width = right;
            that._cows.width = right;
            that._stars.x = xp;
            that._cows.x = xp;
            that._grip.x = xp;
            that._scatterChart.xLevel = x.invert(xp);
        }

        function resetX(e) {
            d3.select(that._ruleX)
                .transition()
                .duration(500)
                .ease(d3.easeBounce)
                .attr("position", xc)
                .on("end", () => that._ruleX.hideLabel());
        }

        function moveY(yp) {
            const
                top = h - (h - yp) - m.top,
                bottom = h - top;

            that._questionMarks.height = top;
            that._stars.height = top;
            that._dogs.height = bottom;
            that._cows.height = bottom;
            that._dogs.y = yp;
            that._cows.y = yp;
            that._grip.y = yp;
            that._scatterChart.yLevel = y.invert(yp);
        }

        function resetY(e) {
            d3.select(that._ruleY)
                .transition()
                .duration(500)
                .ease(d3.easeBounce)
                .attr("position", yc)
                .on("end", () => that._ruleY.hideLabel());
        }

        function change(id, pos, value) {
            if (that.onrulechange) that.onrulechange(id, pos, value);
        }
    }

    _getScales() {
        const
            x = this.chart.scales.x,
            y = this.chart.scales.y,
            xr = x.range(),
            yr = y.range(),
            xc = x(this.xInitValue),
            yc = y(this.yInitValue);
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