"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ReactDOM = require("react-dom");
const BundleConfiguration_1 = require("./BundleConfiguration");
const FrameController_1 = require("./FrameController");
const initialRoute = window.__initial_route;
const initialData = window.__initial_data;
// const sessionInfo: { id: string; hash: string } = (window as any).__session_info;
const configuration = new BundleConfiguration_1.default();
configuration.init().then(() => {
    window.Neweb = { configuration };
    const frameController = new FrameController_1.default({
        configuration,
        remote: {},
    });
    frameController.render(initialRoute, initialData).then((el) => {
        ReactDOM.hydrate(el, document.getElementById("root"), () => {
            console.log("Hydrate finished");
        });
    });
});
