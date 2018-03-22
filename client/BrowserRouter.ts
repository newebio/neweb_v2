import { IRouteInfo } from "..";
import FrameController from "./FrameController";
import ModulesManager from "./ModulesManager";

export interface IBrowserRouterConfig {
    app: FrameController;
    routeResolver: { resolve: (href: string) => Promise<IRouteInfo> };
    modulesManager: ModulesManager;
}
class BrowserRouter {
    constructor(protected config: IBrowserRouterConfig) {
        (window as any).NewebHistory = this;
        window.addEventListener("popstate", async (e) => {
            if (e.state) {
                await this.config.modulesManager.preloadModules(e.state.modules);
                this.config.app.updateRoute(e.state.route, e.state.data);
                return;
            }
        }, false);
    }
    public async replace(url: string) {
        history.replaceState(await this.navigate(url), "", url);
    }
    public async push(url: string) {
        console.log("push", url);
        history.pushState(await this.navigate(url), "", url);
    }
    public async navigate(url: string) {
        const routeInfo = await this.config.routeResolver.resolve(url);
        await this.config.modulesManager.preloadModules(routeInfo.modules);
        await this.config.app.updateRoute(routeInfo.route, routeInfo.data);
        return routeInfo;
    }
    public init(routeInfo: IRouteInfo) {
        history.replaceState(routeInfo, "", window.location.href);
    }
}
export default BrowserRouter;
