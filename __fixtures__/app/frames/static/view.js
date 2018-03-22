"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const React = require("react");
const Link_1 = require("./../../components/Link");
class IndexView extends React.Component {
    render() {
        return React.createElement("div", { id: "testDiv1" }, ["Hello, world!", React.createElement("br"),
            React.createElement(Link_1.default, { key: "link", to: "/staticWithAsyncData" }, ["Link to staticWithAsyncData"]),
        ]);
    }
}
exports.default = IndexView;
