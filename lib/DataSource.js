"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const onemitter_1 = require("onemitter");
class DataSource extends onemitter_1.Onemitter {
    constructor(config) {
        super();
        this.config = config;
        this.onInit();
    }
    onInit() {
        this.emit(null);
    }
}
exports.default = DataSource;
