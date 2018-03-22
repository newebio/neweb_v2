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
class BundleConfiguration {
    constructor(config) {
        this.config = config;
    }
    hasFrame(name) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.config.modulesManager.hasModule("local", "frames/" + name + "/view");
        });
    }
    resolveFrame(name) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!(yield this.config.modulesManager.hasModule("local", "frames/" + name + "/view"))) {
                throw new Error("Not found view for frame " + name);
            }
            const view = this.config.modulesManager.loadModule("local", "frames/" + name + "/view").default;
            const actions = (yield this.config.modulesManager.hasModule("local", "frames/" + name + "/actions")) ?
                this.config.modulesManager.loadModule("local", "frames/" + name + "/actions").default : class {
            };
            const data = (yield this.config.modulesManager.hasModule("local", "frames/" + name + "/data")) ?
                this.config.modulesManager.loadModule("local", "frames/" + name + "/data").default : onemitter_1.Onemitter;
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
}
exports.default = BundleConfiguration;
