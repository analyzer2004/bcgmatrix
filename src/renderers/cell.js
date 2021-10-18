export default class Cell {
    constructor(svg, x, y, width, height, zone) {
        this._svg = svg;
        this._x = x;
        this._y = y;
        this._width = width;
        this._height = height;
        this._color = null;
        this._zone = zone;

        this._g = null;
        this._rect = null;
        this._label = null;
        this.onclick = null;
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
    get width() { return this._width; }
    set width(_) {
        this._width = _;
        this._transform();
    }
    get height() { return this._height; }
    set height(_) {
        this._height = _;
        this._transform();
    }
    get color() { return this._color; }
    set color(_) {
        this._color = _;
        this._rect.attr("fill", this._color);
    }

    render() {
        this._g = this._svg.append("g")
            .call(g => {
                this._rect = g.append("rect")
                    .attr("fill", this._zone.color)
                    .attr("opacity", 0.2);

                this._label = g.append("g")
                    .attr("transform", "translate(5,5)")
                    .attr("opacity", 0.5)
                    .attr("font-size", "14pt")
                    .attr("font-weight", "bold")
                    .call(g => g.append("image")
                        .attr("href", this._zone.icon)
                        .attr("width", 24)
                        .attr("height", 24)
                    )
                    .call(g => g.append("text")
                        .attr("x", 30)
                        .attr("dy", "1em")
                        .text(this._zone.caption)
                    );
            })
            .on("click", e => { if (this.onclick) this.onclick(e); })

        this._transform();
        return this;
    }

    _transform() {
        this._g.attr("transform", `translate(${this._x},${this._y})`);
        this._rect
            .attr("width", this._width)
            .attr("height", this._height);
    }
}