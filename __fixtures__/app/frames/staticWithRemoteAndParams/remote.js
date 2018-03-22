"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const neweb_core_1 = require("neweb-core");
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
__decorate([
    neweb_core_1.data
], Remote.prototype, "remoteData1", void 0);
exports.default = Remote;
