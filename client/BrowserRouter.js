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
class BrowserRouter {
    constructor(config) {
        this.config = config;
        window.NewebHistory = this;
        window.addEventListener("popstate", (e) => __awaiter(this, void 0, void 0, function* () {
            if (e.state) {
                yield this.config.modulesManager.preloadModules(e.state.modules);
                this.config.app.updateRoute(e.state.route, e.state.data);
                return;
            }
        }), false);
    }
    replace(url) {
        return __awaiter(this, void 0, void 0, function* () {
            history.replaceState(yield this.navigate(url), "", url);
        });
    }
    push(url) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("push", url);
            history.pushState(yield this.navigate(url), "", url);
        });
    }
    navigate(url) {
        return __awaiter(this, void 0, void 0, function* () {
            const routeInfo = yield this.config.routeResolver.resolve(url);
            yield this.config.modulesManager.preloadModules(routeInfo.modules);
            yield this.config.app.updateRoute(routeInfo.route, routeInfo.data);
            return routeInfo;
        });
    }
    init(routeInfo) {
        history.replaceState(routeInfo, "", window.location.href);
    }
}
exports.default = BrowserRouter;
