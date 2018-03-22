import { DataSource } from "neweb-core";
export default class extends DataSource<any, any, any> {
    public async onInit() {
        if (!this.config.data) {
            this.emit(await this.config.remote.remoteData1.wait());
        } else {
            this.emit(this.config.data);
        }
        this.config.remote.remoteData1.on((value) => {
            this.emit(value);
        });
    }
}
