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
export interface IConfiguration {
    resolveFrame(name: string): Promise<IFrameConfig>;
    hasFrame(name: string): Promise<boolean>;
    getModulesForFrame(name: string): Promise<IPackInfoModule[]>;
    getModuleContent(moduleInfo: IPackInfoModule): Promise<string>;
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
    data(frameName: string, params: any, dataName: string): Onemitter<any>;
    action(frameName: string, params: any, action: string, args: any[]): void;
}
export const REQUIRE_FUNC_NAME = "loadModule";
