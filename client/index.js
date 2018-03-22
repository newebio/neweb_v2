"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ReactDOM = require("react-dom");
const BrowserRouter_1 = require("./BrowserRouter");
const BundleConfiguration_1 = require("./BundleConfiguration");
const FrameController_1 = require("./FrameController");
const ModulesManager_1 = require("./ModulesManager");
const RouteResolver_1 = require("./RouteResolver");
// import SocketClient from "./SocketClient";
// const sessionInfo: { id: string; hash: string } = (window as any).__session_info;
/*const socketClient = new SocketClient({
    address: window.location.protocol + window.location.host,
    sid: sessionInfo.id + sessionInfo.hash,
    pid: Math.random().toString(),
});*/
const routeInfo = window.__initial_data;
const modulesManager = new ModulesManager_1.default({
    address: window.location.protocol + "//" + window.location.host + "/modules",
});
modulesManager.preloadModules(routeInfo.modules).then(() => {
    const configuration = new BundleConfiguration_1.default({
        modulesManager,
    });
    const frameController = new FrameController_1.default({
        configuration,
        remote: {},
    });
    const routeResolver = new RouteResolver_1.default({
        address: window.location.protocol + "//" + window.location.host,
    });
    const browserRouter = new BrowserRouter_1.default({
        app: frameController,
        routeResolver,
        modulesManager,
    });
    browserRouter.init(routeInfo);
    window.Neweb = { configuration };
    frameController.render(routeInfo.route, routeInfo.data).then((el) => {
        ReactDOM.hydrate(el, document.getElementById("root"), () => {
            console.log.call(console, "Hydrate finished");
        });
    });
});
