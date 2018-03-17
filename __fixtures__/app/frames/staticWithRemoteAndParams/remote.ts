import o from "onemitter";
export default class {
    public remoteData1 = o();
    constructor(protected config: { params: any }) {
        this.remoteData1.emit("remote-data1-" + config.params.param1);
    }
}
