const supabase = require('../config/supabase');

// Ambil detections terbaru untuk satu aset (lewat reports.asset_id).
async function getRecentDetections(assetId, windowDays = 7) {
  const since = new Date(Date.now() - windowDays * 24 * 60 * 60 * 1000).toISOString();
  const { data, error } = await supabase
    .from('detections')
    .select('defect, severity, confidence, created_at, reports!inner(asset_id)')
    .eq('reports.asset_id', assetId)
    .gte('created_at', since);
  if (error) throw error;
  return data || [];
}

// Ringkas per-defect: severity tertinggi + jumlah deteksi (worst case per kelas).
function summarizeByDefect(detections) {
  const map = new Map();
  for (const d of detections) {
    const sev = d.severity == null ? 0 : Number(d.severity);
    const cur = map.get(d.defect) || { defect: d.defect, severity: 0, confidence: 0, count: 0 };
    cur.severity = Math.max(cur.severity, sev);
    cur.confidence = Math.max(cur.confidence, Number(d.confidence) || 0);
    cur.count += 1;
    map.set(d.defect, cur);
  }
  return [...map.values()];
}

// Cocokkan defect+severity ke aturan SPK. Band yang lebih berat menang di batas.
function matchRule(rules, defect, severity) {
  const cands = rules.filter(
    (r) => r.defect === defect && severity >= Number(r.severity_min) && severity <= Number(r.severity_max)
  );
  if (cands.length === 0) return null;
  cands.sort((a, b) => b.priority - a.priority);
  return cands[0];
}

async function recommendForAsset(assetId, { windowDays = 7, persist = false } = {}) {
  const [{ data: rules, error: rulesErr }, detections] = await Promise.all([
    supabase.from('spk_rules').select('*'),
    getRecentDetections(assetId, windowDays),
  ]);
  if (rulesErr) throw rulesErr;

  const summary = summarizeByDefect(detections);
  const recommendations = [];
  for (const s of summary) {
    const rule = matchRule(rules || [], s.defect, s.severity);
    if (!rule) continue;
    recommendations.push({
      defect: s.defect,
      severity: s.severity,
      confidence: s.confidence,
      count: s.count,
      action_text: rule.action_text,
      priority: rule.priority,
      rule_id: rule.id,
    });
  }
  recommendations.sort((a, b) => b.priority - a.priority || b.severity - a.severity);

  let persisted = false;
  let risk_score_id = null;
  if (persist) {
    const { data: rs } = await supabase
      .from('risk_scores')
      .select('id')
      .eq('asset_id', assetId)
      .order('computed_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (rs) {
      risk_score_id = rs.id;
      await supabase.from('recommendations').delete().eq('risk_score_id', risk_score_id);
      if (recommendations.length) {
        const rows = recommendations.map((r) => ({
          risk_score_id,
          defect: r.defect,
          action_text: r.action_text,
          priority: r.priority,
        }));
        const { error: insErr } = await supabase.from('recommendations').insert(rows);
        if (insErr) throw insErr;
        persisted = true;
      }
    }
  }

  return {
    window_days: windowDays,
    detections_total: detections.length,
    defects_found: summary.length,
    recommendations,
    persisted,
    risk_score_id,
  };
}

module.exports = { recommendForAsset, summarizeByDefect, matchRule, getRecentDetections };