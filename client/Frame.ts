import { Onemitter } from "onemitter";
import React = require("react");
interface IState {
    data: any;
    actions: any;
    children: any;
    params: any;
}
export interface IFrameConfig {
    view: any;
    name: string;
    data: Onemitter<any>;
    actions: any;
    params: Onemitter<any>;
    children: Onemitter<React.ReactNode | undefined>;
    key: any;
}
class Frame extends React.Component<IFrameConfig, IState> {
    protected dataEmitter: Onemitter<any>;
    protected dataCallback: (value: any) => void;
    protected childrenEmitter: Onemitter<any>;
    protected childrenCallback: (value: any) => void;
    protected paramsEmitter: Onemitter<any>;
    protected paramsCallback: (value: any) => void;
    public componentWillMount() {
        this.dataCallback = (value: any) => {
            this.setState({ data: value });
        };
        this.childrenCallback = (value: any) => {
            this.setState({ children: value });
        };
        this.paramsCallback = (value: any) => {
            this.setParams(value);
        };

        const state: any = {};
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
    public componentWillReceiveProps(nextProps: IFrameConfig) {
        const state: any = {};
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
    public subscribeParams(params: Onemitter<any>) {
        if (this.paramsEmitter) {
            this.paramsEmitter.off(this.paramsCallback);
        }
        this.paramsEmitter = params;
        this.paramsEmitter.on(this.paramsCallback);
    }
    public subscribeData(data: Onemitter<any>) {
        if (this.dataEmitter) {
            this.dataEmitter.off(this.dataCallback);
        }
        this.dataEmitter = data;
        this.dataEmitter.on(this.dataCallback);
    }
    public subscribeChildren(children: Onemitter<any>) {
        if (this.childrenEmitter) {
            this.childrenEmitter.off(this.childrenCallback);
        }
        this.childrenEmitter = children;
        this.childrenEmitter.on(this.childrenCallback);
    }
    public setParams(params: any) {
        this.setState({ params });
    }
    public render() {
        return React.createElement(this.props.view, {
            data: this.state.data,
            actions: this.state.actions,
            children: this.state.children,
            params: this.state.params,
        });
    }
    public componentWillUnmount() {
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
export default Frame;
