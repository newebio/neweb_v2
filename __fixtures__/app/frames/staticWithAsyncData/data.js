"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const neweb_core_1 = require("neweb-core");
class default_1 extends neweb_core_1.DataSource {
    onInit() {
        if (this.config.data) {
            this.emit(this.config.data);
            setTimeout(() => {
                this.emit({ field1: "value2" });
            }, 500);
        }
        else {
            setTimeout(() => {
                this.emit({ field1: "value1" });
            }, 500);
        }
    }
}
exports.default = default_1;
