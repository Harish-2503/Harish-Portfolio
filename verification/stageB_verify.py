import re, sys, subprocess, json
from stage6_verify import *   # ctx, watch, rec, shot, overflow, CAPABLE, CLS, wait_state, state, results...
LINKS = "http://localhost:4175/"
MAT = "m=>{const x=new DOMMatrix(getComputedStyle(m).transform);return {x:x.m41,y:x.m42,s:x.m11}}"
SEQ = """
window.__seq={};const t0=performance.now();
const ty=e=>new DOMMatrix(getComputedStyle(e).transform).m42;
(function f(){const S=window.__seq,now=performance.now()-t0;
 const L=[...document.querySelectorAll('#hero-title [aria-hidden="true"] > span > span')].pop();
 const W=[...document.querySelectorAll('#top p.font-display [aria-hidden="true"] > span > span')].pop();
 const C=[...document.querySelectorAll('#top .mt-10 > div')];
 if(L&&!S.nameStart&&ty(L)<L.parentElement.clientHeight*1.0&&ty(L)>0.5&&ty(L)<L.parentElement.clientHeight)S.nameStart=now;
 if(L&&!S.nameDone&&ty(L)===0)S.nameDone=now;
 if(W&&!S.tagDone&&ty(W)===0)S.tagDone=now;
 if(C.length===3&&!S.ctaDone&&getComputedStyle(C[2]).opacity>=0.99)S.ctaDone=now;
 if(C.length===3&&!S.ctaEarly&&getComputedStyle(C[0]).opacity<0.5)S.ctaEarly=now;
 requestAnimationFrame(f)})();"""

def hdr(p): return p.evaluate("(()=>{const h=document.querySelector('header');return {s:h.dataset.scrolled,bg:getComputedStyle(h).backgroundColor,h:h.firstElementChild.getBoundingClientRect().height}})()")

with sync_playwright() as pw:
    b = pw.chromium.launch(args=["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"])
    # ================= NAV (desktop)
    c = ctx(b, init=[CAPABLE, CLS, SEQ]); p = c.new_page(); errs = watch(p); p.goto(NEW); p.wait_for_selector("#top h1"); p.wait_for_timeout(5500)
    h = hdr(p); rec("N1a nav transparent and tall at top", h["s"] == "false" and h["bg"] in ("rgba(0, 0, 0, 0)", "transparent") and h["h"] >= 86, str(h))
    p.mouse.wheel(0, 500); p.wait_for_timeout(1200); h = hdr(p)
    rec("N1b nav turns solid and compact after scrolling", h["s"] == "true" and h["h"] <= 66 and not h["bg"].startswith("rgba(0, 0, 0, 0)"), str(h))
    ok = True; info = []
    for label in ("Work", "Journey"):
        p.get_by_role("link", name=label, exact=True).first.click(); p.wait_for_timeout(2200)
        ind = p.evaluate("[...document.querySelectorAll('[data-nav-indicator]')].map(i=>i.parentElement.textContent.trim())")
        cur = p.evaluate("document.querySelector('nav[aria-label=Primary] [aria-current=true]')?.textContent.trim()")
        info.append((label, ind, cur)); ok &= ind == [label] and cur == label
    rec("N2 sliding indicator follows the active section (one at a time)", ok, str(info))
    p.reload(); p.wait_for_selector("#top h1"); p.wait_for_timeout(4500)  # fresh load: keyboard navigation starts at the top, as for a real keyboard user
    seen = None
    for _ in range(6):
        p.keyboard.press("Tab")
        seen = p.evaluate("(()=>{const e=document.activeElement;const s=getComputedStyle(e);return {t:e.textContent.trim().slice(0,12),o:s.outlineStyle,w:s.outlineWidth}})()")
        if seen["t"] == "About": break
    rec("N3 keyboard: Tab reaches nav links with a visible focus ring", seen and seen["t"] == "About" and seen["o"] == "solid" and seen["w"] == "3px", str(seen))
    p.keyboard.press("Enter"); p.wait_for_timeout(2200); top = p.evaluate("document.getElementById('about').getBoundingClientRect().top")
    rec("N3b keyboard: Enter on a nav link scrolls to the section", -40 <= top <= 300, f"top={top:.0f}")
    r = p.locator('nav[aria-label=Primary] a[download]'); r.scroll_into_view_if_needed()
    box = r.bounding_box(); cx, cy = box["x"] + box["width"] / 2, box["y"] + box["height"] / 2
    sw = lambda: p.evaluate("(()=>{const a=document.querySelector('nav[aria-label=Primary] a[download]');return {sweep:a.firstElementChild.getBoundingClientRect().left-a.getBoundingClientRect().left,w:a.getBoundingClientRect().width,mag:new DOMMatrix(getComputedStyle(a.parentElement).transform).m41}})()")
    before = sw(); p.mouse.move(cx - 40, cy, steps=2); p.mouse.move(cx + 18, cy, steps=6); p.wait_for_timeout(900); over = sw()
    p.mouse.move(cx + 400, cy + 300, steps=4); p.wait_for_timeout(1100); after = sw()
    rec("N4 résumé button: download attr, fill sweeps in on hover", p.evaluate("document.querySelector('nav[aria-label=Primary] a[download]').getAttribute('href').endsWith('.pdf')") and before["sweep"] < -20 and abs(over["sweep"]) < 1, f"sweep {before['sweep']:.0f}->{over['sweep']:.0f}")
    rec("N5 résumé button leans toward the mouse, then settles", over["mag"] > 1.5 and abs(after["mag"]) < 0.8, f"lean={over['mag']:.1f} after={after['mag']:.2f}")
    c.close()

    # ================= HERO (desktop)
    c = ctx(b, init=[CAPABLE, CLS, SEQ]); p = c.new_page(); errs = watch(p); p.goto(NEW); p.wait_for_selector("#top h1")
    p.wait_for_timeout(6500); S = p.evaluate("window.__seq")
    seq_ok = all(k in S for k in ("nameDone", "tagDone", "ctaDone")) and S["nameDone"] <= S["tagDone"] + 1 and S["tagDone"] <= S["ctaDone"] + 1
    rec("H1 entrance runs as a sequence: name -> tagline -> buttons", seq_ok, json.dumps({k: round(v) for k, v in S.items()}))
    rec("H1b buttons really start hidden (not everything at once)", "ctaEarly" in S, "")
    ring = lambda: p.evaluate("[...document.querySelectorAll('#top > svg path')].map(x=>getComputedStyle(x).strokeDashoffset)")
    rec("H2 backdrop outlines finish drawn (3 rings)", len(ring()) == 3 and all(float(o.replace('px','')) == 0 for o in ring()), str(ring()))
    col = "document.querySelector('#hero-title').parentElement"; stk = "document.querySelector('[data-stack3d]').parentElement"
    base = p.evaluate(f"(()=>{{const t={col},s={stk};return {{ty:new DOMMatrix(getComputedStyle(t).transform).m42,o:+getComputedStyle(t).opacity,sc:new DOMMatrix(getComputedStyle(s).transform).m11}}}})()")
    p.mouse.move(400, 300); p.mouse.wheel(0, 380); p.wait_for_timeout(1500)
    mid = p.evaluate(f"(()=>{{const t={col},s={stk};return {{ty:new DOMMatrix(getComputedStyle(t).transform).m42,o:+getComputedStyle(t).opacity,sc:new DOMMatrix(getComputedStyle(s).transform).m11,cue:+getComputedStyle(document.querySelector('.scroll-cue').closest('[aria-hidden]')).opacity}}}})()")
    rec("H3 scroll exit: text drifts up and fades, stack shrinks, scroll cue gone", mid["ty"] < -5 and mid["o"] < 0.9 and mid["sc"] < 0.99 and mid["cue"] < 0.1, f"start={base} mid={mid}")
    p.mouse.wheel(0, -2000); p.wait_for_timeout(2000)
    back = p.evaluate(f"(()=>{{const t={col};return {{ty:new DOMMatrix(getComputedStyle(t).transform).m42,o:+getComputedStyle(t).opacity}}}})()")
    rec("H3b scrolling back restores the hero", abs(back["ty"]) < 1 and back["o"] > 0.98, str(back))
    rec("H4 3D stack still takes over in the new hero", wait_state(p, "on", 25000), state(p))
    p.wait_for_timeout(600); rec("H5 desktop: no horizontal overflow, CLS < 0.01", overflow(p) <= 0 and p.evaluate("window.__cls") < 0.01, f"overflow={overflow(p)} cls={p.evaluate('window.__cls'):.4f}")
    p.screenshot(path="/home/claude/t/b_hero_desktop.png")
    real = [e for e in errs if "Failed to load resource" not in e]; rec("H6 desktop: no console errors/warnings", not real, "; ".join(real)[:250]); c.close()

    # ================= HEADINGS
    c = ctx(b, init=[CAPABLE]); p = c.new_page(); errs = watch(p); p.goto(NEW); p.wait_for_selector("#top h1"); p.wait_for_timeout(3500)
    n = p.locator("section h2").count(); H = p.evaluate("document.documentElement.scrollHeight"); y = 0
    while y < H: p.mouse.wheel(0, 450); p.wait_for_timeout(260); y += 450
    p.wait_for_timeout(1500)
    info = p.evaluate("[...document.querySelectorAll('section h2')].map(h=>({sr:h.querySelector('.sr-only')?.textContent,words:[...h.querySelectorAll('[aria-hidden=true] > span > span')].map(w=>new DOMMatrix(getComputedStyle(w).transform).m42)}))")
    rec("S1 every section heading is announced once and fully revealed after scroll", n >= 6 and all(i["sr"] and i["words"] and all(abs(v) < 0.5 for v in i["words"]) for i in info), f"{n} headings: " + "; ".join((i["sr"] or "")[:22] for i in info))
    rule = p.evaluate("[...document.querySelectorAll('section h2 + span')].map(s=>new DOMMatrix(getComputedStyle(s).transform).m11)")
    rec("S2 heading rules finish drawing", rule and all(v > 0.99 for v in rule), str(rule)); c.close()

    # ================= REDUCED MOTION
    c = ctx(b, reduced=True, init=[CAPABLE]); p = c.new_page(); errs = watch(p); p.goto(NEW); p.wait_for_selector("#top h1"); p.wait_for_timeout(4500)
    st = p.evaluate(f"(()=>{{const t={col};const C=[...document.querySelectorAll('#top .mt-10 > div')];return {{ty:new DOMMatrix(getComputedStyle(t).transform).m42,cta:C.map(x=>+getComputedStyle(x).opacity),split:document.querySelectorAll('#top p.font-display [aria-hidden]').length,rings:[...document.querySelectorAll('#top > svg path')].map(x=>getComputedStyle(x).strokeDashoffset)}}}})()")
    p.mouse.wheel(0, 380); p.wait_for_timeout(1200)
    sc = p.evaluate(f"(()=>{{const t={col};return {{ty:new DOMMatrix(getComputedStyle(t).transform).m42,o:+getComputedStyle(t).opacity}}}})()")
    rec("R1 reduced motion: hero fully visible, plain tagline, rings drawn", all(o > 0.98 for o in st["cta"]) and st["split"] == 0 and all(float(r.replace('px','')) == 0 for r in st["rings"]), str(st))
    rec("R2 reduced motion: no scroll-linked hero movement", abs(sc["ty"]) < 0.5 and sc["o"] > 0.98, str(sc))
    p.evaluate("window.scrollTo(0,0)"); p.wait_for_timeout(300); p.mouse.wheel(0, 3000); p.wait_for_timeout(1500)
    hh = p.evaluate("[...document.querySelectorAll('section h2')].map(h=>({v:h.getBoundingClientRect().height>0,plain:h.querySelectorAll('[aria-hidden]').length===0}))")
    rec("R3 reduced motion: headings are plain text", all(x["plain"] for x in hh), ""); 
    p.set_viewport_size({"width": 390, "height": 844}); p.evaluate("window.scrollTo(0,0)"); p.wait_for_timeout(500)
    p.locator('button[aria-label="Open menu"]').click(); p.wait_for_timeout(500)
    lk = p.evaluate("[...document.querySelectorAll('#mobile-menu nav a')].map(a=>({ty:new DOMMatrix(getComputedStyle(a).transform).m42,o:+getComputedStyle(a).opacity}))")
    rec("R4 reduced motion: mobile menu opens with a fade only", len(lk) == 5 and all(abs(x["ty"]) < 0.5 and x["o"] > 0.9 for x in lk), str(lk)[:120])
    rec("R5 reduced motion: no console errors", not [e for e in errs if "Failed to load" not in e]); c.close()

    # ================= MOBILE
    c = ctx(b, 390, 844, mobile=True, init=[CAPABLE, CLS]); p = c.new_page(); errs = watch(p); p.goto(NEW); p.wait_for_selector("#top h1"); p.wait_for_timeout(5500)
    rec("M0 mobile 390: backdrop hidden, no overflow, CLS < 0.01", p.evaluate("getComputedStyle(document.querySelector('#top > svg')).display")=="none" and overflow(p) <= 0 and p.evaluate("window.__cls") < 0.01, f"overflow={overflow(p)} cls={p.evaluate('window.__cls'):.4f}")
    wait_state(p, "on", 25000); p.wait_for_timeout(500); p.screenshot(path="/home/claude/t/b_hero_mobile.png")
    tg = p.locator('button[aria-label="Open menu"]'); tg.tap(); p.wait_for_timeout(110)
    r1 = p.evaluate("parseFloat(/circle\\(([\\d.]+)px/.exec(getComputedStyle(document.getElementById('mobile-menu')).clipPath)?.[1]||'-1')")
    p.wait_for_timeout(230); st1 = p.evaluate("[...document.querySelectorAll('#mobile-menu nav a')].map(a=>Math.abs(new DOMMatrix(getComputedStyle(a).transform).m42))")
    p.wait_for_timeout(1700)
    r2 = p.evaluate("parseFloat(/circle\\(([\\d.]+)px/.exec(getComputedStyle(document.getElementById('mobile-menu')).clipPath)?.[1]||'-1')")
    st2 = p.evaluate("[...document.querySelectorAll('#mobile-menu nav a')].map(a=>Math.abs(new DOMMatrix(getComputedStyle(a).transform).m42))")
    rec("M1 menu opens as a growing circular reveal (still growing at 110ms, full-screen at the end)", 0 <= r1 < r2 - 100 and r2 > 1000, f"radius {r1:.0f}px -> {r2:.0f}px")
    rec("M2 menu links arrive staggered, then all settle", max(st1) > 1 and min(st1) < max(st1) + 0.001 and all(v < 0.5 for v in st2), f"mid={[round(v) for v in st1]} end={[round(v) for v in st2]}")
    foc = p.evaluate("document.activeElement.getAttribute('aria-label')"); rec("M3 focus moves into the menu", foc == "Close menu", str(foc))
    inside = True
    for _ in range(9):
        p.keyboard.press("Tab"); inside &= p.evaluate("document.getElementById('mobile-menu').contains(document.activeElement)")
    p.keyboard.press("Escape"); p.wait_for_timeout(1200)
    back = p.evaluate("document.activeElement.getAttribute('aria-label')")
    rec("M4 focus stays trapped; Escape closes and returns focus to the button", inside and p.locator("#mobile-menu").count() == 0 and back == "Open menu", f"trapped={inside} focus={back}")
    tg.tap(); p.wait_for_timeout(1500); p.locator('#mobile-menu nav a', has_text="Stack").tap(); p.wait_for_timeout(2200)
    rec("M5 menu link closes the menu and scrolls to the section", p.locator("#mobile-menu").count() == 0 and -40 <= p.evaluate("document.getElementById('stack').getBoundingClientRect().top") <= 300, f"scrollY={p.evaluate('scrollY'):.0f}")
    rec("M6 mobile: no console errors/warnings", not [e for e in errs if "Failed to load" not in e], "; ".join(e for e in errs if "Failed to load" not in e)[:200]); c.close()

    # ================= TABLET
    c = ctx(b, 768, 1024, mobile=True, init=[CAPABLE]); p = c.new_page(); errs = watch(p); p.goto(NEW); p.wait_for_selector("#top h1"); p.wait_for_timeout(5000)
    rec("T1 tablet 768: no overflow, no console errors", overflow(p) <= 0 and not [e for e in errs if "Failed to load" not in e], f"overflow={overflow(p)}"); p.screenshot(path="/home/claude/t/b_hero_tablet.png"); c.close()

    # ================= LINK OPTION
    c = ctx(b, init=[CAPABLE]); p = c.new_page(); p.goto(NEW); p.wait_for_selector("#top h1"); p.wait_for_timeout(3000)
    html = p.content()
    rec("L1 default data: no project link buttons, no dev hint in production", p.locator("#work a[target=_blank]").count() == 0 and "Dev: set githubUrl" not in html, ""); c.close()
    c = ctx(b, init=[CAPABLE]); p = c.new_page(); p.goto(LINKS); p.wait_for_selector("#top h1"); p.wait_for_timeout(3000); p.locator("#work").scroll_into_view_if_needed(); p.wait_for_timeout(500)
    arts = p.locator("#work article")
    a0 = arts.nth(0).locator("a[target=_blank]"); hrefs0 = [a0.nth(i).get_attribute("href") for i in range(a0.count())]
    rec("L2a project with GitHub + live URLs shows exactly those two buttons", hrefs0 == ["https://github.com/example-owner/example-repo", "https://example.com/demo"], str(hrefs0))
    rels = a0.evaluate_all("els=>els.map(e=>[e.target,e.rel])"); rec("L2b links open safely (new tab, noopener noreferrer)", all(t == "_blank" and "noopener" in r and "noreferrer" in r for t, r in rels), str(rels))
    nm = a0.nth(0).evaluate("e=>e.textContent.replace(/\\s+/g,' ').trim()"); rec("L2c accessible name says what and where", nm == "GitHub for Kaara Saaram (opens in a new tab)", nm)
    rec("L2d javascript: URL is rejected (no button rendered)", arts.nth(1).locator("a[target=_blank]").count() == 0 and "javascript:" not in p.content(), "")
    rec("L2e a project without any link keeps no empty action row", arts.nth(3).locator("a[target=_blank]").count() == 0 and arts.nth(3).locator("div.border-t").count() == 0, "")
    c.route("https://github.com/**", lambda r: r.fulfill(body="stub", content_type="text/html"))
    with c.expect_page() as pg: a0.nth(0).click()
    newp = pg.value; newp.wait_for_load_state(); rec("L2f clicking GitHub opens the configured destination", newp.url == "https://github.com/example-owner/example-repo", newp.url); c.close()
    # script behaviour
    d = subprocess.run(["node", "scripts/check-links.mjs"], cwd="/home/claude/s7/portfolio", capture_output=True, text=True)
    rec("L3a check:links (default data) exits 0 and lists missing links", d.returncode == 0 and d.stdout.count("missing") >= 12, f"exit={d.returncode}")
    d = subprocess.run(["node", "scripts/check-links.mjs"], cwd="/home/claude/s7/linktest", capture_output=True, text=True)
    rec("L3b check:links rejects the javascript: URL (exit 1)", d.returncode == 1 and "not a valid http(s) URL" in d.stdout, f"exit={d.returncode}")
    d = subprocess.run(["node", "scripts/check-links.mjs", "--online"], cwd="/home/claude/s7/linktest", capture_output=True, text=True)
    lim = "rate limit reached" in d.stdout; ex = "repository exists" in d.stdout; nf = "repository not found (404)" in d.stdout
    rec("L3c check:links --online handles GitHub rate limiting without misreporting repos as missing", d.returncode == 1 and (lim or (ex and nf)) and "repository not found" not in d.stdout.replace("repository not found (404)", "") , ("rate-limited" if lim else "ex=%s nf=%s" % (ex, nf)) + " | exit=%d" % d.returncode)
    b.close()
f = [r for r in results if not r[1]]; print(f"\nSTAGE B TOTAL {len(results)}  PASS {len(results)-len(f)}  FAIL {len(f)}")
