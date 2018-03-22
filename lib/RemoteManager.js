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
const FrameRemoteServer_1 = require("./FrameRemoteServer");
class RemoteManager {
    constructor(config) {
        this.config = config;
        this.frames = {};
    }
    onNewSocket(socket) {
        socket.on("frame-data", (params) => __awaiter(this, void 0, void 0, function* () {
            yield this.createFrameRemoteServer(socket, params);
            this.frames[params.frameId].frameRemote.data(params.dataName);
        }));
        socket.on("frame-action", (params) => __awaiter(this, void 0, void 0, function* () {
            yield this.createFrameRemoteServer(socket, params);
            this.frames[params.frameId].frameRemote.action(params.actionId, params.actionName, params.args);
        }));
        socket.on("off-frame-data", () => {
            // TODO:
        });
    }
    createFrameRemoteServer(socket, params) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.frames[params.frameId]) {
                this.frames[params.frameId] = {
                    frameRemote: new FrameRemoteServer_1.default({
                        socket,
                        frameName: params.frameName,
                        id: params.frameId,
                        frameParams: params.frameParams,
                        configuration: this.config.configuration,
                    }),
                };
                yield this.frames[params.frameId].frameRemote.init();
            }
        });
    }
}
exports.default = RemoteManager;
