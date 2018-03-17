import { JSDOM } from "jsdom";
import fetch from "node-fetch";
import { Grabber, obj } from "page-grabber";
export async function grabSuccess<T>(url: string, model: T): Promise<T> {
    const response = await fetch(url);
    if (response.status !== 200) {
        throw new Error("Invalid response " + response.status + "::" + await response.text());
    }
    const text = await response.text();
    const window = new JSDOM(text, {
        runScripts: "dangerously",
    }).window;
    const grabber = new Grabber(window);
    return grabber.grab(model);
}
export async function grabSuccessWithInitial<T>(url: string, content: T): Promise<{
    content: T;
    data: any;
    route: any;
}> {
    return grabSuccess(url, {
        content,
        data: obj("window.__initial_data"),
        route: obj("window.__initial_route"),
    });
}
