import React = require("react");

export default class extends React.Component<{
    data: {
        field1: string,
    };
}, {}> {
    public render() {
        return React.createElement("div", { id: "testDiv" }, ["data::", this.props.data.field1]);
    }
}
