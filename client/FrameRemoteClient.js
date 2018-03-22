"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const onemitter_1 = require("onemitter");
class FrameRemoteClient {
    constructor(config) {
        this.config = config;
        this.datas = {};
        this.actions = {};
        this.isDisposed = false;
        this.config.provider.on("on-frame-data-" + this.config.id, (dataName, value) => {
            if (this.datas[dataName]) {
                this.datas[dataName].emit(value);
            }
        });
        this.config.provider.on("on-frame-action-" + this.config.id, (actionId, result) => {
            this.actions[actionId].resolve(result);
            delete this.actions[actionId];
        });
    }
    data(dataName) {
        this.datas[dataName] = onemitter_1.default();
        this.config.provider.emit("frame-data", {
            frameId: this.config.id,
            frameName: this.config.name,
            frameParams: this.config.params,
            sid: this.config.sid,
            dataName,
        });
        return this.datas[dataName];
    }
    action(actionName, args) {
        const id = this.generateId();
        return new Promise((resolve) => {
            this.actions[id] = {
                resolve,
            };
            this.config.provider.emit("frame-action", {
                id,
                sid: this.config.sid,
                frameName: this.config.name,
                frameParams: this.config.params,
                frameId: this.config.id,
                actionName,
                args,
            });
        });
    }
    dispose() {
        this.isDisposed = true;
        Object.keys(this.datas).map((dataName) => {
            this.datas[dataName].removeAllListeners();
            this.config.provider.emit("off-frame-data", {
                dataName,
                frameName: this.config.name,
                frameParams: this.config.params,
                frameId: this.config.id,
                sid: this.config.sid,
            });
        });
    }
    generateId() {
        return (+new Date()).toString() + Math.floor(Math.random() * 10000);
    }
}
exports.default = FrameRemoteClient;
