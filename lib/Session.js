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
const mkdirp = require("mkdirp");
const React = require("react");
// tslint:disable-next-line:no-submodule-imports
const ReactDOMServer = require("react-dom/server");
const sleep_es6_1 = require("sleep-es6");
const util_1 = require("util");
const uniqueModules_1 = require("../utils/uniqueModules");
class Session {
    constructor(config) {
        this.config = config;
        this.id = this.config.id;
        this.hash = this.config.hash;
        this.info = this.config.info;
    }
    getId() {
        return this.id;
    }
    getHash() {
        return this.hash;
    }
    render(route) {
        return __awaiter(this, void 0, void 0, function* () {
            this.currentRoute = route;
            const frames = yield Promise.all(this.currentRoute.frames.map((routeFrame) => __awaiter(this, void 0, void 0, function* () {
                const frame = yield this.config.configuration.resolveFrame(routeFrame.frame);
                const params = routeFrame.params || {};
                const remote = new frame.remote({
                    params,
                });
                const dataInstance = new frame.data({
                    data: undefined,
                    params,
                    remote,
                });
                const error = Symbol("Timeout error");
                const dataResult = yield Promise.race([dataInstance.wait(), sleep_es6_1.default(5000).then(() => error)]);
                if (dataResult === error) {
                    throw { code: 504, text: "Timeout for frame data " + frame.name };
                }
                const frameModules = yield this.config.configuration.getModulesForFrame(frame.name);
                return {
                    name: frame.name,
                    view: frame.view,
                    data: dataResult,
                    modules: frameModules,
                    remoteClient: frame.remoteClient,
                    params: routeFrame.params,
                };
            })));
            const data = frames.map((f) => f.data);
            let children = null;
            let modules = [];
            for (const frame of frames.reverse()) {
                children = React.createElement(frame.view, { key: frame.name, children, data: frame.data });
                modules = modules.concat(frame.modules);
            }
            if (!this.info) {
                yield util_1.promisify(mkdirp)(this.config.sessionsPath + "/" + this.id);
            }
            yield util_1.promisify(fs_1.writeFile)(this.config.sessionsPath + "/" + this.id + "/session.json", JSON.stringify({
                id: this.id,
                hash: this.hash,
                currentRoute: this.currentRoute,
                modules: this.info ? uniqueModules_1.default(modules.concat(this.info.modules)) : modules,
            }));
            return {
                sessionId: this.id,
                sessionHash: this.hash,
                html: ReactDOMServer.renderToString(children),
                route: {
                    status: this.currentRoute.status,
                    frames: frames.map((frame) => {
                        return {
                            frame: frame.name,
                            params: frame.params,
                            version: "",
                            remote: frame.remoteClient,
                        };
                    }),
                },
                data,
                modules,
            };
        });
    }
}
exports.default = Session;
