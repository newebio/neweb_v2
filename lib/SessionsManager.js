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
const fs_1 = require("fs");
const util_1 = require("util");
const Session_1 = require("./Session");
class SessionsManager {
    constructor(config) {
        this.config = config;
        this.sessions = {};
    }
    getSession(id, hash) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.sessions[id]) {
                throw new Error("Not found session " + id);
            }
            if (this.sessions[id].session.getHash() !== hash) {
                throw new Error("Invalid hash " + hash + " for session " + id);
            }
            return this.sessions[id];
        });
    }
    resolveSessionBySid(sid) {
        return __awaiter(this, void 0, void 0, function* () {
            const sessionParams = this.getSessionParamsFromSid(sid);
            const sessionItem = this.sessions[sessionParams.id];
            if (sessionItem) {
                if (sessionItem.session.getHash() !== sessionParams.hash) {
                    throw new Error("Invalid hash " + sessionParams.hash + " for sid " + sid);
                }
                return sessionItem.session;
            }
            if (!(yield util_1.promisify(fs_1.exists)(this.config.sessionsPath + "/" + sessionParams.id + "/session.json"))) {
                throw new Error("Not found session for sid " + sid);
            }
            const sessionInfo = JSON.parse((yield util_1.promisify(fs_1.readFile)(this.config.sessionsPath + "/" +
                sessionParams.id + "/session.json")).toString());
            if (sessionInfo.hash !== sessionParams.hash) {
                throw new Error("Invalid hash " + sessionParams.hash + " for sid " + sid);
            }
            return this.addSession({
                id: sessionParams.id,
                hash: sessionParams.hash,
                info: sessionInfo,
            });
        });
    }
    createSession() {
        const id = new Date().getTime().toString() + Math.round(Math.random() * 100000).toString();
        const hash = new Date().getTime().toString() + Math.round(Math.random() * 100000).toString();
        return this.addSession({
            id,
            hash,
        });
    }
    addSession(params) {
        const session = new Session_1.default({
            id: params.id,
            hash: params.hash,
            info: params.info,
            configuration: this.config.configuration,
            sessionsPath: this.config.sessionsPath,
        });
        this.sessions[session.getId()] = { session };
        return session;
    }
    getSessionParamsFromSid(sid) {
        const params = sid.split(":");
        return {
            id: params[0],
            hash: params[1],
        };
    }
}
exports.default = SessionsManager;
