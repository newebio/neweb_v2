import SocketIO = require("socket.io");
import { IConfiguration, IRemoteMessageFrameAction, IRemoteMessageFrameData, IRemoteMessageFrameParams } from "./..";
import FrameRemoteServer from "./FrameRemoteServer";
import SessionsManager from "./SessionsManager";
export interface IRemoteManagerConfig {
    sessionsManager: SessionsManager;
    configuration: IConfiguration;
}
class RemoteManager {
    protected frames: { [index: string]: { frameRemote: FrameRemoteServer } } = {};
    constructor(protected config: IRemoteManagerConfig) {

    }
    public onNewSocket(socket: SocketIO.Socket) {
        socket.on("frame-data", async (params: IRemoteMessageFrameData) => {
            await this.createFrameRemoteServer(socket, params);
            this.frames[params.frameId].frameRemote.data(params.dataName);
        });
        socket.on("frame-action", async (params: IRemoteMessageFrameAction) => {
            await this.createFrameRemoteServer(socket, params);
            this.frames[params.frameId].frameRemote.action(
                params.actionId,
                params.actionName, params.args);
        });
        socket.on("off-frame-data", () => {
            // TODO:
        });
    }
    protected async createFrameRemoteServer(socket: SocketIO.Socket, params: IRemoteMessageFrameParams) {
        if (!this.frames[params.frameId]) {
            this.frames[params.frameId] = {
                frameRemote: new FrameRemoteServer({
                    socket,
                    frameName: params.frameName,
                    id: params.frameId,
                    frameParams: params.frameParams,
                    configuration: this.config.configuration,
                }),
            };
            await this.frames[params.frameId].frameRemote.init();
        }
    }
}
export default RemoteManager;
