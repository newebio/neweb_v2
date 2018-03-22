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
const fs_1 = require("fs");
const path_1 = require("path");
const util_1 = require("util");
const DataSource_1 = require("./DataSource");
class FileConfiguration {
    constructor(config) {
        this.config = config;
    }
    getModuleContent(moduleInfo) {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield util_1.promisify(fs_1.readFile)(this.config.modulesPath + "/" + moduleInfo.type + "/" + moduleInfo.name +
                "/" + moduleInfo.version + "/index.js")).toString();
        });
    }
    getModuleContentStream(moduleInfo) {
        return __awaiter(this, void 0, void 0, function* () {
            return fs_1.createReadStream(this.config.modulesPath + "/" + moduleInfo.type + "/" + moduleInfo.name +
                "/" + moduleInfo.version + "/index.js");
        });
    }
    getModulesForFrame(name) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!(yield util_1.promisify(fs_1.exists)(this.config.appDir + "/frames/" + name))) {
                throw { code: 404, text: "Not found frame " + name };
            }
            const modulePacker = this.config.modulePacker;
            const modules = [];
            const viewInfo = yield modulePacker.addLocalPackage(this.config.appDir + "/frames/" + name + "/view.js");
            modules.push({ name: viewInfo.name, version: viewInfo.version, type: "local" });
            viewInfo.modules.map((m) => modules.push(m));
            if (yield util_1.promisify(fs_1.exists)(this.config.appDir + "/frames/" + name + "/data.js")) {
                const dataInfo = yield modulePacker.addLocalPackage(this.config.appDir + "/frames/" + name + "/data.js");
                modules.push({ name: dataInfo.name, version: dataInfo.version, type: "local" });
                dataInfo.modules.map((m) => modules.push(m));
            }
            if (yield util_1.promisify(fs_1.exists)(this.config.appDir + "/frames/" + name + "/actions.js")) {
                const actionsInfo = yield modulePacker.addLocalPackage(this.config.appDir + "/frames/" + name + "/actions.js");
                modules.push({ name: actionsInfo.name, version: actionsInfo.version, type: "local" });
                actionsInfo.modules.map((m) => modules.push(m));
            }
            return modules;
        });
    }
    hasFrame(name) {
        return __awaiter(this, void 0, void 0, function* () {
            return util_1.promisify(fs_1.exists)(path_1.resolve(this.config.appDir + "/frames/" + name));
        });
    }
    resolveFrame(name) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!(yield util_1.promisify(fs_1.exists)(path_1.resolve(this.config.appDir + "/frames/" + name)))) {
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
        });
    }
    resolveRemote(name) {
        try {
            return require(this.config.appDir + "/frames/" + name + "/remote").default;
        }
        catch (e) {
            return class {
            };
        }
    }
    resolveData(name) {
        try {
            return require(this.config.appDir + "/frames/" + name + "/data").default;
        }
        catch (e) {
            return DataSource_1.default;
        }
    }
    resolveView(name) {
        try {
            return require(this.config.appDir + "/frames/" + name + "/view").default;
        }
        catch (e) {
            return () => null;
        }
    }
    resolveActions(name) {
        try {
            return require(this.config.appDir + "/frames/" + name + "/actions").default;
        }
        catch (e) {
            return class {
            };
        }
    }
}
exports.default = FileConfiguration;
