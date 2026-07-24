const { kv } = require('@vercel/kv');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const { poNumber, data } = req.body || {};
    const key = typeof poNumber === 'string' ? poNumber.trim() : '';

    if (!key) {
      res.status(400).json({ error: 'No. Pesanan Belian (PO) diperlukan.' });
      return;
    }
    if (!data || typeof data !== 'object') {
      res.status(400).json({ error: 'Data borang tidak sah.' });
      return;
    }

    await kv.set(`record:${key}`, data);

    const meta = {
      poNumber: key,
      contractorName: (data.common && data.common.contractorName) || '',
      workDescription: (data.common && data.common.workDescription) || '',
      updatedAt: new Date().toISOString()
    };
    await kv.hset('record-index', { [key]: JSON.stringify(meta) });

    res.status(200).json({ ok: true, meta });
  } catch (e) {
    res.status(500).json({ error: e.message || 'Ralat pelayan.' });
  }
};
