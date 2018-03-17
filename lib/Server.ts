import express = require("express");
import { Server as HttpServer } from "http";
import { resolve as resolvePath } from "path";
import { IConfiguration, IRouter } from "./..";
import FileConfiguration from "./FileConfiguration";
import FramesBasedRouter from "./FramesBasedRouter";
import SessionFactory from "./SessionFactory";
export interface IServerConfig {
    router?: IRouter;
    configuration?: IConfiguration;
    appPath: string;
}
const template = `<!doctype><html><head></head>
    <body><div id="root">{%__html__%}</div>{%__initial_script__%}
    <script src="/bundle.js"></script>
    </body></html>`;
class Server {
    protected router: IRouter;
    protected configuration: IConfiguration;
    protected server: HttpServer;
    protected sessionFactory: SessionFactory;
    constructor(protected config: IServerConfig) {
        this.configuration = this.configuration ? this.configuration :
            new FileConfiguration({ appDir: this.config.appPath });
        this.router = config.router ? config.router :
            new FramesBasedRouter({ configuration: this.configuration });
        this.sessionFactory = new SessionFactory({ configuration: this.configuration });
    }
    public attach(app: express.Express) {
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
            const session = await this.sessionFactory.createSession({ route });
            const result = await session.render();
            res.send(template
                .replace("{%__html__%}", result.html)
                .replace("{%__initial_script__%}",
                    `<script>
                        window.__initial_data=${JSON.stringify(result.data)};
                        window.__initial_route=${JSON.stringify(result.route)}
                    </script>`));
        });
    }
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
