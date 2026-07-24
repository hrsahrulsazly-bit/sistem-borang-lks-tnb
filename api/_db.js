const { Redis } = require('@upstash/redis');

// Works with either the classic "Vercel KV" env var names or a direct
// Upstash Marketplace integration's names - whichever Vercel injected.
const URL = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

let client = null;
function getRedis() {
  if (!URL || !TOKEN) {
    throw new Error('Storan Redis/KV belum disambung. Sila tambah integrasi Upstash Redis (atau KV) di tab Storage Vercel dan redeploy.');
  }
  if (!client) client = new Redis({ url: URL, token: TOKEN });
  return client;
}

module.exports = { getRedis };
