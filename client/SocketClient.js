"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const SocketIOClient = require("socket.io-client");
class SocketClient {
    constructor(config) {
        this.config = config;
        this.requests = {};
        this.io = SocketIOClient();
        this.io.on("response", (id, content) => {
            if (this.requests[id]) {
                this.requests[id].resolve(content);
                delete this.requests[id];
            }
        });
    }
    request(type, params) {
        const id = this.generateId();
        return new Promise((resolve) => {
            this.requests[id] = {
                resolve,
            };
            this.io.emit("request", {
                id,
                sid: this.config.sid,
                pid: this.config.pid,
                type,
                params,
            });
        });
    }
    generateId() {
        return (+new Date()) + Math.floor(Math.random() * 10000);
    }
}
exports.default = SocketClient;
