// tslint:disable max-classes-per-file
import { Onemitter } from "onemitter";
import { IClientConfiguration } from "..";
import ModulesManager from "./ModulesManager";
export interface IBundleConfigurationConfig {
    modulesManager: ModulesManager;
}
class BundleConfiguration implements IClientConfiguration {
    constructor(protected config: IBundleConfigurationConfig) { }
    public async hasFrame(name: string) {
        return this.config.modulesManager.hasModule("local", "frames/" + name + "/view");
    }
    public async resolveFrame(name: string) {
        if (!await this.config.modulesManager.hasModule("local", "frames/" + name + "/view")) {
            throw new Error("Not found view for frame " + name);
        }
        const view = this.config.modulesManager.loadModule("local", "frames/" + name + "/view").default;
        const actions = await this.config.modulesManager.hasModule("local", "frames/" + name + "/actions") ?
            this.config.modulesManager.loadModule("local", "frames/" + name + "/actions").default : class { };
        const data = await this.config.modulesManager.hasModule("local", "frames/" + name + "/data") ?
            this.config.modulesManager.loadModule("local", "frames/" + name + "/data").default : Onemitter;
        const remote = await this.config.modulesManager.hasModule("local", "frames/" + name + "/remote") ?
            this.config.modulesManager.loadModule("local", "frames/" + name + "/remote").default : class { };
        return {
            name,
            view,
            actions,
            data,
            remote,
        };
    }

}
export default BundleConfiguration;
