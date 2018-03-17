import { Onemitter } from "onemitter";
export interface IDataSourceConfig<D, P, R> {
    params: P;
    data: D;
    remote: R;
}
export default class DataSource<D, P, R> extends Onemitter<D> {
    constructor(protected config: IDataSourceConfig<D, P, R>) {
        super();
        this.onInit();
    }
    public onInit() {
        this.emit(null as any);
    }
}
