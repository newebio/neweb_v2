import cookieParser = require("cookie-parser");
import express = require("express");
import { Server as HttpServer } from "http";
import { resolve as resolvePath } from "path";
import { IConfiguration, IRouter } from "./..";
import FileConfiguration from "./FileConfiguration";
import FramesBasedRouter from "./FramesBasedRouter";
import ModulePacker from "./ModulePacker";
import SessionFactory from "./SessionFactory";
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
    protected sessionFactory: SessionFactory;
    protected cachePath: string;
    protected sessionsPath: string;
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
        this.sessionFactory = new SessionFactory({
            configuration: this.configuration,
            sessionsPath: this.sessionsPath,
        });
    }
    public attach(app: express.Express) {
        app.use(cookieParser());
        app.get("/bundle.js", (_, res) => {
            res.sendFile(resolvePath(__dirname + "/../dist/bundle.js"));
        });
        app.use("/:url", async (req, res) => {
            const query = Object.keys(req.query)
                .map((paramName) => paramName + "=" + req.query[paramName]).join("&");
            const route = await this.router.resolve({
                url: "/" + req.params.url + "?" + query,
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
            const session = await this.sessionFactory.createSession({
                sid: req.cookies ? req.cookies.sid : undefined,
                route,
            });

            const result = await session.render();
            const modulesWithContent = await Promise.all(result.modules.map(async (mod) => {
                return {
                    info: mod,
                    content: await this.configuration.getModuleContent(mod),
                };
            }));
            const sidCookie = `sid=${result.sessionId + ":" + result.sessionHash}; expires=${
                new Date(+new Date() + 86400 * 1000 * 365).toUTCString()
                }; path=/`;
            res.writeHead(200, {
                "Content-Type": "text/html",
                "Set-Cookie": sidCookie,
            });
            res.write(`<!doctype><html><head>
            <link rel="stylesheet" href="//cdnjs.cloudflare.com/ajax/libs/semantic-ui/2.2.12/semantic.min.css"></link>
            </head>
            <body><div id="root">`);
            res.write(result.html + `</div>`);
            res.write(`<script>
                window.__initial_data=${JSON.stringify(result.data)};
                window.__initial_route=${JSON.stringify(result.route)};
                window.__session_info = ${JSON.stringify({ id: result.sessionId, hash: result.sessionHash })};
            </script>`);
            modulesWithContent.map((mod) =>
                res.write(`<script module-type="${mod.info.type}"
                         type="neweb/module" name="${mod.info.name}" version="${mod.info.version}">
                        ${mod.content}
                    </script>`));
            res.write(`<script src="/bundle.js"></script>
            </body></html>`);
            res.end();

            /*res.send(template
                .replace("{%__html__%}", result.html)
                .replace("{%__initial_script__%}",
                    `<script>
                        window.__initial_data=${JSON.stringify(result.data)};
                        window.__initial_route=${JSON.stringify(result.route)};
                        window.__modules = ${JSON.stringify(modulesWithContent)}
                    </script>
                    `));*/
        });
    }
    /*                     ${modulesWithContent.map((mod) =>
                        `<script module-type="${mod.info.type}"
                         type="neweb/module" name="${mod.info.name}" version="${mod.info.version}">
                        ${mod.content}
                    </script>`).join("\n")}
                */
    public start(port: number) {
        const app = express();
        app.use(express.static(resolvePath(this.config.appPath + "/public")));
        this.attach(app);
        return new Promise((resolve, reject) => {
            this.server = app.listen(port, (err: any) => {
                if (err) {
                    reject(err);
                    return;
                }
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
}
export default Server;
