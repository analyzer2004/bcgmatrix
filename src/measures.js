class Measures {
    constructor(chart) {
        this._chart = chart;
        this.font = new Font();
        this.width = 1024;
        this.height = 768;
        this.margin = new Margin();

        this._measureText = null;
        this._charBox = null;
        this._tickSpace = 10;
    }

    get charBox() { return this._charBox; }
    get tickSpace() { return this._tickSpace; }

    initialize() {
        this._createMeasureText();
        this._charBox = this.getBBox("M");
        this._calcMargins();
    }

    getBBox(str, font) {
        const
            f = font ?? this.font,
            text = this._measureText;

        f.applyTo(text);
        text.text(str);        
        return text.node().getBBox();
    }

    calcStringWidth(str, font) {
        const b = this.getBBox(str, font);
        return b ? b.width : str.length * 10;
    }

    calcMaxWidth(array, font) {
        return Math.max(...array.map(s => this.calcStringWidth(s, font)));
    }

    _createMeasureText() {
        this._measureText = d3.select(this._chart.container)
            .append("svg")
            .attr("width", 0)
            .attr("height", 0)
            .style("position", "absolute")
            .style("visibility", "hidden")
            .append("text");
    }

    _calcMargins() {
        const            
            chartData = this._chart.chartData,
            extents = chartData.extents,
            formats = chartData.fieldFormats;

        this.margin.left = this.calcMaxWidth(extents.y.map(d => d3.format(formats.y.short)(d))) + this._tickSpace + this._charBox.height;
        this.margin.bottom = this._charBox.height * 2 + this._tickSpace;
    }
}

class Margin {
    constructor() {
        this.left = 50;
        this.top = 20;
        this.right = 20;
        this.bottom = 20;
    }
}

class Font {
    constructor(family = "Sans-serif", size = "12", style = "normal", weight = "normal") {
        this._family = family;
        this._size = size;
        this._style = style;
        this._weight = weight;
    }

    family(_) { return arguments.length ? (this._family = _, this) : this._family; }
    size(_) { return arguments.length ? (this._size = _, this) : this._size; }
    style(_) { return arguments.length ? (this._style = _, this) : this._style; }
    weight(_) { return arguments.length ? (this._weight = _, this) : this._weight; }

    applyTo(elem) {
        elem = elem instanceof HTMLElement ? d3.select(elem) : elem;
        elem.style("font-family", this._family)
            .style("font-size", isNaN(+this._size) ? this._size : `${this._size}pt`)
            .style("font-style", this._style)
            .style("font-weight", this._weight);
    }

    clone() {
        return new Font(this._family, this._size, this._style, this._weight);
    }

    copyFrom(source) {
        if (source) {
            if (source.family) this._family = source.family;
            if (source.size) this._size = source.size;
            if (source.style) this._style = source.style;
            if (source.weight) this._weight = source.weight;
        }
    }
}

export { Measures, Font }