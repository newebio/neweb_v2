import { sel$, text } from "page-grabber";
import Server from "./../lib/Server";
import { grabSuccessWithInitial } from "./../utils/grabSuccess";
const port = 17867;
let server: Server;
jest.setTimeout(10000);
beforeAll(async () => {
    server = new Server({ appPath: __dirname + "/../__fixtures__/app" });
    await server.start(port);
});
it("static html::Hello, world", async () => {
    const res = await grabSuccessWithInitial("http://127.0.0.1:" + port + "/static", sel$("#testDiv1", text()));
    expect(res.data).toEqual([null]);
    expect(res.content).toBe("Hello, world!");
    expect(res.route.frames).toEqual([{ frame: "static" }]);
    expect(res.modules.length).toBe(1);
});
it("static html with async data", async () => {
    const res = await grabSuccessWithInitial("http://127.0.0.1:" + port + "/staticWithAsyncData",
        sel$("#testDiv", text()));
    expect(res.content).toBe("data::value1");
    expect(res.data).toEqual([{ field1: "value1" }]);
    expect(res.route.frames).toEqual([{ frame: "staticWithAsyncData" }]);
});
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
afterAll(async () => {
    await server.stop();
});
