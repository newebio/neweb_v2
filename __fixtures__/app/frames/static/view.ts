import React = require("react");

export default class IndexView extends React.Component<{}, {}> {
    public render() {
        return React.createElement("div", { id: "testDiv1" }, ["Hello, world!"]);
    }
}
