import BaseRenderer from "./baserenderer.js";

export default class Movable extends BaseRenderer {
    constructor(coordinator) {
        super(coordinator);
        this._coordinator = coordinator;

        this.down = false;
        this.onmove = null;
        this.onreset = null;
        this.onchange = null;

        this.handlePointerMove = this.handlePointerMove.bind(this);
        this.handlePointerUp = this.handlePointerUp.bind(this);
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
        document.addEventListener("pointermove", this.handlePointerMove);
        document.addEventListener("pointerup", this.handlePointerUp);
        this.transform();
        return this;
    }

    dispose() {
        document.removeEventListener("pointermove", this.handlePointerMove);
        document.removeEventListener("pointerup", this.handlePointerUp);
    }

    invertX(x) { return this.scales.x.invert(x); }
    invertY(y) { return this.scales.y.invert(y); }

    // for d3.transition
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
        if (this.down && this.onchange) this.onchange();
        this.down = false;
    }

    _convertPosition(e) {
        const p = this.svg.node().createSVGPoint();
        p.x = e.clientX;
        p.y = e.clientY;
        return p.matrixTransform(this.svg.node().getScreenCTM().inverse());
    }
}