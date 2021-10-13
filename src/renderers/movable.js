import BaseRenderer from "./baserenderer.js";

export default class Movable extends BaseRenderer {
    constructor(coordinator) {
        super(coordinator);
        this._coordinator = coordinator;

        this.down = false;
        this.onmove = null;
        this.onreset = null;
    }

    get xRange() { return this.scales.x.range(); }
    get yRange() { return this.scales.y.range(); }

    render(elem) {
        if (elem) {
            elem.on("pointerdown", this.handlePointerDown.bind(this));
            if (this.onreset) {
                this.reset();
                elem.on("dblclick", e => this.onreset(e));
            }
        }
        document.addEventListener("pointermove", this.handlePointerMove.bind(this));
        document.addEventListener("pointerup", this.handlePointerUp.bind(this));
        this.transform();
        return this;
    }

    invertX(x) { return this.scales.x.invert(x); }
    invertY(y) { return this.scales.y.invert(y); }
    
    getAttribute(name) { return this[name]; }
    setAttribute(name, value) { if (this[name]) this[name] = value; }        

    transform() { }

    move(p) { }

    reset() { }

    testBoundary(p) { }

    handlePointerDown(e) {
        e.preventDefault();
        e.stopPropagation();
        this.down = true;
    }

    handlePointerMove(e) {
        if (this.down) {
            const cp = this._convertPosition(e);
            if (this.testBoundary(cp)) this.move(cp);
        }
    }

    handlePointerUp(e) {
        this.down = false;
    }

    _convertPosition(e) {
        const p = this.svg.node().createSVGPoint();
        p.x = e.clientX;
        p.y = e.clientY;
        return p.matrixTransform(this.svg.node().getScreenCTM().inverse());
    }
}