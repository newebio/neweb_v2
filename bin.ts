import Server from "./lib/Server";

const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 5000;
const server = new Server({ appPath: process.cwd() + "/app" });

server.start(port);
