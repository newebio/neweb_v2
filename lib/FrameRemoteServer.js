"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
class FrameRemoteServer {
    constructor(config) {
        this.config = config;
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            const frameConfig = yield this.config.configuration.resolveFrame(this.config.frameName);
            this.remote = new frameConfig.remote({
                params: this.config.frameParams,
            });
        });
    }
    data(dataName) {
        this.remote[dataName].on((value) => {
            this.config.socket.emit("on-frame-data-" + this.config.id, dataName, value);
        });
    }
    action(actionId, actionName, args) {
        return __awaiter(this, void 0, void 0, function* () {
            this.config.socket.emit("on-frame-action-" + this.config.id, actionId, yield this.remote[actionName](args));
        });
    }
    offData(dataName) {
        this.remote[dataName].removeAllListeners();
    }
}
exports.default = FrameRemoteServer;
