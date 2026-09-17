import { PUBLIC_API, IS_BACKEND_CONFIGURED } from './config.js';
import { exportDashboardPDF } from './dashboard_pdf.js';

const EXAMPLES = [
  {
    label: 'Italian WhatsApp (informal)',
    text: `Ciao! Sono Marco Bianchi da Distribuzione Nord.
Mi servono:
- 5x Olio EVO Frantoio 0.75L a 12€ cad
- 3x Pasta Di Martino Spaghetti 500g a 1.80€
- 2x Aceto Balsamico IGP 250ml a 8.50€
Spedire a Via Garibaldi 44, Milano. Grazie mille`,
  },
  {
    label: 'Italian business email',
    text: `Buongiorno,
Le invio il nostro ordine settimanale:
- 10 colli Vino Rosso Toscano DOC 0.75L a 18€/cad
- 6 bottiglie Brunello di Montalcino 2019 a 45€/cad
- 4 conf. Pasta Artigianale Mista (500g) a 3.20€
Cliente: Ristorante La Pergola Srl
Indirizzo consegna: Via Roma 100, Salerno 84100
Distinti saluti`,
  },
  {
    label: 'English order',
    text: `Hi, I need to order the following:
- 4x Extra Virgin Olive Oil 750ml at €11.00 each
- 8x Pasta Fusilli 500g at €1.60 each
- 2x Balsamic Vinegar of Modena IGP at €9.00
Deliver to: John Smith, Via Roma 22, Milan 20121
Thank you`,
  },
];

let currentExample = 0;

export function initExtractionDemo() {
  const textarea  = document.getElementById('demo-input');
  const runBtn    = document.getElementById('demo-run-btn');
  const cycleBtn  = document.getElementById('demo-cycle-btn');
  const resultEl  = document.getElementById('demo-result');
  const emptyEl   = document.getElementById('demo-empty');
  const loadingEl = document.getElementById('demo-loading');
  if (!textarea || !runBtn) return;

  textarea.value = EXAMPLES[0].text;

  // Show backend status
  if (!IS_BACKEND_CONFIGURED) {
    const hint = document.getElementById('demo-backend-hint');
    if (hint) hint.style.display = 'block';
  }

  cycleBtn?.addEventListener('click', () => {
    currentExample = (currentExample + 1) % EXAMPLES.length;
    textarea.value = EXAMPLES[currentExample].text;
    const lbl = document.getElementById('demo-example-label');
    if (lbl) lbl.textContent = EXAMPLES[currentExample].label;
    resetOutput(resultEl, emptyEl, loadingEl);
  });

  let capturedEmail = '';

  runBtn.addEventListener('click', () => {
    if (!capturedEmail) {
      showEmailCapture(
        (email) => {
          capturedEmail = email || '';
          const sendInput = document.getElementById('demo-send-email');
          if (sendInput && email) sendInput.value = email;
          runExtraction(textarea, runBtn, resultEl, emptyEl, loadingEl, capturedEmail);
        },
        () => {
          capturedEmail = 'skipped';
          runExtraction(textarea, runBtn, resultEl, emptyEl, loadingEl, '');
        }
      );
    } else {
      runExtraction(textarea, runBtn, resultEl, emptyEl, loadingEl, capturedEmail === 'skipped' ? '' : capturedEmail);
    }
  });

  textarea.addEventListener('keydown', e => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault(); runBtn.click();
    }
  });
}

function showEmailCapture(onSubmit, onSkip) {
  document.getElementById('email-capture-modal')?.remove();

  const modal = document.createElement('div');
  modal.id = 'email-capture-modal';
  modal.innerHTML = `
    <div class="ecm-backdrop"></div>
    <div class="ecm-box">
      <div class="ecm-title">One second before we run the AI 🤖</div>
      <div class="ecm-sub">Drop your email or WhatsApp number to get the result sent to you — or skip and just see it here.</div>
      <input class="ecm-input" id="ecm-email" type="text" inputmode="email"
        placeholder="📧 email or 📱 +39 328 9741517" autocomplete="email">
      <div class="ecm-actions">
        <button class="ecm-btn-primary" id="ecm-submit">
          Extract &amp; send me the result →
        </button>
        <button class="ecm-btn-skip" id="ecm-skip">
          Just show me the demo
        </button>
      </div>
      <div class="ecm-note">No spam. We use this to send you the extracted document.</div>
    </div>`;
  document.body.appendChild(modal);

  setTimeout(() => document.getElementById('ecm-email')?.focus(), 100);

  document.getElementById('ecm-submit').addEventListener('click', () => {
    const email = document.getElementById('ecm-email')?.value.trim();
    modal.remove();
    onSubmit(email);
  });

  document.getElementById('ecm-skip').addEventListener('click', () => {
    modal.remove();
    onSkip();
  });

  document.getElementById('ecm-email')?.addEventListener('keydown', e => {
    if (e.key === 'Enter') document.getElementById('ecm-submit').click();
    if (e.key === 'Escape') { modal.remove(); /* just close, no action */ }
  });

  // Backdrop click — just close, do NOT extract
  modal.querySelector('.ecm-backdrop').addEventListener('click', () => {
    modal.remove();
    // Reset so next click shows modal again
  });
}

function resetOutput(resultEl, emptyEl, loadingEl) {
  if (resultEl)  { resultEl.style.display  = 'none'; resultEl.innerHTML = ''; }
  if (loadingEl) { loadingEl.style.display = 'none'; }
  if (emptyEl)   { emptyEl.style.display   = 'flex'; }
}

async function runExtraction(textarea, runBtn, resultEl, emptyEl, loadingEl, autoEmail = '') {
  const text = textarea.value.trim();
  if (!text) return;

  runBtn.disabled = true;
  runBtn.innerHTML = '<span class="demo-spin"></span> Extracting…';
  if (emptyEl)   emptyEl.style.display   = 'none';
  if (resultEl)  resultEl.style.display  = 'none';
  if (loadingEl) loadingEl.style.display = 'flex';

  try {
    if (!IS_BACKEND_CONFIGURED) throw new Error('no_backend');

    const res = await fetch(PUBLIC_API.extract, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `HTTP ${res.status}`);
    }

    const data = await res.json();
    if (loadingEl) loadingEl.style.display = 'none';
    renderResult(data, resultEl);

    // Auto-send email if user provided one in the modal
    if (autoEmail && autoEmail !== 'skipped') {
      const sendInput = document.getElementById('demo-send-email');
      if (sendInput) sendInput.value = autoEmail;
      // Send via backend
      sendExtractionEmail(autoEmail, data);
    }

  } catch (err) {
    if (loadingEl) loadingEl.style.display = 'none';
    renderError(err, resultEl, emptyEl);
  }

  runBtn.disabled = false;
  runBtn.innerHTML = '<span>▶</span> Extract order';
}

async function sendExtractionEmail(email, data) {
  try {
    const { BACKEND_URL, IS_BACKEND_CONFIGURED } = await import('./config.js');
    if (!IS_BACKEND_CONFIGURED) return;

    const items    = data.items || [];
    const subtotal = items.reduce((s, i) => s + (i.qty * i.unit_price), 0);
    const vat      = subtotal * 0.22;
    const total    = subtotal + vat;

    const res = await fetch(`${BACKEND_URL}/api/public/send-result/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, result: data }),
    });

    if (res.ok) {
      // Show subtle confirmation
      const note = document.createElement('div');
      note.style.cssText = 'text-align:center;font-size:11px;color:var(--green);margin-top:8px';
      note.textContent = `✓ Result sent to ${email}`;
      document.getElementById('demo-result')?.appendChild(note);
      setTimeout(() => note.remove(), 5000);
    }
  } catch (err) {
    console.warn('[Demo] Email send failed:', err.message);
  }
}

function renderResult(data, container) {
  if (!container) return;

  const items    = data.items || [];
  const subtotal = items.reduce((s, i) => s + (i.qty * i.unit_price), 0);
  const vat      = subtotal * 0.22;
  const total    = subtotal + vat;
  const conf     = Math.round((data.confidence || 0) * 100);
  const isGood   = conf >= 75;
  const confClr  = conf >= 75 ? 'var(--green)' : conf >= 50 ? '#f59e0b' : '#ef4444';
  const missing  = data.missing_fields || [];

  container.innerHTML = `
    <div class="demo-result-inner">
      <div class="demo-result-hdr">
        <div>
          <div class="demo-order-num">PRV-${Date.now().toString(36).toUpperCase().slice(-8)}</div>
          <div class="demo-order-ts">${new Date().toLocaleString('en-GB')}</div>
        </div>
        <span class="demo-badge ${isGood ? 'badge-approved' : 'badge-review'}">
          ${isGood ? '✓ Auto-approved' : '⚠ Needs review'}
        </span>
      </div>

      <div class="demo-conf-row">
        <span>Confidence score</span>
        <strong style="color:${confClr}">${conf}%</strong>
      </div>
      <div class="demo-conf-bg">
        <div class="demo-conf-fill" style="width:${conf}%;background:${confClr}"></div>
      </div>

      ${missing.length ? `
        <div class="demo-missing">
          ⚠ Would go to review queue — missing: ${missing.join(', ')}
        </div>` : ''}

      <div class="demo-customer">
        <div class="demo-avatar">
          ${(data.client_name||'?').split(' ').map(w=>w[0]).slice(0,2).join('').toUpperCase()}
        </div>
        <div>
          <div class="demo-cname">${data.client_name || '<span style="color:var(--text3)">Unknown</span>'}</div>
          <div class="demo-caddr">${data.client_address || '<span style="color:var(--text3)">No address</span>'}</div>
          ${data.client_email ? `<div class="demo-caddr">${data.client_email}</div>` : ''}
        </div>
      </div>

      <table class="demo-table">
        <thead>
          <tr><th>Item</th><th>Qty</th><th>Unit</th><th style="text-align:right">Total</th></tr>
        </thead>
        <tbody>
          ${items.length
            ? items.map(i => `
                <tr>
                  <td>${i.description}</td>
                  <td>${i.qty}</td>
                  <td>€ ${(+i.unit_price).toFixed(2)}</td>
                  <td style="text-align:right;font-weight:600">
                    € ${(i.qty * i.unit_price).toFixed(2)}
                  </td>
                </tr>`).join('')
            : `<tr><td colspan="4" style="color:var(--text3);text-align:center;padding:12px">
                No items extracted
               </td></tr>`
          }
        </tbody>
      </table>

      <div class="demo-totals">
        <div class="demo-tot"><div class="demo-tot-lbl">Subtotal</div><div>€ ${subtotal.toFixed(2)}</div></div>
        <div class="demo-tot"><div class="demo-tot-lbl">VAT 22%</div><div>€ ${vat.toFixed(2)}</div></div>
        <div class="demo-tot demo-tot-grand">
          <div class="demo-tot-lbl">Total</div>
          <div>€ ${total.toFixed(2)}</div>
        </div>
      </div>

      ${isGood ? `
        <div class="demo-invoice-box">
          <span>📄</span>
          <span>Fattura PDF generated · saved to NAS · sent to client</span>
        </div>` : ''}

      <div class="demo-send-row">
        <input class="demo-send-input" id="demo-send-email"
          type="text" inputmode="email"
          placeholder="📧 email or 📱 phone to share via WhatsApp">
        <button class="demo-send-btn demo-pdf-btn" id="demo-send-btn">📤 Send</button>
        <button class="demo-send-btn demo-pdf-btn" id="demo-pdf-btn">⬇ PDF</button>
      </div>
      <div id="demo-send-status" style="font-size:11px;color:var(--green);text-align:center;min-height:16px;margin-top:4px"></div>

      <div style="text-align:center;margin-top:12px">
        <a href="#contact" class="btn-primary" style="font-size:13px;padding:10px 24px">
          Get this for your orders →
        </a>
      </div>
    </div>`;

  container.style.display = 'block';
  document.getElementById('demo-pdf-btn')?.addEventListener('click', () => {
    generateAndDownloadPDF(data);
  });

  document.getElementById('demo-send-btn')?.addEventListener('click', async () => {
    const input  = document.getElementById('demo-send-email');
    const status = document.getElementById('demo-send-status');
    const value  = input?.value.trim();
    const btn    = document.getElementById('demo-send-btn');

    if (!value) {
      status.style.color = 'var(--red,#ef4444)';
      status.textContent = 'Enter an email address or WhatsApp number first';
      return;
    }

    const isPhone = /^[+0-9]/.test(value) && !value.includes('@') && /[0-9]{6,}/.test(value.replace(/\s/g,''));
    const isEmail = value.includes('@') && value.includes('.');

    if (!isPhone && !isEmail) {
      status.style.color = 'var(--red,#ef4444)';
      status.textContent = 'Enter a valid email address or phone number (e.g. +39 328 9741517)';
      return;
    }

    if (isPhone) {
      const items    = (data.items||[]).map(i =>
        `• ${i.qty}x ${i.description} — €${(i.qty * +i.unit_price).toFixed(2)}`
      ).join('\n');
      const subtotal = (data.items||[]).reduce((s,i)=>s+(i.qty * +i.unit_price),0);
      const phone = value.replace(/[^0-9+]/g, '').replace(/^\+/, '');
      const message =
        `*Ordine estratto — TaalumaFlow* 🤖\n\n` +
        `👤 *Cliente:* ${data.client_name||'Unknown'}\n` +
        `📍 *Indirizzo:* ${data.client_address||'—'}\n\n` +
        `*Articoli:*\n${items}\n\n` +
        `💰 *Subtotale:* €${subtotal.toFixed(2)}\n` +
        `📊 *IVA 22%:* €${(subtotal*0.22).toFixed(2)}\n` +
        `✅ *Totale:* €${(subtotal*1.22).toFixed(2)}\n\n` +
        `_Generato da TaalumaFlow · talumaflow.com_`;

      // Mobile: use Web Share API (opens native share sheet including WhatsApp)
      if (navigator.share && /Mobi|Android|iPhone/i.test(navigator.userAgent)) {
        navigator.share({ text: message })
          .then(() => {
            status.style.color = 'var(--green)';
            status.textContent = '✓ Shared successfully';
          })
          .catch(() => {
            // User cancelled — no error shown
            status.textContent = '';
          });
      } else {
        // Desktop: copy to clipboard
        navigator.clipboard.writeText(message).then(() => {
          btn.textContent = '✓ Copied';
          btn.style.background = 'var(--green)';
          status.style.color = 'var(--green)';
          status.textContent = '✓ Message copied — paste it into WhatsApp';
          setTimeout(() => {
            btn.textContent = '📤 Send';
            btn.style.background = '';
            status.textContent = '';
          }, 4000);
        }).catch(() => {
          // Clipboard failed — fallback to wa.me
          window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank', 'noopener');
          status.style.color = 'var(--green)';
          status.textContent = '✓ WhatsApp opened';
        });
      }
      return;
    }

    // Send via backend email (with PDF attachment via base64)
    btn.disabled = true;
    btn.textContent = '⏳ Sending…';
    status.textContent = '';

    try {
      const { BACKEND_URL, IS_BACKEND_CONFIGURED } = await import('./config.js');

      if (!IS_BACKEND_CONFIGURED) throw new Error('no_backend');

      // Send via backend - backend generates the PDF
      const res = await fetch(`${BACKEND_URL}/api/public/send-result/`, {
        method : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body   : JSON.stringify({
          email : value,
          result: data,
        }),
      });

      if (res.ok) {
        btn.textContent = '✓ Sent';
        btn.style.background = 'var(--green)';
        status.style.color   = 'var(--green)';
        status.textContent   = `✓ Result sent to ${value}`;
        setTimeout(() => {
          btn.disabled = false;
          btn.textContent = '📤 Send';
          btn.style.background = '';
        }, 4000);
      } else {
        throw new Error(`${res.status}`);
      }
    } catch (err) {
      // Fallback to mailto
      const items    = (data.items||[]).map(i => `• ${i.qty}x ${i.description} @ €${(+i.unit_price).toFixed(2)}`).join('\n');
      const subtotal = (data.items||[]).reduce((s,i)=>s+(i.qty*i.unit_price),0);
      const subject  = encodeURIComponent('Your order extraction — TaalumaFlow');
      const body     = encodeURIComponent(
        `Hi,\n\nHere is your extracted order:\n\nCustomer: ${data.client_name||'Unknown'}\nAddress: ${data.client_address||'—'}\n\nItems:\n${items}\n\nTotal: €${(subtotal*1.22).toFixed(2)} (VAT incl.)\n\nGenerated by TaalumaFlow · talumaflow.com`
      );
      window.location.href = `mailto:${value}?subject=${subject}&body=${body}`;
      btn.disabled = false;
      btn.textContent = '📤 Send';
      status.style.color   = 'var(--text3)';
      status.textContent   = 'Opened email client as fallback';
    }
  });
}

function renderError(err, resultEl, emptyEl) {
  const isNoBackend = err.message === 'no_backend';
  const msg = isNoBackend
    ? `<strong>Backend not connected</strong><br><br>
       This demo calls your real TaalumaMail pipeline. To see it live,
       <a href="#contact" style="color:var(--blue)">book a demo call</a>
       and we'll run it against your actual order messages.<br><br>
       📱 <a href="https://wa.me/393289741517" style="color:var(--blue)">+39 328 9741517</a>`
    : `<strong>Extraction failed</strong><br>
       ${err.message}<br><br>
       The AI model may be starting up — try again in 10 seconds.`;

  if (emptyEl) {
    emptyEl.style.display = 'flex';
    emptyEl.innerHTML = `<div class="demo-empty-icon">⚠️</div>
      <div style="font-size:13px;color:var(--text2);text-align:center;line-height:1.6">${msg}</div>`;
  }
}
const MAX_DEMO_ROWS = 100;
const MAX_DEMO_MONTHS = 3;

export function initCSVDashboard() {
  const dropzone  = document.getElementById('csv-dropzone');
  const fileInput = document.getElementById('csv-file-input');
  const dashEl    = document.getElementById('csv-dashboard');
  if (!dropzone || !fileInput) return;

  dropzone.addEventListener('dragover',  e => { e.preventDefault(); dropzone.classList.add('drag-over'); });
  dropzone.addEventListener('dragleave', ()  => dropzone.classList.remove('drag-over'));
  dropzone.addEventListener('drop', e => {
    e.preventDefault(); dropzone.classList.remove('drag-over');
    const f = e.dataTransfer.files[0];
    if (f && f.name.endsWith('.csv')) readAndRender(f, dashEl, dropzone);
  });

  fileInput.addEventListener('change', () => {
    if (fileInput.files[0]) readAndRender(fileInput.files[0], dashEl, dropzone);
  });

  document.getElementById('csv-sample-btn')?.addEventListener('click', e => {
    e.stopPropagation();
    renderDashboard(SAMPLE_ROWS, dashEl, dropzone);
  });
}

const SAMPLE_ROWS = [
  {date:'2026-01',product:'Olio EVO Frantoio',category:'Olive Oil',customer:'Distribuzione Nord',qty:12,revenue:144},
  {date:'2026-01',product:'Pasta Di Martino',category:'Pasta',customer:'Ristorante La Pergola',qty:30,revenue:54},
  {date:'2026-01',product:'Vino Rosso Toscano',category:'Wine',customer:'Distribuzione Nord',qty:8,revenue:144},
  {date:'2026-01',product:'Aceto Balsamico',category:'Vinegar',customer:'Bar Centrale',qty:5,revenue:42.5},
  {date:'2026-02',product:'Olio EVO Frantoio',category:'Olive Oil',customer:'Distribuzione Nord',qty:18,revenue:216},
  {date:'2026-02',product:'Pasta Di Martino',category:'Pasta',customer:'Ristorante La Pergola',qty:42,revenue:75.6},
  {date:'2026-02',product:'Vino Rosso Toscano',category:'Wine',customer:'Distribuzione Nord',qty:15,revenue:270},
  {date:'2026-02',product:'Brunello 2019',category:'Wine',customer:'Enoteca Del Corso',qty:5,revenue:225},
  {date:'2026-03',product:'Pasta Fusilli',category:'Pasta',customer:'Pizzeria Napoli',qty:50,revenue:80},
  {date:'2026-03',product:'Olio EVO Frantoio',category:'Olive Oil',customer:'Distribuzione Nord',qty:22,revenue:264},
  {date:'2026-03',product:'Vino Bianco Soave',category:'Wine',customer:'Ristorante La Pergola',qty:18,revenue:162},
  {date:'2026-03',product:'Aceto Balsamico',category:'Vinegar',customer:'Bar Centrale',qty:12,revenue:102},
  {date:'2026-03',product:'Vino Rosso Toscano',category:'Wine',customer:'Distribuzione Nord',qty:20,revenue:360},
];

function readAndRender(file, dashEl, dropzone) {
  const reader = new FileReader();
  reader.onload = e => {
    const rows = parseCSV(e.target.result);
    if (rows.length) renderDashboard(rows, dashEl, dropzone);
  };
  reader.readAsText(file);
}

function parseCSV(text) {
  const lines = text.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.trim().replace(/"/g,'').toLowerCase());
  return lines.slice(1).map(line => {
    const vals = line.split(',').map(v => v.trim().replace(/"/g,''));
    const obj = {};
    headers.forEach((h, i) => obj[h] = vals[i] || '');
    return obj;
  }).filter(r => Object.values(r).some(Boolean));
}

function detectColumns(keys) {
  return {
    numKey:      keys.find(k => /revenue|sales|amount|total|value/i.test(k)) ||
                 keys.find(k => /qty|quantity/i.test(k)),
    catKey:      keys.find(k => /category|cat|type/i.test(k)) ||
                 keys.find(k => /product|item|name/i.test(k)),
    dateKey:     keys.find(k => /date|month|period|time/i.test(k)),
    prodKey:     keys.find(k => /product|item|name|prodotto/i.test(k)),
    customerKey: keys.find(k => /customer|client|cliente/i.test(k)),
  };
}

// ── Column mapping fallback ─────────────────────────────────
function renderColumnMapper(rows, keys, dashEl, dropzone) {
  dashEl.innerHTML = `
    <div class="csv-mapper">
      <div class="csv-mapper-title">We couldn't auto-detect your value column</div>
      <div class="csv-mapper-sub">Tell us which columns to use and we'll build the dashboard from your file.</div>
      <div class="csv-mapper-row">
        <label>Value column (revenue or qty) *</label>
        <select id="map-num">${keys.map(k=>`<option value="${k}">${k}</option>`).join('')}</select>
      </div>
      <div class="csv-mapper-row">
        <label>Category column (optional)</label>
        <select id="map-cat"><option value="">— none —</option>${keys.map(k=>`<option value="${k}">${k}</option>`).join('')}</select>
      </div>
      <div class="csv-mapper-row">
        <label>Date column (optional)</label>
        <select id="map-date"><option value="">— none —</option>${keys.map(k=>`<option value="${k}">${k}</option>`).join('')}</select>
      </div>
      <div class="csv-mapper-row">
        <label>Product column (optional)</label>
        <select id="map-prod"><option value="">— none —</option>${keys.map(k=>`<option value="${k}">${k}</option>`).join('')}</select>
      </div>
      <button class="csv-sample-btn" id="map-run" style="margin-top:8px">Build dashboard →</button>
    </div>`;
  dashEl.style.display = 'block';

  document.getElementById('map-run')?.addEventListener('click', () => {
    const manualCols = {
      numKey:      document.getElementById('map-num').value,
      catKey:      document.getElementById('map-cat').value || null,
      dateKey:     document.getElementById('map-date').value || null,
      prodKey:     document.getElementById('map-prod').value || null,
      customerKey: null,
    };
    renderDashboard(rows, dashEl, dropzone, manualCols);
  });
}

function renderLimitBanner(originalRows, originalMonths) {
  const parts = [];
  if (originalRows)   parts.push(`showing first ${MAX_DEMO_ROWS} of ${originalRows.toLocaleString('it-IT')} rows`);
  if (originalMonths) parts.push(`showing last ${MAX_DEMO_MONTHS} of ${originalMonths} months`);
  return `<div class="csv-limit-banner">📊 Demo limit: ${parts.join(' · ')}. The full dashboard shows your complete dataset with trend history.</div>`;
}

function renderDashboard(allRows, dashEl, dropzone, manualCols = null) {
  if (!dashEl || !allRows.length) return;
  if (dropzone) dropzone.style.display = 'none';

  const keys = Object.keys(allRows[0] || {});
  const cols = manualCols || detectColumns(keys);

  if (!cols.numKey) {
    renderColumnMapper(allRows, keys, dashEl, dropzone);
    return;
  }

  const { numKey, catKey, dateKey, prodKey, customerKey } = cols;

  // ── Demo limits ──────────────────────────────────────────
  let rows = allRows;
  let originalMonths = null;
  if (dateKey) {
    const allMonths = [...new Set(rows.map(r => (r[dateKey]||'').slice(0,7)).filter(Boolean))].sort();
    if (allMonths.length > MAX_DEMO_MONTHS) {
      originalMonths = allMonths.length;
      const keep = new Set(allMonths.slice(-MAX_DEMO_MONTHS));
      rows = rows.filter(r => keep.has((r[dateKey]||'').slice(0,7)));
    }
  }
  let originalRowCount = null;
  if (rows.length > MAX_DEMO_ROWS) {
    originalRowCount = rows.length;
    rows = rows.slice(0, MAX_DEMO_ROWS);
  }

  // ── Aggregate ────────────────────────────────────────────
  const byCategory = {}, byDate = {}, byProduct = {}, byCustomer = {}, byProductByMonth = {};
  let grand = 0, count = 0;

  rows.forEach(r => {
    const val  = parseFloat(String(r[numKey] || 0).replace(/[^0-9.-]/g,'')) || 0;
    const cat  = r[catKey] || 'Other';
    const dt   = (r[dateKey] || '').slice(0, 7);
    const prod = prodKey ? (r[prodKey] || 'Other') : null;
    const cust = customerKey ? (r[customerKey] || 'Unknown') : null;

    byCategory[cat] = (byCategory[cat] || 0) + val;
    if (dt) byDate[dt] = (byDate[dt] || 0) + val;
    if (prod) byProduct[prod] = (byProduct[prod] || 0) + val;
    if (cust) byCustomer[cust] = (byCustomer[cust] || 0) + val;
    if (prod && dt) {
      byProductByMonth[prod] = byProductByMonth[prod] || {};
      byProductByMonth[prod][dt] = (byProductByMonth[prod][dt] || 0) + val;
    }
    grand += val; count++;
  });

  const topCats  = Object.entries(byCategory).sort((a,b)=>b[1]-a[1]).slice(0,6);
  const dates    = Object.keys(byDate).sort();
  const dateVals = dates.map(d => byDate[d]);
  const maxCat   = topCats[0]?.[1] || 1;
  const topProducts = Object.entries(byProduct).sort((a,b)=>b[1]-a[1]);

  let growthPct = null;
  if (dateVals.length >= 2) {
    const last = dateVals[dateVals.length-1], prev = dateVals[dateVals.length-2];
    if (prev > 0) growthPct = Math.round((last-prev)/prev*100);
  }

  // ── Anomaly detection (category bars, >2 std dev) ───────
  const catVals = topCats.map(([,v])=>v);
  const catMean = catVals.reduce((a,b)=>a+b,0) / (catVals.length || 1);
  const catStd  = Math.sqrt(catVals.reduce((s,v)=>s+(v-catMean)**2,0) / (catVals.length || 1));
  const anomalyCats = new Set(topCats.filter(([,v]) => catStd>0 && Math.abs(v-catMean) > 2*catStd).map(([c])=>c));

  // ── Forecast: simple linear regression, 2 months ahead ──
  let forecastPoints = [];
  if (dateVals.length >= 3) {
    const n = dateVals.length;
    const xs = dateVals.map((_,i)=>i);
    const xMean = xs.reduce((a,b)=>a+b,0)/n;
    const yMean = dateVals.reduce((a,b)=>a+b,0)/n;
    const slope = xs.reduce((s,x,i)=>s+(x-xMean)*(dateVals[i]-yMean),0) /
                  (xs.reduce((s,x)=>s+(x-xMean)**2,0) || 1);
    const intercept = yMean - slope*xMean;
    forecastPoints = [n, n+1].map(x => Math.max(0, slope*x+intercept));
  }

  // ── Customer concentration risk ─────────────────────────
  let customerRisk = null;
  if (customerKey && Object.keys(byCustomer).length) {
    const topCustomers = Object.entries(byCustomer).sort((a,b)=>b[1]-a[1]).slice(0,3);
    const topSum = topCustomers.reduce((s,[,v])=>s+v,0);
    const pct = grand>0 ? Math.round(topSum/grand*100) : 0;
    customerRisk = { topCustomers, pct };
  }

  // ── Slow movers (declining month-over-month) ────────────
  let slowMovers = [];
  if (dates.length >= 2) {
    const lastM = dates[dates.length-1], prevM = dates[dates.length-2];
    Object.entries(byProductByMonth).forEach(([prod, months]) => {
      const last = months[lastM] || 0, prev = months[prevM] || 0;
      if (prev > 0 && last < prev) {
        slowMovers.push({ product: prod, prev, last, pct: Math.round((last-prev)/prev*100) });
      }
    });
    slowMovers.sort((a,b)=>a.pct-b.pct);
  }

  // ── Render ───────────────────────────────────────────────
  dashEl.innerHTML = `
    ${(originalRowCount || originalMonths) ? renderLimitBanner(originalRowCount, originalMonths) : ''}
    <div class="csv-dash-header">
      <div class="csv-kpi"><div class="csv-kpi-num">€ ${grand.toLocaleString('it-IT',{minimumFractionDigits:0,maximumFractionDigits:0})}</div><div class="csv-kpi-lbl">Total revenue</div></div>
      <div class="csv-kpi"><div class="csv-kpi-num">${count}</div><div class="csv-kpi-lbl">Transactions</div></div>
      <div class="csv-kpi"><div class="csv-kpi-num">${topCats.length}</div><div class="csv-kpi-lbl">Categories</div></div>
      <div class="csv-kpi"><div class="csv-kpi-num">€ ${(grand/Math.max(count,1)).toFixed(2)}</div><div class="csv-kpi-lbl">Avg per order</div></div>
      ${growthPct !== null ? `<div class="csv-kpi"><div class="csv-kpi-num" style="color:${growthPct>=0?'#22c55e':'#ef4444'}">${growthPct>=0?'+':''}${growthPct}%</div><div class="csv-kpi-lbl">vs prev period</div></div>` : ''}
    </div>
    <div class="csv-charts-grid">
      <div class="csv-chart-card">
        <div class="csv-chart-title">Revenue by ${catKey || 'category'}</div>
        <div class="csv-bar-chart">
          ${topCats.map(([cat, val]) => `
            <div class="csv-bar-row">
              <div class="csv-bar-label" title="${cat}">${cat.length>22?cat.slice(0,20)+'…':cat}${anomalyCats.has(cat)?' ⚠':''}</div>
              <div class="csv-bar-track"><div class="csv-bar-fill ${anomalyCats.has(cat)?'csv-bar-fill-anomaly':''}" style="width:${(val/maxCat*100).toFixed(1)}%"></div></div>
              <div class="csv-bar-val">€${val.toFixed(0)}</div>
            </div>`).join('')}
        </div>
        ${anomalyCats.size ? `<div class="csv-anomaly-note">⚠ Flagged: unusually high revenue vs other categories</div>` : ''}
      </div>

      <div class="csv-chart-card csv-locked-card">
        <div class="csv-chart-title">Revenue over time${forecastPoints.length ? ' + forecast' : ''}</div>
        <div class="csv-locked-content">
          <div id="csv-line" data-l='${JSON.stringify(dates)}' data-v='${JSON.stringify(dateVals)}' data-f='${JSON.stringify(forecastPoints)}' style="width:100%"></div>
        </div>
        <div class="csv-lock-overlay">
          <div class="csv-lock-icon">🔒</div>
          <div class="csv-lock-text">Forecasting unlocks in the full dashboard</div>
          <a href="#contact" class="csv-lock-btn">Unlock full analytics →</a>
        </div>
      </div>

      ${topProducts.length > 0 ? `
      <div class="csv-chart-card csv-chart-full">
        <div class="csv-chart-title">Top products by revenue</div>
        <table class="csv-top-table">
          <thead><tr><th>Product</th><th>Revenue</th><th>Share</th></tr></thead>
          <tbody>
            ${topProducts.slice(0,8).map(([name, val]) => `
              <tr>
                <td>${name.length>30?name.slice(0,28)+'…':name}</td>
                <td>€ ${val.toLocaleString('it-IT',{minimumFractionDigits:2,maximumFractionDigits:2})}</td>
                <td>
                  <div class="csv-share-bar">
                    <div class="csv-share-fill" style="width:${(val/grand*100).toFixed(1)}%"></div>
                    <span>${(val/grand*100).toFixed(1)}%</span>
                  </div>
                </td>
              </tr>`).join('')}
          </tbody>
        </table>
      </div>` : ''}

      ${customerKey ? `
      <div class="csv-chart-card csv-locked-card csv-chart-full">
        <div class="csv-chart-title">Customer concentration risk</div>
        <div class="csv-locked-content">
          ${customerRisk ? `
            <div class="csv-risk-line">Your top ${customerRisk.topCustomers.length} customers are <strong>${customerRisk.pct}%</strong> of revenue.</div>
            <div class="csv-bar-chart">
              ${customerRisk.topCustomers.map(([c,v])=>`
                <div class="csv-bar-row">
                  <div class="csv-bar-label">${c}</div>
                  <div class="csv-bar-track"><div class="csv-bar-fill" style="width:${(v/customerRisk.topCustomers[0][1]*100).toFixed(1)}%"></div></div>
                  <div class="csv-bar-val">€${v.toFixed(0)}</div>
                </div>`).join('')}
            </div>` : ''}
        </div>
        <div class="csv-lock-overlay">
          <div class="csv-lock-icon">🔒</div>
          <div class="csv-lock-text">Customer risk analysis unlocks in the full dashboard</div>
          <a href="#contact" class="csv-lock-btn">Unlock full analytics →</a>
        </div>
      </div>` : ''}

      ${slowMovers.length ? `
      <div class="csv-chart-card csv-chart-full">
        <div class="csv-chart-title">⚠ Slow movers (declining month-over-month)</div>
        <table class="csv-top-table">
          <thead><tr><th>Product</th><th>Prev month</th><th>Last month</th><th>Change</th></tr></thead>
          <tbody>
            ${slowMovers.slice(0,6).map(s => `
              <tr>
                <td>${s.product}</td>
                <td>€${s.prev.toFixed(0)}</td>
                <td>€${s.last.toFixed(0)}</td>
                <td style="color:#f59e0b;font-weight:600">${s.pct}%</td>
              </tr>`).join('')}
          </tbody>
        </table>
      </div>` : ''}
    </div>

    <div class="csv-privacy-note">
      🔒 Your data never left your browser — processed entirely client-side.
      This is exactly how we build your production dashboards.
    </div>
    <div style="text-align:center;margin-top:20px">
      <a href="#contact" class="btn-primary" style="font-size:13px;padding:10px 24px">
        Get this report for my full dataset →
      </a>
    </div>`;

  dashEl.style.display = 'block';
  requestAnimationFrame(() => drawLine('csv-line'));
}

function drawLine(id) {
  const el = document.getElementById(id);
  if (!el) return;
  const labels   = JSON.parse(el.dataset.l || '[]');
  const values   = JSON.parse(el.dataset.v || '[]');
  const forecast = JSON.parse(el.dataset.f || '[]');
  if (!values.length) return;

  const allVals = values.concat(forecast);
  const W = el.clientWidth || 320;
  const H = 130;
  const P = {t:16, r:12, b:28, l:44};
  const maxV = Math.max(...allVals), minV = Math.min(0, ...allVals);
  const range = maxV - minV || 1;
  const totalPts = values.length + forecast.length;

  const scaleX = i => P.l + (i / Math.max(totalPts-1,1)) * (W-P.l-P.r);
  const scaleY = v => P.t + (1-(v-minV)/range) * (H-P.t-P.b);

  const pts  = values.map((v,i)   => ({ x: scaleX(i), y: scaleY(v), v, l: labels[i] }));
  const fpts = forecast.map((v,i) => ({ x: scaleX(values.length+i), y: scaleY(v) }));

  const line = pts.map((p,i)=>`${i===0?'M':'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
  const fill = `${line} L${pts.at(-1).x},${H-P.b} L${pts[0].x},${H-P.b} Z`;
  const step = Math.max(1, Math.floor(pts.length/4));
  const forecastLine = fpts.length
    ? `M${pts.at(-1).x.toFixed(1)},${pts.at(-1).y.toFixed(1)} ` + fpts.map(p=>`L${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')
    : '';

  el.innerHTML = `<svg viewBox="0 0 ${W} ${H}" style="width:100%;height:${H}px;display:block;overflow:visible">
    <defs>
      <linearGradient id="llg" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#4F8EF7" stop-opacity="0.25"/>
        <stop offset="100%" stop-color="#4F8EF7" stop-opacity="0"/>
      </linearGradient>
    </defs>
    <path d="${fill}" fill="url(#llg)"/>
    <path d="${line}" stroke="#4F8EF7" stroke-width="2" fill="none" stroke-linejoin="round" stroke-linecap="round"/>
    ${forecastLine ? `<path d="${forecastLine}" stroke="#9B5DE5" stroke-width="2" fill="none" stroke-dasharray="5,4" stroke-linecap="round"/>` : ''}
    ${pts.map((p,i) => i%step===0 ? `
      <text x="${p.x}" y="${H-6}" text-anchor="middle"
            style="font-size:9px;fill:var(--text3);font-family:Inter,sans-serif">${p.l?.slice(0,7)||''}</text>` : '').join('')}
    ${pts.map(p => `<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="3.5" fill="#4F8EF7"/>`).join('')}
    ${fpts.map(p => `<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="3" fill="#9B5DE5" opacity="0.7"/>`).join('')}
  </svg>`;
}