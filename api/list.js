const { getSupabase } = require('./_supabase');

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('lks_records')
      .select('po_number, contractor_name, work_description, updated_at')
      .order('updated_at', { ascending: false });

    if (error) throw error;

    const records = (data || []).map((r) => ({
      poNumber: r.po_number,
      contractorName: r.contractor_name,
      workDescription: r.work_description,
      updatedAt: r.updated_at
    }));

    res.status(200).json({ records });
  } catch (e) {
    res.status(500).json({ error: e.message || 'Ralat pelayan.' });
  }
};
