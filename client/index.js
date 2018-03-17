"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ReactDOM = require("react-dom");
const FrameController_1 = require("./FrameController");
const initialRoute = window.__initial_route;
const initialData = window.__initial_data;
// tslint:disable-next-line:no-var-requires
const configuration = require("__configuration__");
const frameController = new FrameController_1.default({
    configuration,
    remote: {},
});
frameController.render(initialRoute, initialData).then((el) => {
    ReactDOM.hydrate(el, document.getElementById("root"));
});
