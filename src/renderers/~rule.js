import BaseRenderer from "./baserenderer.js";

export default class Rule extends BaseRenderer {
    constructor(coordinator, x1, y1, x2, y2) {
        super(coordinator);
        this._x1 = x1;
        this._y1 = y1;
        this._x2 = x2;
        this._y2 = y2;
        this._sx = this.chart.scales.x;
        this._sy = this.chart.scales.y;
        this._xTicks = this._sx.ticks().map(d => this._sx(d));
        this._yTicks = this._sy.ticks().map(d => this._sy(d));
        this._isVertical = x1 === x2;

        this._g = null;
        this._label = null;
        this._down = false;

        this.onmove = null;
    }

    get position() { return this._isVertical ? this._x1 : this._y1; }
    set position(_) {
        const p = new DOMPoint();
        p.x = this._isVertical ? _ : 0;
        p.y = this._isVertical ? 0 : _;
        this._move(p);
    }

    render() {
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
                    .attr("font-size", 12)
                    .attr("opacity", 0);
            })
            .on("pointerdown", this._handlePointerDown.bind(this));
        document.addEventListener("pointermove", this._handlePointerMove.bind(this));
        document.addEventListener("pointerup", this._handlePointerUp.bind(this));
        this._transform();
        return this;
    }

    _handlePointerDown(e) {
        e.preventDefault();
        e.stopPropagation();
        this._down = true;
    }

    _handlePointerMove(e) {
        if (this._down) {
            const cp = this._convertPosition(e);
            this._move(cp);
        }
    }

    _move(p) {
        if (this._testBoundary(p)) {
            if (this._isVertical) {
                const x = this._stick(p.x, this._xTicks);
                this._x1 = this._x2 = x;
                this._label
                    .attr("x", 5)
                    .attr("y", p.y !== 0 ? p.y : this._y1 - 5)
                    .attr("opacity", 1)
                    .text(this._sx.invert(x));
                if (this.onmove) this.onmove(x);
            }
            else {
                const y = this._stick(p.y, this._yTicks);
                this._y1 = this._y2 = y;
                this._label
                    .attr("y", -5)
                    .attr("x", p.x !== 0 ? p.x : this._sx.range()[0] + 5)
                    .attr("opacity", 1)
                    .text(this._sy.invert(y));
                if (this.onmove) this.onmove(y);
            }
            this._transform();
        }
    }

    _stick(v, ticks) {
        for (let i = 0; i < ticks.length; i++) {
            const tick = ticks[i];
            if (v >= tick - 5 && v <= tick + 5) return tick;
        }
        return v;
    }

    _transform() {
        if (this._isVertical) {
            this._g.attr("transform", `translate(${this._x1},0)`);
        }
        else {
            this._g.attr("transform", `translate(0,${this._y1})`);
        }
    }

    _handlePointerUp(e) {
        this._down = false;
        this._label.attr("opacity", 0);
    }

    _convertPosition(e) {
        const p = this.svg.node().createSVGPoint();
        p.x = e.clientX;
        p.y = e.clientY;
        return p.matrixTransform(this.svg.node().getScreenCTM().inverse());
    }

    _testBoundary(p) {
        return this._isVertical
            ? p.x >= this._sx.range()[0] && p.x <= this._sx.range()[1]
            : p.y >= this._sy.range()[1] && p.y <= this._sy.range()[0];
    }
}