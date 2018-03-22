"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const SocketIOClient = require("socket.io-client");
const FrameRemoteClient_1 = require("./FrameRemoteClient");
class WebsocketRemoteProvider {
    constructor(config) {
        this.config = config;
        this.io = SocketIOClient(this.config.address);
    }
    createFrameRemoteClient(frameName, params) {
        const frameRemoteClient = new FrameRemoteClient_1.default({
            id: this.generateId(),
            sid: this.config.sid,
            name: frameName,
            params,
            provider: this.io,
        });
        return frameRemoteClient;
    }
    generateId() {
        return (+new Date()).toString() + Math.floor(Math.random() * 10000);
    }
}
exports.default = WebsocketRemoteProvider;
