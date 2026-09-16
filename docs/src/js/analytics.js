import { BACKEND_URL, IS_BACKEND_CONFIGURED } from './config.js';

const TOOLS = {
  forecast: {
    label:   'Demand Forecast',
    icon:    '📈',
    desc:    'Predict next 4–8 weeks of product demand',
    params:  [{ id: 'weeks', label: 'Weeks ahead', type: 'number', default: 8, min: 1, max: 52 }],
    columns: 'Needs: product, qty columns. Optional: date',
  },
  churn: {
    label:   'Churn Predictor',
    icon:    '⚠️',
    desc:    'Find customers who stopped ordering',
    params:  [
      { id: 'churn_days',   label: 'Churned after (days)',  type: 'number', default: 60, min: 1 },
      { id: 'warning_days', label: 'At-risk after (days)',  type: 'number', default: 30, min: 1 },
    ],
    columns: 'Needs: customer, date columns. Optional: revenue',
  },
  inventory: {
    label:   'Inventory Optimizer',
    icon:    '📦',
    desc:    'Calculate reorder points and optimal order quantities',
    params:  [
      { id: 'lead_days',  label: 'Lead time (days)',     type: 'number', default: 7,  min: 1 },
      { id: 'order_cost', label: 'Order cost (€)',       type: 'number', default: 50, min: 0 },
    ],
    columns: 'Needs: product, qty columns. Optional: unit_price',
  },
};

const SAMPLE_CSV = {
  forecast: `product,qty,date
Olio EVO Frantoio,12,2026-01-05
Vino Rosso Toscano,8,2026-01-05
Olio EVO Frantoio,18,2026-02-03
Vino Rosso Toscano,15,2026-02-03
Olio EVO Frantoio,22,2026-03-01
Vino Rosso Toscano,20,2026-03-01`,
  churn: `customer,date,revenue
Marco Bianchi,2026-01-15,144
Ristorante La Pergola,2026-01-20,280
Marco Bianchi,2026-02-10,216
Distribuzione Nord,2026-03-05,510`,
  inventory: `product,qty,unit_price
Olio EVO Frantoio,120,12.00
Vino Rosso Toscano,80,18.00
Pasta Di Martino,300,1.80`,
};

function downloadSample(toolKey) {
  const blob = new Blob([SAMPLE_CSV[toolKey]], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `taalumaflow-sample-${toolKey}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function parseError(rawMessage, tool) {
  const m = rawMessage || '';
  const columnIssue = /need .* columns?/i.test(m);

  if (columnIssue) {
    return {
      friendly: `This file doesn't have the columns ${tool.label} needs. ${tool.columns}.`,
      technical: m,
    };
  }
  return { friendly: `Something went wrong reading this file. Try the sample CSV below to see the expected format.`, technical: m };
}

export function initAnalyticsWidget() {
  const container = document.getElementById('analytics-widget');
  if (!container) return;

  renderToolPicker(container);
}

function renderToolPicker(container) {
  container.innerHTML = `
    <div class="aw-section">
      <div class="aw-tools">
        ${Object.entries(TOOLS).map(([key, tool]) => `
          <button class="aw-tool-btn" data-tool="${key}">
            <div class="aw-tool-icon">${tool.icon}</div>
            <div class="aw-tool-label">${tool.label}</div>
            <div class="aw-tool-desc">${tool.desc}</div>
          </button>`).join('')}
      </div>
    </div>`;

  container.querySelectorAll('.aw-tool-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const key = btn.dataset.tool;
      renderUpload(container, key);
    });
  });
}

function renderUpload(container, toolKey) {
  const tool = TOOLS[toolKey];

  container.innerHTML = `
    <div class="aw-section">
      <div class="aw-breadcrumb">
        <button class="aw-back-btn" id="aw-back">← Back</button>
        <span>${tool.icon} ${tool.label}</span>
      </div>

      <div class="aw-panel">
        <div class="aw-upload-area" id="aw-drop">
          <input type="file" id="aw-file" accept=".csv"
                 style="position:absolute;inset:0;opacity:0;cursor:pointer;z-index:2">
          <div class="aw-upload-icon">📂</div>
          <div class="aw-upload-title">Drop your CSV here or click to browse</div>
          <div class="aw-upload-hint">${tool.columns}</div>
        </div>

        <div class="aw-params">
          ${tool.params.map(p => `
            <div class="aw-param">
              <label for="aw-${p.id}">${p.label}</label>
              <input type="${p.type}" id="aw-${p.id}"
                     value="${p.default}" min="${p.min || 0}"
                     class="aw-param-input">
            </div>`).join('')}
        </div>
      </div>

      <div id="aw-status" style="min-height:20px;font-size:12px;color:var(--text3);text-align:center;margin-top:16px"></div>
      <div id="aw-results"></div>

      ${!IS_BACKEND_CONFIGURED ? `
        <div class="aw-notice">
          ⚡ Backend not connected —
          <a href="#contact" style="color:var(--blue)">book a demo</a>
          to run this on your real data.
        </div>` : ''}
    </div>`;

  document.getElementById('aw-back')?.addEventListener('click', () => renderToolPicker(container));

  const dropzone = document.getElementById('aw-drop');
  const fileInput = document.getElementById('aw-file');

  dropzone.addEventListener('dragover', e => { e.preventDefault(); dropzone.classList.add('drag-over'); });
  dropzone.addEventListener('dragleave', () => dropzone.classList.remove('drag-over'));
  dropzone.addEventListener('drop', e => {
    e.preventDefault();
    dropzone.classList.remove('drag-over');
    const f = e.dataTransfer.files[0];
    if (f?.name.endsWith('.csv')) handleFile(f, toolKey, container);
  });

  fileInput.addEventListener('change', () => {
    if (fileInput.files[0]) handleFile(fileInput.files[0], toolKey, container);
  });
}

async function handleFile(file, toolKey, container) {
  const status    = document.getElementById('aw-status');
  const resultsEl = document.getElementById('aw-results');
  const tool      = TOOLS[toolKey];

  status.textContent = `⏳ Analysing ${file.name}…`;
  status.style.color = 'var(--text3)';
  resultsEl.innerHTML = '';

  const formData = new FormData();
  formData.append('file', file);
  tool.params.forEach(p => {
    const val = document.getElementById(`aw-${p.id}`)?.value;
    if (val) formData.append(p.id, val);
  });

  try {
    if (!IS_BACKEND_CONFIGURED) throw new Error('no_backend');

    const res = await fetch(`${BACKEND_URL}/api/analytics/${toolKey}/`, {
      method: 'POST',
      body: formData,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `HTTP ${res.status}`);
    }

    const data = await res.json();
    status.textContent = `✓ Analysis complete — ${data.count || data.total || 0} items`;
    status.style.color = 'var(--green)';

    renderResults(toolKey, data, resultsEl);

  } catch (err) {
    status.textContent = '';

    if (err.message === 'no_backend') {
      status.style.color = 'var(--red, #ef4444)';
      status.textContent = '⚡ Backend not connected — book a demo to run this on your data.';
      return;
    }

    const { friendly, technical } = parseError(err.message, tool);
    renderError(friendly, technical, toolKey, resultsEl);
  }
}

function renderError(friendly, technical, toolKey, el) {
  el.innerHTML = `
    <div class="aw-error">
      <div class="aw-error-title">⚠️ ${friendly}</div>
      <div class="aw-error-actions">
        <button class="aw-sample-btn" id="aw-sample-dl">↓ Download sample CSV</button>
        <button class="aw-details-toggle" id="aw-details-toggle">Show technical details</button>
      </div>
      <div class="aw-error-details" id="aw-error-details" style="display:none">${technical}</div>
    </div>`;

  document.getElementById('aw-sample-dl')?.addEventListener('click', () => downloadSample(toolKey));
  document.getElementById('aw-details-toggle')?.addEventListener('click', (e) => {
    const details = document.getElementById('aw-error-details');
    const isHidden = details.style.display === 'none';
    details.style.display = isHidden ? 'block' : 'none';
    e.target.textContent = isHidden ? 'Hide technical details' : 'Show technical details';
  });
}

function renderResults(toolKey, data, el) {
  const tool = TOOLS[toolKey];
  if (toolKey === 'forecast')  renderForecast(toolKey, tool, data, el);
  if (toolKey === 'churn')     renderChurn(toolKey, tool, data, el);
  if (toolKey === 'inventory') renderInventory(toolKey, tool, data, el);
}

// ── Forecast renderer ─────────────────────────────────────────
function renderForecast(toolKey, tool, data, el) {
  const maxTotal = Math.max(...data.results.map(r => r.total_forecast), 1);
  const trendIcon = t => t === 'growing' ? '📈' : t === 'declining' ? '📉' : '➡';
  const trendColor = t => t === 'growing' ? 'var(--green)' : t === 'declining' ? '#ef4444' : 'var(--text3)';

  el.innerHTML = `
    <div class="aw-results-header">
      <div class="aw-stat"><div class="aw-stat-num">${data.count}</div><div class="aw-stat-lbl">Products</div></div>
      <div class="aw-stat"><div class="aw-stat-num">${data.weeks}</div><div class="aw-stat-lbl">Weeks ahead</div></div>
      <div class="aw-stat">
        <div class="aw-stat-num">${data.results.filter(r=>r.trend==='growing').length}</div>
        <div class="aw-stat-lbl">📈 Growing</div>
      </div>
      <div class="aw-stat">
        <div class="aw-stat-num">${data.results.filter(r=>r.trend==='declining').length}</div>
        <div class="aw-stat-lbl">📉 Declining</div>
      </div>
    </div>

    <div class="aw-table-wrap">
      <table class="aw-table">
        <thead>
          <tr>
            <th>Product</th>
            <th>Avg/Week</th>
            <th>Trend</th>
            <th>Forecast (${data.weeks}wk)</th>
            <th>Total needed</th>
          </tr>
        </thead>
        <tbody>
          ${data.results.map(r => `
            <tr>
              <td>${r.product}</td>
              <td>${r.avg_weekly}</td>
              <td style="color:${trendColor(r.trend)}">${trendIcon(r.trend)} ${r.trend}</td>
              <td>
                <div class="aw-mini-bars">
                  ${r.weeks_forecast.map(v => `
                    <div class="aw-mini-bar"
                         style="height:${Math.round(v/Math.max(...r.weeks_forecast)*28)}px"
                         title="${v} units"></div>`).join('')}
                </div>
              </td>
              <td>
                <div class="aw-bar-row">
                  <div class="aw-bar-track">
                    <div class="aw-bar-fill"
                         style="width:${(r.total_forecast/maxTotal*100).toFixed(1)}%"></div>
                  </div>
                  <span>${r.total_forecast}</span>
                </div>
              </td>
            </tr>`).join('')}
        </tbody>
      </table>
    </div>
    ${ctaBlock()}`;

  document.getElementById('aw-pdf-btn')?.addEventListener('click', () => exportAnalyticsPDF(toolKey, tool, data));
}

// ── Churn renderer ────────────────────────────────────────────
function renderChurn(toolKey, tool, data, el) {
  const statusColor = s => s==='churned' ? '#ef4444' : s==='at_risk' ? '#f59e0b' : 'var(--green)';
  const statusLabel = s => s==='churned' ? '🔴 Churned' : s==='at_risk' ? '🟡 At risk' : '🟢 Active';

  el.innerHTML = `
    <div class="aw-results-header">
      <div class="aw-stat"><div class="aw-stat-num">${data.total}</div><div class="aw-stat-lbl">Customers</div></div>
      <div class="aw-stat"><div class="aw-stat-num" style="color:#ef4444">${data.churned}</div><div class="aw-stat-lbl">🔴 Churned</div></div>
      <div class="aw-stat"><div class="aw-stat-num" style="color:#f59e0b">${data.at_risk}</div><div class="aw-stat-lbl">🟡 At risk</div></div>
      <div class="aw-stat"><div class="aw-stat-num" style="color:#ef4444">€${data.revenue_at_risk.toLocaleString('it-IT',{minimumFractionDigits:0})}</div><div class="aw-stat-lbl">Revenue at risk</div></div>
    </div>

    <div class="aw-table-wrap">
      <table class="aw-table">
        <thead>
          <tr>
            <th>Customer</th>
            <th>Status</th>
            <th>Days since order</th>
            <th>Last order</th>
            <th>Orders</th>
            <th>Total revenue</th>
          </tr>
        </thead>
        <tbody>
          ${data.results.map(r => `
            <tr>
              <td>${r.customer}</td>
              <td style="color:${statusColor(r.status)};font-weight:600">${statusLabel(r.status)}</td>
              <td>${r.days_since}d</td>
              <td>${r.last_order}</td>
              <td>${r.order_count}</td>
              <td>${r.total_revenue > 0 ? '€'+r.total_revenue.toLocaleString('it-IT',{minimumFractionDigits:2}) : '—'}</td>
            </tr>`).join('')}
        </tbody>
      </table>
    </div>
    ${ctaBlock()}`;

  document.getElementById('aw-pdf-btn')?.addEventListener('click', () => exportAnalyticsPDF(toolKey, tool, data));
}

// ── Inventory renderer ────────────────────────────────────────
function renderInventory(toolKey, tool, data, el) {
  const riskColor = r => r==='high' ? '#ef4444' : r==='medium' ? '#f59e0b' : 'var(--green)';
  const riskLabel = r => r==='high' ? '🔴 High' : r==='medium' ? '🟡 Medium' : '🟢 Low';
  const maxROP = Math.max(...data.results.map(r => r.reorder_point), 1);

  el.innerHTML = `
    <div class="aw-results-header">
      <div class="aw-stat"><div class="aw-stat-num">${data.total}</div><div class="aw-stat-lbl">Products</div></div>
      <div class="aw-stat"><div class="aw-stat-num">${data.lead_days}d</div><div class="aw-stat-lbl">Lead time</div></div>
      <div class="aw-stat"><div class="aw-stat-num" style="color:#ef4444">${data.high_risk}</div><div class="aw-stat-lbl">🔴 High risk</div></div>
    </div>

    <div class="aw-table-wrap">
      <table class="aw-table">
        <thead>
          <tr>
            <th>Product</th>
            <th>Avg/Day</th>
            <th>Safety stock</th>
            <th>Reorder point</th>
            <th>Order qty (EOQ)</th>
            <th>Risk</th>
          </tr>
        </thead>
        <tbody>
          ${data.results.map(r => `
            <tr>
              <td>${r.product}</td>
              <td>${r.avg_daily}</td>
              <td>${r.safety_stock}</td>
              <td>
                <div class="aw-bar-row">
                  <div class="aw-bar-track">
                    <div class="aw-bar-fill"
                         style="width:${(r.reorder_point/maxROP*100).toFixed(1)}%"></div>
                  </div>
                  <span>${r.reorder_point}</span>
                </div>
              </td>
              <td>${r.eoq}</td>
              <td style="color:${riskColor(r.demand_risk)};font-weight:600">${riskLabel(r.demand_risk)}</td>
            </tr>`).join('')}
        </tbody>
      </table>
    </div>
    ${ctaBlock()}`;

  document.getElementById('aw-pdf-btn')?.addEventListener('click', () => exportAnalyticsPDF(toolKey, tool, data));
}

function ctaBlock() {
  return `
    <div class="aw-cta">
      <div class="aw-cta-text">
        🔒 Processed securely on our servers via encrypted connection.
        This is exactly how we build your production analytics.
      </div>
      <div class="aw-cta-actions">
        <button class="aw-pdf-btn" id="aw-pdf-btn">⬇ Export as PDF</button>
        <a href="#contact" class="btn-primary" style="font-size:13px;padding:10px 24px">
          Build this for my real data →
        </a>
      </div>
    </div>`;
}

// ── PDF export ───────────────────────────────────────────────
function buildAnalyticsPDFHtml(toolKey, tool, data) {
  const docNum = `RPT-${Date.now().toString(36).toUpperCase().slice(-6)}`;
  const date = new Date().toLocaleString('en-GB');
  const kpis = getKPIsForTool(toolKey, data);
  const tableHtml = getTableHtmlForTool(toolKey, data);

  return `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><title>${tool.label} Report ${docNum}</title>
<style>
  * { margin:0;padding:0;box-sizing:border-box; }
  body { font-family:'Helvetica Neue',Arial,sans-serif;font-size:12px;color:#1a1a2e;padding:40px; }
  .header { display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:32px;padding-bottom:20px;border-bottom:2px solid #4F8EF7; }
  .brand { font-size:22px;font-weight:700;color:#2563EB;letter-spacing:-0.03em; }
  .brand span { color:#9B5DE5; }
  .brand-sub { font-size:10px;color:#999;margin-top:2px; }
  .doc-info { text-align:right; }
  .doc-num { font-size:16px;font-weight:700; }
  .doc-date { font-size:11px;color:#666;margin-top:3px; }
  .doc-badge { display:inline-block;padding:3px 10px;background:#EBF0FF;color:#2563EB;border-radius:99px;font-size:10px;font-weight:600;margin-top:5px; }
  .kpi-row { display:flex;gap:28px;margin-bottom:28px;flex-wrap:wrap; }
  .kpi-num { font-size:20px;font-weight:700;color:#1a1a2e; }
  .kpi-num.accent { color:#2563EB; }
  .kpi-lbl { font-size:9px;text-transform:uppercase;letter-spacing:.06em;color:#999;margin-top:2px; }
  table { width:100%;border-collapse:collapse;margin-bottom:20px; }
  thead tr { background:#f8f9ff; }
  th { text-align:left;padding:9px 10px;font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:#666;border-bottom:2px solid #e8ecff; }
  td { padding:9px 10px;border-bottom:1px solid #f0f2ff;font-size:12px; }
  tr:last-child td { border-bottom:none; }
  .privacy { font-size:10px;color:#f59e0b;margin-bottom:16px; }
  .footer { margin-top:32px;padding-top:14px;border-top:1px solid #e8ecff;font-size:9px;color:#999;display:flex;justify-content:space-between; }
</style></head>
<body>
  <div class="header">
    <div>
      <div class="brand">Taluma<span>Flow</span></div>
      <div class="brand-sub">${tool.label} Report</div>
    </div>
    <div class="doc-info">
      <div class="doc-num">${docNum}</div>
      <div class="doc-date">${date}</div>
      <div class="doc-badge">DEMO REPORT</div>
    </div>
  </div>
  <div class="kpi-row">
    ${kpis.map(k => `<div><div class="kpi-num${k.accent?' accent':''}">${k.value}</div><div class="kpi-lbl">${k.label}</div></div>`).join('')}
  </div>
  ${tableHtml}
  <div class="privacy">⚠ Processed on our servers via encrypted connection — nothing is retained after this report is generated.</div>
  <div class="footer">
    <span>Generated by TaalumaFlow · talumaflow.com</span>
    <span>Demo report — for production analytics contact info@talumaflow.com</span>
  </div>
</body></html>`;
}

function getKPIsForTool(toolKey, data) {
  if (toolKey === 'forecast') return [
    { label: 'Products', value: data.count },
    { label: 'Weeks ahead', value: data.weeks },
    { label: 'Growing', value: data.results.filter(r=>r.trend==='growing').length, accent:true },
    { label: 'Declining', value: data.results.filter(r=>r.trend==='declining').length },
  ];
  if (toolKey === 'churn') return [
    { label: 'Customers', value: data.total },
    { label: 'Churned', value: data.churned },
    { label: 'At risk', value: data.at_risk },
    { label: 'Revenue at risk', value: `€${data.revenue_at_risk.toLocaleString('it-IT',{minimumFractionDigits:0})}`, accent:true },
  ];
  return [
    { label: 'Products', value: data.total },
    { label: 'Lead time', value: `${data.lead_days}d` },
    { label: 'High risk', value: data.high_risk, accent:true },
  ];
}

function getTableHtmlForTool(toolKey, data) {
  if (toolKey === 'forecast') return `<table><thead><tr><th>Product</th><th>Avg/Week</th><th>Trend</th><th>Total needed</th></tr></thead>
    <tbody>${data.results.map(r=>`<tr><td>${r.product}</td><td>${r.avg_weekly}</td><td>${r.trend}</td><td>${r.total_forecast}</td></tr>`).join('')}</tbody></table>`;
  if (toolKey === 'churn') return `<table><thead><tr><th>Customer</th><th>Status</th><th>Days since</th><th>Last order</th><th>Revenue</th></tr></thead>
    <tbody>${data.results.map(r=>`<tr><td>${r.customer}</td><td>${r.status}</td><td>${r.days_since}d</td><td>${r.last_order}</td><td>${r.total_revenue>0?'€'+r.total_revenue.toFixed(2):'—'}</td></tr>`).join('')}</tbody></table>`;
  return `<table><thead><tr><th>Product</th><th>Avg/Day</th><th>Reorder point</th><th>EOQ</th><th>Risk</th></tr></thead>
    <tbody>${data.results.map(r=>`<tr><td>${r.product}</td><td>${r.avg_daily}</td><td>${r.reorder_point}</td><td>${r.eoq}</td><td>${r.demand_risk}</td></tr>`).join('')}</tbody></table>`;
}

function exportAnalyticsPDF(toolKey, tool, data) {
  const html = buildAnalyticsPDFHtml(toolKey, tool, data);
  const w = window.open('', '_blank');
  if (!w) return;
  w.document.write(html);
  w.document.close();
  w.focus();
  w.onafterprint = () => w.close();
  setTimeout(() => {
    w.print();
    setTimeout(() => { if (!w.closed) w.close(); }, 1000);
  }, 400);
}