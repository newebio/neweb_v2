import React = require("react");
import Button from "semantic-ui-react/dist/commonjs/elements/Button";
export default class extends React.Component<{
    data: {
        field1: string,
    };
}, {}> {
    public render() {
        return React.createElement("div", { id: "testDiv" }, ["data::", this.props.data.field1,
            React.createElement(Button, { key: "btn", content: "Primary" }, ["Button"]),
        ]);
    }
}
