import React = require("react");
import Link from "./../../components/Link";
export default class IndexView extends React.Component<{}, {}> {
    public render() {
        return React.createElement("div", { id: "testDiv1" }, ["Hello, world!", React.createElement("br"),
            React.createElement(Link, { key: "link", to: "/staticWithAsyncData" }, ["Link to staticWithAsyncData"]),
        ]);
    }
}
