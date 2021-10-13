export default class Label {
    constructor(svg, x, y, icon, caption) {
        this._svg = svg;
        this._x = x;
        this._y = y;
        this._icon = icon;
        this._caption = caption;
        this._g = null;
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
        this._g = this._svg.append("g")
            .attr("opacity", 0.5)            
            .attr("font-size", "14pt")
            .attr("font-weight", "bold")
            .call(g => g.append("image")
                .attr("href", this._icon)
                .attr("width", 24)
                .attr("height", 24)
            )
            .call(g => g.append("text")
                .attr("x", 30)
                .attr("dy", "1em")
                .text(this._caption)
            );
        this._transform();
        return this;
    }

    _transform() {
        this._g.attr("transform", `translate(${this._x + 5},${this._y + 5})`);
    }
}