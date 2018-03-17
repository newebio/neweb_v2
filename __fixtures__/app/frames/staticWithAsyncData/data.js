"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const __1 = require("./../../../..");
class default_1 extends __1.DataSource {
    onInit() {
        setTimeout(() => {
            this.emit({ field1: "value1" });
        }, 500);
    }
}
exports.default = default_1;
