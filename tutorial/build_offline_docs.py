#!/usr/bin/env python3
"""Mirror every Pipecat docs page referenced by the tutorial for fully-offline use.

Run this ONCE (needs internet):

    python tutorial/build_offline_docs.py
    # or:  uv run python tutorial/build_offline_docs.py

What it does:
  1. Reads tutorial/reference/_manifest.json (344 doc pages: API reference + learn/fundamentals).
  2. Downloads each page's Markdown (.md) using only the Python standard library.
  3. Converts it to a themed offline HTML page under tutorial/reference/.
  4. Rewrites every https://docs.pipecat.ai/... link in the tutorial's HTML files
     to point at the local copy, so nothing needs the internet afterwards.

Re-running is safe; it skips pages already downloaded (use --force to refetch).
"""
import json, os, re, sys, html, time, urllib.request, urllib.error

HERE = os.path.dirname(os.path.abspath(__file__))
REF = os.path.join(HERE, "reference")
MANIFEST = os.path.join(REF, "_manifest.json")
FORCE = "--force" in sys.argv

def load_manifest():
    with open(MANIFEST, encoding="utf-8") as f:
        return json.load(f)

def url_to_slug_map(manifest):
    return {m["url"]: m["slug"] for m in manifest}

# ---------- tiny, dependency-free Markdown -> HTML ----------
def inline(text, urlmap):
    text = html.escape(text, quote=False)
    text = re.sub(r"`([^`]+)`", r"<code>\1</code>", text)
    text = re.sub(r"\*\*([^*]+)\*\*", r"<strong>\1</strong>", text)
    def link(m):
        label, url = m.group(1), m.group(2)
        clean = re.sub(r"\.md($|#)", r"\1", url)
        if clean in urlmap:
            url = urlmap[clean]                       # local sibling page
        return '<a href="%s">%s</a>' % (url, label)
    text = re.sub(r"\[([^\]]+)\]\(([^)]+)\)", link, text)
    return text

def md_to_html(md, urlmap):
    lines = md.split("\n")
    out, i, n = [], 0, len(lines)
    while i < n:
        line = lines[i]
        # fenced code
        if line.lstrip().startswith("```"):
            i += 1; code = []
            while i < n and not lines[i].lstrip().startswith("```"):
                code.append(lines[i]); i += 1
            i += 1
            out.append("<pre><code>%s</code></pre>" % html.escape("\n".join(code), quote=False))
            continue
        # table
        if line.strip().startswith("|") and i + 1 < n and re.match(r"^\s*\|?[\s:|-]+\|?\s*$", lines[i+1]):
            header = [c.strip() for c in line.strip().strip("|").split("|")]
            i += 2; rows = []
            while i < n and lines[i].strip().startswith("|"):
                rows.append([c.strip() for c in lines[i].strip().strip("|").split("|")]); i += 1
            t = ['<div class="tablewrap"><table><thead><tr>']
            t += ["<th>%s</th>" % inline(c, urlmap) for c in header]
            t.append("</tr></thead><tbody>")
            for r in rows:
                t.append("<tr>" + "".join("<td>%s</td>" % inline(c, urlmap) for c in r) + "</tr>")
            t.append("</tbody></table></div>")
            out.append("".join(t)); continue
        # heading
        h = re.match(r"^(#{1,6})\s+(.*)$", line)
        if h:
            lvl = min(len(h.group(1)), 4)
            out.append("<h%d>%s</h%d>" % (lvl, inline(h.group(2), urlmap), lvl)); i += 1; continue
        # hr
        if re.match(r"^\s*([-*_])\1\1+\s*$", line):
            out.append("<hr>"); i += 1; continue
        # blockquote
        if line.strip().startswith(">"):
            buf = []
            while i < n and lines[i].strip().startswith(">"):
                buf.append(lines[i].strip()[1:].strip()); i += 1
            out.append("<blockquote>%s</blockquote>" % inline(" ".join(buf), urlmap)); continue
        # list
        if re.match(r"^\s*([-*]|\d+\.)\s+", line):
            ordered = bool(re.match(r"^\s*\d+\.\s+", line))
            tag = "ol" if ordered else "ul"; items = []
            while i < n and re.match(r"^\s*([-*]|\d+\.)\s+", lines[i]):
                items.append(inline(re.sub(r"^\s*([-*]|\d+\.)\s+", "", lines[i]), urlmap)); i += 1
            out.append("<%s>%s</%s>" % (tag, "".join("<li>%s</li>" % it for it in items), tag)); continue
        # blank
        if not line.strip():
            i += 1; continue
        # paragraph
        buf = []
        while i < n and lines[i].strip() and not re.match(r"^(#{1,6}\s|```|\s*[-*]\s|\s*\d+\.\s|>|\|)", lines[i]):
            buf.append(lines[i]); i += 1
        out.append("<p>%s</p>" % inline(" ".join(buf), urlmap))
    return "\n".join(out)

PAGE = """<!DOCTYPE html>
<html lang="en"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>{title} · Pipecat API (offline)</title>
<link rel="stylesheet" href="../assets/style.css">
<style>main{{max-width:820px}}blockquote{{border-left:3px solid var(--accent);margin:14px 0;padding:6px 14px;background:var(--panel);color:var(--muted)}}</style>
</head><body>
<div class="layout"><main><div class="content">
<div class="eyebrow"><a href="../ch13-api-reference.html">← API Reference index</a> · offline copy</div>
{body}
<hr style="margin-top:40px"><p class="apicount">Mirrored from <a href="{url}">{url}</a></p>
</div></main></div></body></html>"""

def fetch(md_url):
    req = urllib.request.Request(md_url, headers={"User-Agent": "pipecat-tutorial-offline/1.0"})
    with urllib.request.urlopen(req, timeout=30) as r:
        return r.read().decode("utf-8", "replace")

def main():
    manifest = load_manifest()
    urlmap = url_to_slug_map(manifest)
    os.makedirs(REF, exist_ok=True)
    ok, skip, fail = 0, 0, []
    for k, m in enumerate(manifest, 1):
        dest = os.path.join(REF, m["slug"])
        if os.path.exists(dest) and not FORCE:
            skip += 1; continue
        try:
            md = fetch(m["md"])
            body = md_to_html(md, urlmap)
            with open(dest, "w", encoding="utf-8") as f:
                f.write(PAGE.format(title=html.escape(m["title"]), body=body, url=html.escape(m["url"])))
            ok += 1
            print("[%d/%d] %s" % (k, len(manifest), m["slug"]))
            time.sleep(0.05)
        except Exception as e:
            fail.append((m["url"], str(e)))
            print("  FAILED %s (%s)" % (m["url"], e))
    print("\nDownloaded %d, skipped %d, failed %d" % (ok, skip, len(fail)))

    # Rewrite tutorial HTML links to the local copies
    rewritten = 0
    for fn in [f for f in os.listdir(HERE) if f.endswith(".html")]:
        p = os.path.join(HERE, fn)
        t = open(p, encoding="utf-8").read(); orig = t
        def repl(m):
            u = m.group(1)
            clean = re.sub(r"\.md$", "", u)
            if clean in urlmap:
                return 'href="reference/%s"' % urlmap[clean]
            return m.group(0)
        t = re.sub(r'href="(https://docs\.pipecat\.ai/[^"]+)"', repl, t)
        if t != orig:
            open(p, "w", encoding="utf-8").write(t); rewritten += 1
    print("Rewrote links in %d tutorial pages. Everything is now offline." % rewritten)
    if fail:
        print("\nThese pages could not be fetched (links left pointing online):")
        for u, e in fail: print("  -", u)

if __name__ == "__main__":
    main()
