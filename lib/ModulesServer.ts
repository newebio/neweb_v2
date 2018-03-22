import express = require("express");
import { IConfiguration } from "..";
export interface IModuleServerConfig {
    configuration: IConfiguration;
}
class ModuleServer {
    constructor(protected config: IModuleServerConfig) {

    }
    public attach(app: express.Express) {
        app.get("/modules/:type/:name/:version.js", async (req, res) => {
            const { type, name: xName, version } = req.params;
            const name = xName.replace(/~/gi, "/");
            try {
                const mod = {
                    name,
                    type,
                    version: version === "*" ? undefined : version,
                };
                const moduleStream = await this.config.configuration.getModuleContentStream(mod);
                moduleStream.on("error", (e) => {
                    if (e.toString().indexOf("ENOENT") > -1) {
                        res.status(404).send("Not found module::" + JSON.stringify(mod));
                        return;
                    }
                    res.status(500).send(e.toString());
                });
                moduleStream.on("open", () => {
                    res.writeHead(200, {
                        "Content-Type": "application/json",
                    });
                    moduleStream.pipe(res);
                });
                moduleStream.on("close", () => {
                    res.end();
                });
            } catch (e) {
                res.status(500).send(e.toString());
            }
        });
    }
}
export default ModuleServer;
