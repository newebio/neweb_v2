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
const onemitter_1 = require("onemitter");
const react_test_renderer_1 = require("react-test-renderer");
const FileConfiguration_1 = require("./../lib/FileConfiguration");
const FrameController_1 = require("./FrameController");
class ClientFileConfiguration {
    constructor(config) {
        this.fileConfiguration = new FileConfiguration_1.default({ appDir: config.appDir });
    }
    resolveFrame(name) {
        return __awaiter(this, void 0, void 0, function* () {
            const config = yield this.fileConfiguration.resolveFrame(name);
            return Object.assign({}, config, { remote: { data: [], actions: [] } });
        });
    }
    hasFrame() {
        return __awaiter(this, void 0, void 0, function* () {
            return true;
        });
    }
}
const configuration = new ClientFileConfiguration({ appDir: __dirname + "/../__fixtures__/app" });
const remote = {
    data: () => onemitter_1.default(),
    action: () => null,
};
const frameController = new FrameController_1.default({
    configuration,
    remote,
});
it("FrameController:: static render", () => __awaiter(this, void 0, void 0, function* () {
    const rootElement = yield frameController.render({
        status: 200,
        frames: [{
                frame: "static",
                params: {},
            }],
    }, []);
    expect(react_test_renderer_1.create(rootElement).toJSON()).toMatchSnapshot();
}));
it("FrameController:: update route", () => __awaiter(this, void 0, void 0, function* () {
    const rootElement = yield frameController.render({
        status: 200,
        frames: [{
                frame: "static",
                params: {},
            }],
    }, []);
    const el = react_test_renderer_1.create(rootElement);
    yield frameController.updateRoute({
        status: 200,
        frames: [{
                frame: "parent",
                params: {},
            }, {
                frame: "static",
                params: {},
            }],
    }, []);
    expect(el.toJSON()).toMatchSnapshot();
}));
