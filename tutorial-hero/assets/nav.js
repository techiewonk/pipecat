/* Pipecat 0-to-Hero — nav + UX + animated flow diagrams + self-contained highlighter.
   Defined once, injected into every page. */
(function () {
  const CHAPTERS = [
    { file: "index.html", n: "", title: "Course home", group: "Start" },

    { file: "l00-orientation.html",       n: "0",  title: "How to use this course", group: "Part I — Principles" },
    { file: "l01-what-is-pipecat.html",   n: "1",  title: "What Pipecat is" },
    { file: "l02-setup-first-run.html",   n: "2",  title: "Setup & first run" },
    { file: "l03-frame-model.html",       n: "3",  title: "The frame model" },
    { file: "l04-frameprocessor.html",    n: "4",  title: "FrameProcessor & custom processors" },
    { file: "l05-pipeline-workers.html",  n: "5",  title: "Pipeline, workers & runner" },

    { file: "l06-transports.html",        n: "6",  title: "Transports", group: "Part II — The voice loop" },
    { file: "l07-audio-processing.html",  n: "7",  title: "Audio: filters, resamplers, VAD" },
    { file: "l08-stt.html",               n: "8",  title: "Speech to Text" },
    { file: "l09-context-aggregators.html", n: "9", title: "Context & aggregators" },
    { file: "l10-turn-taking.html",       n: "10", title: "Turn-taking & muting" },
    { file: "l11-llm-settings.html",      n: "11", title: "LLM inference, adapters & settings" },
    { file: "l12-function-calling.html",  n: "12", title: "Function calling, async tools & MCP" },
    { file: "l13-tts.html",               n: "13", title: "Text to Speech" },
    { file: "l14-output-playback.html",   n: "14", title: "Output & playback" },

    { file: "l15-realtime.html",          n: "15", title: "Realtime speech-to-speech", group: "Part III — Realtime & multimodal" },
    { file: "l16-vision-video.html",      n: "16", title: "Vision, video & avatars" },
    { file: "l17-thinking.html",          n: "17", title: "Thinking / reasoning" },
    { file: "l18-rag-memory.html",        n: "18", title: "RAG & memory" },

    { file: "l19-flows.html",             n: "19", title: "Flows", group: "Part IV — Structure, control & capture" },
    { file: "l20-interruptions-switching.html", n: "20", title: "Interruptions, idle & switching" },
    { file: "l21-summarization.html",     n: "21", title: "Context summarization & strategies" },
    { file: "l22-transcripts-recording.html", n: "22", title: "Transcripts & recording" },
    { file: "l23-observability.html",     n: "23", title: "Observability & metrics" },

    { file: "l24-bus.html",               n: "24", title: "The worker bus & bridge", group: "Part V — Multi-agent" },
    { file: "l25-workers-registry.html",  n: "25", title: "Workers, @tool, registry" },
    { file: "l26-handoff.html",           n: "26", title: "Handoff" },
    { file: "l27-job-coordination.html",  n: "27", title: "Job coordination" },
    { file: "l28-distributed-proxy.html", n: "28", title: "Distributed & proxy" },
    { file: "l29-uiworker-rtvi.html",     n: "29", title: "UIWorker + RTVI client" },

    { file: "l30-runner-telephony.html",  n: "30", title: "Runner & telephony", group: "Part VI — Production & quality" },
    { file: "l31-ivr-voicemail.html",     n: "31", title: "IVR & voicemail" },
    { file: "l32-integrations.html",      n: "32", title: "Framework integrations" },
    { file: "l33-deployment-cli.html",    n: "33", title: "Deployment & the CLI" },
    { file: "l34-evals-testing.html",     n: "34", title: "Evals & testing" },

    { file: "l35-capstone-a2a.html",      n: "35", title: "Capstone: Gemini Live A2A", group: "Part VII — Capstone" },

    { file: "ax-frame-catalog.html",      n: "A", title: "Frame catalog", group: "Appendices" },
    { file: "ax-glossary.html",           n: "B", title: "Glossary" },
    { file: "ax-migration.html",          n: "C", title: "What changed from old tutorials" },
    { file: "ax-provider-matrix.html",    n: "D", title: "Provider matrix" },
    { file: "ax-coverage.html",           n: "E", title: "Coverage matrix" },
    { file: "ax-utils.html",              n: "F", title: "utils/ reference" },
    { file: "ax-events.html",             n: "G", title: "Events reference" },
  ];
  const here = (location.pathname.split("/").pop() || "index.html").toLowerCase();

  // ---- progress store (localStorage; safe if blocked) ----
  const KEY = "pc_hero_done";
  function readDone() { try { return JSON.parse(localStorage.getItem(KEY) || "{}"); } catch (e) { return {}; } }
  function writeDone(o) { try { localStorage.setItem(KEY, JSON.stringify(o)); } catch (e) {} }
  const lessonFiles = CHAPTERS.filter(c => /^\d+$/.test(c.n)).map(c => c.file);

  // ---- sidebar ----
  const aside = document.getElementById("sidebar");
  if (aside && !aside.hasAttribute("data-static")) {
    const done = readDone();
    let html = '<div class="brand">Pipecat <span>0&#8209;to&#8209;Hero</span></div>'
             + '<div class="sub">Source&#8209;deep, runnable &middot; to a distributed A2A</div>'
             + '<div class="navprogress"><div class="bar"><i id="npbar"></i></div><div class="lbl" id="nplbl"></div></div>';
    CHAPTERS.forEach(c => {
      if (c.group) html += '<div class="grp">' + c.group + '</div>';
      const active = c.file.toLowerCase() === here ? " active" : "";
      const isdone = done[c.file] ? " done" : "";
      const num = c.n ? '<span class="n">' + c.n + '</span>' : '<span class="n"></span>';
      html += '<a class="' + (active + isdone).trim() + '" href="' + c.file + '">' + num + c.title + '</a>';
    });
    aside.innerHTML = html;
    updateNavProgress();
  }
  function updateNavProgress() {
    const done = readDone();
    const n = lessonFiles.filter(f => done[f]).length;
    const bar = document.getElementById("npbar"), lbl = document.getElementById("nplbl");
    if (bar) bar.style.width = Math.round((n / lessonFiles.length) * 100) + "%";
    if (lbl) lbl.textContent = n + " / " + lessonFiles.length + " lessons complete";
  }

  // ---- mobile menu ----
  const btn = document.getElementById("menuBtn");
  if (btn) btn.addEventListener("click", () => document.body.classList.toggle("nav-open"));
  const bd = document.querySelector(".backdrop");
  if (bd) bd.addEventListener("click", () => document.body.classList.remove("nav-open"));

  // ---- on-page TOC ----
  const toc = document.getElementById("pagetoc");
  const heads = Array.prototype.slice.call(document.querySelectorAll(".content h2[id]"));
  if (toc) {
    if (heads.length > 1) {
      let t = '<div class="t">On this page</div>';
      heads.forEach(h => { t += '<a href="#' + h.id + '" data-spy="' + h.id + '">' + h.textContent.replace(/^[^A-Za-z0-9]+/, "") + '</a>'; });
      toc.innerHTML = t;
    } else { toc.style.display = "none"; }
  }

  // ---- reading progress bar + back-to-top + scroll-spy ----
  const pbar = document.createElement("div"); pbar.id = "progressbar"; document.body.appendChild(pbar);
  const totop = document.createElement("button"); totop.id = "totop"; totop.setAttribute("aria-label", "Back to top");
  totop.innerHTML = "↑"; document.body.appendChild(totop);
  totop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
  const spyLinks = toc ? Array.prototype.slice.call(toc.querySelectorAll("a[data-spy]")) : [];
  function onScroll() {
    const st = document.documentElement.scrollTop || document.body.scrollTop;
    const h = (document.documentElement.scrollHeight - document.documentElement.clientHeight) || 1;
    pbar.style.width = (st / h * 100) + "%";
    totop.classList.toggle("show", st > 500);
    if (spyLinks.length) {
      let cur = heads[0] && heads[0].id;
      for (const hd of heads) { if (hd.getBoundingClientRect().top <= 120) cur = hd.id; }
      spyLinks.forEach(a => a.classList.toggle("active", a.getAttribute("data-spy") === cur));
    }
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // ---- copy buttons on code blocks ----
  document.querySelectorAll("pre > code").forEach(function (code) {
    const pre = code.parentElement;
    const b = document.createElement("button"); b.className = "copybtn"; b.textContent = "Copy";
    b.addEventListener("click", function () {
      const txt = code.textContent;
      const done = () => { b.textContent = "Copied"; b.classList.add("ok"); setTimeout(() => { b.textContent = "Copy"; b.classList.remove("ok"); }, 1400); };
      if (navigator.clipboard) navigator.clipboard.writeText(txt).then(done, done);
      else { const t = document.createElement("textarea"); t.value = txt; document.body.appendChild(t); t.select(); try { document.execCommand("copy"); } catch (e) {} t.remove(); done(); }
    });
    pre.appendChild(b);
  });

  // ---- self-contained syntax highlighter (offline) ----
  window.pcTokenize = function (code) {
    var esc = function (s) { return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); };
    var re = /(#[^\n]*)|("""[\s\S]*?"""|'''[\s\S]*?'''|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')|(@[A-Za-z_][\w.]*)|\b(async|await|def|class|return|import|from|as|with|in|if|elif|else|for|while|not|and|or|lambda|yield|try|except|finally|raise|pass|True|False|None|self)\b|\b(\d+\.?\d*)\b/g;
    var out = "", last = 0, m;
    while ((m = re.exec(code))) {
      out += esc(code.slice(last, m.index));
      if (m[1]) out += '<span class="tok-c">' + esc(m[1]) + "</span>";
      else if (m[2]) out += '<span class="tok-s">' + esc(m[2]) + "</span>";
      else if (m[3]) out += '<span class="tok-f">' + esc(m[3]) + "</span>";
      else if (m[4]) out += '<span class="tok-k">' + esc(m[4]) + "</span>";
      else if (m[5]) out += '<span class="tok-n">' + esc(m[5]) + "</span>";
      last = re.lastIndex;
    }
    out += esc(code.slice(last));
    return out;
  };
  document.querySelectorAll("pre code").forEach(function (b) { b.innerHTML = window.pcTokenize(b.textContent); });

  // ---- animated pipeline flow diagrams ----
  // <div class="pcflow" data-dur="6" data-stages="Mic:audio|STT:text|LLM:reply" data-caption="msg1|msg2|msg3"></div>
  document.querySelectorAll(".pcflow").forEach(function (el) {
    var stages = (el.getAttribute("data-stages") || "").split("|").filter(Boolean);
    var caps = (el.getAttribute("data-caption") || "").split("|").filter(Boolean);
    var dur = parseFloat(el.getAttribute("data-dur") || "6");
    if (!stages.length) return;
    el.style.setProperty("--n", stages.length);
    el.style.setProperty("--dur", dur + "s");
    var track = document.createElement("div"); track.className = "track";
    stages.forEach(function (s, i) {
      var p = s.split(":"); var box = document.createElement("div"); box.className = "st"; box.style.setProperty("--i", i);
      box.innerHTML = '<div class="t">' + p[0] + "</div>" + (p[1] ? '<div class="s">' + p[1] + "</div>" : "");
      track.appendChild(box);
    });
    var packet = document.createElement("div"); packet.className = "packet"; track.appendChild(packet);
    var ctrl = document.createElement("button"); ctrl.className = "ctrl";
    var cap = document.createElement("div"); cap.className = "cap";
    el.appendChild(ctrl); el.appendChild(track); el.appendChild(cap);
    var idx = 0, timer = null;
    function tick() { if (caps.length) { cap.innerHTML = caps[idx % caps.length]; idx++; } }
    function start() { tick(); timer = setInterval(tick, dur * 1000 / stages.length); ctrl.textContent = "⏸ pause"; el.classList.remove("paused"); }
    function stop() { clearInterval(timer); ctrl.textContent = "▶ play"; el.classList.add("paused"); }
    var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) { el.classList.add("paused"); ctrl.textContent = "▶ play"; if (caps.length) cap.innerHTML = caps[0]; }
    else start();
    ctrl.addEventListener("click", function () { if (el.classList.contains("paused")) start(); else stop(); });
  });

  // ---- footer prev/next + mark-complete ----
  const foot = document.getElementById("chapnav");
  const i = CHAPTERS.findIndex(c => c.file.toLowerCase() === here);
  if (foot) {
    let h = "";
    if (i > 0) { const p = CHAPTERS[i - 1]; h += '<a class="prev" href="' + p.file + '"><span class="dir">← Previous</span><span class="ttl">' + (p.n ? p.n + ". " : "") + p.title + "</span></a>"; }
    else h += "<span></span>";
    if (i >= 0 && i < CHAPTERS.length - 1) { const nx = CHAPTERS[i + 1]; h += '<a class="next" href="' + nx.file + '"><span class="dir">Next →</span><span class="ttl">' + (nx.n ? nx.n + ". " : "") + nx.title + "</span></a>"; }
    foot.innerHTML = h;
  }
  // mark-complete control for lesson pages
  const cur = CHAPTERS[i];
  if (cur && /^\d+$/.test(cur.n)) {
    const wrap = document.querySelector(".content");
    if (wrap) {
      const done = readDone();
      const bar = document.createElement("div"); bar.className = "completebar";
      const b = document.createElement("button"); b.className = "completebtn" + (done[cur.file] ? " done" : "");
      b.textContent = done[cur.file] ? "✓ Completed — click to unmark" : "Mark this lesson complete";
      b.addEventListener("click", function () {
        const d = readDone(); d[cur.file] = !d[cur.file]; if (!d[cur.file]) delete d[cur.file]; writeDone(d);
        b.classList.toggle("done", !!d[cur.file]);
        b.textContent = d[cur.file] ? "✓ Completed — click to unmark" : "Mark this lesson complete";
        updateNavProgress();
        const link = document.querySelector('#sidebar a[href="' + cur.file + '"]'); if (link) link.classList.toggle("done", !!d[cur.file]);
      });
      bar.appendChild(b);
      const hint = document.createElement("span"); hint.className = "kbdhint"; hint.innerHTML = "Tip: <kbd>&larr;</kbd> / <kbd>&rarr;</kbd> to move between lessons";
      bar.appendChild(hint);
      wrap.appendChild(bar);
    }
  }

  // ---- keyboard prev/next ----
  document.addEventListener("keydown", function (e) {
    if (e.target && /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName)) return;
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    if (e.key === "ArrowRight" && i >= 0 && i < CHAPTERS.length - 1) location.href = CHAPTERS[i + 1].file;
    if (e.key === "ArrowLeft" && i > 0) location.href = CHAPTERS[i - 1].file;
  });
})();
