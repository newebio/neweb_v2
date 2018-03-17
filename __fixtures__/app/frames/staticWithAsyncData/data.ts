import { DataSource } from "./../../../..";
export default class extends DataSource<any, any, any> {
    public onInit() {
        setTimeout(() => {
            this.emit({ field1: "value1" });
        }, 500);
    }
}
