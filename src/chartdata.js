class ChartData {
    constructor() {
        this._dataset = null;
        this._fieldInfos = new FieldInfos();
        this._extents = new Extents();

        this.numOfTopBottom = 5;
    }

    get dataset() { return this._dataset; }

    get extents() { return this._extents; }
    get fieldInfos() { return this._fieldInfos; }
    get fieldNames() { return this._fieldInfos.names; }
    get fieldFormats() { return this._fieldInfos.formats; }

    process(source) {
        const
            names = this.fieldNames,
            test = (v, [v1, v2]) => {
                if (v < v1) v1 = v;
                if (v > v2) v2 = v;
                return [v1, v2];
            }

        this._dataset = source
            .map(d => {
                const row = new Dot(
                    d[names.name],
                    d[names.x],
                    d[names.y],
                    d[names.radius],
                    ValueFlag.unspecified
                );
                this.extents.x = test(row.x, this.extents.x);
                this.extents.y = test(row.y, this.extents.y);
                this.extents.radius = test(row.r, this.extents.radius);
                return row;
            })
            .filter(d => d.x || d.y || d.r)
            .sort((a, b) => a.r - b.r);

        const len = this._dataset.length;
        if (names.radius && names.radius !== "") {
            this._dataset[0].flag = ValueFlag.min;
            this._dataset[len - 1].flag = ValueFlag.max;
            this._dataset.slice(0, this.numOfTopBottom).forEach(d => d.flag |= ValueFlag.bottomGroup);
            this._dataset.slice(-this.numOfTopBottom).forEach(d => d.flag |= ValueFlag.topGroup);
        }
    }
}

class FieldInfos {
    constructor() {
        this.name = new FieldInfo();
        this.x = new FieldInfo();
        this.y = new FieldInfo();
        this.radius = new FieldInfo();
    }

    get names() {
        return {
            name: this.name.name,
            x: this.x.name,
            y: this.y.name,
            radius: this.radius.name
        }
    }

    get formats() {
        return {
            x: this.x.format,
            y: this.y.format,
            radius: this.radius.format
        }
    }

    copyFrom(source) {
        if (source) {
            if (source.name) this.name.copyFrom(source.name);
            if (source.x) this.x.copyFrom(source.x);
            if (source.y) this.y.copyFrom(source.y);
            if (source.radius) this.radius.copyFrom(source.radius);
        }
    }
}

class FieldInfo {
    constructor() {
        this.name = null;
        this._label = null;
        this.format = new NumberFormat();
    }

    get label() { return this._label ?? this.name; }
    set label(_) { this._label = _; }

    copyFrom(source) {
        if (source) {
            if (source.name) this.name = source.name;
            if (source.label) this.label = source.label;
            if (source.format) this.format.copyFrom(source.format);
        }
    }
}

class NumberFormat {
    constructor() {
        this.short = ",.2s";
        this.long = ",.2f";
    }

    copyFrom(source) {
        if (source) {
            if (source.short) this.short = source.short;
            if (source.long) this.long = source.long;
        }
    }
}

class Extents {
    constructor() {
        this.x = [0, 0];
        this.y = [0, 0];
        this.radius = [0, 0];
    }
}

class ValueFlag {
    static get unspecified() { return 0; }
    static get min() { return 1; }
    static get max() { return 2; }
    static get bottomGroup() { return 4; }
    static get topGroup() { return 8; }
}

class Dot {
    constructor(name, x, y, r, flag) {
        this.name = name;
        this.x = x;
        this.y = y;
        this.r = r;
        this.flag = flag
    }
}

export { ChartData, ValueFlag };