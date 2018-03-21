import { exists, readFile, stat, unlink, writeFile } from "fs";
import globby = require("globby");
import mkdirp = require("mkdirp");
import { basename, dirname, resolve as resolvePath, sep } from "path";
import { promisify } from "util";
import webpack = require("webpack");
import { REQUIRE_FUNC_NAME } from "..";
import { getNearestPackageJSON } from "./../utils/module-info";
import uniqueModules from "./../utils/uniqueModules";
export interface IModulePackerConfig {
    modulesPath: string;
    appRoot: string;
    excludedModules?: string[];
}

export interface IPackInfo extends IPackInfoModule {
    modules: IPackInfoModule[];
}
export interface IPackInfoModule {
    name: string;
    version?: string;
    type: "node" | "local" | "internal";
}

class ModulePacker {
    protected modules: IPackInfo[] = [];
    protected localModulesPath: string;
    protected nodeModulesPath: string;
    protected excludedModules: string[] = [];
    constructor(protected config: IModulePackerConfig) {
        if (this.config.excludedModules) {
            this.excludedModules = this.config.excludedModules;
        }
        this.localModulesPath = resolvePath(this.config.modulesPath + "/local");
        this.nodeModulesPath = resolvePath(this.config.modulesPath + "/node");
    }
    public async init() {
        await promisify(mkdirp)(this.localModulesPath);
        await promisify(mkdirp)(this.nodeModulesPath);
        //        let files = await globby(this.localModulesPath + "/**/neweb.json", { absolute: true });
        //       for (const file of files) {
        //          const newebJSON: IModule = require(file);
        //         this.modules.push(newebJSON);
        //    }
        //   files = await globby(this.nodeModulesPath + "/**/neweb.json", { absolute: true });
        //  for (const file of files) {
        //     const newebJSON: IModule = require(file);
        //    this.modules.push(newebJSON);
        // }
    }
    public async addLocalPackage(entry: string): Promise<IPackInfo> {
        const localPath = require.resolve(entry.startsWith(".") ? this.config.appRoot + "/" + entry : entry);
        const moduleName = localPath
            .replace(resolvePath(this.config.appRoot) + sep, "")
            .replace(/\.js$/i, "")
            .replace(/\\/gi, "/");
        const version = (await promisify(stat)(localPath)).mtime.getTime().toString();
        const mainFile = this.localModulesPath + "/" + moduleName + "/" + version + "/index.js";
        const newebFile = this.localModulesPath + "/" + moduleName + "/" + version + "/neweb.json";
        const existingModuleInfo =
            this.modules.find((m) => m.type === "local" && m.name === moduleName && m.version === version);
        if (existingModuleInfo) {
            return existingModuleInfo;
        }
        if (await promisify(exists)(newebFile)) {
            const jsonModuleInfo = JSON.parse((await promisify(readFile)(newebFile)).toString());
            return {
                name: jsonModuleInfo.name,
                version: jsonModuleInfo.version,
                type: "local",
                modules: jsonModuleInfo.dependencies,
            };
        }
        const info: IPackInfo = { name: moduleName, version, modules: [], type: "local" };
        this.modules.push(info);
        return new Promise<any>((resolve, reject) => {
            webpack({
                entry: localPath,
                output: {
                    path: dirname(mainFile),
                    filename: basename(mainFile),
                    libraryTarget: "commonjs2",
                },
                target: "node",
                mode: "production",
                externals: [async (context, childModuleName, callback) => {
                    if (!childModuleName.startsWith(".") && childModuleName !== localPath) {
                        if (this.excludedModules.indexOf(childModuleName) > -1) {
                            callback(null, `the ` + `${REQUIRE_FUNC_NAME}("node", "${childModuleName}")`);
                            return;
                        }
                        const child = await this.handleChildNodeModule(context, childModuleName);
                        info.modules.push({
                            name: child.name,
                            type: "node",
                            version: child.version,
                        });
                        child.modules.map((m) => info.modules.push(m));
                        callback(null, `the ` + `${REQUIRE_FUNC_NAME}("node", "${child.name}", "${child.version}")`);
                        return;
                    }
                    if (childModuleName.startsWith(".") && childModuleName !== localPath) {
                        const depInfo = await this.addLocalPackage(require.resolve(context + "/" + childModuleName));
                        info.modules.push({
                            name: "./" + depInfo.name,
                            version: depInfo.version,
                            type: "local",
                        });
                        depInfo.modules.map((m) => info.modules.push(m));
                        callback(null, `the ` +
                            `${REQUIRE_FUNC_NAME}("local", "${depInfo.name}", "${depInfo.version}")`);
                        return;
                    }
                    (callback as any)();
                }],
            }).run(async (err, stats) => {
                if (err) {
                    reject(err);
                    return;
                }
                if (stats.hasErrors()) {
                    reject(stats.toString());
                    return;
                }
                info.modules = uniqueModules(info.modules);
                await promisify(writeFile)(newebFile, `{
                    "name": "${moduleName}",
                    "version": "${version}",
                    "type": "node",
                    "dependencies": ${JSON.stringify(
                        info.modules.map((mod) => ({ name: mod.name, type: mod.type, version: mod.version })))}
                }`);
                resolve(info);
            });
        });
    }
    public async addNodePackage(name: string, version: string): Promise<IPackInfo> {
        const mainFile = this.nodeModulesPath + "/" + name + "/" + version + "/index.js";
        const newebFile = this.nodeModulesPath + "/" + name + "/" + version + "/neweb.json";
        const existingModuleInfo =
            this.modules.find((m) => m.type === "node" && m.name === name && m.version === version);
        if (existingModuleInfo) {
            return existingModuleInfo;
        }
        if (await promisify(exists)(newebFile)) {
            const jsonModuleInfo = JSON.parse((await promisify(readFile)(newebFile)).toString());
            return {
                name: jsonModuleInfo.name,
                version: jsonModuleInfo.version,
                type: jsonModuleInfo.type,
                modules: jsonModuleInfo.dependencies,
            };
        }
        const info: IPackInfo = { name, version, modules: [], type: "node" };
        this.modules.push(info);
        return new Promise<IPackInfo>((resolve, reject) => {
            webpack({
                entry: name,
                output: {
                    path: dirname(mainFile),
                    filename: basename(mainFile),
                    libraryTarget: "commonjs2",
                },
                target: "node",
                mode: "production",
                externals: [async (context, childModuleName: string, callback) => {
                    if (!childModuleName.startsWith(".") && childModuleName !== name) {
                        if (this.excludedModules.indexOf(childModuleName) > -1) {
                            callback(null, `the ` + `${REQUIRE_FUNC_NAME}("node", "${childModuleName}")`);
                            return;
                        }
                        const child = await this.handleChildNodeModule(context, childModuleName);
                        child.modules.map((m) => info.modules.push(m));
                        callback(null, `the ` + `${REQUIRE_FUNC_NAME}("node","${child.name}", "${child.version}")`);
                        return;
                    }
                    (callback as any)();
                }],
            }).run(async (err, stats) => {
                if (err) {
                    reject(err);
                    return;
                }
                if (stats.hasErrors()) {
                    reject(stats.toString());
                    return;
                }
                info.modules = uniqueModules(info.modules);
                await promisify(writeFile)(newebFile, `{
                    "name": "${name}",
                    "version": "${version}",
                    "type": "node",
                    "dependencies": ${JSON.stringify(
                        info.modules.map((mod) => ({ name: mod.name, type: mod.type, version: mod.version })))}
                }`);
                resolve(info);
            });
        });
    }
    protected async handleChildNodeModule(context: string, childModuleName: string) {
        const tmpName = (+new Date()).toString() + "" + Math.round(Math.random() * 10000);
        const tmpFileName = context + "/" + tmpName + ".js";
        await promisify(writeFile)(tmpFileName, "");
        const packageJSONPath = getNearestPackageJSON(childModuleName, tmpFileName);
        if (!packageJSONPath) {
            throw new Error("not found package.json for " + childModuleName + " in " + tmpFileName);
        }
        const packageJSON = JSON.parse((await promisify(readFile)(packageJSONPath)).toString());
        await promisify(unlink)(tmpFileName);
        const depInfo = await this.addNodePackage(childModuleName, packageJSON.version);
        const modules: IPackInfoModule[] = [{
            name: childModuleName,
            version: packageJSON.version,
            type: "node",
        }];
        depInfo.modules.map((m) => modules.push(m));
        return { name: childModuleName, modules, version: packageJSON.version };
    }
}
export default ModulePacker;
