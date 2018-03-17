import ReactDOM = require("react-dom");
import { IFramesRoute } from "./..";
import FrameController from "./FrameController";
const initialRoute: IFramesRoute = (window as any).__initial_route;
const initialData: any[] = (window as any).__initial_data;
// tslint:disable-next-line:no-var-requires
const configuration = require("__configuration__");
const frameController = new FrameController({
    configuration,
    remote: {} as any,
});
frameController.render(initialRoute, initialData).then((el) => {
    ReactDOM.hydrate(el, document.getElementById("root"));
});
