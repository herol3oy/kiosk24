import type { APIRoute } from "astro";

export const GET: APIRoute = async ({ params, locals }) => {
	try {
		const env = locals.runtime.env;
		const path = params.path;

		if (!path) {
			return new Response(JSON.stringify({ error: "Path is required" }), {
				status: 400,
				headers: { "Content-Type": "application/json" },
			});
		}

		const res = await env.API_WORKER.fetch(`http://internal/${path}`);

		return new Response(res.body, {
			status: res.status,
			headers: res.headers,
		});
	} catch (_error) {
		return new Response(JSON.stringify({ error: "Proxy failed" }), {
			status: 500,
			headers: { "Content-Type": "application/json" },
		});
	}
};
