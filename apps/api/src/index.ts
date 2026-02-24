import { Hono } from "hono";
import { bearerAuth } from "hono/bearer-auth";
import {
	deleteUrlRoute,
	getAvailableDatesRoute,
	getImageRoute,
	getLanguagesRoute,
	getLatestRoute,
	getScreenshotsRoute,
	getStatusRoute,
	getUrlsRoute,
	postRunsRoute,
	postScreenshotsRoute,
	postUrlsRoute,
	uploadToR2Route,
} from "./handlers";

export interface Env {
	API_KEY: string;
	D1: D1Database;
	R2_BUCKET: R2Bucket;
}

const app = new Hono<{ Bindings: Env }>();

const routes = app

	.get("/", (c) => c.json({ status: "ok", service: "kiosk24" }))

	.on(["POST", "PUT", "DELETE", "PATCH"], "*", async (c, next) => {
		if (!c.env.API_KEY) {
			return c.json(
				{ error: "Server misconfiguration: API_KEY is missing" },
				500,
			);
		}
		const auth = bearerAuth({ token: c.env.API_KEY });
		return auth(c, next);
	})

	.get("/urls", ...getUrlsRoute)
	.post("/urls", ...postUrlsRoute)
	.delete("/urls/:id", ...deleteUrlRoute)

	.get("/screenshots", ...getScreenshotsRoute)
	.post("/screenshots", ...postScreenshotsRoute)
	.post("/upload-screenshot", ...uploadToR2Route)

	.post("/runs", ...postRunsRoute)

	.get("/latest", ...getLatestRoute)
	.get("/available-dates", ...getAvailableDatesRoute)
	.get("/languages", ...getLanguagesRoute)
	.get("/status", ...getStatusRoute)

	.get("/:key{.+$}", ...getImageRoute)

	.onError((err, c) => {
		console.error(`[Error] ${err.message}`, err);
		return c.json({ error: "Internal Server Error" }, 500);
	})

	.notFound((c) => {
		return c.json({ error: "Not Found" }, 404);
	});

export type AppType = typeof routes;

export default app;
