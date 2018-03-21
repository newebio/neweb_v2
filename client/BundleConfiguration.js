"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
// tslint:disable max-classes-per-file
const onemitter_1 = require("onemitter");
const React = require("react");
const ReactDOM = require("react-dom");
const __1 = require("..");
class BundleConfiguration {
    constructor() {
        this.modules = [];
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
    init() {
        return __awaiter(this, void 0, void 0, function* () {
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
                    yield this.addModule(type, name, version, scriptEl.textContent || "");
                }
            }
            const nw = localStorage.getItem("__neweb_modules");
            if (nw) {
                yield Promise.all(JSON.parse(nw).map((m) => this.addModule(m.type, m.name, m.version, m.content)));
            }
            localStorage.setItem("__neweb_modules", JSON.stringify(this.modules.filter((m) => !!m.version)));
        });
    }
    addModule(type, name, version, content) {
        return __awaiter(this, void 0, void 0, function* () {
            if (yield this.hasModule(type, name, version)) {
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
        });
    }
    hasFrame(name) {
        return __awaiter(this, void 0, void 0, function* () {
            const mod = this.modules.find((m) => m.type === "local" && m.name === "frames/" + name + "/view");
            return !!mod;
        });
    }
    hasModule(type, name, version) {
        return __awaiter(this, void 0, void 0, function* () {
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
        });
    }
    resolveFrame(name) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!(yield this.hasModule("local", "frames/" + name + "/view"))) {
                throw new Error("Not found view for frame " + name);
            }
            const view = this.loadModule("local", "frames/" + name + "/view").default;
            const actions = (yield this.hasModule("local", "frames/" + name + "/actions")) ?
                this.loadModule("local", "frames/" + name + "/actions").default : class {
            };
            const data = (yield this.hasModule("local", "frames/" + name + "/data")) ?
                this.loadModule("local", "frames/" + name + "/data").default : onemitter_1.Onemitter;
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
        });
    }
    loadModule(type, name, version) {
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
    evalModule(content) {
        window[__1.REQUIRE_FUNC_NAME] = this.loadModule.bind(this);
        // tslint:disable-next-line:no-eval
        return eval(content);
    }
}
exports.default = BundleConfiguration;
