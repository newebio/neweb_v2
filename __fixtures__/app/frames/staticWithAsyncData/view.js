"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const React = require("react");
const Button_1 = require("semantic-ui-react/dist/commonjs/elements/Button");
class default_1 extends React.Component {
    render() {
        return React.createElement("div", { id: "testDiv" }, ["data::", this.props.data.field1,
            React.createElement(Button_1.default, { key: "btn", content: "Primary" }, ["Button"]),
        ]);
    }
}
exports.default = default_1;
