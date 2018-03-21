import { IConfiguration, IFramesRoute } from "./..";
import Session from "./Session";
export interface ICreateSessionParams {
    route: IFramesRoute;
    sid: string;
}
export interface ISessionFactoryConfig {
    configuration: IConfiguration;
    sessionsPath: string;
}
class SessionFactory {
    constructor(protected config: ISessionFactoryConfig) {

    }
    public async createSession(params: ICreateSessionParams) {
        const sid = params.sid;
        const session = new Session({
            sid,
            initialRoute: params.route,
            configuration: this.config.configuration,
            sessionsPath: this.config.sessionsPath,
        });
        await session.init();
        return session;
    }
}
export default SessionFactory;
