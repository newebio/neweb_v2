import { ReadStream } from "fs";
import { Onemitter } from "onemitter";
import DataSource from "./lib/DataSource";
import { IPackInfoModule } from "./lib/ModulePacker";
export { default as DataSource } from "./lib/DataSource";
export interface IRequest {
    url: string;
}
export interface IRouter {
    resolve(req: IRequest): Promise<IRoute>;
}
export interface INotFoundRoute {
    status: 404;
    text?: string;
}
export interface IFramesRoute {
    status: 200;
    frames: IRouteFrame[];
}
export type IRoute = IFramesRoute | INotFoundRoute;
export interface IRouteFrame {
    frame: string;
    params: any;
}
export interface ISessionRoute {
    status: 200;
    frames: ISessionFrameRoute[];
}
export interface ISessionFrameRoute {
    frame: string;
    params: any;
    version: string;
    remote: {
        data: string[];
        actions: string[];
    };
}
export interface IConfiguration {
    resolveTemplate(): Promise<string>;
    resolveFrame(name: string): Promise<IFrameConfig>;
    hasFrame(name: string): Promise<boolean>;
    getModulesForFrame(name: string): Promise<IPackInfoModule[]>;
    getModuleContent(moduleInfo: IPackInfoModule): Promise<string>;
    getModuleContentStream(moduleInfo: IPackInfoModule): Promise<ReadStream>;
}
export interface IClientConfiguration {
    resolveFrame(name: string): Promise<IFrameConfigClient>;
    hasFrame(name: string): Promise<boolean>;
}
export interface IFrameConfig {
    name: string;
    view: React.ComponentClass<any>;
    data: new (config: IFrameDataConfig) => DataSource<any, any, any>;
    actions: new (config: IFrameActionsConfig) => any;
    remote: new (...args: any[]) => any;
    remoteClient: {
        data: string[];
        actions: string[];
    };
}
export interface IFrameConfigClient {
    name: string;
    view: React.ComponentClass<any>;
    data: new (config: IFrameDataConfig) => DataSource<any, any, any>;
    actions: new (config: IFrameActionsConfig) => any;
    remote: {
        actions: string[];
        data: string[];
    };
}
export interface IFrameData extends Onemitter<any> {

}
export interface IFrameActionsConfig {
    params: any;
    remote: any;
}
export interface IFrameDataConfig {
    data: any;
    params: any;
    remote: any;
}
export interface IRemoteProvider {
    createFrameRemoteClient(frameName: string, params: any): IFrameRemoteClient;
}
export interface IFrameRemoteClient {
    data(dataName: string): Onemitter<any>;
    action(actionName: string, args: any): Promise<any>;
}

export interface IRouteInfo {
    route: ISessionRoute;
    data: any[];
    modules: IPackInfoModule[];
}
export interface IRemoteMessageFrameParams {
    frameId: string;
    frameName: string;
    frameParams: any;
    sid: string;
}
export interface IRemoteMessageFrameData extends IRemoteMessageFrameParams {
    dataName: string;
}
export interface IRemoteMessageFrameAction extends IRemoteMessageFrameParams {
    actionId: string;
    actionName: string;
    args: any;
}
export interface IRemoteMessageFrameOffData extends IRemoteMessageFrameParams {
    dataName: string;
}
