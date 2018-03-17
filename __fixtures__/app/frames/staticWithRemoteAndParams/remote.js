"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const onemitter_1 = require("onemitter");
class default_1 {
    constructor(config) {
        this.config = config;
        this.remoteData1 = onemitter_1.default();
        this.remoteData1.emit("remote-data1-" + config.params.param1);
    }
}
exports.default = default_1;
