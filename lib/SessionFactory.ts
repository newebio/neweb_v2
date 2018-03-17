import { IConfiguration, IFramesRoute } from "./..";
import Session from "./Session";
export interface ICreateSessionParams {
    route: IFramesRoute;
}
export interface ISessionFactoryConfig {
    configuration: IConfiguration;
}
class SessionFactory {
    constructor(protected config: ISessionFactoryConfig) {

    }
    public createSession(params: ICreateSessionParams) {
        return new Session({
            initialRoute: params.route,
            configuration: this.config.configuration,
        });
    }
}
export default SessionFactory;
