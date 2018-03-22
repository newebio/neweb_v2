"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const onemitter_1 = require("onemitter");
class Remote {
    constructor(config) {
        this.config = config;
        this.remoteData1 = onemitter_1.default();
        let i = 0;
        setInterval(() => {
            this.remoteData1.emit("remote-data1-" + config.params.param1 + ++i);
        }, 100);
    }
}
exports.default = Remote;
Remote.prototype.__data = ["remoteData1"];
