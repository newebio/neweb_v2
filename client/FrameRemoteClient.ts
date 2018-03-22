import o, { Onemitter } from "onemitter";
import { IFrameRemoteClient } from "./..";

export interface IFrameRemoteClientConfig {
    id: string;
    sid: string;
    name: string;
    params: any;
    provider: {
        on(eventName: string, cb: (...args: any[]) => void): void;
        emit(...args: any[]): void;
    };
}
class FrameRemoteClient implements IFrameRemoteClient {
    protected datas: { [index: string]: Onemitter<any> } = {};
    protected actions: {
        [index: string]: {
            resolve: (...args: any[]) => void;
        };
    } = {};
    protected isDisposed = false;
    constructor(protected config: IFrameRemoteClientConfig) {
        this.config.provider.on("on-frame-data-" + this.config.id, (dataName, value) => {
            if (this.datas[dataName]) {
                this.datas[dataName].emit(value);
            }
        });
        this.config.provider.on("on-frame-action-" + this.config.id, (actionId, result) => {
            this.actions[actionId].resolve(result);
            delete this.actions[actionId];
        });
    }
    public data(dataName: string) {
        this.datas[dataName] = o();
        this.config.provider.emit("frame-data", {
            frameId: this.config.id,
            frameName: this.config.name,
            frameParams: this.config.params,
            sid: this.config.sid,
            dataName,
        });
        return this.datas[dataName];
    }
    public action(actionName: string, args: any) {
        const id = this.generateId();
        return new Promise((resolve) => {
            this.actions[id] = {
                resolve,
            };
            this.config.provider.emit("frame-action", {
                id,
                sid: this.config.sid,
                frameName: this.config.name,
                frameParams: this.config.params,
                frameId: this.config.id,
                actionName,
                args,
            });
        });
    }
    public dispose() {
        this.isDisposed = true;
        Object.keys(this.datas).map((dataName) => {
            this.datas[dataName].removeAllListeners();
            this.config.provider.emit("off-frame-data", {
                dataName,
                frameName: this.config.name,
                frameParams: this.config.params,
                frameId: this.config.id,
                sid: this.config.sid,
            });
        });
    }
    protected generateId() {
        return (+new Date()).toString() + Math.floor(Math.random() * 10000);
    }
}
export default FrameRemoteClient;
