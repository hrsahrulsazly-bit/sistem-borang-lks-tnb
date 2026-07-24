const { getRedis } = require('./_db');

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const po = (req.query.po || '').toString().trim();
  if (!po) {
    res.status(400).json({ error: 'No. Pesanan Belian (PO) diperlukan.' });
    return;
  }

  try {
    const redis = getRedis();
    const data = await redis.get(`record:${po}`);
    if (!data) {
      res.status(404).json({ error: `Tiada rekod dijumpai untuk No. PO ${po}.` });
      return;
    }
    res.status(200).json({ data });
  } catch (e) {
    res.status(500).json({ error: e.message || 'Ralat pelayan.' });
  }
};
