// tslint:disable max-classes-per-file
import { exists } from "fs";
import { promisify } from "util";
import { IFrameConfig } from "..";
import DataSource from "./DataSource";
export interface IFileConfigurationConfig {
    appDir: string;
}
class FileConfiguration {
    constructor(protected config: IFileConfigurationConfig) {

    }
    public async hasFrame(name: string) {
        return promisify(exists)(this.config.appDir + "/frames/" + name);
    }
    public async resolveFrame(name: string): Promise<IFrameConfig> {
        if (!await promisify(exists)(this.config.appDir + "/frames/" + name)) {
            throw { code: 404 };
        }
        return {
            name,
            actions: this.resolveActions(name),
            view: this.resolveView(name),
            data: this.resolveData(name),
            remote: this.resolveRemote(name),
        };
    }
    protected resolveRemote(name: string) {
        try {
            return require(this.config.appDir + "/frames/" + name + "/remote").default;
        } catch (e) {
            return class { };
        }
    }
    protected resolveData(name: string) {
        try {
            return require(this.config.appDir + "/frames/" + name + "/data").default;
        } catch (e) {
            return DataSource;
        }
    }
    protected resolveView(name: string) {
        try {
            return require(this.config.appDir + "/frames/" + name + "/view").default;
        } catch (e) {
            return () => null;
        }
    }
    protected resolveActions(name: string) {
        try {
            return require(this.config.appDir + "/frames/" + name + "/actions").default;
        } catch (e) {
            return class { };
        }
    }
}
export default FileConfiguration;
