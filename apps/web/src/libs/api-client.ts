import type { AppType } from "@kiosk24/api";
import { hc } from "hono/client";

export const browserClient = hc<AppType>("/api");

export const getServerClient = (env: { API_WORKER: { fetch: typeof fetch } }) => {
	return hc<AppType>("http://internal", {
		fetch: env.API_WORKER.fetch.bind(env.API_WORKER),
	});
};
