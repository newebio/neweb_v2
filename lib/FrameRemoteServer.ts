import SocketIO = require("socket.io");
import { IConfiguration } from "./..";
export interface IFrameRemoteServerConfig {
    id: string;
    frameName: string;
    frameParams: any;
    configuration: IConfiguration;
    socket: SocketIO.Socket;
}
class FrameRemoteServer {
    protected remote: any;
    constructor(protected config: IFrameRemoteServerConfig) {

    }
    public async init() {
        const frameConfig = await this.config.configuration.resolveFrame(this.config.frameName);
        this.remote = new frameConfig.remote({
            params: this.config.frameParams,
        });
    }
    public data(dataName: string) {
        this.remote[dataName].on((value: any) => {
            this.config.socket.emit("on-frame-data-" + this.config.id, dataName, value);
        });
    }
    public async action(actionId: string, actionName: string, args: any) {
        this.config.socket.emit("on-frame-action-" + this.config.id, actionId,
            await this.remote[actionName](args),
        );
    }
    public offData(dataName: string) {
        this.remote[dataName].removeAllListeners();
    }
}
export default FrameRemoteServer;
