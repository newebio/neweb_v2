import o from "onemitter";
export default class Remote {

    public remoteData1 = o();
    constructor(protected config: { params: any }) {
        let i = 0;
        setInterval(() => {
            this.remoteData1.emit("remote-data1-" + config.params.param1 + ++i);
        }, 100);
    }
}
Remote.prototype.__data = ["remoteData1"];
