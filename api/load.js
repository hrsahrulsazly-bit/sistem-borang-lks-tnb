const { getSupabase } = require('./_supabase');

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
    const supabase = getSupabase();
    const { data: row, error } = await supabase
      .from('lks_records')
      .select('data')
      .eq('po_number', po)
      .maybeSingle();

    if (error) throw error;
    if (!row) {
      res.status(404).json({ error: `Tiada rekod dijumpai untuk No. PO ${po}.` });
      return;
    }
    res.status(200).json({ data: row.data });
  } catch (e) {
    res.status(500).json({ error: e.message || 'Ralat pelayan.' });
  }
};
