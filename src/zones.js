export default class Zones {
    constructor() {        
        this._questionMarks = new Zone("Question Marks", "#af7aa1");
        this._dogs = new Zone("Dogs", "#e15759");
        this._stars = new Zone("Stars", "#59a14f");
        this._cows = new Zone("Cows", "#edc949");
        this._showIcons = true;
        this._showLabels = true;
    }

    get questionMarks() { return this._questionMarks; }
    get dogs() { return this._dogs; }
    get stars() { return this._stars; }
    get cows() { return this._cows; }
    get showIcons() { return this._showIcons; }
    set showIcons(_) {
        this._showIcons = _;
        [this._questionMarks, this._dogs, this._stars, this.cows].forEach(z => z.showIcon = _);
    }
    get showLabels() { return this._showLabels; }
    set showLabels(_) {
        this._showLabels = _;
        [this._questionMarks, this._dogs, this._stars, this.cows].forEach(z => z.showLabel = _);
    }

    copyFrom(source) {
        this._questionMarks.copyFrom(source.questionMarks);        
        this._dogs.copyFrom(source.dogs);
        this._stars.copyFrom(source.stars);
        this._cows.copyFrom(source.cows);
        this.showLabels = source.showLabels ?? true;
        this.showIcons = source.showIcons ?? true;
    }
}

class Zone {
    constructor(caption, color, icon) {
        this.caption = caption;
        this.color = color;
        this.icon = icon;
        this.showIcons = true;
        this.showLabel = true;
    }

    copyFrom(source) {
        if (source) {
            if (source.caption) this.caption = source.caption;
            if (source.color) this.color = source.color;
            if (source.icon) this.icon = source.icon;
        }
    }
}