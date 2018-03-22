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
const Page_1 = require("./Page");
class PageManager {
    constructor(config) {
        this.config = config;
        this.pages = {};
    }
    onNewSocket(socket) {
        socket.on("request", (params) => __awaiter(this, void 0, void 0, function* () {
            try {
                const session = yield this.config.sessionsManager.resolveSessionBySid(params.sid);
                if (params.type === "get-module") {
                    socket.emit("response", params.id, yield this.config.configuration.getModuleContent(params.params));
                    return;
                }
                const pageItem = this.pages[params.sid + ":" + params.pid];
                const page = pageItem ? pageItem.page : this.createPage();
            }
            catch (e) {
                socket.emit("error", "Invalid session");
            }
        }));
    }
    createPage() {
        return new Page_1.default();
    }
}
exports.default = PageManager;
