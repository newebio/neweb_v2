"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const React = require("react");
class Frame extends React.Component {
    componentWillMount() {
        this.dataCallback = (value) => {
            this.setState({ data: value });
        };
        this.childrenCallback = (value) => {
            this.setState({ children: value });
        };
        this.paramsCallback = (value) => {
            this.setParams(value);
        };
        const state = {};
        if (this.props.data.has()) {
            state.data = this.props.data.get();
        }
        if (this.props.params.has()) {
            state.params = this.props.params.get();
        }
        state.actions = this.props.actions;
        if (this.props.children.has()) {
            state.children = this.props.children.get();
        }
        this.subscribeChildren(this.props.children);
        this.subscribeData(this.props.data);
        this.subscribeParams(this.props.params);
        this.setState(state);
    }
    componentWillReceiveProps(nextProps) {
        const state = {};
        if (this.props.data !== nextProps.data) {
            this.subscribeData(nextProps.data);
            if (nextProps.data.has()) {
                state.data = nextProps.data.get();
            }
        }
        if (this.props.children !== nextProps.children) {
            this.subscribeChildren(nextProps.children);
            if (nextProps.children.has()) {
                state.children = nextProps.children.get();
            }
        }
        if (this.props.params !== nextProps.params) {
            this.subscribeParams(nextProps.params);
            if (nextProps.params.has()) {
                state.params = nextProps.params.get();
            }
        }
    }
    subscribeParams(params) {
        if (this.paramsEmitter) {
            this.paramsEmitter.off(this.paramsCallback);
        }
        this.paramsEmitter = params;
        this.paramsEmitter.on(this.paramsCallback);
    }
    subscribeData(data) {
        if (this.dataEmitter) {
            this.dataEmitter.off(this.dataCallback);
        }
        this.dataEmitter = data;
        this.dataEmitter.on(this.dataCallback);
    }
    subscribeChildren(children) {
        if (this.childrenEmitter) {
            this.childrenEmitter.off(this.childrenCallback);
        }
        this.childrenEmitter = children;
        this.childrenEmitter.on(this.childrenCallback);
    }
    setParams(params) {
        this.setState({ params });
    }
    render() {
        return React.createElement(this.props.view, {
            data: this.state.data,
            actions: this.state.actions,
            children: this.state.children,
            params: this.state.params,
        });
    }
    componentWillUnmount() {
        if (this.dataEmitter) {
            this.dataEmitter.off(this.dataCallback);
        }
        if (this.childrenEmitter) {
            this.childrenEmitter.off(this.childrenCallback);
        }
        if (this.paramsEmitter) {
            this.paramsEmitter.off(this.paramsCallback);
        }
    }
}
exports.default = Frame;
