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
class RouteResolver {
    constructor(config) {
        this.config = config;
    }
    resolve(href) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield fetch(this.config.address + "/resolveRoute", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    url: href,
                }),
            });
            if (response.status !== 200) {
                throw new Error("Invalid request::" + (yield response.text()));
            }
            return response.json();
        });
    }
}
exports.default = RouteResolver;
