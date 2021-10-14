import { InfoBox, Annotation } from "./infobox.js"

export default class InfoLayer {
    constructor(svg, font) {
        this._svg = svg;
        this._font = font;

        this._tooltip = null;
        this._annotation = null;

        this.showHint = true;
        this.showAnnotation = true;

        this.assignDelegates = null;        
    }

    initialize() {
        if (this.showAnnotation) {
            const font = this._font.clone().family("Sans-serif").size("11px").weight("bold");
            this._annotation = new Annotation(this._svg, font, "none");
            if (this.assignDelegates) this.assignDelegates(this._annotation, font);
        }

        if (this.showHint) {
            this._tooltip = new InfoBox(this._svg, this._font, "white", 0.7, "#aaa");
            if (this.assignDelegates) this.assignDelegates(this._tooltip, this._font);
        }
    }

    openTooltip(e, content) {
        if (this.showHint) this._tooltip.show(e, content);
    }

    moveTooltip(e) {
        if (this.showHint) this._tooltip.move(e);
    }

    hideTooltip() {
        if (this.showHint) this._tooltip.hide();
    }

    openAnnotation(content, x, y, r) {
        if (this.showAnnotation) {
            this._annotation.hide();
            this._annotation.show(
                null, content,
                x, y, r, "#999"
            );
        }
    }

    hideAnnotation() {
        if (this.showAnnotation) this._annotation.hide();
    }
}