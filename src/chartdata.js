class ChartData {
    constructor() {
        this.dataset = null;
        this._fieldInfos = new FieldInfos();
        this._extents = new Extents();
    }

    get extents() { return this._extents; }
    get fieldInfos() { return this._fieldInfos; }
    get fieldNames() { return this._fieldInfos.names; }
    get fieldFormats() { return this._fieldInfos.formats; }

    process() {
        const
            names = this.fieldNames,
            test = (v, [v1, v2]) => {
                if (v < v1) v1 = v;
                if (v > v2) v2 = v;
                return [v1, v2];
            }

        for (let i = 0; i < this.dataset.length; i++) {
            const row = this.dataset[i];
            this.extents.x = test(row[names.x], this.extents.x);
            this.extents.y = test(row[names.y], this.extents.y);
            this.extents.radius = test(row[names.radius], this.extents.radius);
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
}

class FieldInfo {
    constructor() {
        this.name = null;
        this._label = null;
        this.format = new NumberFormat();
    }

    get label() { return this._label ?? this.name; }
    set label(_) { this._label = _; }    
}

class NumberFormat {
    constructor() {
        this.short = ",.2s";
        this.long = ",.2f";
    }
}

class Extents {
    constructor() {
        this.x = [0, 0];
        this.y = [0, 0];
        this.radius = [0, 0];
    }
}

export { ChartData };