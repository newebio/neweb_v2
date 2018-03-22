import bodyParser = require("body-parser");
import cookieParser = require("cookie-parser");
import express = require("express");
import { Server as HttpServer } from "http";
import { resolve as resolvePath } from "path";
import SocketIO = require("socket.io");
import { IConfiguration, IRouter } from "./..";
import FileConfiguration from "./FileConfiguration";
import FramesBasedRouter from "./FramesBasedRouter";
import ModulePacker from "./ModulePacker";
import ModulesServer from "./ModulesServer";
import RemoteManager from "./RemoteManager";
import Session from "./Session";
import SessionsManager from "./SessionsManager";
export interface IServerConfig {
    router?: IRouter;
    configuration?: IConfiguration;
    appPath: string;
    cachePath?: string;
    sessionsPath?: string;
}
/*const template = `<!doctype><html><head></head>
    <body><div id="root">{%__html__%}</div>
    {%__initial_script__%}
    <script src="/bundle.js"></script>
    </body></html>`;*/
class Server {
    protected router: IRouter;
    protected configuration: IConfiguration;
    protected server: HttpServer;
    protected sessionsManager: SessionsManager;
    protected remoteManager: RemoteManager;
    protected cachePath: string;
    protected sessionsPath: string;
    protected modulesServer: ModulesServer;
    constructor(protected config: IServerConfig) {
        this.cachePath = this.config.cachePath || process.cwd() + "/cache";
        this.sessionsPath = this.config.sessionsPath || process.cwd() + "/sessions";
        const modulePacker = new ModulePacker({
            appRoot: this.config.appPath,
            modulesPath: this.cachePath + "/modules",
            excludedModules: ["react", "react-dom"],
        });
        this.configuration = this.configuration ? this.configuration :
            new FileConfiguration({
                appDir: this.config.appPath,
                modulesPath: this.cachePath + "/modules",
                modulePacker,
            });
        this.router = config.router ? config.router :
            new FramesBasedRouter({ configuration: this.configuration });
        this.sessionsManager = new SessionsManager({
            configuration: this.configuration,
            sessionsPath: this.sessionsPath,
        });
        this.remoteManager = new RemoteManager({
            sessionsManager: this.sessionsManager,
            configuration: this.configuration,
        });
        this.modulesServer = new ModulesServer({
            configuration: this.configuration,
        });
    }
    public attach(app: express.Express) {
        this.modulesServer.attach(app);
        app.use(cookieParser());
        app.get("/bundle.js", (_, res) => {
            res.sendFile(resolvePath(__dirname + "/../dist/bundle.js"));
        });
        app.post("/resolveRoute", bodyParser.json(), async (req, res) => {
            const { url } = req.body;
            this.resolveRoute(url, req, res, false);
        });
        app.get("/:url", async (req, res) => {
            const query = Object.keys(req.query)
                .map((paramName) => paramName + "=" + req.query[paramName]).join("&");
            this.resolveRoute("/" + req.params.url + "?" + query, req, res);
        });
    }
    public start(port: number) {
        const app = express();
        app.use(express.static(resolvePath(this.config.appPath + "/public")));
        this.attach(app);
        return new Promise((resolve, reject) => {
            this.server = app.listen(port, async (err: any) => {
                if (err) {
                    reject(err);
                    return;
                }
                await this.startWebsocket(this.server);
                resolve();
            });
        });
    }
    public async stop() {
        if (this.server) {
            return new Promise((resolve, reject) => {
                this.server.close((err: any) => {
                    if (err) {
                        reject(err);
                        return;
                    }
                    resolve();
                });
            });
        }
        return;
    }
    public startWebsocket(server: HttpServer) {
        const io = SocketIO(server);
        io.on("connection", (client) => {
            this.remoteManager.onNewSocket(client);
        });
    }
    protected async resolveRoute(url: string, req: express.Request, res: express.Response, isFull = true) {
        const route = await this.router.resolve({
            url,
        });
        if (route.status !== 200) {
            switch (route.status) {
                case 404:
                    res.status(404).send(route.text);
                    break;
                default:
                    res.status(500).send("Unknown error");
            }
            return;
        }
        let session: Session | undefined;
        if (req.cookies && req.cookies.sid) {
            try {
                session = await this.sessionsManager.resolveSessionBySid(req.cookies.sid);
            } catch (e) {
                //
            }
        }
        if (!session) {
            session = await this.sessionsManager.createSession();
        }
        const result = await session.render(route);
        const sidCookie = `sid=${result.sessionId + ":" + result.sessionHash}; expires=${
            new Date(+new Date() + 86400 * 1000 * 365).toUTCString()
            }; path=/`;

        const html = result.html;
        delete result.html;
        if (isFull) {
            res.writeHead(200, {
                "Content-Type": "text/html",
                "Set-Cookie": sidCookie,
            });
            res.write(`<!doctype><html><head>
            <link rel="stylesheet" href="//cdnjs.cloudflare.com/ajax/libs/semantic-ui/2.2.12/semantic.min.css"></link>
            </head>
            <body><div id="root">`);
            res.write(html + `</div>`);
            res.write(`<script>
                window.__initial_data=${JSON.stringify(result)};
            </script>`);
            res.write(`<script src="/bundle.js"></script>
            </body></html>`);
            res.end();
        } else {
            res.writeHead(200, {
                "Content-Type": "application/json",
                "Set-Cookie": sidCookie,
            });
            res.write(JSON.stringify(result));
            res.end();
        }
    }
}
export default Server;
