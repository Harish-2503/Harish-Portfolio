import sys, json, io, time
from playwright.sync_api import sync_playwright
from PIL import Image

NEW, BASE = "http://localhost:4173/", "http://localhost:4174/"
CAPABLE = "Object.defineProperty(navigator,'hardwareConcurrency',{get:()=>8});"
CLS = "window.__cls=0;new PerformanceObserver(l=>{for(const e of l.getEntries())if(!e.hadRecentInput)window.__cls+=e.value}).observe({type:'layout-shift',buffered:true});"
results = []
def rec(name, ok, detail=""):
    results.append((name, ok, detail)); print(("PASS " if ok else "FAIL ") + name + (f"  [{detail}]" if detail else ""), flush=True)

def ctx(b, w=1280, h=800, mobile=False, reduced=False, init=()):
    c = b.new_context(viewport={"width": w, "height": h}, has_touch=mobile, is_mobile=mobile,
                      reduced_motion="reduce" if reduced else "no-preference", device_scale_factor=1)
    for s in init: c.add_init_script(s)
    return c

def watch(page):
    errs = []
    page.on("console", lambda m: errs.append(m.text) if m.type in ("error", "warning") else None)
    page.on("pageerror", lambda e: errs.append("PAGEERROR " + str(e)))
    return errs

def state(page): return page.locator("[data-stack3d]").get_attribute("data-stack3d")
def wait_state(page, want, timeout=20000):
    try: page.wait_for_function(f"document.querySelector('[data-stack3d]')?.dataset.stack3d==='{want}'", timeout=timeout); return True
    except Exception: return False
def overflow(page): return page.evaluate("document.documentElement.scrollWidth - window.innerWidth")
def shot(page): return Image.open(io.BytesIO(page.screenshot())).convert("RGB")
def rect(page): return page.evaluate("(()=>{const r=document.querySelector('[data-stack3d]').getBoundingClientRect();return {x:r.left,y:r.top,w:r.width,h:r.height}})()")
def at(img, r, sx, sy, vw):  # svg-space point -> pixel colour
    return img.getpixel((int(r["x"] + sx * r["w"] / vw), int(r["y"] + sy * r["h"] / 500)))
def polys_hidden(page): return page.evaluate("[...document.querySelectorAll('[data-stack3d] svg polygon')].every(p=>getComputedStyle(p).display==='none')")
def polys_visible(page): return page.evaluate("[...document.querySelectorAll('[data-stack3d] svg polygon')].every(p=>getComputedStyle(p).display!=='none')")

def regression(b, url, tag, w=1280, h=800, mobile=False):
    c = ctx(b, w, h, mobile, init=[CAPABLE]); p = c.new_page(); errs = watch(p)
    p.goto(url); p.wait_for_selector("#top h1", timeout=20000); p.wait_for_timeout(3500)
    ids = ["top", "work", "stack", "about", "journey", "recognition", "contact"]
    rec(f"[{tag}] sections present", all(p.locator(f"#{i}").count() == 1 for i in ids))
    rec(f"[{tag}] no horizontal overflow ({w}px)", overflow(p) <= 0, f"delta={overflow(p)}")
    if not mobile:
        nav = p.locator('nav[aria-label="Primary"] a[href^="#"]'); n = nav.count(); good = 0
        for i in range(n):
            href = nav.nth(i).get_attribute("href"); nav.nth(i).click(); p.wait_for_timeout(1800)
            top = p.evaluate(f"document.querySelector('{href}').getBoundingClientRect().top")
            good += -40 <= top <= 300
        rec(f"[{tag}] primary nav anchors scroll to sections", n > 0 and good == n, f"{good}/{n}")
        st = p.locator("[data-xray-stage]").first; st.scroll_into_view_if_needed(); st.focus()
        p.keyboard.press("Enter"); p.wait_for_timeout(300); a = st.get_attribute("data-xray-on")
        p.keyboard.press("ArrowRight"); p.keyboard.press("ArrowDown"); p.keyboard.press("Escape"); p.wait_for_timeout(300)
        b2 = st.get_attribute("data-xray-on")
        rec(f"[{tag}] X-Ray Lens keyboard: Enter opens, Escape closes", a == "true" and b2 == "false", f"after Enter={a}, after Esc={b2}")
        btn = p.locator("[data-xray-stage]").first.locator("xpath=following::button[@aria-pressed][1]"); btn.click(); p.wait_for_timeout(300)
        on = btn.get_attribute("aria-pressed"); btn.click(); p.wait_for_timeout(300)
        rec(f"[{tag}] X-Ray Lens toggle button", on == "true" and btn.get_attribute("aria-pressed") == "false")
        rows = p.locator("#stack button[aria-expanded]"); rows.first.scroll_into_view_if_needed(); p.wait_for_timeout(500)
        init = rows.first.get_attribute("aria-expanded"); rows.first.click(); p.wait_for_timeout(500); a = rows.first.get_attribute("aria-expanded")
        rows.nth(2).click(); p.wait_for_timeout(500); c3 = rows.nth(2).get_attribute("aria-expanded"); d = rows.nth(0).get_attribute("aria-expanded")
        rows.first.focus(); p.keyboard.press("ArrowDown"); p.wait_for_timeout(300)
        moved = p.evaluate("document.activeElement.id.endsWith('-h-interface')")
        rec(f"[{tag}] Stack Explorer: click toggles, other row switches, ArrowDown moves focus", a != init and c3 == "true" and d == "false" and moved, f"initial={init} after_click={a}")
    else:
        p.locator('button[aria-label="Open menu"]').click(); p.wait_for_timeout(600)
        rec(f"[{tag}] mobile menu opens", p.locator("#mobile-menu").is_visible())
    real = [e for e in errs if "Failed to load resource" not in e]
    rec(f"[{tag}] no console errors/warnings", not real, "; ".join(real)[:200])
    c.close()

if __name__ == "__main__":
    with sync_playwright() as pw:
        b = pw.chromium.launch(args=["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"])
        # ---------- A. default sandbox (1 core) -> low-end gate keeps SVG
        c = ctx(b); p = c.new_page(); errs = watch(p); p.goto(NEW); p.wait_for_selector("[data-stack3d]"); p.wait_for_timeout(6000)
        rec("A low-end gate (1 core, no override): stays on SVG, no canvas", state(p) == "svg" and p.locator("[data-stack3d] canvas").count() == 0 and polys_visible(p), state(p))
        c.close()
        # ---------- B. desktop 3D
        c = ctx(b, init=[CAPABLE, CLS]); p = c.new_page(); errs = watch(p); reqs = []
        p.on("request", lambda r: reqs.append(r.url) if "LayerStack3D" in r.url else None)
        p.goto(NEW); p.wait_for_selector("[data-stack3d]", timeout=20000)
        p.wait_for_function("document.querySelector('[data-stack3d]').dataset.stack3d!=='idle'", timeout=20000) if False else None
        # wait for SVG entrance to finish, capture SVG reference shot
        p.wait_for_timeout(100)
        t0 = time.time()
        while state(p) in ("idle",) and time.time() - t0 < 8: p.wait_for_timeout(100)
        r0 = rect(p)
        ok_on = wait_state(p, "on", 25000)
        rec("B1 desktop: 3D scene loads and takes over", ok_on, state(p))
        if ok_on:
            p.wait_for_timeout(900); r1 = rect(p); img3d = shot(p)
            rec("B2 desktop: no layout shift (container rect unchanged)", all(abs(r0[k] - r1[k]) < 0.6 for k in r0), f"{r0} -> {r1}")
            rec("B3 desktop: SVG slabs hidden, canvas present, labels still in DOM", polys_hidden(p) and p.locator("[data-stack3d] canvas").count() == 1 and p.locator("[data-stack3d] svg text").count() == 8)
            rec("B4 desktop: accessible name retained on SVG, canvas layer aria-hidden", p.locator("[data-stack3d] svg[role=img] title").text_content().startswith("Four stacked layers") and p.evaluate("document.querySelector('[data-stack3d] canvas').closest('[aria-hidden=true]')!==null"))
            rec("B5 desktop: 3D chunk requested only once, after load", len(reqs) == 1, str(len(reqs)))
            rec("B6 desktop: CLS", p.evaluate("window.__cls") < 0.01, f"{p.evaluate('window.__cls'):.4f}")
            rec("B7 desktop: no horizontal overflow", overflow(p) <= 0)
            # colour fidelity vs the SVG: take an SVG-only reference with the same page, canvas hidden
            p.evaluate("document.querySelector('[data-stack3d] canvas').parentElement.style.display='none';document.querySelectorAll('[data-stack3d] svg polygon').forEach(x=>x.style.display='inline')")
            p.wait_for_timeout(200); imgsvg = shot(p)
            p.evaluate("document.querySelector('[data-stack3d] canvas').parentElement.style.display='';document.querySelectorAll('[data-stack3d] svg polygon').forEach(x=>x.style.display='')"); p.wait_for_timeout(200)
            pts = {"Design top": (220, 140), "Design left": (120, 205), "Design right": (320, 205), "Data left": (120, 413), "Data right": (320, 413)}
            diffs = {}
            for k, (x, y) in pts.items():
                a = at(img3d, r1, x, y, 600); s = at(imgsvg, r1, x, y, 600); diffs[k] = (a, s, max(abs(i - j) for i, j in zip(a, s)))
            worst = max(v[2] for v in diffs.values())
            rec("B8 colour fidelity vs SVG (max channel delta <= 24)", worst <= 24, json.dumps({k: {"3d": v[0], "svg": v[1], "d": v[2]} for k, v in diffs.items()}))
            Image.open(io.BytesIO(p.screenshot())).save("/home/claude/t/desktop_3d.png"); imgsvg.save("/home/claude/t/desktop_svg.png")
            # hover tilt
            before = shot(p); p.mouse.move(1150, 150, steps=8); p.wait_for_timeout(900); after = shot(p)
            from PIL import ImageChops
            bb = ImageChops.difference(before.crop((int(r1["x"]), int(r1["y"]), int(r1["x"] + r1["w"]), int(r1["y"] + r1["h"]))), after.crop((int(r1["x"]), int(r1["y"]), int(r1["x"] + r1["w"]), int(r1["y"] + r1["h"])))).getbbox()
            rec("B9 desktop: pointer tilt redraws the 3D stack", bb is not None, str(bb)); after.save("/home/claude/t/desktop_tilt.png")
            p.mouse.move(640, 400); p.wait_for_timeout(900)
            # B10 context loss
            p.evaluate("document.querySelector('[data-stack3d] canvas').dispatchEvent(new Event('webglcontextlost',{cancelable:true}))"); p.wait_for_timeout(800)
            rec("B10 runtime failure (webglcontextlost): back to SVG, canvas removed", state(p) == "svg" and p.locator("[data-stack3d] canvas").count() == 0 and polys_visible(p), state(p))
        real = [e for e in errs if "Failed to load resource" not in e]
        rec("B11 desktop: no console errors/warnings", not real, "; ".join(real)[:300])
        c.close()
        # ---------- C. mobile 3D
        c = ctx(b, 390, 844, mobile=True, init=[CAPABLE, CLS]); p = c.new_page(); errs = watch(p); p.goto(NEW); p.wait_for_selector("[data-stack3d]", timeout=20000)
        ok = wait_state(p, "on", 25000); rec("C1 mobile 390px: 3D scene loads", ok, state(p))
        if ok:
            p.wait_for_timeout(800); rec("C2 mobile: no horizontal overflow", overflow(p) <= 0, f"delta={overflow(p)}")
            rec("C3 mobile: CLS", p.evaluate("window.__cls") < 0.01, f"{p.evaluate('window.__cls'):.4f}")
            r = rect(p); rec("C4 mobile: stack fits viewport", r["x"] >= 0 and r["x"] + r["w"] <= 390, str(r))
            p.touchscreen.tap(195, 300); p.wait_for_timeout(300); y0 = p.evaluate("scrollY"); p.mouse.wheel(0, 400); p.wait_for_timeout(1200)
            rec("C5 mobile: canvas does not block scrolling", p.evaluate("scrollY") > y0, f"{y0} -> {p.evaluate('scrollY')}")
            Image.open(io.BytesIO(p.screenshot())).save("/home/claude/t/mobile_3d.png")
        real = [e for e in errs if "Failed to load resource" not in e]; rec("C6 mobile: no console errors/warnings", not real, "; ".join(real)[:300]); c.close()
        # ---------- D. reduced motion
        c = ctx(b, reduced=True, init=[CAPABLE]); p = c.new_page(); errs = watch(p); reqs = []
        p.on("request", lambda r: reqs.append(r.url) if "LayerStack3D" in r.url else None); p.goto(NEW); p.wait_for_selector("[data-stack3d]"); p.wait_for_timeout(6000)
        rec("D1 prefers-reduced-motion: SVG only, no canvas, 3D chunk never requested", state(p) == "svg" and p.locator("canvas").count() == 0 and not reqs and polys_visible(p), f"{state(p)} reqs={len(reqs)}")
        rec("D2 reduced motion: no console errors", not [e for e in errs if "Failed to load" not in e]); c.close()
        # ---------- E. WebGL unavailable
        stub = "const g=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(t,...a){return /webgl/.test(t)?null:g.call(this,t,...a)};"
        c = ctx(b, init=[CAPABLE, stub]); p = c.new_page(); errs = watch(p); reqs = []
        p.on("request", lambda r: reqs.append(r.url) if "LayerStack3D" in r.url else None); p.goto(NEW); p.wait_for_selector("[data-stack3d]"); p.wait_for_timeout(6000)
        rec("E1 WebGL unavailable: SVG only, chunk never requested, no errors", state(p) == "svg" and p.locator("canvas").count() == 0 and not reqs and polys_visible(p) and not [e for e in errs if "Failed to load" not in e], f"{state(p)} reqs={len(reqs)}"); c.close()
        # ---------- F. chunk fails to load
        c = ctx(b, init=[CAPABLE]); p = c.new_page(); errs = watch(p); p.route("**/LayerStack3D-*.js", lambda r: r.abort()); p.goto(NEW); p.wait_for_selector("[data-stack3d]"); p.wait_for_timeout(6000)
        rec("F1 3D chunk fails to load: SVG remains, page intact", state(p) == "svg" and polys_visible(p) and p.locator("#top h1").count() == 1, state(p)); c.close()
        # ---------- G. WebGL init throws inside the 3D component (renderer creation fails)
        brk = "const g=HTMLCanvasElement.prototype.getContext;let n=0;HTMLCanvasElement.prototype.getContext=function(t,...a){if(/webgl/.test(t)){if(n++<1)return g.call(this,t,...a);return null}return g.call(this,t,...a)};"
        c = ctx(b, init=[CAPABLE, brk]); p = c.new_page(); errs = watch(p); p.goto(NEW); p.wait_for_selector("[data-stack3d]"); p.wait_for_timeout(8000)
        rec("G1 renderer init fails after probe passes: error boundary -> SVG", state(p) == "svg" and polys_visible(p) and p.locator("#top h1").count() == 1, state(p)); c.close()
        # ---------- H. regression on new build and on untouched Stage 5 build
        regression(b, NEW, "new d1280"); regression(b, BASE, "stage5 d1280")
        regression(b, NEW, "new m390", 390, 844, True); regression(b, BASE, "stage5 m390", 390, 844, True)
        b.close()
    f = [r for r in results if not r[1]]
    print(f"\nTOTAL {len(results)}  PASS {len(results) - len(f)}  FAIL {len(f)}")
    json.dump(results, open("/home/claude/t/results.json", "w"))
