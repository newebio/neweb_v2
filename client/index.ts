import ReactDOM = require("react-dom");
import { IFramesRoute, IRouteInfo } from "./..";
import BrowserRouter from "./BrowserRouter";
import BundleConfiguration from "./BundleConfiguration";
import FrameController from "./FrameController";
import ModulesManager from "./ModulesManager";
import RouteResolver from "./RouteResolver";
// import SocketClient from "./SocketClient";
// const sessionInfo: { id: string; hash: string } = (window as any).__session_info;
/*const socketClient = new SocketClient({
    address: window.location.protocol + window.location.host,
    sid: sessionInfo.id + sessionInfo.hash,
    pid: Math.random().toString(),
});*/
const routeInfo: IRouteInfo = (window as any).__initial_data;
const modulesManager = new ModulesManager({
    address: window.location.protocol + "//" + window.location.host + "/modules",
});
modulesManager.preloadModules(routeInfo.modules).then(() => {
    const configuration = new BundleConfiguration({
        modulesManager,
    });
    const frameController = new FrameController({
        configuration,
        remote: {} as any,
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
