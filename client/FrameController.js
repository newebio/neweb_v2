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
const onemitter_1 = require("onemitter");
const React = require("react");
const Frame_1 = require("./Frame");
class FrameController {
    constructor(config) {
        this.config = config;
        this.framesStates = [];
        const childrenEmitter = onemitter_1.default();
        const rootFrameState = {
            name: "__root",
            actions: {},
            childrenEmitter,
            data: onemitter_1.default(),
            remote: {},
            paramsEmitter: onemitter_1.default(),
            element: null,
        };
        this.framesStates.push(rootFrameState);
    }
    render(route, data) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.updateRoute(route, data);
            return React.createElement(Frame_1.default, {
                actions: this.framesStates[0].actions,
                name: "__root",
                children: this.framesStates[0].childrenEmitter,
                data: this.framesStates[0].data,
                params: this.framesStates[0].paramsEmitter,
                view: ((p) => p.children),
                key: "__root",
            });
        });
    }
    updateRoute(route, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const framesConfigs = (yield Promise.all(route.frames.map((routeFrame) => __awaiter(this, void 0, void 0, function* () {
                const frameConfig = yield this.config.configuration.resolveFrame(routeFrame.frame);
                return frameConfig;
            }))));
            const frames = route.frames.map((routeFrame, index) => {
                return {
                    frame: routeFrame,
                    index,
                };
            });
            for (const frame of frames) {
                const frameStateIndex = frame.index + 1;
                if (!this.framesStates[frameStateIndex] || this.framesStates[frameStateIndex].name !== frame.frame.frame) {
                    const frameState = this.createFrameState(framesConfigs[frame.index], frame.frame.params, data[frame.index]);
                    this.framesStates[frameStateIndex] = frameState;
                    this.framesStates[frameStateIndex - 1].childrenEmitter.emit(frameState.element);
                }
            }
            this.framesStates.splice(route.frames.length + 1, 100);
        });
    }
    getState() {
        return this.framesStates;
    }
    createFrameState(frameConfig, params, initialData) {
        const childrenEmitter = onemitter_1.default();
        const remote = {};
        for (const dataName of frameConfig.remote.data) {
            remote[dataName] = this.config.remote.data(frameConfig.name, params, dataName);
        }
        for (const dataName of frameConfig.remote.actions) {
            remote[dataName] = (...args) => this.config.remote.action(frameConfig.name, params, dataName, args);
        }
        const actions = new frameConfig.actions({
            params,
            remote,
        });
        const data = new frameConfig.data({
            data: initialData,
            params,
            remote,
        });
        const paramsEmitter = onemitter_1.default({ value: params });
        const element = React.createElement(Frame_1.default, {
            name: frameConfig.name,
            key: frameConfig.name,
            view: frameConfig.view,
            data,
            actions,
            params: paramsEmitter,
            children: childrenEmitter,
        });
        const frameState = {
            name: frameConfig.name,
            paramsEmitter,
            remote,
            actions,
            data,
            childrenEmitter,
            element,
        };
        return frameState;
    }
}
exports.default = FrameController;
