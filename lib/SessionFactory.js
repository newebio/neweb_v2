"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Session_1 = require("./Session");
class SessionFactory {
    constructor(config) {
        this.config = config;
    }
    createSession(params) {
        return new Session_1.default({
            initialRoute: params.route,
            configuration: this.config.configuration,
        });
    }
}
exports.default = SessionFactory;
