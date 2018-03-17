import o from "onemitter";
import { create } from "react-test-renderer";
import { IFrameConfigClient, IRemoteProvider } from "..";
import FileConfiguration from "./../lib/FileConfiguration";
import FrameController from "./FrameController";
class ClientFileConfiguration {
    protected fileConfiguration: FileConfiguration;
    constructor(config: { appDir: string }) {
        this.fileConfiguration = new FileConfiguration({ appDir: config.appDir });
    }
    public async resolveFrame(name: string): Promise<IFrameConfigClient> {
        const config = await this.fileConfiguration.resolveFrame(name);
        return {
            ...config,
            remote: { data: [], actions: [] },
        };
    }
    public async hasFrame() {
        return true;
    }
}
const configuration = new ClientFileConfiguration({ appDir: __dirname + "/../__fixtures__/app" });
const remote: IRemoteProvider = {
    data: () => o(),
    action: () => null,
};
const frameController = new FrameController({
    configuration,
    remote,
});
it("FrameController:: static render", async () => {
    const rootElement = await frameController.render({
        status: 200,
        frames: [{
            frame: "static",
            params: {},
        }],
    }, []);
    expect(create(rootElement).toJSON()).toMatchSnapshot();
});
it("FrameController:: update route", async () => {
    const rootElement = await frameController.render({
        status: 200,
        frames: [{
            frame: "static",
            params: {},
        }],
    }, []);
    const el = create(rootElement);
    await frameController.updateRoute({
        status: 200,
        frames: [{
            frame: "parent",
            params: {},
        }, {
            frame: "static",
            params: {},
        }],
    }, []);
    expect(el.toJSON()).toMatchSnapshot();
});
