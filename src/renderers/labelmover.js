export default class LabelMover {
    constructor(scatterChart) {
        this._chart = scatterChart;
        this._x1 = 0;
        this._y1 = 0;
        this._x2 = 0;
        this._y2 = 0;
        this._bubbles = [];
        this._maxPass = 30;
    }

    run() {
        this._initialize();

        let
            pass = 1,
            clogs = this._findClogs(this._bubbles);

        while (clogs.length > 0 && pass <= this._maxPass) {
            clogs.sort((a, b) => b.clogs.length - a.clogs.length);
            clogs.forEach(b => b.unclog(this._bubbles, pass));
            clogs = this._findClogs(this._bubbles);
            pass++;
        }
    }

    _initialize() {
        const
            that = this,
            xr = this._chart.x.range(),
            yr = this._chart.y.range();

        this._x1 = xr[0];
        this._y1 = xr[1];
        this._x2 = yr[0];
        this._y2 = yr[1];

        this._chart.dots.each(function (d, i) {
            that._bubbles.push(new Bubble(that._chart, d3.select(this)));
        });
    }

    _findClogs() {
        this._bubbles.forEach(bubble => bubble.findClogs(this._bubbles));
        return this._bubbles.filter(b => b.clogs.length > 0);
    }
}

class Bubble {
    constructor(chart, g) {
        this._chart = chart;
        this._group = g;
        this._circle = new Block(g.select("circle"));
        this._text = new Block(g.select("text"));
        this._link = null;
        this._boundary = new Boundary(g.node().getBoundingClientRect());
        this._border = new Boundary(this.svg.node().getBoundingClientRect());

        this._clogs = [];
    }

    get svg() { return this._chart.svg; }
    get circle() { return this._circle; }
    get text() { return this._text; }
    get boundary() { return this._boundary; }
    get clogs() { return this._clogs; }
    get label() { return this._text.object.text(); }

    overlaps(target) {
        return this._text.boundary.overlaps(target.text.boundary)
            || this._text.boundary.overlaps(target.circle.boundary);
    }

    findClogs(bubbles) {
        this._clogs = bubbles.filter(bubble => bubble !== this && bubble.text.isValid && this.overlaps(bubble));
    }

    unclog(bubbles, factor) {
        this.findClogs(bubbles);
        if (this._clogs.length > 0) {
            const dir = this._moveText(bubbles, factor);
            if (dir) {
                const
                    dx = this._text.boundary.x1 - this._boundary.x1,
                    dy = this._text.boundary.y1 - this._boundary.y1 - (this._circle.boundary.height - this._text.boundary.height) / 2;

                this._text.object.attr("dx", dx).attr("dy", dy);
                this._text.boundary = new Boundary(this._text.object.node().getBoundingClientRect());
                this._boundary = new Boundary(this._group.node().getBoundingClientRect());
                this._addLink(dir);
            }
        }
    }

    _moveText(bubbles, factor) {
        const
            that = this,
            margin = this._chart.margin,
            clogBoundary = this._circle.boundary.join(this._clogs.map(b => b.boundary)),
            textBoundary = this._text.boundary,
            backup = textBoundary.clone();

        // debug
        //this._plotBoundary(clogBoundary);
        const
            none = null,
            up = clogBoundary.y1 - 20 * factor,
            down = clogBoundary.y2 + 20 * factor,
            left = clogBoundary.x1 - textBoundary.width / 2 - 5 * factor,
            right = clogBoundary.x2 + 5 * factor;

        /*
        if (move(none, up)) return Direction.up;
        if (move(none, down)) return Direction.down;
        if (move(left, none)) return Direction.left;
        if (move(right, none)) return Direction.right;
        if (move(left, up)) return Direction.up | Direction.left;
        if (move(right, up)) return Direction.up | Direction.right;                
        if (move(left, down)) return Direction.down | Direction.left;
        if (move(right, down)) return Direction.down | Direction.right;
        */

        const movers = [
            shuffle([
                { func: () => move(none, up), dir: Direction.up },
                { func: () => move(none, down), dir: Direction.down },
                { func: () => move(left, none), dir: Direction.left },
                { func: () => move(right, none), dir: Direction.right },
            ]),
            shuffle([
                { func: () => move(left, up), dir: Direction.up | Direction.left },
                { func: () => move(right, up), dir: Direction.up | Direction.right },
                { func: () => move(left, down), dir: Direction.down | Direction.left },
                { func: () => move(right, down), dir: Direction.down | Direction.right },
            ])
        ];

        for (let i = 0; i < movers.length; i++) {
            const set = movers[i];
            for (let j = 0; j < set.length; j++) {
                const m = set[j];
                if (m.func()) return m.dir;
            }
        }

        textBoundary.copyFrom(backup);
        return Direction.none;

        function move(x, y) {
            const p = 5; // padding
            if (x && x < that._border.x1 + margin.left + p) x = that._border.x1 + margin.left + p;
            if (x && x + textBoundary.width > that._border.x2 - margin.right - p) x = that._border.x2 - margin.right - textBoundary.width - p;
            if (y && y < that._border.y1 + margin.top + p) y = that._border.y1 + margin.top + p;
            if (y && y + textBoundary.height > that._border.y2 - margin.bottom - p) y = that._border.y2 - margin.bottom - textBoundary.height - p;

            textBoundary.copyFrom(backup);
            textBoundary.moveTo(x, y);
            return pass();
        }

        function pass() {
            for (let i = 0; i < bubbles.length; i++) {
                const bubble = bubbles[i];
                if (that !== bubble && that.overlaps(bubble)) return false;
            }
            return true;
        }

        function shuffle(a) {
            for (let i = a.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [a[i], a[j]] = [a[j], a[i]];
            }
            return a;
        }
    }

    _addLink(dir) {
        let [x1, y1] = this._convertPoint(this._text.boundary.x1, this._text.boundary.y1);
        let [x2, y2] = this._convertPoint(this._circle.boundary.x1, this._circle.boundary.y1);

        const
            up = (dir & Direction.up) === Direction.up,
            down = (dir & Direction.down) === Direction.down,
            left = (dir & Direction.left) === Direction.left,
            right = (dir & Direction.right) === Direction.right;

        // trim y
        if (up && !left && !right) y1 += this._text.boundary.height / 2 + 4;
        //else if (down && !left && !right) y1 -= 1;
        else y1 = y1 + this._text.boundary.height / 2;

        // trim x
        if (left) x1 += this._text.boundary.width + 2.5;
        else if (right) x1 -= 2.5;
        else x1 = x1 + this._text.boundary.width / 2;

        x2 = x2 + this._circle.boundary.width / 2;
        y2 = y2 + this._circle.boundary.width / 2;

        if (this._link) this._link.remove();
        this._link = this.svg.select(".connectors")
            .append("line")
            .attr("x1", x1)
            .attr("y1", y1)
            .attr("x2", x2)
            .attr("y2", y2)
            .attr("stroke", "black")
            .attr("stroke-width", 0.5)
            .attr("stroke-dasharray", "2")
            .attr("text", this.label);
    }

    _convertPoint(x, y) {
        const p = this.svg.node().createSVGPoint();
        p.x = x;
        p.y = y;
        const pp = p.matrixTransform(this.svg.node().getScreenCTM().inverse());
        return [pp.x, pp.y];
    }

    // debug
    _plotBoundary(b) {
        const [x, y] = this._convertPoint(b.x1, b.y1);
        this.svg.select(".connectors")
            .append("rect")
            .attr("x", x)
            .attr("y", y)
            .attr("width", b.width)
            .attr("height", b.height)
            .attr("stroke", "blue")
            .attr("stroke-width", 1)
            .attr("fill", "none");
    }
}

class Block {
    constructor(elem) {
        this._object = elem;
        this.boundary = elem.node()
            ? new Boundary(elem.node().getBoundingClientRect())
            : Boundary.empty;
    }

    get object() { return this._object; }
    get isValid() { return this._object && this._object.node(); }

    overlaps(target) {
        return this.boundary.overlaps(target.boundary);
    }
}

class Boundary {
    constructor(clientRect) {
        this.x1 = clientRect.left;
        this.y1 = clientRect.top;
        this.x2 = clientRect.right;
        this.y2 = clientRect.bottom;
    }

    get width() { return Math.abs(this.x2 - this.x1); }
    get height() { return Math.abs(this.y2 - this.y1); }
    static get empty() { return new Boundary({ left: 0, top: 0, right: 0, bottom: 0 }); }

    overlaps(target) {
        const { x1, y1, x2, y2 } = this;
        let a = 0, b = 0;
        if (target.x1 >= x1 && target.x1 <= x2) a++;
        if (target.x2 >= x1 && target.x2 <= x2) a++;
        if (target.y1 >= y1 && target.y1 <= y2) b++;
        if (target.y2 >= y1 && target.y2 <= y2) b++;
        return a !== 0 && b !== 0;
    }

    join(targets) {
        return new Boundary({
            left: Math.min(...[this.x1, ...targets.map(t => t.x1)]),
            top: Math.min(...[this.y1, ...targets.map(t => t.y1)]),
            right: Math.max(...[this.x2, ...targets.map(t => t.x2)]),
            bottom: Math.max(...[this.y2, ...targets.map(t => t.y2)])
        });
    }

    moveTo(x, y) {
        if (x) {
            this.x2 = x + this.width;
            this.x1 = x;
        }

        if (y) {
            this.y2 = y + this.height;
            this.y1 = y;
        }
    }

    clone() {
        return { ...this };
    }

    copyFrom(source) {
        this.x1 = source.x1;
        this.x2 = source.x2;
        this.y1 = source.y1;
        this.y2 = source.y2;
    }
}

class Direction {
    static get none() { return 0; }
    static get up() { return 1; }
    static get down() { return 2; }
    static get left() { return 4; }
    static get right() { return 8; }
}