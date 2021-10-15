import BaseRenderer from "./baserenderer.js";
import InfoLayer from "./infolayer.js";
import { ScaleType } from "../scales.js";
import { ValueFlag } from "../chartdata.js";

class ScatterChart extends BaseRenderer {
    constructor(coordinator) {
        super(coordinator);

        this._dots = null;
        this._xLevel = null;
        this._yLevel = null;

        this._focus = null;
        this._infoLayer = new InfoLayer();

        this.highlight = Highlight.none;

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
    get formats() { return this.chartData.fieldFormats; }
    get infoLayer() { return this._infoLayer; }

    render() {
        this._xLevel = this._xLevel ?? this.scales.xDefault;
        this._yLevel = this._yLevel ?? this.scales.yDefault;
        this._renderXAxis();
        this._renderYAxis();
        this._renderDots();
        this._highlightDots();
        this._initInfoLayer();

        return this;
    }

    hideAnnotation() {
        this._infoLayer.hideAnnotation();
        this._focus = null;
    }

    _initInfoLayer() {
        this._infoLayer.assignDelegates = (obj, font) => {
            obj.getBBox = s => this.measures.getBBox(s, font);
            obj.calcTextWidth = s => this.measures.calcStringWidth(s, font);
            obj.calcPosition = (c, b) => {
                const
                    box = this.svg.node().getBoundingClientRect(),
                    x = c.x + box.left,
                    y = c.y + box.top;

                const
                    t = 5,
                    left = x + b.width + t > box.right ? c.x - b.width - t : c.x + t,
                    top = y + b.height + t > box.bottom ? c.y - b.height - t : c.y + t;

                return { left, top };
            }
        }
        this._infoLayer.initialize(this.svg, this.font);
    }

    _rotateTicks(g, isXAxis) {
        const boxes = g.selectAll(".tick").nodes().map(node => node.getBoundingClientRect());
        let overlapped = false;
        for (let i = 0; i < boxes.length - 1; i++) {
            const c = boxes[i], n = boxes[i + 1];
            overlapped = isXAxis ? c.right > n.left : c.top < n.bottom;
            if (overlapped) break;
        }

        if (overlapped) {
            const texts = g.selectAll("text");
            if (isXAxis) {
                texts.attr("text-anchor", "end")
                    .attr("transform", "translate(-10,0) rotate(-45)");
            }
            else {
                texts.attr("opacity", (_, i) => i % 2 === 0 ? 1 : 0);
            }
        }
    }

    _renderXAxis() {
        const xr = this.x.range();

        this.svg.append("g")
            .call(this._xAxis.bind(this))
            .call(g => this._rotateTicks(g, true))
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
            .call(g => this._rotateTicks(g))
            .call(g => g.append("text")
                .attr("transform", `translate(-${this.margin.left},${y}) rotate(-90,0,0)`)
                .attr("text-anchor", "middle")
                .attr("font-weight", "bold")
                .attr("dy", "1em")
                .attr("fill", this.coordinator.colors.text)
                .text(`${this.chartData.fieldInfos.y.label} →`)
            );
    }

    _xAxis(g) {
        this.font.applyTo(g);
        return g
            .attr("transform", `translate(0,${this.chartHeight - this.margin.bottom})`)
            .call(g => {
                const axis = this._getAxis(d3.axisBottom, this.x, this.formats.x.short);
                if (this.scales.xScaleType === ScaleType.log) axis.ticks(5);
                axis(g);
            });
    }

    _yAxis(g) {
        this.font.applyTo(g);
        return g
            .attr("transform", `translate(${this.margin.left},0)`)
            .call(g => {
                const axis = this._getAxis(d3.axisLeft, this.y, this.formats.y.short);
                if (this.scales.yScaleType === ScaleType.log) axis.ticks(5);
                axis(g);
            });
    }

    _getAxis(axis, scale, format) {
        const a = axis(scale);
        if (format && format !== null) a.tickFormat(d => d3.format(format)(d));
        return a;
    }

    _renderDots() {
        this._dots = this.svg.append("g")
            .selectAll(".dot")
            .data(this.chartData.dataset)
            .join("g")
            .attr("transform", d => `translate(${this.x(d.x)},${this.y(d.y)})`)
            .call(g => g.append("circle")
                .attr("class", "dot")
                .attr("stroke-width", 2)
                .attr("opacity", 0.5)
                .attr("r", d => this.r(d.r))
            )
            .on("pointerenter", (e, d) => this._handlePointerEnter(e, d))
            .on("pointermove", (e, d) => this._handlePointerMove(e, d))
            .on("pointerleave", (e, d) => this._handlePointerLeave(e, d))
            .on("click", (e, d) => this._handleClick(e, d));
        this._updateColor();
    }

    _highlightDots() {
        const tester = Highlight.getTester(this.highlight);

        const ch = this.measures.charBox.height;
        this._dots.filter(tester)
            .append("text")
            .attr("dy", d => {
                const r = this.r(d.r);
                return r < ch ? r + ch / 1.5 : 0;
            })
            .attr("text-anchor", "middle")
            .attr("alignment-baseline", "middle")
            .attr("fill", this.coordinator.colors.text)
            .text(d => d.name);
    }

    _getColor(d) {
        const zones = this.chart.zones;

        if (d.x < this._xLevel) {
            return d.y < this._yLevel ? zones.dogs.color : zones.questionMarks.color;
        }
        else {
            return d.y < this._yLevel ? zones.cows.color : zones.stars.color;
        }
    }

    _updateColor() {
        if (this._dots) {
            this._dots.select("circle")
                .attr("stroke", d => d3.color(this._getColor(d)).darker(1))
                .attr("fill", d => this._getColor(d));
        }
    }

    _getTooltipContent(d) {
        const fields = this.chartData.fieldInfos;

        const content = [
            `${d.name}`,
            `${fields.x.label}: ${d3.format(fields.x.format.long)(d.x)}`,
            `${fields.y.label}: ${d3.format(fields.y.format.long)(d.y)}`
        ];

        const radius = fields.radius;
        if (radius.name && radius.name !== "") {
            content.push(`${radius.label}: ${d3.format(radius.format.long)(d.r)}`);
        }

        return content;
    }

    _handlePointerEnter(e, d) {
        this._dots.select("circle").attr("opacity", dot => dot === d ? 0.75 : 0.5);

        const content = this._getTooltipContent(d);
        this._infoLayer.openTooltip(e, content);
        if (this.onhover) this.onhover(e, d, content);
    }

    _handlePointerMove(e, d) {
        this._infoLayer.moveTooltip(e);
    }

    _handlePointerLeave(e, d) {
        this._dots.select("circle").attr("opacity", 0.5);
        this._infoLayer.hideTooltip();
        if (this.onleave) this.onleave(e, d);
    }

    _handleClick(e, d) {
        if (this._focus !== d) {
            this._focus = d;
            this._infoLayer.openAnnotation(
                this._getTooltipContent(d),
                this.x(d.x), this.y(d.y), this.r(d.r)
            );
        }
        else {
            this.hideAnnotation();
        }
        if (this.onclick) this.onclick(e, d);
    }
}

class Highlight {
    static get none() { return 0; }
    static get all() { return 1; }
    static get min() { return 2; }
    static get max() { return 3; }
    static get minMax() { return 4; }
    static get top() { return 5; }
    static get bottom() { return 6; }
    static get topBottom() { return 7; }

    static getTester(index) {
        if (index === Highlight.all) return () => true;
        if (index === Highlight.min) return d => (d.flag & ValueFlag.min) === ValueFlag.min;
        if (index === Highlight.max) return d => (d.flag & ValueFlag.max) === ValueFlag.max;
        if (index === Highlight.minMax) return d => (d.flag & ValueFlag.min) === ValueFlag.min || (d.flag & ValueFlag.max) === ValueFlag.max;
        if (index === Highlight.top) return d => (d.flag & ValueFlag.topGroup) === ValueFlag.topGroup;
        if (index === Highlight.bottom) return d => (d.flag & ValueFlag.bottomGroup) === ValueFlag.bottomGroup;
        if (index === Highlight.topBottom) return d => (d.flag & ValueFlag.topGroup) === ValueFlag.topGroup || (d.flag & ValueFlag.bottomGroup) === ValueFlag.bottomGroup;
        return () => false;
    }
}

export { ScatterChart, Highlight };