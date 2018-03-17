import { parse } from "url";
import { IConfiguration, IRequest, IRoute, IRouter } from "./..";
export interface IFramesBasedRouterConfig {
    configuration: IConfiguration;
}
class FramesBasedRouter implements IRouter {
    protected basePath = "/";
    constructor(protected config: IFramesBasedRouterConfig) {

    }
    public async resolve(request: IRequest): Promise<IRoute> {
        const url = parse(request.url);
        if (!url.pathname) {
            throw new Error("Url should contain path: " + request.url);
        }
        const pathname = this.basePath ? url.pathname.substr(this.basePath.length) : url.pathname;
        const framesNames = pathname.split("_").map((frameName) => frameName || "index");
        const isExistings =
            (await Promise.all(framesNames.map((frameName) => this.config.configuration.hasFrame(frameName))));

        for (const [index, isExisting] of isExistings.entries()) {
            if (!isExisting) {
                return {
                    status: 404,
                    text: "Not found frame " + framesNames[index],
                };
            }
        }

        const params = url.query ? this.parseParams(url.query) : [];
        return {
            status: 200,
            frames: framesNames.map((name, i) => {
                return {
                    frame: name,
                    params: params[i],
                };
            }),
        };
    }
    protected parseParams(query: string) {
        const queryParams = query.split("&");
        const params: Array<{ [index: string]: string }> = [];
        for (const param of queryParams) {
            const [paramFullName, paramValue] = param.split("=");
            const [frameShortName, paramName] = paramFullName.split("_");
            const frameNumber = parseInt(frameShortName.substr(1), 10);
            if (!params[frameNumber]) {
                params[frameNumber] = {};
            }
            params[frameNumber][paramName] = decodeURIComponent(paramValue);
        }
        return params;
    }
}
export default FramesBasedRouter;
