import { exists, readFile, writeFile } from "fs";
import mkdirp = require("mkdirp");
import React = require("react");
// tslint:disable-next-line:no-submodule-imports
import ReactDOMServer = require("react-dom/server");
import sleep from "sleep-es6";
import { promisify } from "util";
import uniqueModules from "../utils/uniqueModules";
import { IConfiguration, IFramesRoute, IRoute } from "./..";
import { IPackInfoModule } from "./ModulePacker";
import diffModules from "../utils/diffModules";

export interface ISessionConfig {
    initialRoute: IFramesRoute;
    configuration: IConfiguration;
    sessionsPath: string;
    sid: string;
}
export interface ISessionInfo {
    html: string;
    data: any[];
    route: IRoute;
    modules: any[];
    sessionId: string;
    sessionHash: string;
}
class Session {
    protected currentRoute: IFramesRoute;
    protected id: string;
    protected hash: string;
    protected info: ISessionInfo;
    constructor(protected config: ISessionConfig) {

    }
    public async init() {
        this.currentRoute = this.config.initialRoute;
        if (this.config.sid) {
            const [id, hash] = this.config.sid.split(":");
            if (await promisify(exists)(this.config.sessionsPath + "/" + id + "/session.json")) {
                const sessionInfo = JSON.parse(
                    (await promisify(readFile)(this.config.sessionsPath + "/" + id + "/session.json")).toString());
                if (sessionInfo.hash === hash) {
                    this.info = sessionInfo;
                    this.id = id;
                    this.hash = hash;
                    return;
                }
            }
        }
        this.id = new Date().getTime().toString() + Math.round(Math.random() * 100000).toString();
        this.hash = new Date().getTime().toString() + Math.round(Math.random() * 100000).toString();
    }
    public async render(): Promise<ISessionInfo> {
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
            route: this.currentRoute,
            data,
            modules: this.info ? diffModules(modules, this.info.modules) : modules,
        };
    }
}
export default Session;
