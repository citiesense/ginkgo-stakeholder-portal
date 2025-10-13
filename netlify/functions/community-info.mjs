import { ok,bad,forward,getBody } from './_utils.mjs';

export async function handler(e){
  const { communityId } = getBody(e);
  if (!communityId) return bad('communityId required');

  if (process.env.DEMO_MODE === 'true') {
    return ok({ ok: true, communityId, name: `Community ${communityId}`, demo: true });
  }

  const u = process.env.WEBHOOK_URL_COMMUNITY_INFO;
  if (!u) return bad('WEBHOOK_URL_COMMUNITY_INFO not set', 500);

  const payload = { communityId, label: 'community.info', source: 'stakeholder-portal' };
  const o = await forward(u, payload);
  return { statusCode: o.statusCode, body: o.body };
}
