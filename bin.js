"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Server_1 = require("./lib/Server");
const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 5000;
const server = new Server_1.default({ appPath: process.cwd() + "/app" });
server.start(port);
