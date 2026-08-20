<!DOCTYPE html>
<html lang="en" data-theme="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>TaalumaFlow — AI Solutions for Business</title>
  <meta name="description" content="TaalumaFlow builds AI-powered tools for businesses: order pipelines, custom chatbots, data dashboards, and process automation.">
  <meta name="author" content="TaalumaFlow">
  <meta property="og:title" content="TaalumaFlow — AI Solutions for Business">
  <meta property="og:description" content="AI automation tools built by data scientists for real business operations.">
  <meta property="og:type" content="website">
  <meta property="og:url" content="https://www.talumaflow.com">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="src/css/main.css">
</head>
<body>

<canvas id="bg-canvas" aria-hidden="true"></canvas>

<!-- NAV -->
<nav id="nav">
  <a href="#" class="nav-logo" aria-label="TaalumaFlow home">
    <div class="nav-logo-mark" aria-hidden="true">TF</div>
    <div class="nav-wordmark">Taluma<span>Flow</span></div>
  </a>
  <div class="nav-center">
    <a href="#products">Products</a>
    <a href="#extraction-demo">Live Demo</a>
    <a href="#chatdemo">AI Chat</a>
    <a href="#csv-section">Data Lab</a>
    <a href="#process">Process</a>
    <a href="#contact">Contact</a>
  </div>
  <div class="nav-right">
    <button class="theme-toggle" onclick="toggleTheme()" aria-label="Toggle dark/light mode">
      <div class="theme-knob" aria-hidden="true">🌙</div>
    </button>
    <a href="#contact" class="nav-cta">Get a demo</a>
    <button class="nav-hamburger" id="mnob" aria-label="Open menu">☰</button>
  </div>
</nav>

<div class="mobile-nav-overlay" id="mno" aria-hidden="true"></div>
<div class="mobile-nav-drawer" id="mnd" role="dialog" aria-label="Navigation menu">
  <a href="#products">Products</a>
  <a href="#extraction-demo">Live Demo</a>
  <a href="#chatdemo">AI Chat</a>
  <a href="#csv-section">Data Lab</a>
  <a href="#process">How we work</a>
  <a href="#contact">Contact</a>
</div>

<!-- HERO -->
<section id="hero">
  <div class="hero-badge rv"><span class="hero-badge-dot" aria-hidden="true"></span>AI Solutions · Milan, Italy</div>
  <h1 class="hero-h1">
    <span class="l1 rv d1">Automate what</span>
    <span class="l2 rv d2">holds you back.</span>
  </h1>
  <p class="hero-sub rv d3">TaalumaFlow builds intelligent automation tools — order pipelines, custom chatbots, and data dashboards — tailored for businesses that run on real operations, not enterprise IT budgets.</p>
  <div class="hero-btns rv d4">
    <a href="#products" class="btn-primary">Explore our products</a>
    <a href="#extraction-demo" class="btn-outline">Try live extraction ↓</a>
  </div>
  <div class="hero-metrics rv d4">
    <div class="hm"><div class="hm-num"><span id="cnt-1">0</span>s</div><div class="hm-lbl">WhatsApp → Invoice</div></div>
    <div class="hm"><div class="hm-num"><span id="cnt-2">0</span>%</div><div class="hm-lbl">Extraction accuracy</div></div>
    <div class="hm"><div class="hm-num"><span id="cnt-3">0</span>+</div><div class="hm-lbl">Integrations supported</div></div>
    <div class="hm"><div class="hm-num">On<span class="hm-sub">-prem</span></div><div class="hm-lbl">Data stays with you</div></div>
  </div>
</section>


<!-- EXTRACTION DEMO -->
<section id="extraction-demo">
  <div class="si">
    <div class="sl rv">Live demo</div>
    <h2 class="sh rv">Paste a WhatsApp order.<br>Watch it become a fattura.</h2>
    <p class="ss rv">This calls the actual TaalumaMail extraction engine — your real Mistral model running locally. Paste any order message in Italian or English and see real AI extraction, confidence scoring, and document generation.</p>
    <div id="demo-backend-hint" style="display:none;margin:16px 0;padding:12px 16px;background:rgba(245,158,11,0.08);border:1px solid rgba(245,158,11,0.2);border-radius:10px;font-size:13px;color:#f59e0b">
      ⚡ Backend not connected yet — <a href="#contact" style="color:var(--blue)">book a call</a> to see this with your real pipeline, or
      <a href="https://wa.me/393289741517" style="color:var(--blue)">WhatsApp us</a>.
      The sample data below shows the output format.
    </div>
    <div class="demo-grid">
      <div class="demo-input-panel rv">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
          <label style="font-size:10px;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:0.1em">Order message</label>
          <span id="demo-example-label" style="font-size:10px;color:var(--text3)">Italian WhatsApp (informal)</span>
        </div>
        <textarea class="demo-textarea" id="demo-input" placeholder="Paste a WhatsApp or email order message…"></textarea>
        <div class="demo-actions">
          <button class="demo-run-btn" id="demo-run-btn">
            <span>▶</span> Extract order
          </button>
          <button class="demo-cycle-btn" id="demo-cycle-btn">↻ Try another example</button>
        </div>
        <div class="demo-hint">Ctrl+Enter to run · Works in Italian and English · Powered by your local Mistral model</div>
      </div>
      <div class="demo-output-panel rv d1">
        <div class="demo-empty" id="demo-empty">
          <div class="demo-empty-icon">📋</div>
          <div style="font-size:13px;color:var(--text2)">Extracted order appears here</div>
          <div style="font-size:11px;color:var(--text3);margin-top:4px">Click "Extract order" to run the AI pipeline</div>
        </div>
        <div class="demo-loading" id="demo-loading">
          <div style="font-size:13px;color:var(--text2)">🤖 Your Mistral model is extracting…</div>
          <div class="demo-loading-bar"><div class="demo-loading-fill"></div></div>
          <div style="font-size:11px;color:var(--text3)">Reading items, prices, customer details…</div>
        </div>
        <div id="demo-result"></div>
      </div>
    </div>
  </div>
</section>

<!-- PRODUCTS -->
<section id="products">
  <div class="si">
    <div class="products-header">
      <div>
        <div class="sl rv">Our products</div>
        <h2 class="sh rv">Six tools.<br>One clear purpose each.</h2>
      </div>
      <p class="ss rv" style="max-width:360px;font-size:14px;">We don't build platforms. We build precise tools that solve one operational problem and integrate cleanly with everything else.</p>
    </div>
    <div class="products-grid">

      <!-- TaalumaMail FEATURED -->
      <article class="pc featured rv">
        <div class="pc-inner">
          <div>
            <div class="pc-status s-live"><span class="s-dot"></span>Live</div>
            <div class="pc-icon">✉️</div>
            <h3 class="pc-name">TaalumaMail</h3>
            <p class="pc-desc">Your clients send orders by WhatsApp or email. TaalumaMail reads them, extracts every item and price, generates a fattura or preventivo PDF, and replies automatically — without any manual input.</p>
            <div class="pc-tags">
              <span class="pc-tag">WhatsApp</span><span class="pc-tag">Email / IMAP</span>
              <span class="pc-tag">PDF generation</span><span class="pc-tag">ERP integration</span><span class="pc-tag">Italian fiscal</span>
            </div>
            <a href="#contact" class="pc-link">Request a demo →</a>
          </div>
          <div class="pc-demo-panel" aria-hidden="true">
            <div class="dp-row"><span class="dp-k">Source</span><span class="dp-b">WhatsApp</span></div>
            <div class="dp-row"><span class="dp-k">Client</span><span class="dp-v">Marco Bianchi</span></div>
            <div class="dp-row"><span class="dp-k">Items extracted</span><span class="dp-v">3 of 3</span></div>
            <div class="dp-row"><span class="dp-k">Confidence</span><span class="dp-g">97%</span></div>
            <div class="dp-hr"></div>
            <div class="dp-row"><span class="dp-k">Document</span><span class="dp-b">FATTURA</span></div>
            <div class="dp-row"><span class="dp-k">Total</span><span class="dp-v">€ 281.82</span></div>
            <div class="dp-row"><span class="dp-k">Status</span><span class="dp-g">✓ Sent</span></div>
          </div>
        </div>
      </article>

      <article class="pc rv d1">
        <div class="pc-status s-live"><span class="s-dot"></span>Live</div>
        <div class="pc-icon">🤖</div>
        <h3 class="pc-name">Custom AI Chatbots</h3>
        <p class="pc-desc">Chatbots trained on your business — product catalog, FAQ, ordering flow, or support. Deployed on your website, WhatsApp, or internal tools.</p>
        <div class="pc-tags"><span class="pc-tag">Custom training</span><span class="pc-tag">Multi-language</span><span class="pc-tag">WhatsApp API</span><span class="pc-tag">Website embed</span></div>
        <a href="#chatdemo" class="pc-link">Try live demo →</a>
      </article>

      <article class="pc rv d2">
        <div class="pc-status s-live"><span class="s-dot"></span>Live</div>
        <div class="pc-icon">📊</div>
        <h3 class="pc-name">Data Dashboards</h3>
        <p class="pc-desc">Interactive dashboards built on your actual business data — sales, customer trends, forecast models. We do the data science; you get the insight.</p>
        <div class="pc-tags"><span class="pc-tag">Real-time</span><span class="pc-tag">Predictive models</span><span class="pc-tag">Custom KPIs</span><span class="pc-tag">Export ready</span></div>
        <a href="#analytics" class="pc-link">See examples →</a>
      </article>

      <article class="pc rv d3">
        <!-- <div class="pc-status s-live"><span class="s-dot"></span>Live</div>
        <div class="pc-icon">🏗</div>
        <h3 class="pc-name"><a href="https://taalumaerp.com" target="_blank" rel="noopener" class="pc-link">Visit TaalumaERP →</a></h3>
        <p class="pc-desc">Lightweight ERP for small distributors who outgrew spreadsheets but don't need SAP. Pre-wired to TaalumaMail's extraction pipeline.</p>
        <div class="pc-tags"><span class="pc-tag">Inventory</span><span class="pc-tag">Customers</span><span class="pc-tag">Italian compliance</span></div> -->

 
        <div class="pc-status s-live"><span class="s-dot"></span>Live</div>
          <div class="pc-icon">🏗</div>
      
        <h3 class="pc-name">TaalumaERP</h3>
      
        <p class="pc-desc">Lightweight ERP for small distributors who outgrew
          spreadsheets but don't need SAP. Pre-wired to TaalumaMail's
          extraction pipeline.</p>
      
        <div class="pc-tags">
          <span class="pc-tag">Inventory</span>
          <span class="pc-tag">Customers</span>
          <span class="pc-tag">Italian compliance</span>
        </div>
      
        <a href="https://taalumaerp.com" target="_blank" rel="noopener"
          class="pc-link">Visit TaalumaERP →</a>
      
      
      <!-- </div> -->
 
      </article>

      <article class="pc rv">
        <div class="pc-status s-live"><span class="s-dot"></span>Live</div>
        <div class="pc-icon">⚙️</div>
        <h3 class="pc-name">Process Automation</h3>
        <p class="pc-desc">Repetitive workflows — data entry, report generation, email routing, document classification — automated with AI so your team focuses on work that requires humans.</p>
        <div class="pc-tags"><span class="pc-tag">Document OCR</span><span class="pc-tag">Auto-routing</span><span class="pc-tag">Scheduled tasks</span></div>
        <a href="#contact" class="pc-link">Discuss your process →</a>
      </article>

      <article class="pc rv d1">
        <div class="pc-status s-live"><span class="s-dot"></span>Available</div>
        <div class="pc-icon">🧠</div>
        <h3 class="pc-name">Custom AI Solutions</h3>
        <p class="pc-desc">Bespoke projects scoped and built by data scientists — NLP, classification, forecasting, fine-tuned local models — delivered as running software.</p>
        <div class="pc-tags"><span class="pc-tag">NLP / LLM</span><span class="pc-tag">Classification</span><span class="pc-tag">Forecasting</span><span class="pc-tag">On-premise</span></div>
        <a href="#contact" class="pc-link">Start a conversation →</a>
      </article>

    </div>
  </div>
</section>

<!-- CHATBOT DEMO -->
<section id="chatdemo">
  <div class="si">
    <div class="chatdemo-grid">
      <div class="chatdemo-copy">
        <div class="sl rv">Live demo</div>
        <h2 class="sh rv">This is what we<br>build for your clients.</h2>
        <p class="ss rv" style="margin-bottom:28px;">Every chatbot we deliver is trained on your specific business context — your products, your language, your tone.</p>
        <div class="chatdemo-feature rv d1">
          <div class="cdf-icon">🌍</div>
          <div><div class="cdf-title">Multi-language by default</div><div class="cdf-desc">Handles Italian, English, and mixed conversations without configuration.</div></div>
        </div>
        <div class="chatdemo-feature rv d2">
          <div class="cdf-icon">🎯</div>
          <div><div class="cdf-title">Trained on your context</div><div class="cdf-desc">Fine-tuned with your product catalog, FAQs, and business rules.</div></div>
        </div>
        <div class="chatdemo-feature rv d3">
          <div class="cdf-icon">🔌</div>
          <div><div class="cdf-title">Deploys anywhere</div><div class="cdf-desc">Website widget, WhatsApp Business API, Slack/Teams, or your existing tools.</div></div>
        </div>
      </div>
      <div class="rv d1">
        <div class="chat-widget">
          <div class="chat-header">
            <div class="chat-avatar">🤖</div>
            <div>
              <div class="chat-hname">TaalumaFlow AI</div>
              <div class="chat-online"><span class="chat-online-dot"></span><span class="chat-hstatus">Online · AI-powered demo</span></div>
            </div>
          </div>
          <div class="chat-messages" id="chat-msgs" role="log" aria-live="polite">
            <div class="msg bot">
              <div class="msg-bubble">Ciao! I'm TaalumaFlow's demo assistant. Ask me anything about our products, or try asking in Italian. 🇮🇹</div>
              <div class="msg-time">now</div>
            </div>
          </div>
          <div class="chat-typing" id="chat-typing" aria-hidden="true">
            <div class="chat-typing-dot"></div><div class="chat-typing-dot"></div><div class="chat-typing-dot"></div>
          </div>
          <div class="chat-input-row">
            <label for="chat-input" class="sr-only">Message</label>
            <input class="chat-input" id="chat-input" type="text" placeholder="Ask about our products..." maxlength="300" autocomplete="off">
            <button class="chat-send" id="chat-send-btn" aria-label="Send">➤</button>
          </div>
          <div class="chat-disclaimer">Powered by Claude · Live AI · Not a scripted demo</div>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- DATA LAB -->
<section id="csv-section">
  <div class="si">
    <div class="sl rv">Data dashboards</div>
    <h2 class="sh rv">Upload your data.<br>See it become a dashboard.</h2>
    <p class="ss rv">Drop any CSV — sales, inventory, orders. We render live charts in your browser instantly. Your data never leaves your device. This is exactly how we build your real production dashboards.</p>
    <div class="csv-upload-area">
      <div class="csv-dropzone rv" id="csv-dropzone">
        <input type="file" id="csv-file-input" accept=".csv" style="position:absolute;inset:0;opacity:0;cursor:pointer;z-index:2">
        <div class="csv-drop-icon" aria-hidden="true">📊</div>
        <div class="csv-drop-title">Drop your CSV here or click to browse</div>
        <div class="csv-drop-sub">Or try our sample Italian distributor dataset — no upload needed</div>
        <button class="csv-sample-btn" id="csv-sample-btn" type="button">Load sample data →</button>
      </div>
      <div id="csv-dashboard"></div>
    </div>
  </div>
</section>

<!-- PROCESS -->
<section id="process">
  <div class="si">
    <div class="sl rv">How we work</div>
    <h2 class="sh rv">Data science discipline.<br>Practical delivery.</h2>
    <p class="ss rv">We follow a structured process because it's what separates AI tools that work from demos that don't survive contact with real data.</p>
    <div class="process-grid">
      <div class="pg-step rv"><div class="pg-num">1</div><div class="pg-title">Understand</div><div class="pg-desc">We map your current process, data sources, and failure points. No proposal before we understand the problem.</div></div>
      <div class="pg-step rv d1"><div class="pg-num">2</div><div class="pg-title">Data audit</div><div class="pg-desc">We assess data quality and volume. If the data isn't there, we tell you — we don't build models on bad foundations.</div></div>
      <div class="pg-step rv d2"><div class="pg-num">3</div><div class="pg-title">Prototype</div><div class="pg-desc">Working prototype in 2 weeks, tested on your actual data. You see real output before committing to a full build.</div></div>
      <div class="pg-step rv d3"><div class="pg-num">4</div><div class="pg-title">Build &amp; test</div><div class="pg-desc">Production build with confidence scoring and edge-case handling. Human review where AI is genuinely uncertain.</div></div>
      <div class="pg-step rv d4"><div class="pg-num">5</div><div class="pg-title">Deploy &amp; monitor</div><div class="pg-desc">Docker-based deployment on your infrastructure. We monitor performance and retrain when accuracy drifts.</div></div>
    </div>
  </div>
</section>

<!-- STATS -->
<section id="stats">
  <div class="stats-row">
    <div class="stat-item rv"><div class="stat-num">&lt;<span>10</span>s</div><div class="stat-lbl">Average time from<br>message to document</div></div>
    <div class="stat-item rv d1"><div class="stat-num"><span>94</span>%</div><div class="stat-lbl">Orders auto-approved<br>without human review</div></div>
    <div class="stat-item rv d2"><div class="stat-num"><span>0</span></div><div class="stat-lbl">Client data sent<br>to external servers</div></div>
    <div class="stat-item rv d3"><div class="stat-num"><span>1</span></div><div class="stat-lbl">Docker Compose file<br>to deploy everything</div></div>
  </div>
</section>

<!-- CONTACT -->
<section id="contact">
  <div class="si">
    <div class="contact-grid">
      <div>
        <div class="sl rv">Contact</div>
        <h2 class="sh rv">Start with<br>a 30-minute call.</h2>
        <p class="ss rv" style="margin-bottom:36px;">We'll look at your current process, tell you honestly whether AI helps, and show you a realistic solution — before any commitment.</p>
        <div class="contact-detail rv"><div class="cd-icon">✉️</div><div><div class="cd-lbl">Email</div><div class="cd-val"><a href="mailto:talumaflow@gmail.com">talumaflow@gmail.com</a></div></div></div>
        <div class="contact-detail rv d1"><div class="cd-icon">📱</div><div><div class="cd-lbl">WhatsApp</div><div class="cd-val"><a href="https://wa.me/393289741517">+39 328 9741517</a></div></div></div>
        <div class="contact-detail rv d2"><div class="cd-icon">🌍</div><div><div class="cd-lbl">Website</div><div class="cd-val"><a href="https://www.talumaflow.com">www.talumaflow.com</a></div></div></div>
        <div class="contact-detail rv d3"><div class="cd-icon">📍</div><div><div class="cd-lbl">Location</div><div class="cd-val">Milan, Italy · Remote-first</div></div></div>
        <div class="contact-detail rv d4"><div class="cd-icon">📸</div><div><div class="cd-lbl">Social</div><div class="cd-val"><a href="#">@talumaflow</a></div></div></div>
      </div>
      <form class="contact-form rv d1" id="contact-form" novalidate>
        <div class="fl-2">
          <div class="fl"><label for="cf-name">Name</label><input class="fi" id="cf-name" name="cf-name" type="text" placeholder="Mario Rossi" required autocomplete="name"></div>
          <div class="fl"><label for="cf-company">Company</label><input class="fi" id="cf-company" name="cf-company" type="text" placeholder="Rossi Srl" autocomplete="organization"></div>
        </div>
        <div class="fl"><label for="cf-email">Email</label><input class="fi" id="cf-email" name="cf-email" type="email" placeholder="mario@rossi.it" required autocomplete="email"></div>
        <div class="fl">
          <label for="cf-product">I'm interested in</label>
          <select class="fs" id="cf-product" name="cf-product">
            <option value="">Select...</option>
            <option>TaalumaMail — order extraction</option>
            <option>Custom AI chatbot</option>
            <option>Data dashboard / analytics</option>
            <option>Process automation</option>
            <option>TaalumaERP</option>
            <option>Custom AI solution</option>
            <option>Not sure — tell me what fits</option>
          </select>
        </div>
        <div class="fl"><label for="cf-message">Current challenge</label><textarea class="ft" id="cf-message" name="cf-message" placeholder="E.g. We process 40 orders/day by WhatsApp and enter them manually into our gestionale..."></textarea></div>
        <button type="submit" class="form-btn" id="fbtn">Send →</button>
      </form>
    </div>
  </div>
</section>

<!-- FOOTER -->
<footer>
  <div class="f-logo">Taluma<span>Flow</span></div>
  <ul class="f-links">
    <li><a href="#products">Products</a></li>
    <li><a href="#extraction-demo">Live Demo</a></li>
    <li><a href="#csv-section">Data Lab</a></li>
    <li><a href="#process">Process</a></li>
    <li><a href="#contact">Contact</a></li>
    <li><a href="mailto:talumaflow@gmail.com">Email us</a></li>
  </ul>
  <div class="f-copy">© 2026 TaalumaFlow · Milan, Italy</div>
</footer>

<!-- FLOATING CHAT BUBBLE -->
<button class="chat-bubble-btn" id="float-chat-btn" aria-label="Open AI chat" aria-expanded="false">
  <span class="cbb-open" aria-hidden="true">💬</span>
  <span class="cbb-close" aria-hidden="true">✕</span>
</button>
<div class="chat-float-panel" id="float-chat-panel" role="dialog" aria-label="AI assistant" aria-hidden="true">
  <div class="chat-header">
    <div class="chat-avatar">🤖</div>
    <div>
      <div class="chat-hname">TaalumaFlow AI</div>
      <div class="chat-online"><span class="chat-online-dot"></span><span class="chat-hstatus">Online · AI-powered demo</span></div>
    </div>
    <button class="cfp-clear-btn" id="cfp-clear-btn" title="Clear conversation" aria-label="Clear chat">↺</button>
  </div>
  <div class="cfp-messages" id="cfp-msgs" role="log" aria-live="polite">
    <div class="msg bot">
      <div class="msg-bubble">Ciao! Ask me anything about TaalumaFlow — in Italian or English. 👋</div>
      <div class="msg-time">now</div>
    </div>
  </div>
  <div class="cfp-input-row">
    <label for="cfp-input" class="sr-only">Message</label>
    <input class="cfp-input" id="cfp-input" type="text" placeholder="Your question..." maxlength="300" autocomplete="off">
    <button class="cfp-send" id="cfp-send-btn" aria-label="Send">➤</button>
  </div>
</div>

<!-- Single entry point — ES module so import/export works natively in browser -->
<script type="module" src="src/js/index.js"></script>
</body>
</html>
