export class ColorGUIHelper {
    constructor(object, prop) {
        this.object = object;
        this.prop = prop;
    }

    get value() {
        return `#${this.object[this.prop].getHexString()}`
    }

    set value(hexString) {
        this.object[this.prop].set(hexString);
    }
}

export class SizeGUIHelper {
    constructor(object, prop) {
        this.object = object;
        this.prop = prop;
    }

    get value() {
        return this.object[this.prop] * 100;
    }

    set value(size) {
        this.object[this.prop] = size / 100;
    }
}