import { DataSource } from "neweb-core";
export default class extends DataSource<any, any, any> {
    public onInit() {
        if (this.config.data) {
            this.emit(this.config.data);
            setTimeout(() => {
                this.emit({ field1: "value2" });
            }, 500);
        } else {
            setTimeout(() => {
                this.emit({ field1: "value1" });
            }, 500);
        }
    }
}
