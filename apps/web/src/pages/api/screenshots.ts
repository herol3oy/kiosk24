import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ locals, request }) => {
  try {
    const env = locals.runtime.env;
    const url = new URL(request.url);
    
    const res = await env.API_WORKER.fetch(`http://internal/screenshots${url.search}`);
    const data = await res.json();

    return new Response(JSON.stringify(data), {
      status: res.status,
      headers: {
        'Content-Type': 'application/json'
      }
    });

  } catch (e) {
    return new Response(JSON.stringify({ error: 'Proxy Error' }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};