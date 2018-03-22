import { IRouteInfo } from "..";

export interface IRouteResolverConfig {
    address: string;
}
class RouteResolver {
    constructor(protected config: IRouteResolverConfig) {

    }
    public async resolve(href: string): Promise<IRouteInfo> {
        const response = await fetch(this.config.address + "/resolveRoute", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                url: href,
            }),
        });
        if (response.status !== 200) {
            throw new Error("Invalid request::" + await response.text());
        }
        return response.json();
    }
}
export default RouteResolver;
