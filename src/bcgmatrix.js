// https://github.com/analyzer2004/bcgmatrix
// Copyright 2021 Eric Lo 

import { ChartData } from "./chartdata.js";
import Coordinator from "./coordinator.js";
import { Measures } from "./measures.js";
import { Highlight } from "./renderers/scatterchart.js";
import { Scales, ScaleType } from "./scales.js";
import Zones from "./zones.js";

export default class BCGMatrix {
    constructor(
        data, 
        {
            width = 1024,
            height = 768,
            dotRadius = 5,
            bubbleRadiusRange = [5, 30],
            highlightScope = "none", // "none", "all", "min", "max", "minMax", "top", "bottom", "topBottom"
            numOfTopBottoms = 5,
            showTooltip = true,
            showAnnotation = true,
            showTicksOnRules = true,
            x = {
                initValue: null,
                exponent: 1,
                scaleType: "linear", // "linear", "log", "sqrt", "pow"
            },
            y = {
                initValue: null,
                exponent: 1,
                scaleType: "linear", // "linear", "log", "sqrt", "pow"
            },
            columns = {},
            zones = {},
            colors = {},
            font = {},
            events = {}
        } = {},
        container = document.createElement("div")
    ) {
        const that = this;

        this._container = container;
        this._dataset = data;
        this._zones = new Zones();
        this._chartData = new ChartData();
        this._measures = new Measures(this);
        this._scales = new Scales(this);
        this._coordinator = new Coordinator(this);

        processOptions();        

        function processOptions() {
            const { _measures: m, _chartData: d, _scales: s, _coordinator: c } = that;

            that._zones.copyFrom(zones);                        
            m.width = width;
            m.height = height;
            m.font.copyFrom(font);
            d.numOfTopBottoms = numOfTopBottoms;
            d.fieldInfos.copyFrom(columns);
            s.dotRadius = dotRadius;
            s.bubbleRadiusRange = bubbleRadiusRange;
            if (x) {
                c.xInitValue = x.initValue;
                if (x.exponent !== null && x.exponent !== undefined) s.xExponent = x.exponent;
                if (x.scaleType) s.xScaleType = ScaleType[x.scaleType];
            }
            if (y) {
                c.yInitValue = y.initValue;
                if (y.exponent !== null && y.exponent !== undefined) s.yExponent = y.exponent;
                if (y.scaleType) s.yScaleType = ScaleType[y.scaleType];
            }
            c.colors.copyFrom(colors);
            c.highlight = Highlight[highlightScope];
            c.showTicksOnRules = showTicksOnRules;
            c.scatterChart.infoLayer.showTooltip = showTooltip;
            c.scatterChart.infoLayer.showAnnotation = showAnnotation;
            c.scatterChart.onclick = events.onclick;
            c.scatterChart.onhover = events.onhover;
            c.scatterChart.onleave = events.onleave;
            c.onrulemove = events.onrulemove;
            c.onrulechange = events.onrulechange;            
        }
    }

    get container() { return this._container; }
    get chartData() { return this._chartData; }
    get measures() { return this._measures; }
    get scales() { return this._scales; }
    get zones() { return this._zones; }

    render() {
        const detached = !this._container.isConnected;
        if (detached) document.body.appendChild(this._container);

        this._chartData.process(this._dataset);
        this._measures.initialize();
        this._scales.initialize();
        this._coordinator.render();

        if (detached) {
            const svg = this._coordinator.svg.node();
            this._container.removeChild(svg);
            this._container.remove();
            return svg;
        }
    }

    dispose() {
        if (this._coordinator) this._coordinator.dispose();
    }

    getDots(zoneIndex) {
        const
            { _coordinator: c, _chartData: d } = this,
            { xLevel: x, yLevel: y } = c.scatterChart;

        let tester;
        if (zoneIndex === 0) tester = d => d.x < x && d.y >= y; // question marks
        else if (zoneIndex === 1) tester = d => d.x >= x && d.y >= y; // stars
        else if (zoneIndex === 2) tester = d => d.x < x && d.y < y; // dogs
        else tester = d => d.x >= x && d.y < y; // cows

        return d.dataset.filter(tester).map(d => ({...d}));
    }
}