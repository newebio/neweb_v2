import SocketIO = require("socket.io");
import { IConfiguration } from "..";
import Page from "./Page";
import SessionsManager from "./SessionsManager";
export interface IPageManagerConfig {
    sessionsManager: SessionsManager;
    configuration: IConfiguration;
}
class PageManager {
    protected pages: { [index: string]: { page: Page } } = {};
    constructor(protected config: IPageManagerConfig) {

    }
    public onNewSocket(socket: SocketIO.Socket) {
        socket.on("request", async (params: {
            id: string;
            sid: string;
            pid: string;
            type: "get-module";
            params: any;
        }) => {
            try {
                const session = await this.config.sessionsManager.resolveSessionBySid(params.sid);
                if (params.type === "get-module") {
                    socket.emit("response", params.id,
                        await this.config.configuration.getModuleContent(params.params));
                    return;
                }
                const pageItem = this.pages[params.sid + ":" + params.pid];
                const page = pageItem ? pageItem.page : this.createPage();
            } catch (e) {
                socket.emit("error", "Invalid session");
            }
        });
    }
    public createPage() {
        return new Page();
    }
}
export default PageManager;
