import Movable from "./movable.js";

export default class Rule extends Movable {
    constructor(coordinator, x1, y1, x2, y2) {
        super(coordinator);
        this._x1 = x1;
        this._y1 = y1;
        this._x2 = x2;
        this._y2 = y2;
        this._isVertical = x1 === x2;
        this._gravity = 7;

        this._g = null;
        this._label = null;
        this.showTicks = true;
        this.onchange = null;
    }

    get position() { return this._isVertical ? this._x1 : this._y1; }
    set position(_) {
        const p = new DOMPoint();
        p.x = this._isVertical ? _ : 0;
        p.y = this._isVertical ? 0 : _;
        this.move(p);
    }
    get value() { return this._isVertical ? this.invertX(this._x1) : this.invertY(this._y1); }

    render() {
        const
            scale = this._isVertical ? this.scales.y : this.scales.x,
            ticks = this._isVertical ? this.scales.yTicks : this.scales.xTicks,
            format = this._isVertical ? this.chartData.fieldFormats.y : this.chartData.fieldFormats.x;

        this._g = this.svg.append("g")
            .call(g => {
                g.append("line")
                    .attr("stroke", "#aaa")
                    .attr("stroke-width", 2)
                    .attr("stroke-dasharray", "2")
                    .attr("x1", this._isVertical ? 0 : this._x1)
                    .attr("y1", this._isVertical ? this._y1 : 0)
                    .attr("x2", this._isVertical ? 0 : this._x2)
                    .attr("y2", this._isVertical ? this._y2 : 0)
                    .clone()
                    .attr("stroke-width", 7)
                    .attr("stroke-dasharray", "")
                    .attr("opacity", 0)
                    .style("cursor", this._isVertical ? "col-resize" : "row-resize");

                this._label = g.append("text")
                    .attr("font-family", "sans-serif")
                    .attr("font-weight", "bold")
                    .attr("font-size", 11)
                    .attr("opacity", 0);

                if (this.showTicks) {
                    g.selectAll(".tick")
                        .data(ticks.slice(1, ticks.length - 1))
                        .join("text")
                        .attr("class", "tick")
                        .attr("text-anchor", "middle")
                        .attr("dy", "0.32em")
                        .attr("stroke", "white")
                        .attr("stroke-width", 2)
                        .attr(this._isVertical ? "y" : "x", d => d)
                        .text(d => d3.format(format.short)(scale.invert(d)))
                        .clone()
                        .attr("stroke", "none")
                        .attr("stroke-width", 0)
                        .attr("fill", "#aaa")
                        .text(d => d3.format(format.short)(scale.invert(d)));
                }
            });
        return super.render(this._g);
    }

    move(p) {
        const formats = this.chartData.fieldFormats;
        if (this._isVertical) {
            const
                x = this._stick(p.x, this.scales.xTicks),
                xt = d3.format(formats.x.long)(this.invertX(x)),
                len = this.measures.calcStringWidth(xt),
                exceed = p.x + len > this.xRange[1];

            this._x1 = this._x2 = x;
            this._label
                .attr("x", exceed ? -5 : 5)
                .attr("y", p.y !== 0 ? p.y : this._y1 - 5)
                .attr("opacity", 1)
                .attr("text-anchor", exceed ? "end" : "start")
                .text(xt);
            if (this.onmove) this.onmove(x);
        }
        else {
            const y = this._stick(p.y, this.scales.yTicks);
            this._y1 = this._y2 = y;
            this._label
                .attr("y", -5)
                .attr("x", p.x !== 0 ? p.x : this.xRange[0] + 5)
                .attr("opacity", 1)
                .text(d3.format(formats.y.long)(this.invertY(y)));
            if (this.onmove) this.onmove(y);
        }
        this.transform();
    }

    testBoundary(p) {
        const { xRange, yRange } = this;
        return this._isVertical
            ? p.x >= xRange[0] && p.x <= xRange[1]
            : p.y >= yRange[1] && p.y <= yRange[0];
    }

    handlePointerUp(e) {        
        super.handlePointerUp(e);
        this.hideLabel();        
    }

    transform() {
        if (this._isVertical) {
            this._g.attr("transform", `translate(${this._x1},0)`);
        }
        else {
            this._g.attr("transform", `translate(0,${this._y1})`);
        }
    }

    hideLabel() {
        this._label.attr("opacity", 0);
    }

    _stick(v, ticks) {
        for (let i = 0; i < ticks.length; i++) {
            const tick = ticks[i];
            if (v >= tick - this._gravity && v <= tick + this._gravity) return tick;
        }
        return v;
    }
}