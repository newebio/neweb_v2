"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const cookieParser = require("cookie-parser");
const express = require("express");
const path_1 = require("path");
const FileConfiguration_1 = require("./FileConfiguration");
const FramesBasedRouter_1 = require("./FramesBasedRouter");
const ModulePacker_1 = require("./ModulePacker");
const SessionFactory_1 = require("./SessionFactory");
/*const template = `<!doctype><html><head></head>
    <body><div id="root">{%__html__%}</div>
    {%__initial_script__%}
    <script src="/bundle.js"></script>
    </body></html>`;*/
class Server {
    constructor(config) {
        this.config = config;
        this.cachePath = this.config.cachePath || process.cwd() + "/cache";
        this.sessionsPath = this.config.sessionsPath || process.cwd() + "/sessions";
        const modulePacker = new ModulePacker_1.default({
            appRoot: this.config.appPath,
            modulesPath: this.cachePath + "/modules",
            excludedModules: ["react", "react-dom"],
        });
        this.configuration = this.configuration ? this.configuration :
            new FileConfiguration_1.default({
                appDir: this.config.appPath,
                modulesPath: this.cachePath + "/modules",
                modulePacker,
            });
        this.router = config.router ? config.router :
            new FramesBasedRouter_1.default({ configuration: this.configuration });
        this.sessionFactory = new SessionFactory_1.default({
            configuration: this.configuration,
            sessionsPath: this.sessionsPath,
        });
    }
    attach(app) {
        app.use(cookieParser());
        app.get("/bundle.js", (_, res) => {
            res.sendFile(path_1.resolve(__dirname + "/../dist/bundle.js"));
        });
        app.use("/:url", (req, res) => __awaiter(this, void 0, void 0, function* () {
            const query = Object.keys(req.query)
                .map((paramName) => paramName + "=" + req.query[paramName]).join("&");
            const route = yield this.router.resolve({
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
            const session = yield this.sessionFactory.createSession({
                sid: req.cookies ? req.cookies.sid : undefined,
                route,
            });
            const result = yield session.render();
            const modulesWithContent = yield Promise.all(result.modules.map((mod) => __awaiter(this, void 0, void 0, function* () {
                return {
                    info: mod,
                    content: yield this.configuration.getModuleContent(mod),
                };
            })));
            const sidCookie = `sid=${result.sessionId + ":" + result.sessionHash}; expires=${new Date(+new Date() + 86400 * 1000 * 365).toUTCString()}; path=/`;
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
            modulesWithContent.map((mod) => res.write(`<script module-type="${mod.info.type}"
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
        }));
    }
    /*                     ${modulesWithContent.map((mod) =>
                        `<script module-type="${mod.info.type}"
                         type="neweb/module" name="${mod.info.name}" version="${mod.info.version}">
                        ${mod.content}
                    </script>`).join("\n")}
                */
    start(port) {
        const app = express();
        app.use(express.static(path_1.resolve(this.config.appPath + "/public")));
        this.attach(app);
        return new Promise((resolve, reject) => {
            this.server = app.listen(port, (err) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve();
            });
        });
    }
    stop() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.server) {
                return new Promise((resolve, reject) => {
                    this.server.close((err) => {
                        if (err) {
                            reject(err);
                            return;
                        }
                        resolve();
                    });
                });
            }
            return;
        });
    }
}
exports.default = Server;
