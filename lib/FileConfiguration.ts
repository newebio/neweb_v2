// tslint:disable max-classes-per-file
import { createReadStream, exists, readFile, stat, writeFile } from "fs";
import { resolve } from "path";
import { promisify } from "util";
import { IFrameConfig } from "..";
import DataSource from "./DataSource";
import ModulePacker, { IPackInfoModule } from "./ModulePacker";
export interface IFileConfigurationConfig {
    appDir: string;
    modulesPath: string;
    modulePacker: ModulePacker;
}
class FileConfiguration {
    constructor(protected config: IFileConfigurationConfig) {

    }
    public async getModuleContent(moduleInfo: IPackInfoModule) {
        return (await promisify(readFile)(
            this.config.modulesPath + "/" + moduleInfo.type + "/" + moduleInfo.name +
            "/" + moduleInfo.version + "/index.js")).toString();
    }
    public async getModuleContentStream(moduleInfo: IPackInfoModule) {
        return createReadStream(this.config.modulesPath + "/" + moduleInfo.type + "/" + moduleInfo.name +
            "/" + moduleInfo.version + "/index.js");
    }
    public async getModulesForFrame(name: string) {
        if (!await promisify(exists)(this.config.appDir + "/frames/" + name)) {
            throw { code: 404, text: "Not found frame " + name };
        }
        const modulePacker = this.config.modulePacker;
        const modules: IPackInfoModule[] = [];
        const viewInfo = await modulePacker.addLocalPackage(this.config.appDir + "/frames/" + name + "/view.js");
        modules.push({ name: viewInfo.name, version: viewInfo.version, type: "local" });
        viewInfo.modules.map((m) => modules.push(m));
        if (await promisify(exists)(this.config.appDir + "/frames/" + name + "/data.js")) {
            const dataInfo = await modulePacker.addLocalPackage(this.config.appDir + "/frames/" + name + "/data.js");
            modules.push({ name: dataInfo.name, version: dataInfo.version, type: "local" });
            dataInfo.modules.map((m) => modules.push(m));
        }
        if (await promisify(exists)(this.config.appDir + "/frames/" + name + "/actions.js")) {
            const actionsInfo = await modulePacker.addLocalPackage(
                this.config.appDir + "/frames/" + name + "/actions.js");
            modules.push({ name: actionsInfo.name, version: actionsInfo.version, type: "local" });
            actionsInfo.modules.map((m) => modules.push(m));
        }
        return modules;
    }
    public async resolveTemplate() {
        if (!await promisify(exists)(resolve(this.config.appDir + "/template.html"))) {
            return `<!doctype><html><head>
            </head>
            <body><div id="root">{%__initial_html__%}</div>
            {%__initial_script__%}
            <script src="/bundle.js"></script>
            </body></html>`;
        }
        return (await promisify(readFile)(resolve(this.config.appDir + "/template.html"))).toString();
    }
    public async hasFrame(name: string) {
        return promisify(exists)(resolve(this.config.appDir + "/frames/" + name));
    }
    public async resolveFrame(name: string): Promise<IFrameConfig> {
        if (!await promisify(exists)(resolve(this.config.appDir + "/frames/" + name))) {
            throw { code: 404, text: "Not found frame " + name };
        }
        const remote = this.resolveRemote(name);
        return {
            name,
            actions: this.resolveActions(name),
            view: this.resolveView(name),
            data: this.resolveData(name),
            remote,
            remoteClient: {
                data: remote.prototype.__data || [],
                actions: remote.prototype.__actions || [],
            },
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
