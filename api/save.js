const { getSupabase } = require('./_supabase');

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

    const supabase = getSupabase();
    const row = {
      po_number: key,
      contractor_name: (data.common && data.common.contractorName) || '',
      work_description: (data.common && data.common.workDescription) || '',
      data,
      updated_at: new Date().toISOString()
    };

    const { error } = await supabase.from('lks_records').upsert(row, { onConflict: 'po_number' });
    if (error) throw error;

    res.status(200).json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message || 'Ralat pelayan.' });
  }
};
