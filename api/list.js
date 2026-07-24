const { getRedis } = require('./_db');

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const redis = getRedis();
    const all = (await redis.hgetall('record-index')) || {};
    const records = Object.values(all)
      .map((v) => {
        try { return typeof v === 'string' ? JSON.parse(v) : v; } catch (e) { return null; }
      })
      .filter(Boolean)
      .sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || ''));

    res.status(200).json({ records });
  } catch (e) {
    res.status(500).json({ error: e.message || 'Ralat pelayan.' });
  }
};
