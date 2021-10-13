import { ChartData } from "./chartdata.js";
import Coordinator from "./coordinator.js";
import { Measures }from "./measures.js";
import Scales from "./scales.js";

export default class BCGMatrix {
    constructor(container) {
        this._container = container;

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
    get zones() { return this._zones; }

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

    colors(_) {
        if (arguments.length) {
            if (_.questionMarks) this._zones.questionMarks.color = _.questionMarks;
            if (_.dogs) this._zones.dogs.color = _.dogs;
            if (_.stars) this._zones.stars.color = _.stars;
            if (_.cows) this._zones.cows.color = _.cows;
            if (_.rule) this._coordinator.colors.rule = _.rule;
            if (_.text) this._coordinator.colors.text = _.text;
            if (_.ticks) this._coordinator.colors.ticks = _.ticks;
            if (_.background) this._coordinator.colors.background = _.background;
            return this;
        }
        else {
            return {
                questionMarks: this._zones.questionMarks.color,
                dogs: this._zones.dogs.color,
                stars: this._zones.stars.color,
                cows: this._zones.cows.color,
                rule: this._coordinator.colors.rule,
                text: this._coordinator.colors.text,
                ticks: this._coordinator.colors.ticks,
                background: this._coordinator.colors.background
            };
        }
    }

    icons(_) {
        if (arguments.length) {
            if (_.questionMarks) this._zones.questionMarks.icon = _.questionMarks;
            if (_.dogs) this._zones.dogs.icon = _.dogs;
            if (_.stars) this._zones.stars.icon = _.stars;
            if (_.cows) this._zones.cows.icon = _.cows;
            return this;
        }
        else {
            return {
                questionMarks: this._zones.questionMarks.icon,
                dogs: this._zones.dogs.icon,
                stars: this._zones.stars.icon,
                cows: this._zones.cows.icon,
            };
        }
    }

    labels(_) {
        if (arguments.length) {
            if (_.questionMarks) this._zones.questionMarks.caption = _.questionMarks;
            if (_.dogs) this._zones.dogs.caption = _.dogs;
            if (_.stars) this._zones.stars.caption = _.stars;
            if (_.cows) this._zones.cows.caption = _.cows;
            return this;
        }
        else {
            return {
                questionMarks: this._zones.questionMarks.caption,
                dogs: this._zones.dogs.caption,
                stars: this._zones.stars.caption,
                cows: this._zones.cows.caption,
            };
        }
    }

    columns(_) {
        if (arguments.length) {
            const fields = this._chartData.fieldInfos;
            fields.name = Object.assign(fields.name, _.name);
            fields.x = Object.assign(fields.x, _.x);
            fields.y = Object.assign(fields.y, _.y);
            fields.radius = Object.assign(fields.radius, _.radius);
            return this;
        }
        else {
            return this._fieldNames;
        }
    }

    font(_) {
        if (arguments.length) {
            this.measures.font.family(_.family);
            this.measures.font.size(_.size);
            return this;
        }
        else {
            return this.measures.font;
        }
    }

    data(_) {
        return arguments.length ? (this._chartData.dataset = _, this) : this._chartData.dataset;
    }

    render() {
        this._chartData.process();
        this._measures.initialize();
        this._scales.initialize();
        this._coordinator.render();

    }
}

class Zones {
    constructor() {
        this._questionMarks = new Zone("Question Marks", "#af7aa1");
        this._dogs = new Zone("Dogs", "#e15759");
        this._stars = new Zone("Stars", "#59a14f");
        this._cows = new Zone("Cows", "#edc949");
    }

    get questionMarks() { return this._questionMarks; }
    get dogs() { return this._dogs; }
    get stars() { return this._stars; }
    get cows() { return this._cows; }
}

class Zone {
    constructor(caption, color, icon) {
        this.caption = caption;
        this.color = color;
        this.icon = icon;
    }
}