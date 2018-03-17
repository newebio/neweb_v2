import o, { Onemitter } from "onemitter";
import React = require("react");
import { DataSource, IClientConfiguration, IFrameConfigClient, IFramesRoute, IRemoteProvider } from "./..";
import Frame from "./Frame";
export interface IFrameControllerConfig {
    configuration: IClientConfiguration;
    remote: IRemoteProvider;
}
export interface IFrameState {
    name: string;
    remote: any;
    actions: any;
    data: DataSource<any, any, any>;
    paramsEmitter: Onemitter<any>;
    childrenEmitter: Onemitter<any>;
    element: React.ReactElement<any>;
}
class FrameController {
    protected framesStates: IFrameState[] = [];
    constructor(protected config: IFrameControllerConfig) {
        const childrenEmitter = o();
        const rootFrameState: IFrameState = {
            name: "__root",
            actions: {},
            childrenEmitter,
            data: o() as any,
            remote: {},
            paramsEmitter: o(),
            element: null as any,
        };
        this.framesStates.push(rootFrameState);
    }
    public async render(route: IFramesRoute, data: any[]) {
        await this.updateRoute(route, data);
        return React.createElement(Frame, {
            actions: this.framesStates[0].actions,
            name: "__root",
            children: this.framesStates[0].childrenEmitter,
            data: this.framesStates[0].data,
            params: this.framesStates[0].paramsEmitter,
            view: ((p: any) => p.children) as any,
            key: "__root",
        });
    }
    public async updateRoute(route: IFramesRoute, data: any[]) {
        const framesConfigs = (await Promise.all(route.frames.map(async (routeFrame) => {
            const frameConfig = await this.config.configuration.resolveFrame(routeFrame.frame) as IFrameConfigClient;
            return frameConfig;
        })));
        const frames = route.frames.map((routeFrame, index) => {
            return {
                frame: routeFrame,
                index,
            };
        });
        for (const frame of frames) {
            const frameStateIndex = frame.index + 1;
            if (!this.framesStates[frameStateIndex] || this.framesStates[frameStateIndex].name !== frame.frame.frame) {
                const frameState =
                    this.createFrameState(framesConfigs[frame.index], frame.frame.params, data[frame.index]);
                this.framesStates[frameStateIndex] = frameState;
                this.framesStates[frameStateIndex - 1].childrenEmitter.emit(frameState.element);
            }
        }
        this.framesStates.splice(route.frames.length + 1, 100);
    }
    public getState() {
        return this.framesStates;
    }
    protected createFrameState(frameConfig: IFrameConfigClient, params: any, initialData: any) {
        const childrenEmitter = o();
        const remote: any = {};
        for (const dataName of frameConfig.remote.data) {
            remote[dataName] = this.config.remote.data(frameConfig.name, params, dataName);
        }
        for (const dataName of frameConfig.remote.actions) {
            remote[dataName] = (...args: any[]) => this.config.remote.action(frameConfig.name, params, dataName, args);
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
        const paramsEmitter = o({ value: params });
        const element = React.createElement(Frame, {
            name: frameConfig.name,
            key: frameConfig.name,
            view: frameConfig.view,
            data,
            actions,
            params: paramsEmitter,
            children: childrenEmitter,
        });
        const frameState: IFrameState = {
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
export default FrameController;
