import { exists, readFile } from "fs";
import { promisify } from "util";
import { IConfiguration } from "./..";
import Session, { ISessionInfo } from "./Session";

export interface ISessionsManagerConfig {
    configuration: IConfiguration;
    sessionsPath: string;
}
export interface IAddSessionParams {
    id: string;
    hash: string;
    info?: ISessionInfo;
}
class SessionsManager {
    protected sessions: { [index: string]: { session: Session } } = {};
    constructor(protected config: ISessionsManagerConfig) {

    }
    public async getSession(id: string, hash: string) {
        if (!this.sessions[id]) {
            throw new Error("Not found session " + id);
        }
        if (this.sessions[id].session.getHash() !== hash) {
            throw new Error("Invalid hash " + hash + " for session " + id);
        }
        return this.sessions[id];
    }
    public async resolveSessionBySid(sid: string): Promise<Session> {
        const sessionParams = this.getSessionParamsFromSid(sid);
        const sessionItem = this.sessions[sessionParams.id];
        if (sessionItem) {
            if (sessionItem.session.getHash() !== sessionParams.hash) {
                throw new Error("Invalid hash " + sessionParams.hash + " for sid " + sid);
            }
            return sessionItem.session;
        }
        if (!await promisify(exists)(this.config.sessionsPath + "/" + sessionParams.id + "/session.json")) {
            throw new Error("Not found session for sid " + sid);
        }
        const sessionInfo = JSON.parse(
            (await promisify(readFile)(this.config.sessionsPath + "/" +
                sessionParams.id + "/session.json")).toString());

        if (sessionInfo.hash !== sessionParams.hash) {
            throw new Error("Invalid hash " + sessionParams.hash + " for sid " + sid);
        }
        return this.addSession({
            id: sessionParams.id,
            hash: sessionParams.hash,
            info: sessionInfo,
        });
    }
    public createSession() {
        const id = new Date().getTime().toString() + Math.round(Math.random() * 100000).toString();
        const hash = new Date().getTime().toString() + Math.round(Math.random() * 100000).toString();
        return this.addSession({
            id,
            hash,
        });
    }
    protected addSession(params: IAddSessionParams) {
        const session = new Session({
            id: params.id,
            hash: params.hash,
            info: params.info,
            configuration: this.config.configuration,
            sessionsPath: this.config.sessionsPath,
        });
        this.sessions[session.getId()] = { session };
        return session;
    }
    protected getSessionParamsFromSid(sid: string) {
        const params = sid.split(":");
        return {
            id: params[0],
            hash: params[1],
        };
    }
}
export default SessionsManager;
