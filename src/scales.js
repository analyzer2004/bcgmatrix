class Scales {
    constructor(chart) {
        this._chart = chart;
        this.xScaleType = ScaleType.linear;
        this.yScaleType = ScaleType.linear;
        this.xExponent = 1;
        this.yExponent = 1;

        this._x = null;
        this._y = null;
        this._radius = null;

        this.dotRadius = 5;
        this.bubbleRadiusRange = [5, 30];

        this._xTicks = [];
        this._yTicks = [];
    }

    get x() { return this._x; }
    get y() { return this._y; }
    get radius() { return this._radius; }
    get isBubble() {
        const r = this._chart.chartData.extents.radius;
        return !(r[0] === 0 && r[1] === 0);
    }

    get xTicks() { return this._xTicks; }
    get yTicks() { return this._yTicks; }
    get xDefault() { return this._x ? this._calcMidPoint(this._x) : 0; }
    get yDefault() { return this._y ? this._calcMidPoint(this._y) : 0; }

    initialize() {
        const
            data = this._chart.chartData,
            measures = this._chart.measures,
            margin = measures.margin;

        this._x = ScaleType.getScale(this.xScaleType, data.extents.x, [margin.left, measures.width - margin.right], true, this.xExponent);
        this._y = ScaleType.getScale(this.yScaleType, data.extents.y, [measures.height - margin.bottom, margin.top], true, this.yExponent);
        this._radius = this.isBubble
            ? d3.scaleLinear().domain(data.extents.radius).range(this.bubbleRadiusRange)
            : _ => this.dotRadius;

        this._xTicks = this._x.ticks().map(d => this._x(d));
        this._yTicks = this._y.ticks().map(d => this._y(d));
    }

    _calcMidPoint(scale) {
        const ticks = scale.ticks();
        return ticks[0] + (ticks[ticks.length - 1] - ticks[0]) / 2;
    }
}

class ScaleType {
    static get linear() { return 0; }
    static get log() { return 1; }
    static get sqrt() { return 2; }
    static get pow() { return 3; }
    static getScale(type, domain, range, nice, exponent) {
        const names = ["Linear", "Log", "Sqrt", "Pow"];
        let scale = d3[`scale${names[type]}`]();
        if (!scale) scale = d3.scaleLinear();        
        if (type === ScaleType.log && domain.length === 2) {
            if (domain[0] === 0) domain[0] = 1;
        }
        else if (type === ScaleType.pow) {
            scale.exponent(exponent);
        }
        scale.domain(domain).range(range);
        return nice ? scale.nice() : scale;
    }
}

export { Scales, ScaleType };