import Movable from "./movable.js";

export default class Grip extends Movable {
    constructor(coordinator, x, y) {
        super(coordinator);
        this._r = 10;
        this._x = x;
        this._y = y;
        this._circle = null;
    }

    get x() { return this._x; }
    set x(_) {
        if (this._x !== _) {
            this._x = _;
            this.transform();
        }
    }

    get y() { return this._y; }
    set y(_) {
        if (this._y !== _) {
            this._y = _;
            this.transform();
        }
    }

    render() {
        this._circle = this.svg.append("circle")
            .attr("cx", this._r)
            .attr("cy", this._r)
            .attr("r", this._r)
            .attr("opacity", 0)
            .style("cursor", "all-scroll");            
        return super.render(this._circle);        
    }

    transform() {
        this._circle.attr("transform", `translate(${this._x - this._r},${this._y - this._r})`);
    }

    move(p) {
        this._x = p.x;
        this._y = p.y;
        this.transform();
        if (this.onmove) this.onmove(p.x, p.y);
    }

    testBoundary(p) {
        const { xRange, yRange } = this;
        return p.x >= xRange[0] && p.x <= xRange[1] && p.y >= yRange[1] && p.y <= yRange[0];
    }
}