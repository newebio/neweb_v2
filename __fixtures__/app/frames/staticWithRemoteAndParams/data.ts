import { DataSource } from "./../../../..";
export default class extends DataSource<any, any, any> {
    public async onInit() {
        this.emit(await this.config.remote.remoteData1.wait());
    }
}
