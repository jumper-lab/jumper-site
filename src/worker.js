/* Worker do jumper-site: assets estáticos + POST /api/track (Meta CAPI).
   O token do CAPI vive APENAS no secret META_CAPI_TOKEN do worker
   (1Password → wrangler secret put). Sem o secret, a rota vira no-op 204. */

const PIXEL_ID = '2300032824240212';

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === '/api/track') {
      if (request.method !== 'POST') return new Response(null, { status: 405 });
      return handleTrack(request, env);
    }

    return env.ASSETS.fetch(request);
  }
};

async function handleTrack(request, env) {
  if (!env.META_CAPI_TOKEN) return new Response(null, { status: 204 });

  let body = null;
  try { body = JSON.parse(await request.text()); } catch (e) {}
  if (!body || !body.event_name || !body.event_id) {
    return new Response(null, { status: 400 });
  }

  const custom = Object.assign({}, body.data || {});
  if (body.variant) custom.wm_variant = body.variant;

  const event = {
    event_name: String(body.event_name).slice(0, 64),
    event_time: Math.floor(Date.now() / 1000),
    event_id: String(body.event_id).slice(0, 64),
    event_source_url: body.event_source_url,
    action_source: 'website',
    user_data: {
      client_ip_address: request.headers.get('CF-Connecting-IP') || undefined,
      client_user_agent: request.headers.get('User-Agent') || undefined,
      fbp: body.fbp || undefined,
      fbc: body.fbc || undefined
    },
    custom_data: custom
  };

  try {
    const r = await fetch('https://graph.facebook.com/v21.0/' + PIXEL_ID + '/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: [event], access_token: env.META_CAPI_TOKEN })
    });
    return new Response(null, { status: r.ok ? 204 : 502 });
  } catch (e) {
    return new Response(null, { status: 502 });
  }
}
