import { ChartData } from "./chartdata.js";
import Coordinator from "./coordinator.js";
import { Measures } from "./measures.js";
import { Highlight } from "./renderers/scatterchart.js";
import { Scales, ScaleType } from "./scales.js";
import Zones from "./zones.js";

export default class BCGMatrix {
    constructor(container) {
        this._container = container;

        this._dataset = null;
        this._options = new BCGMatrixOptions();

        this._zones = new Zones();
        this._chartData = new ChartData();
        this._measures = new Measures(this);
        this._scales = new Scales(this);
        this._coordinator = new Coordinator(this);
    }

    get container() { return this._container; }
    get chartData() { return this._chartData; }
    get measures() { return this._measures; }
    get scales() { return this._scales; }

    size(_) {
        if (arguments.length) {
            this._measures.width = _[0];
            this._measures.height = _[1];
            return this;
        }
        else {
            return [this._measures.width, this._measures.height];
        }
    }

    options(_) {
        return arguments.length ? (this._options = Object.assign(this._options, _), this) : this._options;
    }

    zones(_) {
        return arguments.length ? (this._zones.copyFrom(_), this) : this._zones;
    }

    colors(_) {
        return arguments.length ? (this._coordinator.colors.copyFrom(_), this) : this._zones;
    }

    columns(_) {
        return arguments.length ? (this._chartData.fieldInfos.copyFrom(_), this) : this._chartData.fieldInfos;
    }

    font(_) {
        return arguments.length ? (this._measures.font.copyFrom(_), this) : this._measures.font;
    }

    data(_) {
        return arguments.length ? (this._dataset = _, this) : this._dataset;
    }

    events(_) {
        if (arguments.length) {
            this._coordinator.scatterChart.onclick = _.onclick;
            this._coordinator.scatterChart.onhover = _.onhover;
            this._coordinator.scatterChart.onleave = _.onleave;
            this._coordinator.onrulechange = _.onrulechange;
            return this;
        }
        else {
            return {
                onclick: this._coordinator.scatterChart.onclick,
                onhover: this._coordinator.scatterChart.onhover,
                oncancel: this._coordinator.scatterChart.oncancel,
                onrulechange: this._coordinator.onrulechange
            }
        }
    }

    render() {
        const options = this._options;

        this._chartData.numOfTopBottom = options.numberOfTopBottom;
        this._chartData.process(this._dataset);
        this._measures.initialize();

        this._scales.dotRadius = options.dotRadius;
        this._scales.bubbleRadiusRange = options.bubbleRadiusRange;
        this._scales.xExponent = options.xExponent;
        this._scales.yExponent = options.yExponent;
        this._scales.xScaleType = ScaleType[options.xScaleType];
        this._scales.yScaleType = ScaleType[options.yScaleType];
        this._scales.initialize();

        this._coordinator.highlight = Highlight[options.highlightScope];
        this._coordinator.showTicksOnRules = options.showTicksOnRules;
        this._coordinator.xInitValue = options.xInitValue;
        this._coordinator.yInitValue = options.yInitValue;
        this._coordinator.scatterChart.infoLayer.showTooltip = options.showTooltip;
        this._coordinator.scatterChart.infoLayer.showAnnotation = options.showAnnotation;
        this._coordinator.render();

        return this;
    }

    dispose() {
        if (this._coordinator) this._coordinator.dispose();
    }
}

class BCGMatrixOptions {
    constructor() {
        this.dotRadius = 5;
        this.bubbleRadiusRange = [5, 30];
        this.highlightScope = "none"; // "none", "all", "min", "max", "minMax", "top", "bottom", "topBottom"
        this.numberOfTopBottom = 5;
        this.showTooltip = true;
        this.showAnnotation = true;
        this.xInitValue = null;
        this.xExponent = 1;
        this.xScaleType = "linear"; // "linear", "log", "sqrt", "pow"
        this.yInitValue = null;
        this.yExponent = 1;
        this.yScaleType = "linear"; // "linear", "log", "sqrt", "pow"
        this.showTicksOnRules = true;
    }
}