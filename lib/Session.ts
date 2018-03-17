import React = require("react");
// tslint:disable-next-line:no-submodule-imports
import ReactDOMServer = require("react-dom/server");
import sleep from "sleep-es6";
import { IConfiguration, IFramesRoute, IRoute } from "./..";

export interface ISessionConfig {
    initialRoute: IFramesRoute;
    configuration: IConfiguration;
}
class Session {
    protected currentRoute: IFramesRoute;
    constructor(protected config: ISessionConfig) {
        this.currentRoute = this.config.initialRoute;
    }
    public async render(): Promise<{
        html: string;
        data: any[];
        route: IRoute;
    }> {
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
            return {
                name: frame.name,
                view: frame.view,
                data: dataResult,
            };
        }));
        const data = frames.map((f) => f.data);
        let children: any = null;
        for (const frame of frames.reverse()) {
            children = React.createElement(frame.view, { key: frame.name, children, data: frame.data });
        }
        return {
            html: ReactDOMServer.renderToString(children),
            route: this.currentRoute,
            data,
        };
    }
}
export default Session;
