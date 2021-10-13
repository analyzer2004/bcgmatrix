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
}

class Zone {
    constructor(caption, color, icon) {
        this.caption = caption;
        this.color = color;
        this.icon = icon;
    }
}