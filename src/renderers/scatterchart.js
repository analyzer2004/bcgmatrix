import BaseRenderer from "./baserenderer.js";

export default class ScatterChart extends BaseRenderer {
    constructor(coordinator) {
        super(coordinator);
        this._dots = null;
        this._xLevel = this.scales.xDefault;
        this._yLevel = this.scales.yDefault;

        this.onhover = null;
        this.onleave = null;
        this.onclick = null;
    }

    get x() { return this.scales.x; }
    get y() { return this.scales.y; }
    get r() { return this.scales.radius; }
    get xLevel() { return this._xLevel; }
    set xLevel(_) {
        if (this._xLevel !== _) {
            this._xLevel = _;
            this._updateColor();
        }

    }
    get yLevel() { return this._yLevel; }
    set yLevel(_) {
        if (this._yLevel !== _) {
            this._yLevel = _;
            this._updateColor();
        }
    }
    get dots() { return this._dots; }
    get formats() { return this.chartData.fieldFormats; }


    render() {
        this._renderXAxis();
        this._renderYAxis();
        this._renderDots();

        return this;
    }

    _renderXAxis() {
        const xr = this.x.range();

        this.svg.append("g")
            .call(this._xAxis.bind(this))
            .call(g => g.append("text")
                .attr("transform", `translate(0,${this.measures.charBox.height + this.measures.tickSpace})`)
                .attr("x", xr[0] + (xr[1] - xr[0]) / 2)
                .attr("y", "1em")                
                .attr("font-weight", "bold")
                .attr("fill", this.coordinator.colors.text)
                .text(`${this.chartData.fieldInfos.x.label} →`)
            );
    }

    _renderYAxis() {
        const
            yr = this.y.range(),
            y = yr[0] + (yr[1] - yr[0]) / 2;

        this.svg.append("g")
            .call(this._yAxis.bind(this))
            .call(g => g.append("text")                
                .attr("transform", `translate(-${this.margin.left},${y}) rotate(-90,0,0)`)                                
                .attr("text-anchor", "middle")                
                .attr("font-weight", "bold")
                .attr("dy", "1em")
                .attr("fill", this.coordinator.colors.text)
                .text(`${this.chartData.fieldInfos.y.label} →`)
            );
    }

    _renderDots() {
        const names = this.chartData.fieldNames;

        this._dots = this.svg.append("g")
            .selectAll(".dot")
            .data(this.chartData.dataset)
            .join("circle")
            .attr("class", "dot")
            .attr("cx", d => this.x(d[names.x]))
            .attr("cy", d => this.y(d[names.y]))
            .attr("stroke-width", 2)
            .attr("opacity", 0.5)
            .attr("r", d => this.r(d[names.radius]))
            .on("pointerenter", (e, d) => this._handlePointerEnter(e, d))
            .on("pointerleave", (e, d) => this._handlePointerLeave(e, d))
            .on("click", (e, d) => this._handleClick(e, d));
        this._updateColor();
    }

    _renderLabels() {

    }

    _xAxis(g) {
        this.font.applyTo(g);
        return g
            .attr("transform", `translate(0,${this.chartHeight - this.margin.bottom})`)
            .call(this._getAxis(d3.axisBottom, this.x, this.formats.x.short));
    }

    _yAxis(g) {
        this.font.applyTo(g);
        return g
            .attr("transform", `translate(${this.margin.left},0)`)
            .call(this._getAxis(d3.axisLeft, this.y, this.formats.y.short));
    }

    _getAxis(axis, scale, format) {
        const a = axis(scale);
        if (format && format !== null) a.tickFormat(d => d3.format(format)(d));
        return a;
    }

    _getColor(d) {
        const
            zones = this.chart.zones,
            names = this.chartData.fieldNames;

        if (d[names.x] < this._xLevel) {
            return d[names.y] < this._yLevel ? zones.dogs.color : zones.questionMarks.color;
        }
        else {
            return d[names.y] < this._yLevel ? zones.cows.color : zones.stars.color;
        }
    }

    _updateColor() {
        this._dots
            .attr("stroke", d => d3.color(this._getColor(d)).darker(1))
            .attr("fill", d => this._getColor(d));
    }

    _handlePointerEnter(e, d) {
        this._dots.attr("opacity", dot => dot === d ? 0.75 : 0.5);
    }

    _handlePointerLeave(e, d) {
        this._dots.attr("opacity", 0.5);
    }

    _handleClick(e, d) {

    }
}