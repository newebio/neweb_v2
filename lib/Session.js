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
const React = require("react");
// tslint:disable-next-line:no-submodule-imports
const ReactDOMServer = require("react-dom/server");
const sleep_es6_1 = require("sleep-es6");
class Session {
    constructor(config) {
        this.config = config;
        this.currentRoute = this.config.initialRoute;
    }
    render() {
        return __awaiter(this, void 0, void 0, function* () {
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
                return {
                    name: frame.name,
                    view: frame.view,
                    data: dataResult,
                };
            })));
            const data = frames.map((f) => f.data);
            let children = null;
            for (const frame of frames.reverse()) {
                children = React.createElement(frame.view, { key: frame.name, children, data: frame.data });
            }
            return {
                html: ReactDOMServer.renderToString(children),
                route: this.currentRoute,
                data,
            };
        });
    }
}
exports.default = Session;
