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
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const express = require("express");
const path_1 = require("path");
const SocketIO = require("socket.io");
const FileConfiguration_1 = require("./FileConfiguration");
const FramesBasedRouter_1 = require("./FramesBasedRouter");
const ModulePacker_1 = require("./ModulePacker");
const ModulesServer_1 = require("./ModulesServer");
const RemoteManager_1 = require("./RemoteManager");
const SessionsManager_1 = require("./SessionsManager");
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
        this.sessionsManager = new SessionsManager_1.default({
            configuration: this.configuration,
            sessionsPath: this.sessionsPath,
        });
        this.remoteManager = new RemoteManager_1.default({
            sessionsManager: this.sessionsManager,
            configuration: this.configuration,
        });
        this.modulesServer = new ModulesServer_1.default({
            configuration: this.configuration,
        });
    }
    attach(app) {
        this.modulesServer.attach(app);
        app.use(cookieParser());
        app.get("/bundle.js", (_, res) => {
            res.sendFile(path_1.resolve(__dirname + "/../dist/bundle.js"));
        });
        app.post("/resolveRoute", bodyParser.json(), (req, res) => __awaiter(this, void 0, void 0, function* () {
            const { url } = req.body;
            this.resolveRoute(url, req, res, false);
        }));
        app.get("/:url", (req, res) => __awaiter(this, void 0, void 0, function* () {
            const query = Object.keys(req.query)
                .map((paramName) => paramName + "=" + req.query[paramName]).join("&");
            this.resolveRoute("/" + req.params.url + "?" + query, req, res);
        }));
    }
    start(port) {
        const app = express();
        app.use(express.static(path_1.resolve(this.config.appPath + "/public")));
        this.attach(app);
        return new Promise((resolve, reject) => {
            this.server = app.listen(port, (err) => __awaiter(this, void 0, void 0, function* () {
                if (err) {
                    reject(err);
                    return;
                }
                yield this.startWebsocket(this.server);
                resolve();
            }));
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
    startWebsocket(server) {
        const io = SocketIO(server);
        io.on("connection", (client) => {
            this.remoteManager.onNewSocket(client);
        });
    }
    resolveRoute(url, req, res, isFull = true) {
        return __awaiter(this, void 0, void 0, function* () {
            const route = yield this.router.resolve({
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
            let session;
            if (req.cookies && req.cookies.sid) {
                try {
                    session = yield this.sessionsManager.resolveSessionBySid(req.cookies.sid);
                }
                catch (e) {
                    //
                }
            }
            if (!session) {
                session = yield this.sessionsManager.createSession();
            }
            const result = yield session.render(route);
            const sidCookie = `sid=${result.sessionId + ":" + result.sessionHash}; expires=${new Date(+new Date() + 86400 * 1000 * 365).toUTCString()}; path=/`;
            const html = result.html;
            delete result.html;
            if (isFull) {
                res.writeHead(200, {
                    "Content-Type": "text/html",
                    "Set-Cookie": sidCookie,
                });
                const template = yield this.configuration.resolveTemplate();
                res.write(template
                    .replace("{%__initial_html__%}", html)
                    .replace("{%__initial_script__%}", `<script>
                    window.__initial_data=${JSON.stringify(result)};
                    </script>`));
                res.end();
            }
            else {
                res.writeHead(200, {
                    "Content-Type": "application/json",
                    "Set-Cookie": sidCookie,
                });
                res.write(JSON.stringify(result));
                res.end();
            }
        });
    }
}
exports.default = Server;
