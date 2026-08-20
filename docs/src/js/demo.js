
// import { PUBLIC_API, IS_BACKEND_CONFIGURED } from './config.js';

// const EXAMPLES = [
//   {
//     label: 'Italian WhatsApp (informal)',
//     text: `Ciao! Sono Marco Bianchi da Distribuzione Nord.
// Mi servono:
// - 5x Olio EVO Frantoio 0.75L a 12€ cad
// - 3x Pasta Di Martino Spaghetti 500g a 1.80€
// - 2x Aceto Balsamico IGP 250ml a 8.50€
// Spedire a Via Garibaldi 44, Milano. Grazie mille`,
//   },
//   {
//     label: 'Italian business email',
//     text: `Buongiorno,
// Le invio il nostro ordine settimanale:
// - 10 colli Vino Rosso Toscano DOC 0.75L a 18€/cad
// - 6 bottiglie Brunello di Montalcino 2019 a 45€/cad
// - 4 conf. Pasta Artigianale Mista (500g) a 3.20€
// Cliente: Ristorante La Pergola Srl
// Indirizzo consegna: Via Roma 100, Salerno 84100
// Distinti saluti`,
//   },
//   {
//     label: 'English order',
//     text: `Hi, I need to order the following:
// - 4x Extra Virgin Olive Oil 750ml at €11.00 each
// - 8x Pasta Fusilli 500g at €1.60 each
// - 2x Balsamic Vinegar of Modena IGP at €9.00
// Deliver to: John Smith, Via Roma 22, Milan 20121
// Thank you`,
//   },
// ];

// let currentExample = 0;

// export function initExtractionDemo() {
//   const textarea  = document.getElementById('demo-input');
//   const runBtn    = document.getElementById('demo-run-btn');
//   const cycleBtn  = document.getElementById('demo-cycle-btn');
//   const resultEl  = document.getElementById('demo-result');
//   const emptyEl   = document.getElementById('demo-empty');
//   const loadingEl = document.getElementById('demo-loading');
//   if (!textarea || !runBtn) return;

//   textarea.value = EXAMPLES[0].text;

//   // Show backend status
//   if (!IS_BACKEND_CONFIGURED) {
//     const hint = document.getElementById('demo-backend-hint');
//     if (hint) hint.style.display = 'block';
//   }

//   cycleBtn?.addEventListener('click', () => {
//     currentExample = (currentExample + 1) % EXAMPLES.length;
//     textarea.value = EXAMPLES[currentExample].text;
//     const lbl = document.getElementById('demo-example-label');
//     if (lbl) lbl.textContent = EXAMPLES[currentExample].label;
//     resetOutput(resultEl, emptyEl, loadingEl);
//   });

//   let capturedEmail = '';

//   runBtn.addEventListener('click', () => {
//     if (!capturedEmail) {
//       showEmailCapture(
//         (email) => {
//           capturedEmail = email || '';
//           const sendInput = document.getElementById('demo-send-email');
//           if (sendInput && email) sendInput.value = email;
//           runExtraction(textarea, runBtn, resultEl, emptyEl, loadingEl, capturedEmail);
//         },
//         () => {
//           capturedEmail = 'skipped';
//           runExtraction(textarea, runBtn, resultEl, emptyEl, loadingEl, '');
//         }
//       );
//     } else {
//       runExtraction(textarea, runBtn, resultEl, emptyEl, loadingEl, capturedEmail === 'skipped' ? '' : capturedEmail);
//     }
//   });

//   textarea.addEventListener('keydown', e => {
//     if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
//       e.preventDefault(); runBtn.click();
//     }
//   });
// }

// function showEmailCapture(onSubmit, onSkip) {
//   // Remove any existing modal
//   document.getElementById('email-capture-modal')?.remove();

//   const modal = document.createElement('div');
//   modal.id = 'email-capture-modal';
//   modal.innerHTML = `
//     <div class="ecm-backdrop"></div>
//     <div class="ecm-box">
//       <div class="ecm-title">One second before we run the AI 🤖</div>
//       <div class="ecm-sub">Drop your email to get the full extraction result sent to you — or skip and just see it here.</div>
//       <input class="ecm-input" id="ecm-email" type="email"
//         placeholder="your@email.com" autocomplete="email">
//       <div class="ecm-actions">
//         <button class="ecm-btn-primary" id="ecm-submit">
//           Extract &amp; send me the result →
//         </button>
//         <button class="ecm-btn-skip" id="ecm-skip">
//           Just show me the demo
//         </button>
//       </div>
//       <div class="ecm-note">No spam. We use this to send you the extracted document.</div>
//     </div>`;
//   document.body.appendChild(modal);

//   // Focus email input
//   setTimeout(() => document.getElementById('ecm-email')?.focus(), 100);

//   document.getElementById('ecm-submit').addEventListener('click', () => {
//     const email = document.getElementById('ecm-email')?.value.trim();
//     modal.remove();
//     onSubmit(email);
//   });

//   document.getElementById('ecm-skip').addEventListener('click', () => {
//     modal.remove();
//     onSkip();
//   });

//   document.getElementById('ecm-email')?.addEventListener('keydown', e => {
//     if (e.key === 'Enter') document.getElementById('ecm-submit').click();
//     if (e.key === 'Escape') { modal.remove(); onSkip(); }
//   });

//   modal.querySelector('.ecm-backdrop').addEventListener('click', () => {
//     modal.remove(); onSkip();
//   });
// }

// function resetOutput(resultEl, emptyEl, loadingEl) {
//   if (resultEl)  { resultEl.style.display  = 'none'; resultEl.innerHTML = ''; }
//   if (loadingEl) { loadingEl.style.display = 'none'; }
//   if (emptyEl)   { emptyEl.style.display   = 'flex'; }
// }

// async function runExtraction(textarea, runBtn, resultEl, emptyEl, loadingEl, autoEmail = '') {
//   const text = textarea.value.trim();
//   if (!text) return;

//   runBtn.disabled = true;
//   runBtn.innerHTML = '<span class="demo-spin"></span> Extracting…';
//   if (emptyEl)   emptyEl.style.display   = 'none';
//   if (resultEl)  resultEl.style.display  = 'none';
//   if (loadingEl) loadingEl.style.display = 'flex';

//   try {
//     if (!IS_BACKEND_CONFIGURED) throw new Error('no_backend');

//     const res = await fetch(PUBLIC_API.extract, {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({ text }),
//     });

//     if (!res.ok) {
//       const err = await res.json().catch(() => ({}));
//       throw new Error(err.error || `HTTP ${res.status}`);
//     }

//     const data = await res.json();
//     if (loadingEl) loadingEl.style.display = 'none';
//     renderResult(data, resultEl);

//     // Auto-send email if user provided one in the modal
//     if (autoEmail && autoEmail !== 'skipped') {
//       const sendInput = document.getElementById('demo-send-email');
//       if (sendInput) sendInput.value = autoEmail;
//       // Send via backend
//       sendExtractionEmail(autoEmail, data);
//     }

//   } catch (err) {
//     if (loadingEl) loadingEl.style.display = 'none';
//     renderError(err, resultEl, emptyEl);
//   }

//   runBtn.disabled = false;
//   runBtn.innerHTML = '<span>▶</span> Extract order';
// }

// async function sendExtractionEmail(email, data) {
//   try {
//     const { BACKEND_URL, IS_BACKEND_CONFIGURED } = await import('./config.js');
//     if (!IS_BACKEND_CONFIGURED) return;

//     const items    = data.items || [];
//     const subtotal = items.reduce((s, i) => s + (i.qty * i.unit_price), 0);
//     const vat      = subtotal * 0.22;
//     const total    = subtotal + vat;

//     const res = await fetch(`${BACKEND_URL}/api/public/send-result/`, {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({ email, result: data }),
//     });

//     if (res.ok) {
//       // Show subtle confirmation
//       const note = document.createElement('div');
//       note.style.cssText = 'text-align:center;font-size:11px;color:var(--green);margin-top:8px';
//       note.textContent = `✓ Result sent to ${email}`;
//       document.getElementById('demo-result')?.appendChild(note);
//       setTimeout(() => note.remove(), 5000);
//     }
//   } catch (err) {
//     console.warn('[Demo] Email send failed:', err.message);
//   }
// }

// function renderResult(data, container) {
//   if (!container) return;

//   const items    = data.items || [];
//   const subtotal = items.reduce((s, i) => s + (i.qty * i.unit_price), 0);
//   const vat      = subtotal * 0.22;
//   const total    = subtotal + vat;
//   const conf     = Math.round((data.confidence || 0) * 100);
//   const isGood   = conf >= 75;
//   const confClr  = conf >= 75 ? 'var(--green)' : conf >= 50 ? '#f59e0b' : '#ef4444';
//   const missing  = data.missing_fields || [];

//   container.innerHTML = `
//     <div class="demo-result-inner">
//       <div class="demo-result-hdr">
//         <div>
//           <div class="demo-order-num">PRV-${Date.now().toString(36).toUpperCase().slice(-8)}</div>
//           <div class="demo-order-ts">${new Date().toLocaleString('en-GB')}</div>
//         </div>
//         <span class="demo-badge ${isGood ? 'badge-approved' : 'badge-review'}">
//           ${isGood ? '✓ Auto-approved' : '⚠ Needs review'}
//         </span>
//       </div>

//       <div class="demo-conf-row">
//         <span>Confidence score</span>
//         <strong style="color:${confClr}">${conf}%</strong>
//       </div>
//       <div class="demo-conf-bg">
//         <div class="demo-conf-fill" style="width:${conf}%;background:${confClr}"></div>
//       </div>

//       ${missing.length ? `
//         <div class="demo-missing">
//           ⚠ Would go to review queue — missing: ${missing.join(', ')}
//         </div>` : ''}

//       <div class="demo-customer">
//         <div class="demo-avatar">
//           ${(data.client_name||'?').split(' ').map(w=>w[0]).slice(0,2).join('').toUpperCase()}
//         </div>
//         <div>
//           <div class="demo-cname">${data.client_name || '<span style="color:var(--text3)">Unknown</span>'}</div>
//           <div class="demo-caddr">${data.client_address || '<span style="color:var(--text3)">No address</span>'}</div>
//           ${data.client_email ? `<div class="demo-caddr">${data.client_email}</div>` : ''}
//         </div>
//       </div>

//       <table class="demo-table">
//         <thead>
//           <tr><th>Item</th><th>Qty</th><th>Unit</th><th style="text-align:right">Total</th></tr>
//         </thead>
//         <tbody>
//           ${items.length
//             ? items.map(i => `
//                 <tr>
//                   <td>${i.description}</td>
//                   <td>${i.qty}</td>
//                   <td>€ ${(+i.unit_price).toFixed(2)}</td>
//                   <td style="text-align:right;font-weight:600">
//                     € ${(i.qty * i.unit_price).toFixed(2)}
//                   </td>
//                 </tr>`).join('')
//             : `<tr><td colspan="4" style="color:var(--text3);text-align:center;padding:12px">
//                 No items extracted
//                </td></tr>`
//           }
//         </tbody>
//       </table>

//       <div class="demo-totals">
//         <div class="demo-tot"><div class="demo-tot-lbl">Subtotal</div><div>€ ${subtotal.toFixed(2)}</div></div>
//         <div class="demo-tot"><div class="demo-tot-lbl">VAT 22%</div><div>€ ${vat.toFixed(2)}</div></div>
//         <div class="demo-tot demo-tot-grand">
//           <div class="demo-tot-lbl">Total</div>
//           <div>€ ${total.toFixed(2)}</div>
//         </div>
//       </div>

//       ${isGood ? `
//         <div class="demo-invoice-box">
//           <span>📄</span>
//           <span>Fattura PDF generated · saved to NAS · sent to client</span>
//         </div>` : ''}

//       <div class="demo-send-row">
//         <input class="demo-send-input" id="demo-send-email"
//           type="email" placeholder="Send to email (optional)">
//         <button class="demo-send-btn" id="demo-email-btn">📧 Email</button>
//         <button class="demo-send-btn" id="demo-wa-btn">📱 WhatsApp</button>
//         <button class="demo-send-btn demo-pdf-btn" id="demo-pdf-btn">⬇ PDF</button>
//       </div>

//       <div style="text-align:center;margin-top:12px">
//         <a href="#contact" class="btn-primary" style="font-size:13px;padding:10px 24px">
//           Get this for your orders →
//         </a>
//       </div>
//     </div>`;

//   container.style.display = 'block';

//   // Wire action buttons
//   document.getElementById('demo-pdf-btn')?.addEventListener('click', () => {
//     import('./demo.js').then(m => m.generatePDF(data));
//   });

//   document.getElementById('demo-email-btn')?.addEventListener('click', () => {
//     const email = document.getElementById('demo-send-email')?.value.trim();
//     const items  = (data.items||[]).map(i => `• ${i.qty}x ${i.description} @ €${(+i.unit_price).toFixed(2)}`).join('\n');
//     const subtotal = (data.items||[]).reduce((s,i)=>s+(i.qty*i.unit_price),0);
//     const subject  = encodeURIComponent(`Order extraction result — TaalumaFlow demo`);
//     const body     = encodeURIComponent(`Hi,\n\nHere is your extracted order:\n\nCustomer: ${data.client_name||'Unknown'}\nAddress: ${data.client_address||'—'}\n\nItems:\n${items}\n\nTotal: €${(subtotal*1.22).toFixed(2)} (incl. VAT 22%)\n\nGenerated by TaalumaFlow · talumaflow.com`);
//     window.open(`mailto:${email||''}?subject=${subject}&body=${body}`);
//   });

//   document.getElementById('demo-wa-btn')?.addEventListener('click', () => {
//     const items    = (data.items||[]).map(i => `• ${i.qty}x ${i.description} @ €${(+i.unit_price).toFixed(2)}`).join('\n');
//     const subtotal = (data.items||[]).reduce((s,i)=>s+(i.qty*i.unit_price),0);
//     const msg = encodeURIComponent(`*Order Summary — TaalumaFlow*\n\nCustomer: ${data.client_name||'Unknown'}\n\n${items}\n\n*Total: €${(subtotal*1.22).toFixed(2)}* (incl. VAT 22%)`);
//     window.open(`https://wa.me/?text=${msg}`, '_blank');
//   });
// }

// function renderError(err, resultEl, emptyEl) {
//   const isNoBackend = err.message === 'no_backend';
//   const msg = isNoBackend
//     ? `<strong>Backend not connected</strong><br><br>
//        This demo calls your real TaalumaMail pipeline. To see it live,
//        <a href="#contact" style="color:var(--blue)">book a demo call</a>
//        and we'll run it against your actual order messages.<br><br>
//        📱 <a href="https://wa.me/393289741517" style="color:var(--blue)">+39 328 9741517</a>`
//     : `<strong>Extraction failed</strong><br>
//        ${err.message}<br><br>
//        The AI model may be starting up — try again in 10 seconds.`;

//   if (emptyEl) {
//     emptyEl.style.display = 'flex';
//     emptyEl.innerHTML = `<div class="demo-empty-icon">⚠️</div>
//       <div style="font-size:13px;color:var(--text2);text-align:center;line-height:1.6">${msg}</div>`;
//   }
// }

// export function initCSVDashboard() {
//   const dropzone  = document.getElementById('csv-dropzone');
//   const fileInput = document.getElementById('csv-file-input');
//   const dashEl    = document.getElementById('csv-dashboard');
//   const emptyEl   = document.getElementById('csv-empty');
//   if (!dropzone || !fileInput) return;

//   dropzone.addEventListener('dragover',  e => { e.preventDefault(); dropzone.classList.add('drag-over'); });
//   dropzone.addEventListener('dragleave', ()  => dropzone.classList.remove('drag-over'));
//   dropzone.addEventListener('drop', e => {
//     e.preventDefault(); dropzone.classList.remove('drag-over');
//     const f = e.dataTransfer.files[0];
//     if (f && f.name.endsWith('.csv')) readAndRender(f, dashEl, dropzone);
//   });

//   fileInput.addEventListener('change', () => {
//     if (fileInput.files[0]) readAndRender(fileInput.files[0], dashEl, dropzone);
//   });

//   document.getElementById('csv-sample-btn')?.addEventListener('click', e => {
//     e.stopPropagation();
//     renderDashboard(SAMPLE_ROWS, dashEl, dropzone);
//   });
// }

// const SAMPLE_ROWS = [
//   {date:'2026-01',product:'Olio EVO Frantoio',category:'Olive Oil',qty:12,revenue:144},
//   {date:'2026-01',product:'Pasta Di Martino',category:'Pasta',qty:30,revenue:54},
//   {date:'2026-01',product:'Vino Rosso Toscano',category:'Wine',qty:8,revenue:144},
//   {date:'2026-01',product:'Aceto Balsamico',category:'Vinegar',qty:5,revenue:42.5},
//   {date:'2026-02',product:'Olio EVO Frantoio',category:'Olive Oil',qty:18,revenue:216},
//   {date:'2026-02',product:'Pasta Di Martino',category:'Pasta',qty:42,revenue:75.6},
//   {date:'2026-02',product:'Vino Rosso Toscano',category:'Wine',qty:15,revenue:270},
//   {date:'2026-02',product:'Brunello 2019',category:'Wine',qty:5,revenue:225},
//   {date:'2026-03',product:'Pasta Fusilli',category:'Pasta',qty:50,revenue:80},
//   {date:'2026-03',product:'Olio EVO Frantoio',category:'Olive Oil',qty:22,revenue:264},
//   {date:'2026-03',product:'Vino Bianco Soave',category:'Wine',qty:18,revenue:162},
//   {date:'2026-03',product:'Aceto Balsamico',category:'Vinegar',qty:12,revenue:102},
//   {date:'2026-03',product:'Vino Rosso Toscano',category:'Wine',qty:20,revenue:360},
// ];

// function readAndRender(file, dashEl, dropzone) {
//   const reader = new FileReader();
//   reader.onload = e => {
//     const rows = parseCSV(e.target.result);
//     if (rows.length) renderDashboard(rows, dashEl, dropzone);
//   };
//   reader.readAsText(file);
// }

// function parseCSV(text) {
//   const lines = text.trim().split('\n');
//   const headers = lines[0].split(',').map(h => h.trim().replace(/"/g,'').toLowerCase());
//   return lines.slice(1).map(line => {
//     const vals = line.split(',').map(v => v.trim().replace(/"/g,''));
//     const obj = {};
//     headers.forEach((h, i) => obj[h] = vals[i] || '');
//     return obj;
//   }).filter(r => Object.values(r).some(Boolean));
// }

// function renderDashboard(rows, dashEl, dropzone) {
//   if (!dashEl) return;
//   if (dropzone) dropzone.style.display = 'none';

//   // Detect columns
//   const keys = Object.keys(rows[0] || {});
//   const numKey = keys.find(k => /revenue|sales|amount|total|value/i.test(k)) ||
//                  keys.find(k => /qty|quantity/i.test(k));
//   const catKey = keys.find(k => /category|cat|type/i.test(k)) ||
//                  keys.find(k => /product|item|name/i.test(k));
//   const dateKey = keys.find(k => /date|month|period|time/i.test(k));

//   const byCategory = {}, byDate = {};
//   let grand = 0, count = 0;

//   rows.forEach(r => {
//     const val = parseFloat(String(r[numKey] || 0).replace(/[^0-9.]/g,'')) || 0;
//     const cat = r[catKey] || 'Other';
//     const dt  = (r[dateKey] || '').slice(0, 7);
//     byCategory[cat] = (byCategory[cat] || 0) + val;
//     if (dt) byDate[dt] = (byDate[dt] || 0) + val;
//     grand += val; count++;
//   });

//   const topCats  = Object.entries(byCategory).sort((a,b)=>b[1]-a[1]).slice(0,6);
//   const dates    = Object.keys(byDate).sort();
//   const dateVals = dates.map(d => byDate[d]);
//   const maxCat   = topCats[0]?.[1] || 1;

//   dashEl.innerHTML = `
//     <div class="csv-dash-header">
//       <div class="csv-kpi"><div class="csv-kpi-num">€ ${grand.toLocaleString('it-IT',{minimumFractionDigits:0,maximumFractionDigits:0})}</div><div class="csv-kpi-lbl">Total revenue</div></div>
//       <div class="csv-kpi"><div class="csv-kpi-num">${count}</div><div class="csv-kpi-lbl">Transactions</div></div>
//       <div class="csv-kpi"><div class="csv-kpi-num">${topCats.length}</div><div class="csv-kpi-lbl">Categories</div></div>
//       <div class="csv-kpi"><div class="csv-kpi-num">€ ${(grand/Math.max(count,1)).toFixed(2)}</div><div class="csv-kpi-lbl">Avg per order</div></div>
//     </div>
//     <div class="csv-charts-grid">
//       <div class="csv-chart-card">
//         <div class="csv-chart-title">Revenue by ${catKey || 'category'}</div>
//         <div class="csv-bar-chart">
//           ${topCats.map(([cat, val]) => `
//             <div class="csv-bar-row">
//               <div class="csv-bar-label" title="${cat}">${cat.length>22?cat.slice(0,20)+'…':cat}</div>
//               <div class="csv-bar-track"><div class="csv-bar-fill" style="width:${(val/maxCat*100).toFixed(1)}%"></div></div>
//               <div class="csv-bar-val">€${val.toFixed(0)}</div>
//             </div>`).join('')}
//         </div>
//       </div>
//       <div class="csv-chart-card">
//         <div class="csv-chart-title">Revenue over time</div>
//         <div id="csv-line" data-l='${JSON.stringify(dates)}' data-v='${JSON.stringify(dateVals)}'
//              style="width:100%"></div>
//       </div>
//     </div>
//     <div class="csv-privacy-note">
//       🔒 Your data never left your browser — processed entirely client-side.
//       This is how we build your actual production dashboards.
//     </div>
//     <div style="text-align:center;margin-top:20px">
//       <a href="#contact" class="btn-primary" style="font-size:13px;padding:10px 24px">
//         Build this for my real data →
//       </a>
//     </div>`;

//   dashEl.style.display = 'block';
//   requestAnimationFrame(() => drawLine('csv-line'));
// }

// function drawLine(id) {
//   const el = document.getElementById(id);
//   if (!el) return;
//   const labels = JSON.parse(el.dataset.l || '[]');
//   const values = JSON.parse(el.dataset.v || '[]');
//   if (!values.length) return;

//   const W = el.clientWidth || 320;
//   const H = 130;
//   const P = {t:16, r:12, b:28, l:44};
//   const maxV = Math.max(...values), minV = Math.min(...values);
//   const range = maxV - minV || 1;

//   const pts = values.map((v,i) => ({
//     x: P.l + (i / Math.max(values.length-1, 1)) * (W-P.l-P.r),
//     y: P.t + (1-(v-minV)/range) * (H-P.t-P.b),
//     v, l: labels[i],
//   }));

//   const line = pts.map((p,i)=>`${i===0?'M':'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
//   const fill = `${line} L${pts.at(-1).x},${H-P.b} L${pts[0].x},${H-P.b} Z`;
//   const step = Math.max(1, Math.floor(pts.length/4));

//   el.innerHTML = `<svg viewBox="0 0 ${W} ${H}" style="width:100%;height:${H}px;display:block;overflow:visible">
//     <defs>
//       <linearGradient id="llg" x1="0" y1="0" x2="0" y2="1">
//         <stop offset="0%" stop-color="#4F8EF7" stop-opacity="0.25"/>
//         <stop offset="100%" stop-color="#4F8EF7" stop-opacity="0"/>
//       </linearGradient>
//     </defs>
//     <path d="${fill}" fill="url(#llg)"/>
//     <path d="${line}" stroke="#4F8EF7" stroke-width="2" fill="none" stroke-linejoin="round" stroke-linecap="round"/>
//     ${pts.map((p,i) => i%step===0 ? `
//       <text x="${p.x}" y="${H-6}" text-anchor="middle"
//             style="font-size:9px;fill:var(--text3);font-family:Inter,sans-serif">${p.l?.slice(0,7)||''}</text>` : '').join('')}
//     ${pts.map(p => `<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="3.5" fill="#4F8EF7"/>`).join('')}
//   </svg>`;
// }



// export function generatePDF(data) {
//   const items   = data.items || [];
//   const subtotal = items.reduce((s, i) => s + (i.qty * i.unit_price), 0);
//   const vat      = subtotal * 0.22;
//   const total    = subtotal + vat;
//   const docNum   = `PRV-${Date.now().toString(36).toUpperCase().slice(-8)}`;
//   const date     = new Date().toLocaleDateString('it-IT');

//   const html = `<!DOCTYPE html>
// <html>
// <head>
// <meta charset="UTF-8">
// <title>${docNum}</title>
// <style>
//   * { margin:0; padding:0; box-sizing:border-box; }
//   body { font-family: 'Helvetica Neue', Arial, sans-serif; font-size:13px; color:#1a1a2e; padding:40px; }
//   .header { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:40px; padding-bottom:24px; border-bottom:2px solid #4F8EF7; }
//   .brand { font-size:24px; font-weight:700; color:#2563EB; letter-spacing:-0.03em; }
//   .brand span { color:#9B5DE5; }
//   .doc-info { text-align:right; }
//   .doc-num { font-size:18px; font-weight:700; color:#1a1a2e; }
//   .doc-date { font-size:12px; color:#666; margin-top:4px; }
//   .doc-type { display:inline-block; padding:3px 12px; background:#EBF0FF; color:#2563EB; border-radius:99px; font-size:11px; font-weight:600; margin-top:6px; }
//   .section { margin-bottom:28px; }
//   .section-label { font-size:9px; font-weight:700; text-transform:uppercase; letter-spacing:0.1em; color:#888; margin-bottom:8px; }
//   .customer-name { font-size:15px; font-weight:600; color:#1a1a2e; }
//   .customer-addr { font-size:12px; color:#555; margin-top:3px; }
//   table { width:100%; border-collapse:collapse; margin-bottom:20px; }
//   thead tr { background:#f8f9ff; }
//   th { text-align:left; padding:10px 12px; font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:0.06em; color:#666; border-bottom:2px solid #e8ecff; }
//   td { padding:10px 12px; border-bottom:1px solid #f0f2ff; font-size:13px; }
//   tr:last-child td { border-bottom:none; }
//   .text-right { text-align:right; }
//   .font-bold { font-weight:600; }
//   .totals { margin-left:auto; width:240px; }
//   .total-row { display:flex; justify-content:space-between; padding:6px 0; font-size:13px; }
//   .total-row.grand { border-top:2px solid #4F8EF7; margin-top:4px; padding-top:10px; font-size:16px; font-weight:700; color:#2563EB; }
//   .conf-badge { display:inline-block; padding:4px 14px; border-radius:99px; font-size:11px; font-weight:700; background:#d1fae5; color:#065f46; }
//   .footer { margin-top:48px; padding-top:16px; border-top:1px solid #e8ecff; font-size:10px; color:#999; display:flex; justify-content:space-between; }
//   .powered { font-size:10px; color:#aaa; margin-top:4px; }
// </style>
// </head>
// <body>
//   <div class="header">
//     <div>
//       <div class="brand">Taluma<span>Flow</span></div>
//       <div class="powered">AI Order Extraction Demo</div>
//     </div>
//     <div class="doc-info">
//       <div class="doc-num">${docNum}</div>
//       <div class="doc-date">${date}</div>
//       <div class="doc-type">PREVENTIVO / FATTURA</div>
//     </div>
//   </div>

//   <div class="section">
//     <div class="section-label">Customer</div>
//     <div class="customer-name">${data.client_name || 'Unknown Customer'}</div>
//     <div class="customer-addr">${data.client_address || ''}</div>
//     ${data.client_email ? `<div class="customer-addr">${data.client_email}</div>` : ''}
//   </div>

//   <div class="section">
//     <div class="section-label">Order items</div>
//     <table>
//       <thead>
//         <tr>
//           <th>Description</th>
//           <th class="text-right">Qty</th>
//           <th class="text-right">Unit Price</th>
//           <th class="text-right">Total</th>
//         </tr>
//       </thead>
//       <tbody>
//         ${items.map(i => `
//           <tr>
//             <td>${i.description}</td>
//             <td class="text-right">${i.qty}</td>
//             <td class="text-right">€ ${(+i.unit_price).toFixed(2)}</td>
//             <td class="text-right font-bold">€ ${(i.qty * i.unit_price).toFixed(2)}</td>
//           </tr>`).join('')}
//       </tbody>
//     </table>

//     <div class="totals">
//       <div class="total-row"><span>Subtotal</span><span>€ ${subtotal.toFixed(2)}</span></div>
//       <div class="total-row"><span>VAT 22%</span><span>€ ${vat.toFixed(2)}</span></div>
//       <div class="total-row grand"><span>Total</span><span>€ ${total.toFixed(2)}</span></div>
//     </div>
//   </div>

//   <div>
//     <span class="conf-badge">✓ AI Confidence: ${Math.round((data.confidence||0)*100)}%</span>
//   </div>

//   <div class="footer">
//     <span>Generated by TaalumaFlow · talumaflow.com</span>
//     <span>Payment due within 30 days</span>
//   </div>
// </body>
// </html>`;

//   const w = window.open('', '_blank');
//   w.document.write(html);
//   w.document.close();
//   w.focus();
//   setTimeout(() => { w.print(); }, 500);
// }


/**
 * demo.js
 * ─────────────────────────────────────────────────────────────
 * Two interactive features:
 *
 * 1. initExtractionDemo()
 *    Calls /api/public/extract/ on the Django backend.
 *    Your real Mistral model does the extraction.
 *    Falls back to a clear "backend not connected" message
 *    with instructions to contact for a live demo.
 *
 * 2. initCSVDashboard()
 *    Pure client-side CSV upload → live charts.
 *    D3-style SVG charts, zero data sent anywhere.
 * ─────────────────────────────────────────────────────────────
 */
import { PUBLIC_API, IS_BACKEND_CONFIGURED } from './config.js';

/* ══════════════════════════════════════════════════════════════
   EXAMPLE ORDER MESSAGES
══════════════════════════════════════════════════════════════ */
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

/* ══════════════════════════════════════════════════════════════
   1. EXTRACTION DEMO
══════════════════════════════════════════════════════════════ */
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
  // Remove any existing modal
  document.getElementById('email-capture-modal')?.remove();

  const modal = document.createElement('div');
  modal.id = 'email-capture-modal';
  modal.innerHTML = `
    <div class="ecm-backdrop"></div>
    <div class="ecm-box">
      <div class="ecm-title">One second before we run the AI 🤖</div>
      <div class="ecm-sub">Drop your email to get the full extraction result sent to you — or skip and just see it here.</div>
      <input class="ecm-input" id="ecm-email" type="email"
        placeholder="your@email.com" autocomplete="email">
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

  // Focus email input
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
    if (e.key === 'Escape') { modal.remove(); onSkip(); }
  });

  modal.querySelector('.ecm-backdrop').addEventListener('click', () => {
    modal.remove(); onSkip();
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
          type="email" placeholder="Enter email or WhatsApp number to send">
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

  // ── PDF download ────────────────────────────────────────────
  document.getElementById('demo-pdf-btn')?.addEventListener('click', () => {
    generateAndDownloadPDF(data);
  });

  // ── Send button — email via backend, WhatsApp if phone number ─
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

    // Detect if it's a phone number or email
    const isPhone = /^[+0-9\s\-()]{7,}$/.test(value);

    if (isPhone) {
      // Send via WhatsApp
      const items    = (data.items||[]).map(i => `• ${i.qty}x ${i.description} @ €${(+i.unit_price).toFixed(2)}`).join('\n');
      const subtotal = (data.items||[]).reduce((s,i)=>s+(i.qty*i.unit_price),0);
      const phone    = value.replace(/[^0-9+]/g,'');
      const msg      = encodeURIComponent(
        `*Order Summary — TaalumaFlow*\n\nCustomer: ${data.client_name||'Unknown'}\nAddress: ${data.client_address||'—'}\n\n${items}\n\n*Subtotal:* €${subtotal.toFixed(2)}\n*VAT 22%:* €${(subtotal*0.22).toFixed(2)}\n*Total:* €${(subtotal*1.22).toFixed(2)}\n\n_Generated by TaalumaFlow · talumaflow.com_`
      );
      window.open(`https://wa.me/${phone}?text=${msg}`, '_blank');
      status.style.color = 'var(--green)';
      status.textContent = `✓ WhatsApp opened for ${value}`;
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

/* ══════════════════════════════════════════════════════════════
   2. CSV DASHBOARD — 100% client-side
══════════════════════════════════════════════════════════════ */
export function initCSVDashboard() {
  const dropzone  = document.getElementById('csv-dropzone');
  const fileInput = document.getElementById('csv-file-input');
  const dashEl    = document.getElementById('csv-dashboard');
  const emptyEl   = document.getElementById('csv-empty');
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
  {date:'2026-01',product:'Olio EVO Frantoio',category:'Olive Oil',qty:12,revenue:144},
  {date:'2026-01',product:'Pasta Di Martino',category:'Pasta',qty:30,revenue:54},
  {date:'2026-01',product:'Vino Rosso Toscano',category:'Wine',qty:8,revenue:144},
  {date:'2026-01',product:'Aceto Balsamico',category:'Vinegar',qty:5,revenue:42.5},
  {date:'2026-02',product:'Olio EVO Frantoio',category:'Olive Oil',qty:18,revenue:216},
  {date:'2026-02',product:'Pasta Di Martino',category:'Pasta',qty:42,revenue:75.6},
  {date:'2026-02',product:'Vino Rosso Toscano',category:'Wine',qty:15,revenue:270},
  {date:'2026-02',product:'Brunello 2019',category:'Wine',qty:5,revenue:225},
  {date:'2026-03',product:'Pasta Fusilli',category:'Pasta',qty:50,revenue:80},
  {date:'2026-03',product:'Olio EVO Frantoio',category:'Olive Oil',qty:22,revenue:264},
  {date:'2026-03',product:'Vino Bianco Soave',category:'Wine',qty:18,revenue:162},
  {date:'2026-03',product:'Aceto Balsamico',category:'Vinegar',qty:12,revenue:102},
  {date:'2026-03',product:'Vino Rosso Toscano',category:'Wine',qty:20,revenue:360},
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

function renderDashboard(rows, dashEl, dropzone) {
  if (!dashEl) return;
  if (dropzone) dropzone.style.display = 'none';

  // Detect columns
  const keys = Object.keys(rows[0] || {});
  const numKey = keys.find(k => /revenue|sales|amount|total|value/i.test(k)) ||
                 keys.find(k => /qty|quantity/i.test(k));
  const catKey = keys.find(k => /category|cat|type/i.test(k)) ||
                 keys.find(k => /product|item|name/i.test(k));
  const dateKey = keys.find(k => /date|month|period|time/i.test(k));

  const byCategory = {}, byDate = {};
  let grand = 0, count = 0;

  rows.forEach(r => {
    const val = parseFloat(String(r[numKey] || 0).replace(/[^0-9.]/g,'')) || 0;
    const cat = r[catKey] || 'Other';
    const dt  = (r[dateKey] || '').slice(0, 7);
    byCategory[cat] = (byCategory[cat] || 0) + val;
    if (dt) byDate[dt] = (byDate[dt] || 0) + val;
    grand += val; count++;
  });

  const topCats  = Object.entries(byCategory).sort((a,b)=>b[1]-a[1]).slice(0,6);
  const dates    = Object.keys(byDate).sort();
  const dateVals = dates.map(d => byDate[d]);
  const maxCat   = topCats[0]?.[1] || 1;

  dashEl.innerHTML = `
    <div class="csv-dash-header">
      <div class="csv-kpi"><div class="csv-kpi-num">€ ${grand.toLocaleString('it-IT',{minimumFractionDigits:0,maximumFractionDigits:0})}</div><div class="csv-kpi-lbl">Total revenue</div></div>
      <div class="csv-kpi"><div class="csv-kpi-num">${count}</div><div class="csv-kpi-lbl">Transactions</div></div>
      <div class="csv-kpi"><div class="csv-kpi-num">${topCats.length}</div><div class="csv-kpi-lbl">Categories</div></div>
      <div class="csv-kpi"><div class="csv-kpi-num">€ ${(grand/Math.max(count,1)).toFixed(2)}</div><div class="csv-kpi-lbl">Avg per order</div></div>
    </div>
    <div class="csv-charts-grid">
      <div class="csv-chart-card">
        <div class="csv-chart-title">Revenue by ${catKey || 'category'}</div>
        <div class="csv-bar-chart">
          ${topCats.map(([cat, val]) => `
            <div class="csv-bar-row">
              <div class="csv-bar-label" title="${cat}">${cat.length>22?cat.slice(0,20)+'…':cat}</div>
              <div class="csv-bar-track"><div class="csv-bar-fill" style="width:${(val/maxCat*100).toFixed(1)}%"></div></div>
              <div class="csv-bar-val">€${val.toFixed(0)}</div>
            </div>`).join('')}
        </div>
      </div>
      <div class="csv-chart-card">
        <div class="csv-chart-title">Revenue over time</div>
        <div id="csv-line" data-l='${JSON.stringify(dates)}' data-v='${JSON.stringify(dateVals)}'
             style="width:100%"></div>
      </div>
    </div>
    <div class="csv-privacy-note">
      🔒 Your data never left your browser — processed entirely client-side.
      This is how we build your actual production dashboards.
    </div>
    <div style="text-align:center;margin-top:20px">
      <a href="#contact" class="btn-primary" style="font-size:13px;padding:10px 24px">
        Build this for my real data →
      </a>
    </div>`;

  dashEl.style.display = 'block';
  requestAnimationFrame(() => drawLine('csv-line'));
}

function drawLine(id) {
  const el = document.getElementById(id);
  if (!el) return;
  const labels = JSON.parse(el.dataset.l || '[]');
  const values = JSON.parse(el.dataset.v || '[]');
  if (!values.length) return;

  const W = el.clientWidth || 320;
  const H = 130;
  const P = {t:16, r:12, b:28, l:44};
  const maxV = Math.max(...values), minV = Math.min(...values);
  const range = maxV - minV || 1;

  const pts = values.map((v,i) => ({
    x: P.l + (i / Math.max(values.length-1, 1)) * (W-P.l-P.r),
    y: P.t + (1-(v-minV)/range) * (H-P.t-P.b),
    v, l: labels[i],
  }));

  const line = pts.map((p,i)=>`${i===0?'M':'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
  const fill = `${line} L${pts.at(-1).x},${H-P.b} L${pts[0].x},${H-P.b} Z`;
  const step = Math.max(1, Math.floor(pts.length/4));

  el.innerHTML = `<svg viewBox="0 0 ${W} ${H}" style="width:100%;height:${H}px;display:block;overflow:visible">
    <defs>
      <linearGradient id="llg" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#4F8EF7" stop-opacity="0.25"/>
        <stop offset="100%" stop-color="#4F8EF7" stop-opacity="0"/>
      </linearGradient>
    </defs>
    <path d="${fill}" fill="url(#llg)"/>
    <path d="${line}" stroke="#4F8EF7" stroke-width="2" fill="none" stroke-linejoin="round" stroke-linecap="round"/>
    ${pts.map((p,i) => i%step===0 ? `
      <text x="${p.x}" y="${H-6}" text-anchor="middle"
            style="font-size:9px;fill:var(--text3);font-family:Inter,sans-serif">${p.l?.slice(0,7)||''}</text>` : '').join('')}
    ${pts.map(p => `<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="3.5" fill="#4F8EF7"/>`).join('')}
  </svg>`;
}

/* ══════════════════════════════════════════════════════════════
   PDF GENERATION — client-side, no server needed
   Uses the browser's print API to generate a clean PDF
══════════════════════════════════════════════════════════════ */

// ── PDF HTML template ─────────────────────────────────────────
function buildPDFHtml(data) {
  const items    = data.items || [];
  const subtotal = items.reduce((s, i) => s + (i.qty * i.unit_price), 0);
  const vat      = subtotal * 0.22;
  const total    = subtotal + vat;
  const docNum   = `PRV-${Date.now().toString(36).toUpperCase().slice(-8)}`;
  const date     = new Date().toLocaleDateString('it-IT');

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>${docNum}</title>
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family: 'Helvetica Neue', Arial, sans-serif; font-size:13px; color:#1a1a2e; padding:40px; }
  .header { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:40px; padding-bottom:24px; border-bottom:2px solid #4F8EF7; }
  .brand { font-size:24px; font-weight:700; color:#2563EB; letter-spacing:-0.03em; }
  .brand span { color:#9B5DE5; }
  .doc-info { text-align:right; }
  .doc-num { font-size:18px; font-weight:700; color:#1a1a2e; }
  .doc-date { font-size:12px; color:#666; margin-top:4px; }
  .doc-type { display:inline-block; padding:3px 12px; background:#EBF0FF; color:#2563EB; border-radius:99px; font-size:11px; font-weight:600; margin-top:6px; }
  .section { margin-bottom:28px; }
  .section-label { font-size:9px; font-weight:700; text-transform:uppercase; letter-spacing:0.1em; color:#888; margin-bottom:8px; }
  .customer-name { font-size:15px; font-weight:600; color:#1a1a2e; }
  .customer-addr { font-size:12px; color:#555; margin-top:3px; }
  table { width:100%; border-collapse:collapse; margin-bottom:20px; }
  thead tr { background:#f8f9ff; }
  th { text-align:left; padding:10px 12px; font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:0.06em; color:#666; border-bottom:2px solid #e8ecff; }
  td { padding:10px 12px; border-bottom:1px solid #f0f2ff; font-size:13px; }
  tr:last-child td { border-bottom:none; }
  .text-right { text-align:right; }
  .font-bold { font-weight:600; }
  .totals { margin-left:auto; width:240px; }
  .total-row { display:flex; justify-content:space-between; padding:6px 0; font-size:13px; }
  .total-row.grand { border-top:2px solid #4F8EF7; margin-top:4px; padding-top:10px; font-size:16px; font-weight:700; color:#2563EB; }
  .conf-badge { display:inline-block; padding:4px 14px; border-radius:99px; font-size:11px; font-weight:700; background:#d1fae5; color:#065f46; }
  .footer { margin-top:48px; padding-top:16px; border-top:1px solid #e8ecff; font-size:10px; color:#999; display:flex; justify-content:space-between; }
</style>
</head>
<body>
  <div class="header">
    <div>
      <div class="brand">Taluma<span>Flow</span></div>
      <div style="font-size:10px;color:#aaa;margin-top:4px">AI Order Extraction Demo</div>
    </div>
    <div class="doc-info">
      <div class="doc-num">${docNum}</div>
      <div class="doc-date">${date}</div>
      <div class="doc-type">PREVENTIVO / FATTURA</div>
    </div>
  </div>
  <div class="section">
    <div class="section-label">Customer</div>
    <div class="customer-name">${data.client_name || 'Unknown Customer'}</div>
    <div class="customer-addr">${data.client_address || ''}</div>
    ${data.client_email ? `<div class="customer-addr">${data.client_email}</div>` : ''}
  </div>
  <div class="section">
    <div class="section-label">Order items</div>
    <table>
      <thead><tr>
        <th>Description</th>
        <th class="text-right">Qty</th>
        <th class="text-right">Unit Price</th>
        <th class="text-right">Total</th>
      </tr></thead>
      <tbody>
        ${items.map(i => `
          <tr>
            <td>${i.description}</td>
            <td class="text-right">${i.qty}</td>
            <td class="text-right">€ ${(+i.unit_price).toFixed(2)}</td>
            <td class="text-right font-bold">€ ${(i.qty * i.unit_price).toFixed(2)}</td>
          </tr>`).join('')}
      </tbody>
    </table>
    <div class="totals">
      <div class="total-row"><span>Subtotal</span><span>€ ${subtotal.toFixed(2)}</span></div>
      <div class="total-row"><span>VAT 22%</span><span>€ ${vat.toFixed(2)}</span></div>
      <div class="total-row grand"><span>Total</span><span>€ ${total.toFixed(2)}</span></div>
    </div>
  </div>
  <div>
    <span class="conf-badge">✓ AI Confidence: ${Math.round((data.confidence||0)*100)}%</span>
  </div>
  <div class="footer">
    <span>Generated by TaalumaFlow · talumaflow.com</span>
    <span>Payment due within 30 days</span>
  </div>
</body>
</html>`;
}

// Open print dialog (download as PDF via browser)
export function generatePDF(data) {
  generateAndDownloadPDF(data);
}

function generateAndDownloadPDF(data) {
  const html = buildPDFHtml(data);
  const w = window.open('', '_blank');
  if (!w) return;
  w.document.write(html);
  w.document.close();
  w.focus();
  setTimeout(() => { w.print(); }, 500);
}

// Returns base64-encoded HTML for email attachment
function generatePDFBase64(data) {
  const html = buildPDFHtml(data);
  return btoa(unescape(encodeURIComponent(html)));
}