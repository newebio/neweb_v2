import ReactDOM = require("react-dom");
import { IRouteInfo } from "./..";
import BrowserRouter from "./BrowserRouter";
import BundleConfiguration from "./BundleConfiguration";
import FrameController from "./FrameController";
import ModulesManager from "./ModulesManager";
import RouteResolver from "./RouteResolver";
import WebsocketRemoteProvider from "./WebsocketRemoteProvider";

const routeInfo: IRouteInfo = (window as any).__initial_data;
const modulesManager = new ModulesManager({
    address: window.location.protocol + "//" + window.location.host + "/modules",
});
modulesManager.preloadModules(routeInfo.modules).then(() => {
    const remoteProvider = new WebsocketRemoteProvider({
        address: window.location.protocol + "//" + window.location.host,
        sid: getCookie("sid"),
    });
    const configuration = new BundleConfiguration({
        modulesManager,
    });
    const frameController = new FrameController({
        configuration,
        remote: remoteProvider,
    });
    const routeResolver = new RouteResolver({
        address: window.location.protocol + "//" + window.location.host,
    });
    const browserRouter = new BrowserRouter({
        app: frameController,
        routeResolver,
        modulesManager,
    });
    browserRouter.init(routeInfo);

    (window as any).Neweb = { configuration };

    frameController.render(routeInfo.route, routeInfo.data).then((el) => {
        ReactDOM.hydrate(el, document.getElementById("root"), () => {
            console.log.call(console, "Hydrate finished");
        });
    });
});
function getCookie(name: string) {
    const matches = document.cookie.match(new RegExp(
        "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, "\\$1") + "=([^;]*)",
    ));
    return matches ? decodeURIComponent(matches[1]) : "";
}
