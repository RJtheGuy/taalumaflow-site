

export function exportDashboardPDF(data, kpis) {
  const { grand, count, topCats, dates, dateVals, topProducts, growthPct } = data;

  const date = new Date().toLocaleDateString('it-IT');
  const docNum = `RPT-${Date.now().toString(36).toUpperCase().slice(-6)}`;

  const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Dashboard Report ${docNum}</title>
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family: 'Helvetica Neue', Arial, sans-serif; font-size:12px; color:#1a1a2e; padding:32px; }

  .header { display:flex; justify-content:space-between; align-items:flex-start; padding-bottom:16px; border-bottom:2px solid #2563EB; margin-bottom:24px; }
  .brand { font-size:20px; font-weight:700; color:#2563EB; }
  .brand span { color:#9B5DE5; }
  .meta { text-align:right; font-size:11px; color:#666; }
  .doc-num { font-size:14px; font-weight:700; color:#1a1a2e; }

  .kpis { display:grid; grid-template-columns:repeat(5,1fr); gap:12px; margin-bottom:24px; }
  .kpi { background:#f8f9ff; border-radius:8px; padding:12px; text-align:center; }
  .kpi-num { font-size:18px; font-weight:700; color:#2563EB; }
  .kpi-lbl { font-size:9px; color:#888; margin-top:4px; text-transform:uppercase; letter-spacing:0.05em; }

  h3 { font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:0.08em; color:#888; margin-bottom:10px; }

  .section { margin-bottom:24px; }

  .bar-row { display:flex; align-items:center; gap:8px; margin-bottom:6px; }
  .bar-label { width:100px; font-size:11px; color:#444; text-align:right; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
  .bar-track { flex:1; background:#f0f2ff; border-radius:3px; height:14px; }
  .bar-fill { background:linear-gradient(90deg,#3b82f6,#2563EB); height:14px; border-radius:3px; }
  .bar-val { width:60px; font-size:11px; font-weight:600; color:#1a1a2e; }

  table { width:100%; border-collapse:collapse; font-size:11px; }
  th { text-align:left; padding:8px 10px; background:#f8f9ff; font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:0.06em; color:#666; border-bottom:2px solid #e8ecff; }
  td { padding:7px 10px; border-bottom:1px solid #f0f2ff; color:#333; }
  tr:last-child td { border-bottom:none; }

  .timeline { display:flex; align-items:flex-end; gap:4px; height:80px; padding-top:8px; }
  .t-bar { flex:1; background:linear-gradient(180deg,#3b82f6,#2563EB); border-radius:3px 3px 0 0; min-width:8px; }
  .t-labels { display:flex; gap:4px; margin-top:4px; }
  .t-label { flex:1; font-size:8px; color:#888; text-align:center; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }

  .footer { margin-top:32px; padding-top:12px; border-top:1px solid #e8ecff; display:flex; justify-content:space-between; font-size:9px; color:#aaa; }
  .privacy { background:#d1fae5; color:#065f46; padding:6px 10px; border-radius:6px; font-size:10px; margin-top:16px; }
</style>
</head>
<body>

<div class="header">
  <div>
    <div class="brand">Taluma<span>Flow</span></div>
    <div style="font-size:10px;color:#aaa;margin-top:2px">Data Dashboard Report</div>
  </div>
  <div class="meta">
    <div class="doc-num">${docNum}</div>
    <div>${date}</div>
    <div style="margin-top:4px;color:#2563EB;font-weight:600">DEMO REPORT</div>
  </div>
</div>

<div class="kpis">
  <div class="kpi"><div class="kpi-num">€${grand.toLocaleString('it-IT',{maximumFractionDigits:0})}</div><div class="kpi-lbl">Total Revenue</div></div>
  <div class="kpi"><div class="kpi-num">${count}</div><div class="kpi-lbl">Transactions</div></div>
  <div class="kpi"><div class="kpi-num">${topCats.length}</div><div class="kpi-lbl">Categories</div></div>
  <div class="kpi"><div class="kpi-num">€${(grand/Math.max(count,1)).toFixed(0)}</div><div class="kpi-lbl">Avg Order</div></div>
  ${growthPct !== null ? `<div class="kpi"><div class="kpi-num" style="color:${growthPct>=0?'#22c55e':'#ef4444'}">${growthPct>=0?'+':''}${growthPct}%</div><div class="kpi-lbl">vs Prev Period</div></div>` : '<div class="kpi"></div>'}
</div>

<div style="display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-bottom:24px">
  <div class="section">
    <h3>Revenue by Category</h3>
    ${topCats.map(([cat,val]) => `
      <div class="bar-row">
        <div class="bar-label">${cat}</div>
        <div class="bar-track"><div class="bar-fill" style="width:${(val/topCats[0][1]*100).toFixed(0)}%"></div></div>
        <div class="bar-val">€${val.toFixed(0)}</div>
      </div>`).join('')}
  </div>

  <div class="section">
    <h3>Revenue Over Time</h3>
    ${dates.length > 0 ? `
    <div class="timeline">
      ${dateVals.map(v => `<div class="t-bar" style="height:${(v/Math.max(...dateVals)*100).toFixed(0)}%"></div>`).join('')}
    </div>
    <div class="t-labels">
      ${dates.map(d => `<div class="t-label">${d}</div>`).join('')}
    </div>` : '<div style="color:#aaa;font-size:11px">No date data</div>'}
  </div>
</div>

${topProducts.length > 0 ? `
<div class="section">
  <h3>Top Products by Revenue</h3>
  <table>
    <thead><tr><th>Product</th><th>Revenue</th><th>Share</th></tr></thead>
    <tbody>
      ${topProducts.slice(0,8).map(([name,val]) => `
        <tr>
          <td>${name}</td>
          <td>€ ${val.toLocaleString('it-IT',{minimumFractionDigits:2,maximumFractionDigits:2})}</td>
          <td>${(val/grand*100).toFixed(1)}%</td>
        </tr>`).join('')}
    </tbody>
  </table>
</div>` : ''}

<div class="privacy">🔒 This report was generated client-side. No data was sent to any server.</div>

<div class="footer">
  <span>Generated by TaalumaFlow · talumaflow.com</span>
  <span>Demo report — for production dashboards contact info@talumaflow.com</span>
</div>

</body>
</html>`;
  const w = window.open('', '_blank', 'width=900,height=700');
  if (!w) return;
  w.document.write(html);
  w.document.close();
  w.focus();

  w.onafterprint = () => w.close();

  setTimeout(() => {
    w.print();
    setTimeout(() => { if (!w.closed) w.close(); }, 1000); 
  }, 600);
}