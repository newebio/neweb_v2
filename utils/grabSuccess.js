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
const jsdom_1 = require("jsdom");
const node_fetch_1 = require("node-fetch");
const page_grabber_1 = require("page-grabber");
function grabSuccess(url, model) {
    return __awaiter(this, void 0, void 0, function* () {
        const response = yield node_fetch_1.default(url);
        if (response.status !== 200) {
            throw new Error("Invalid response " + response.status + "::" + (yield response.text()));
        }
        const text = yield response.text();
        const window = new jsdom_1.JSDOM(text, {
            runScripts: "dangerously",
        }).window;
        const grabber = new page_grabber_1.Grabber(window);
        return grabber.grab(model);
    });
}
exports.grabSuccess = grabSuccess;
function grabSuccessWithInitial(url, content) {
    return __awaiter(this, void 0, void 0, function* () {
        return grabSuccess(url, {
            content,
            data: page_grabber_1.obj("window.__initial_data"),
            route: page_grabber_1.obj("window.__initial_route"),
        });
    });
}
exports.grabSuccessWithInitial = grabSuccessWithInitial;
