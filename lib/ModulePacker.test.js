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
const fs_1 = require("fs");
const mkdirp = require("mkdirp");
const rimraf = require("rimraf");
const util_1 = require("util");
const common_1 = require("./../common");
const ModulePacker_1 = require("./ModulePacker");
let packer;
const tmpDir = __dirname + "/../tmp";
const package1Name = "__test_package1";
const package2Name = "__test_package2";
const package3Name = "__test_package3";
beforeEach(() => __awaiter(this, void 0, void 0, function* () {
    yield createNodeModule(package1Name, "0.0.1", {}, `module.exports = {test : "__test_value__"}`);
    yield createNodeModule(package2Name, "0.0.1", {
        [package1Name]: "0.0.1",
        [package3Name]: "0.0.2",
    }, `module.exports = require("__test_package1") +
        require("__test_package3") ;`);
    yield createNodeModule(package3Name, "0.0.2", {}, `module.exports = 100`);
    packer = new ModulePacker_1.default({
        modulesPath: tmpDir,
        appRoot: __dirname + "/../__fixtures__/app-for-pack",
    });
}));
it("pack node module without dependencies", () => __awaiter(this, void 0, void 0, function* () {
    yield packer.addNodePackage(package1Name, "0.0.1");
    expect(require(tmpDir + "/node/" + package1Name + "/0.0.1/index.js").test).toBe("__test_value__");
    expect(require(tmpDir + "/node/" + package1Name + "/0.0.1/neweb.json")).toEqual({
        name: package1Name,
        type: "node",
        version: "0.0.1",
        dependencies: [],
    });
}));
it("pack node module with dependencies", () => __awaiter(this, void 0, void 0, function* () {
    const res = yield packer.addNodePackage(package2Name, "0.0.1");
    global[common_1.REQUIRE_FUNC_NAME] = (type, name, version) => {
        if (type === "node" && name === package1Name && version === "0.0.1") {
            return 200;
        }
        return 5;
    };
    expect(require((tmpDir + "/node/" + package2Name + "/0.0.1/index.js"))).toBe(205);
    expect(res).toEqual({
        name: "__test_package2",
        version: "0.0.1",
        modules: [{
                name: "__test_package1",
                version: "0.0.1",
            }, {
                name: "__test_package3",
                version: "0.0.2",
            }],
    });
    expect(require(tmpDir + "/node/" + package2Name + "/0.0.1/neweb.json")).toEqual({
        name: package2Name,
        type: "node",
        version: "0.0.1",
        dependencies: [{
                name: package1Name, version: "0.0.1",
            }, {
                name: package3Name, version: "0.0.2",
            }],
    });
}));
it("pack local module", () => __awaiter(this, void 0, void 0, function* () {
    const info = yield packer.addLocalPackage("./local1");
    expect(info.name).toBe("local1");
    expect(parseInt(info.version, 10) >= 1521605497884).toBe(true);
    expect(info.modules).toEqual([{
            name: "__test_package1",
            version: "0.0.1",
        }, {
            name: "./local2",
            version: "1521607097358",
        }, {
            name: "__test_package3",
            version: "0.0.2",
        }]);
}));
afterEach(() => __awaiter(this, void 0, void 0, function* () {
    yield removeNodeModule(package1Name);
    yield removeNodeModule(package2Name);
    yield removeNodeModule(package3Name);
}));
function removeNodeModule(name) {
    return __awaiter(this, void 0, void 0, function* () {
        const nodeModuleDir = __dirname + "/../node_modules/" + name;
        yield util_1.promisify(rimraf)(nodeModuleDir);
    });
}
function createNodeModule(name, version, dependencies, content) {
    return __awaiter(this, void 0, void 0, function* () {
        const nodeModuleDir = __dirname + "/../node_modules/" + name;
        yield util_1.promisify(mkdirp)(nodeModuleDir);
        yield util_1.promisify(fs_1.writeFile)(nodeModuleDir + "/package.json", `{
        "name": "${name}",
        "version": "${version}",
        "main": "index.js",
        "dependencies": ${JSON.stringify(dependencies)}
    }`);
        yield util_1.promisify(fs_1.writeFile)(nodeModuleDir + "/index.js", content);
    });
}
