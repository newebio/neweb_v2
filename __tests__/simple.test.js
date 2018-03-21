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
const page_grabber_1 = require("page-grabber");
const Server_1 = require("./../lib/Server");
const grabSuccess_1 = require("./../utils/grabSuccess");
const port = 17867;
let server;
jest.setTimeout(10000);
beforeAll(() => __awaiter(this, void 0, void 0, function* () {
    server = new Server_1.default({ appPath: __dirname + "/../__fixtures__/app" });
    yield server.start(port);
}));
it("static html::Hello, world", () => __awaiter(this, void 0, void 0, function* () {
    const res = yield grabSuccess_1.grabSuccessWithInitial("http://127.0.0.1:" + port + "/static", page_grabber_1.sel$("#testDiv1", page_grabber_1.text()));
    expect(res.data).toEqual([null]);
    expect(res.content).toBe("Hello, world!");
    expect(res.route.frames).toEqual([{ frame: "static" }]);
    expect(res.modules.length).toBe(1);
}));
it("static html with async data", () => __awaiter(this, void 0, void 0, function* () {
    const res = yield grabSuccess_1.grabSuccessWithInitial("http://127.0.0.1:" + port + "/staticWithAsyncData", page_grabber_1.sel$("#testDiv", page_grabber_1.text()));
    expect(res.content).toBe("data::value1");
    expect(res.data).toEqual([{ field1: "value1" }]);
    expect(res.route.frames).toEqual([{ frame: "staticWithAsyncData" }]);
}));
/*it("static two frames", async () => {
    const res = await grabSuccessWithInitial("http://127.0.0.1:" + port + "/parent_staticWithAsyncData",
        sel$("#parent", text()));
    expect(res.content).toBe("parent::data::value1");
    expect(res.data).toEqual([null, { field1: "value1" }]);
    expect(res.route.frames).toEqual([{ frame: "parent" }, { frame: "staticWithAsyncData" }]);
});
it("static with remote", async () => {
    const res = await grabSuccessWithInitial(
        "http://127.0.0.1:" + port + "/staticWithRemoteAndParams?f0_param1=param1Value",
        sel$("#testDiv", text()));
    expect(res.content).toBe("data::remote-data1-param1Value");
    expect(res.data).toEqual(["remote-data1-param1Value"]);
    expect(res.route.frames).toEqual([{ frame: "staticWithRemoteAndParams", params: { param1: "param1Value" } }]);
});*/
afterAll(() => __awaiter(this, void 0, void 0, function* () {
    yield server.stop();
}));
