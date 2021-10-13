import BaseRenderer from "./baserenderer.js";

export default class Grip extends BaseRenderer {
    constructor(coordinator, x, y) {
        super(coordinator);
        this._r = 10;
        this._x = x;
        this._y = y;
        this._sx = this.chart.scales.x;
        this._sy = this.chart.scales.y;
        this._circle = null;

        this._down = false;
        this.onmove = null;
    }

    get x() { return this._x; }
    set x(_) {
        this._x = _;
        this._transform();
    }

    get y() { return this._y; }
    set y(_) {
        this._y = _;
        this._transform();
    }

    render() {
        this._circle = this.svg.append("circle")
            .attr("cx", this._r)
            .attr("cy", this._r)
            .attr("r", this._r)
            .attr("opacity", 0)
            .style("cursor", "all-scroll")
            .on("pointerdown", this._handlePointerDown.bind(this));
        document.addEventListener("pointermove", this._handlePointerMove.bind(this));
        document.addEventListener("pointerup", this._handlePointerUp.bind(this));
        this._transform();
        return this;
    }

    _transform() {
        this._circle.attr("transform", `translate(${this._x - this._r},${this._y - this._r})`);
    }

    _handlePointerDown(e) {
        e.preventDefault();
        e.stopPropagation();
        this._down = true;
    }

    _handlePointerMove(e) {
        if (this._down) {
            const cp = this._convertPosition(e);
            if (this._testBoundary(cp)) {
                this._x = cp.x;
                this._y = cp.y;
                this._transform();
                if (this.onmove) this.onmove(cp.x, cp.y);
            }
        }
    }

    _handlePointerUp(e) {
        this._down = false;
    }

    _convertPosition(e) {
        const p = this.svg.node().createSVGPoint();
        p.x = e.clientX;
        p.y = e.clientY;
        return p.matrixTransform(this.svg.node().getScreenCTM().inverse());
    }

    _testBoundary(p) {
        return p.x >= this._sx.range()[0] && p.x <= this._sx.range()[1] && p.y >= this._sy.range()[1] && p.y <= this._sy.range()[0];
    }
}