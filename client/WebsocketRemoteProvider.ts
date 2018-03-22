import SocketIOClient = require("socket.io-client");
import { IRemoteProvider } from "..";
import FrameRemoteClient from "./FrameRemoteClient";
export interface IWebsocketRemoteProviderConfig {
    address: string;
    sid: string;
}
class WebsocketRemoteProvider implements IRemoteProvider {
    protected io: SocketIOClient.Socket;
    constructor(protected config: IWebsocketRemoteProviderConfig) {
        this.io = SocketIOClient(this.config.address);
    }
    public createFrameRemoteClient(frameName: string, params: any) {
        const frameRemoteClient = new FrameRemoteClient({
            id: this.generateId(),
            sid: this.config.sid,
            name: frameName,
            params,
            provider: this.io,
        });

        return frameRemoteClient;
    }
    protected generateId() {
        return (+new Date()).toString() + Math.floor(Math.random() * 10000);
    }
}
export default WebsocketRemoteProvider;
