// tslint:disable max-classes-per-file
import { Onemitter } from "onemitter";
import React = require("react");
import ReactDOM = require("react-dom");
import { IClientConfiguration, REQUIRE_FUNC_NAME } from "..";
class BundleConfiguration implements IClientConfiguration {
    protected modules: Array<{
        name: string;
        version?: string;
        type: string;
        exports: any;
        content: string;
    }> = [];
    constructor() {
        this.modules.push({
            name: "react",
            version: undefined,
            type: "node",
            content: "",
            exports: React,
        });
        this.modules.push({
            name: "react-dom",
            version: undefined,
            type: "node",
            content: "",
            exports: ReactDOM,
        });
        /*const modules: any[] = (window as any).__modules;
        modules.map((mod) => this.modules.push({
            name: mod.info.name,
            version: mod.info.version,
            type: mod.info.type,
            content: mod.content,
            exports: undefined,
        }));*/

    }
    public async init() {
        for (const scriptEl of document.getElementsByTagName("script")) {
            if (scriptEl.type === "neweb/module") {
                const name = scriptEl.getAttribute("name");
                if (!name) {
                    throw new Error("Not found attribute name for neweb-module");
                }
                const version = scriptEl.getAttribute("version");
                if (!version) {
                    throw new Error("Not found attribute version for neweb-module");
                }
                const type = scriptEl.getAttribute("module-type");
                if (!type) {
                    throw new Error("Not found attribute `type` for neweb-module");
                }
                await this.addModule(
                    type,
                    name,
                    version,
                    scriptEl.textContent || "",
                );
            }
        }
        const nw = localStorage.getItem("__neweb_modules");
        if (nw) {
            await Promise.all(JSON.parse(nw).map((m: any) => this.addModule(m.type, m.name, m.version, m.content)));
        }
        localStorage.setItem("__neweb_modules", JSON.stringify(this.modules.filter((m) => !!m.version)));
    }
    public async addModule(type: string, name: string, version: string | undefined, content: string) {
        if (await this.hasModule(type, name, version)) {
            return;
        }
        this.modules.push({
            name,
            version,
            type,
            content,
            exports: undefined,
        });
        // localStorage.setItem("__neweb_module_" + type + "~" + name + "~" + version, content);
    }
    public async hasFrame(name: string) {
        const mod = this.modules.find((m) => m.type === "local" && m.name === "frames/" + name + "/view");
        return !!mod;
    }
    public async hasModule(type: string, name: string, version?: string) {
        const mod = this.modules.find((m) => m.type === type && m.name === name && (!version || m.version === version));
        if (mod) {
            return true;
        }
        /*const content = localStorage.getItem("__neweb_module_" + type + "~" + name + "~" + version);
        if (content) {
            await this.addModule(type, name, version, content);
            return true;
        }*/
        return false;
    }
    public async resolveFrame(name: string) {
        if (!await this.hasModule("local", "frames/" + name + "/view")) {
            throw new Error("Not found view for frame " + name);
        }
        const view = this.loadModule("local", "frames/" + name + "/view").default;
        const actions = await this.hasModule("local", "frames/" + name + "/actions") ?
            this.loadModule("local", "frames/" + name + "/actions").default : class { };
        const data = await this.hasModule("local", "frames/" + name + "/data") ?
            this.loadModule("local", "frames/" + name + "/data").default : Onemitter;
        return {
            name,
            view,
            actions,
            data,
            remote: {
                data: [],
                actions: [],
            },
        };
    }
    public loadModule(type: string, name: string, version?: string) {
        const mod = this.modules.find((m) => m.type === type && m.name === name && (!version || m.version === version));
        if (!mod) {
            throw new Error("Not found module " + type + "::" + name + "::" + version);
        }
        const content = localStorage.getItem("__neweb_module_" + type + "~" + name + "~" + version);
        if (content) {
            this.addModule(type, name, version, content);
        }
        if (typeof (mod.exports) === "undefined") {
            mod.exports = this.evalModule(mod.content);
        }
        return mod.exports;
    }
    protected evalModule(content: string) {
        (window as any)[REQUIRE_FUNC_NAME] = this.loadModule.bind(this);
        // tslint:disable-next-line:no-eval
        return eval(content);
    }
}
export default BundleConfiguration;
