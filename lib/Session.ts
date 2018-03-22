import { exists, readFile, writeFile } from "fs";
import mkdirp = require("mkdirp");
import React = require("react");
// tslint:disable-next-line:no-submodule-imports
import ReactDOMServer = require("react-dom/server");
import sleep from "sleep-es6";
import { promisify } from "util";
import diffModules from "../utils/diffModules";
import uniqueModules from "../utils/uniqueModules";
import { IConfiguration, IFramesRoute, IRoute, ISessionRoute } from "./..";
import { IPackInfoModule } from "./ModulePacker";

export interface ISessionConfig {
    id: string;
    hash: string;
    info?: ISessionInfo;
    configuration: IConfiguration;
    sessionsPath: string;
}
export interface ISessionInfo {
    html: string;
    data: any[];
    route: ISessionRoute;
    modules: any[];
    sessionId: string;
    sessionHash: string;
}
class Session {
    protected currentRoute: IFramesRoute;
    protected id: string;
    protected hash: string;
    protected info?: ISessionInfo;
    constructor(protected config: ISessionConfig) {
        this.id = this.config.id;
        this.hash = this.config.hash;
        this.info = this.config.info;
    }
    public getId() {
        return this.id;
    }
    public getHash() {
        return this.hash;
    }
    public async render(route: IFramesRoute): Promise<ISessionInfo> {
        this.currentRoute = route;
        const frames = await Promise.all(this.currentRoute.frames.map(async (routeFrame) => {
            const frame = await this.config.configuration.resolveFrame(routeFrame.frame);
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
            const dataResult = await Promise.race([dataInstance.wait(), sleep(5000).then(() => error)]);
            if (dataResult === error) {
                throw { code: 504, text: "Timeout for frame data " + frame.name };
            }
            const frameModules = await this.config.configuration.getModulesForFrame(frame.name);
            return {
                name: frame.name,
                view: frame.view,
                data: dataResult,
                modules: frameModules,
                remoteClient: frame.remoteClient,
                params: routeFrame.params,
            };
        }));
        const data = frames.map((f) => f.data);
        let children: any = null;
        let modules: IPackInfoModule[] = [];
        for (const frame of frames.reverse()) {
            children = React.createElement(frame.view, { key: frame.name, children, data: frame.data });
            modules = modules.concat(frame.modules);
        }

        if (!this.info) {
            await promisify(mkdirp)(this.config.sessionsPath + "/" + this.id);
        }
        await promisify(writeFile)(this.config.sessionsPath + "/" + this.id + "/session.json", JSON.stringify({
            id: this.id,
            hash: this.hash,
            currentRoute: this.currentRoute,
            modules: this.info ? uniqueModules(modules.concat(this.info.modules)) : modules,
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
            // modules: this.info ? diffModules(modules, this.info.modules) : modules,
        };
    }
}
export default Session;
