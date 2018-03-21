import ReactDOM = require("react-dom");
import { IFramesRoute } from "./..";
import BundleConfiguration from "./BundleConfiguration";
import FrameController from "./FrameController";
const initialRoute: IFramesRoute = (window as any).__initial_route;
const initialData: any[] = (window as any).__initial_data;
// const sessionInfo: { id: string; hash: string } = (window as any).__session_info;

const configuration = new BundleConfiguration();
configuration.init().then(() => {
    (window as any).Neweb = { configuration };
    const frameController = new FrameController({
        configuration,
        remote: {} as any,
    });
    frameController.render(initialRoute, initialData).then((el) => {
        ReactDOM.hydrate(el, document.getElementById("root"), () => {
            console.log("Hydrate finished");
        });
    });
});
