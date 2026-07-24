const { getRedis } = require('./_db');

module.exports = async function handler(req, res) {
  if (req.method !== 'DELETE' && req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const po = ((req.query && req.query.po) || (req.body && req.body.poNumber) || '').toString().trim();
  if (!po) {
    res.status(400).json({ error: 'No. Pesanan Belian (PO) diperlukan.' });
    return;
  }

  try {
    const redis = getRedis();
    await redis.del(`record:${po}`);
    await redis.hdel('record-index', po);
    res.status(200).json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message || 'Ralat pelayan.' });
  }
};
