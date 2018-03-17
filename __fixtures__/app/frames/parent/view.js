"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const React = require("react");
class IndexView extends React.Component {
    render() {
        return React.createElement("div", { id: "parent" }, ["parent::", this.props.children]);
    }
}
exports.default = IndexView;
