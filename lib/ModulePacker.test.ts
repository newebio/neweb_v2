import { writeFile } from "fs";
import mkdirp = require("mkdirp");

import rimraf = require("rimraf");
import { promisify } from "util";
import { REQUIRE_FUNC_NAME } from "./../common";
import ModulePacker from "./ModulePacker";
let packer: ModulePacker;
const tmpDir = __dirname + "/../tmp";
const package1Name = "__test_package1";
const package2Name = "__test_package2";
const package3Name = "__test_package3";

beforeEach(async () => {
    await createNodeModule(package1Name, "0.0.1",
        {}, `module.exports = {test : "__test_value__"}`);
    await createNodeModule(package2Name, "0.0.1", {
        [package1Name]: "0.0.1",
        [package3Name]: "0.0.2",
    }, `module.exports = require("__test_package1") +
        require("__test_package3") ;`);
    await createNodeModule(package3Name, "0.0.2", {}, `module.exports = 100`);
    packer = new ModulePacker({
        modulesPath: tmpDir,
        appRoot: __dirname + "/../__fixtures__/app-for-pack",
    });
});
it("pack node module without dependencies", async () => {
    await packer.addNodePackage(package1Name, "0.0.1");
    expect(require(tmpDir + "/node/" + package1Name + "/0.0.1/index.js").test).toBe("__test_value__");
    expect(require(tmpDir + "/node/" + package1Name + "/0.0.1/neweb.json")).toEqual({
        name: package1Name,
        type: "node",
        version: "0.0.1",
        dependencies: [],
    });
});
it("pack node module with dependencies", async () => {
    const res = await packer.addNodePackage(package2Name, "0.0.1");
    (global as any)[REQUIRE_FUNC_NAME] = (type: string, name: string, version: string) => {
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
});
it("pack local module", async () => {
    const info = await packer.addLocalPackage("./local1");
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
});
afterEach(async () => {
    await removeNodeModule(package1Name);
    await removeNodeModule(package2Name);
    await removeNodeModule(package3Name);
});
async function removeNodeModule(name: string) {
    const nodeModuleDir = __dirname + "/../node_modules/" + name;
    await promisify(rimraf)(nodeModuleDir);
}
async function createNodeModule(
    name: string, version: string,
    dependencies: { [index: string]: string }, content: string) {
    const nodeModuleDir = __dirname + "/../node_modules/" + name;
    await promisify(mkdirp)(nodeModuleDir);
    await promisify(writeFile)(nodeModuleDir + "/package.json", `{
        "name": "${name}",
        "version": "${version}",
        "main": "index.js",
        "dependencies": ${JSON.stringify(dependencies)}
    }`);
    await promisify(writeFile)(nodeModuleDir + "/index.js", content);
}
