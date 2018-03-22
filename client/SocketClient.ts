import SocketIOClient = require("socket.io-client");
export interface ISocketClientConfig {
    address: string;
    sid: string;
    pid: string;
}
export interface ISocketRequest {
    id: string;
    sid: string;
    pid: string;
    type: string;
    params: any;
}
class SocketClient {
    protected io: SocketIOClient.Socket;
    protected requests: {
        [index: string]: {
            resolve: (...args: any[]) => void;
        };
    } = {};
    constructor(protected config: ISocketClientConfig) {
        this.io = SocketIOClient();
        this.io.on("response", (id: string, content: string) => {
            if (this.requests[id]) {
                this.requests[id].resolve(content);
                delete this.requests[id];
            }
        });
    }
    public request(type: string, params: any) {
        const id = this.generateId();
        return new Promise((resolve) => {
            this.requests[id] = {
                resolve,
            };
            this.io.emit("request", {
                id,
                sid: this.config.sid,
                pid: this.config.pid,
                type,
                params,
            });
        });
    }
    protected generateId() {
        return (+new Date()) + Math.floor(Math.random() * 10000);
    }
}
export default SocketClient;
