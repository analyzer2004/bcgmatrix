export default class Zones {
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

    copyFrom(source) {
        this._questionMarks.copyFrom(source.questionMarks);
        this._dogs.copyFrom(source.dogs);
        this._stars.copyFrom(source.stars);
        this._cows.copyFrom(source.cows);
    }
}

class Zone {
    constructor(caption, color, icon) {
        this.caption = caption;
        this.color = color;
        this.icon = icon;
    }

    copyFrom(source) {
        if (source) {
            if (source.caption) this.caption = source.caption;
            if (source.color) this.color = source.color;
            if (source.icon) this.icon = source.icon;
        }
    }
}