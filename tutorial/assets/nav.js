/* Shared navigation — defined ONCE, injected into every page.
   This is how the tutorial avoids repeating nav/boilerplate markup across chapters. */
(function () {
  // The single source of truth for chapter order + titles.
  const CHAPTERS = [
    { file: "index.html",                    n: "",   title: "Overview", group: "Start" },
    { file: "ch00-foundations.html",         n: "0",  title: "Foundations", group: "Part A — Core" },
    { file: "ch01-turn-taking.html",         n: "1",  title: "Turn-taking" },
    { file: "ch02-audio-frame-processing.html", n: "2", title: "Audio & Frame Processing" },
    { file: "ch03-speech-io.html",           n: "3",  title: "Speech I/O (STT + TTS)" },
    { file: "ch04-brain-memory.html",        n: "4",  title: "Brain & Memory" },
    { file: "ch05-tools-mcp.html",           n: "5",  title: "Tools & MCP" },
    { file: "ch06-gemini-live.html",         n: "6",  title: "Gemini Live", group: "Part B — Modalities & knowledge" },
    { file: "ch07-multimodal.html",          n: "7",  title: "Multimodal (vision/video/avatars)" },
    { file: "ch08-rag.html",                 n: "8",  title: "RAG & Grounding" },
    { file: "ch09-flows.html",               n: "9",  title: "Flows" },
    { file: "ch10-production-telephony.html",n: "10", title: "Production & Telephony", group: "Part C — Production & A2A" },
    { file: "ch11-a2a-patterns.html",        n: "11", title: "Multi-agent A2A patterns" },
    { file: "ch12-capstone-gemini-a2a.html", n: "12", title: "Capstone: Gemini Live A2A" },
    { file: "ch13-api-reference.html",       n: "13", title: "API Reference (all pages)", group: "Reference" },
    { file: "all-in-one.html",               n: "",   title: "All-in-one (single page)", group: "Combined" },
  ];

  const here = (location.pathname.split("/").pop() || "index.html").toLowerCase();

  // Build sidebar
  const aside = document.getElementById("sidebar");
  if (aside && !aside.hasAttribute("data-static")) {
    let html = '<div class="brand">Pipecat <span>Feature Tutorial</span></div>'
             + '<div class="sub">Voice &amp; multimodal AI · toward a Gemini&nbsp;Live A2A</div>';
    CHAPTERS.forEach(c => {
      if (c.group) html += '<div class="grp">' + c.group + '</div>';
      const active = c.file.toLowerCase() === here ? ' class="active"' : "";
      const num = c.n ? '<span class="n">' + c.n + '</span>' : '';
      html += '<a href="' + c.file + '"' + active + '>' + num + c.title + '</a>';
    });
    aside.innerHTML = html;
  }

  // Mobile menu toggle + backdrop
  const btn = document.getElementById("menuBtn");
  if (btn) btn.addEventListener("click", () => document.body.classList.toggle("nav-open"));
  const bd = document.querySelector(".backdrop");
  if (bd) bd.addEventListener("click", () => document.body.classList.remove("nav-open"));

  // Auto-build the on-page TOC from <h2 id> inside .content
  const toc = document.getElementById("pagetoc");
  if (toc) {
    const hs = document.querySelectorAll(".content h2[id]");
    if (hs.length > 1) {
      let t = '<div class="t">On this page</div>';
      hs.forEach(h => { t += '<a href="#' + h.id + '">' + h.textContent.replace(/^[^A-Za-z0-9]+/, "") + '</a>'; });
      toc.innerHTML = t;
    } else { toc.style.display = "none"; }
  }

  // Self-contained syntax highlighter (no external dependency; works offline).
  window.pcHighlight = function (root) {
    (root || document).querySelectorAll("pre code").forEach(function (block) {
      block.innerHTML = pcTokenize(block.textContent);
    });
  };
  window.pcTokenize = function (code) {
    var esc = function (s) { return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); };
    var re = /(#[^\n]*)|("""[\s\S]*?"""|'''[\s\S]*?'''|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')|(@[A-Za-z_][\w.]*)|\b(async|await|def|class|return|import|from|as|with|in|if|elif|else|for|while|not|and|or|lambda|yield|try|except|finally|raise|pass|True|False|None|self)\b|\b(\d+\.?\d*)\b/g;
    var out = "", last = 0, m;
    while ((m = re.exec(code))) {
      out += esc(code.slice(last, m.index));
      if (m[1])      out += '<span class="tok-c">' + esc(m[1]) + "</span>";
      else if (m[2]) out += '<span class="tok-s">' + esc(m[2]) + "</span>";
      else if (m[3]) out += '<span class="tok-f">' + esc(m[3]) + "</span>";
      else if (m[4]) out += '<span class="tok-k">' + esc(m[4]) + "</span>";
      else if (m[5]) out += '<span class="tok-n">' + esc(m[5]) + "</span>";
      last = re.lastIndex;
    }
    out += esc(code.slice(last));
    return out;
  };
  window.pcHighlight(document);

  // Auto-build previous/next chapter footer
  const foot = document.getElementById("chapnav");
  if (foot) {
    const i = CHAPTERS.findIndex(c => c.file.toLowerCase() === here);
    let h = "";
    if (i > 0) { const p = CHAPTERS[i - 1]; h += '<a class="prev" href="' + p.file + '"><span class="dir">← Previous</span><span class="ttl">' + (p.n ? p.n + ". " : "") + p.title + '</span></a>'; }
    else { h += '<span></span>'; }
    if (i >= 0 && i < CHAPTERS.length - 1) { const nx = CHAPTERS[i + 1]; h += '<a class="next" href="' + nx.file + '"><span class="dir">Next →</span><span class="ttl">' + (nx.n ? nx.n + ". " : "") + nx.title + '</span></a>'; }
    foot.innerHTML = h;
  }
})();
