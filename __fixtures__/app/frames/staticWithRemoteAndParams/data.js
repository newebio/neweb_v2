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
const neweb_core_1 = require("neweb-core");
class default_1 extends neweb_core_1.DataSource {
    onInit() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.config.data) {
                this.emit(yield this.config.remote.remoteData1.wait());
            }
            else {
                this.emit(this.config.data);
            }
            this.config.remote.remoteData1.on((value) => {
                this.emit(value);
            });
        });
    }
}
exports.default = default_1;
