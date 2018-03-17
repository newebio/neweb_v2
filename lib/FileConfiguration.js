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
const util_1 = require("util");
const DataSource_1 = require("./DataSource");
class FileConfiguration {
    constructor(config) {
        this.config = config;
    }
    hasFrame(name) {
        return __awaiter(this, void 0, void 0, function* () {
            return util_1.promisify(fs_1.exists)(this.config.appDir + "/frames/" + name);
        });
    }
    resolveFrame(name) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!(yield util_1.promisify(fs_1.exists)(this.config.appDir + "/frames/" + name))) {
                throw { code: 404 };
            }
            return {
                name,
                actions: this.resolveActions(name),
                view: this.resolveView(name),
                data: this.resolveData(name),
                remote: this.resolveRemote(name),
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
