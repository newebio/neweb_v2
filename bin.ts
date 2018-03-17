import express = require("express");
import Server from "./lib/Server";

const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 5000;
const app = express();
const server = new Server({ appPath: process.cwd() + "/app" });

server.attach(app);

app.listen(port);
