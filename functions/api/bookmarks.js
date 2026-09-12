export async function onRequestGet(context) {
  const { env } = context;
  try {
    const raw = await env.BOOKMARKS_KV.get("data");
    if (!raw) {
      return new Response(JSON.stringify({ apps: null, categories: null }), {
        headers: { "Content-Type": "application/json" }
      });
    }
    return new Response(raw, {
      headers: { "Content-Type": "application/json", "Cache-Control": "no-store" }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: "KV read failed", detail: String(err) }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}

export async function onRequestPost(context) {
  const { env, request } = context;
  try {
    const body = await request.json();
    if (!body || !Array.isArray(body.apps)) {
      return new Response(JSON.stringify({ error: "Invalid payload: apps[] required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    const payload = JSON.stringify({
      apps: body.apps,
      categories: Array.isArray(body.categories) ? body.categories : ["All"],
      backgroundColor: body.backgroundColor || null,
      updatedAt: new Date().toISOString()
    });
    await env.BOOKMARKS_KV.put("data", payload);
    return new Response(JSON.stringify({ ok: true }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: "KV write failed", detail: String(err) }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}

export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    }
  });
}
