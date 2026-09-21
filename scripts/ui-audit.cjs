/* Real-browser forensic audit v2 — cursor tracking, staleness, clicks. */
const puppeteer = require("puppeteer-core");
const chromium = require("@sparticuz/chromium").default;

const URL = "http://localhost:3000";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
  const browser = await puppeteer.launch({
    executablePath: await chromium.executablePath(),
    args: [...chromium.args, "--headless=new", "--force-device-scale-factor=2"],
    headless: "new",
    defaultViewport: { width: 1280, height: 800, deviceScaleFactor: 2 },
  });

  const page = await browser.newPage();
  page.on("pageerror", (e) => console.log("[PAGEERROR]", e.message.slice(0, 200)));

  // Force pointer:fine so the custom cursor activates in headless.
  await page.evaluateOnNewDocument(() => {
    const orig = window.matchMedia.bind(window);
    window.matchMedia = (q) => {
      if (typeof q === "string" && q.includes("pointer: fine")) {
        return {
          matches: true,
          media: q,
          onchange: null,
          addEventListener: () => {},
          removeEventListener: () => {},
          addListener: () => {},
          removeListener: () => {},
          dispatchEvent: () => false,
        };
      }
      return orig(q);
    };
  });

  await page.goto(URL, { waitUntil: "networkidle0", timeout: 60000 });
  await sleep(4500); // boot curtain

  const report = [];
  const check = (name, ok, detail = "") => {
    report.push([name, ok]);
    console.log(`${ok ? "PASS" : "FAIL"}  ${name} ${detail}`);
  };

  // ── 1. Cursor active, native hidden ──
  const state = await page.evaluate(() => ({
    active: document.documentElement.classList.contains("cursor-active"),
    htmlCursor: getComputedStyle(document.documentElement).cursor,
    linkCursor: (() => {
      const a = document.querySelector("a");
      return a ? getComputedStyle(a).cursor : "?";
    })(),
    canvases: document.querySelectorAll(".cursor-canvas").length,
  }));
  check("cursor active", state.active);
  check("html cursor none", state.htmlCursor === "none");
  check("links inherit cursor none", state.linkCursor === "none", `got ${state.linkCursor}`);
  check("exactly one cursor canvas", state.canvases === 1);

  // ── 2. Fresh move → head exactly on pointer ──
  async function probeHead(px, py) {
    return page.evaluate(
      ([tx, ty]) => {
        const canvas = document.querySelector(".cursor-canvas");
        const sample = document.createElement("canvas");
        sample.width = canvas.width;
        sample.height = canvas.height;
        const sctx = sample.getContext("2d");
        sctx.drawImage(canvas, 0, 0);
        const dpr = window.devicePixelRatio || 1;
        // Search the WHOLE canvas for the whitest core pixel (the head).
        const img = sctx.getImageData(0, 0, sample.width, sample.height);
        let best = { v: -1, x: -1, y: -1 };
        for (let yy = 0; yy < img.height; yy += 2)
          for (let xx = 0; xx < img.width; xx += 2) {
            const i = (yy * img.width + xx) * 4;
            const r = img.data[i], g = img.data[i + 1], b = img.data[i + 2];
            // near-white core: high all channels
            const white = r + g + b - Math.abs(r - g) - Math.abs(g - b);
            if (white > best.v) best = { v: white, x: xx / dpr, y: yy / dpr };
          }
        return { found: best.v > 300, x: best.x, y: best.y, dist: Math.hypot(best.x - tx, best.y - ty) };
      },
      [px, py]
    );
  }

  // move to A, settle, then move to B and probe immediately (staleness test)
  await page.mouse.move(300, 300, { steps: 10 });
  await sleep(800); // idle — old cursor would freeze here
  await page.mouse.move(950, 550, { steps: 15 });
  await sleep(120);
  const headB = await probeHead(950, 550);
  check("head tracks after idle→move (no staleness)", headB.found && headB.dist < 2, JSON.stringify(headB));

  await page.mouse.move(200, 650, { steps: 15 });
  await sleep(120);
  const headC = await probeHead(200, 650);
  check("head tracks second jump", headC.found && headC.dist < 2, JSON.stringify(headC));

  // ── 3. pointerState matches for physics ──
  const ps = await page.evaluate(() => window.__karwinCursor?.state ?? null);
  check("debug state alive", !!ps, ps ? JSON.stringify(ps) : "missing");

  // ── 4. Navbar clicks at desktop width ──
  const navLink = await page.evaluate(() => {
    const links = Array.from(document.querySelectorAll("header nav a"));
    const el = links.find((a) => a.textContent.includes("Work"));
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
  });
  if (navLink) {
    await page.mouse.click(navLink.x, navLink.y);
    await sleep(1600);
    const y = await page.evaluate(() => window.scrollY);
    check("desktop nav 'Work' click scrolls", y > 500, `scrollY=${y}`);
  } else {
    check("desktop nav 'Work' click scrolls", false, "link not found");
  }

  // ── 5. Hamburger at narrow width ──
  await page.setViewport({ width: 640, height: 800, deviceScaleFactor: 2 });
  await sleep(600);
  await page.evaluate(() => window.scrollTo(0, 0));
  await sleep(400);
  const burger = await page.evaluate(() => {
    const el = document.querySelector("button[aria-controls='mobile-menu']");
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return { x: r.x + r.width / 2, y: r.y + r.height / 2, w: r.width };
  });
  if (burger && burger.w > 0) {
    await page.mouse.click(burger.x, burger.y);
    await sleep(600);
    const open = await page.evaluate(() => !!document.getElementById("mobile-menu"));
    check("hamburger opens menu @640px", open);
    if (open) {
      // click a menu link — it should close the menu AND scroll
      const link = await page.evaluate(() => {
        const el = document.querySelector("#mobile-menu a[href='#work']");
        if (!el) return null;
        const r = el.getBoundingClientRect();
        return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
      });
      if (link) {
        await page.mouse.click(link.x, link.y);
        await sleep(1600);
        const closed = await page.evaluate(() => !document.getElementById("mobile-menu"));
        const y = await page.evaluate(() => window.scrollY);
        check("menu link closes menu + scrolls", closed && y > 300, `closed=${closed} scrollY=${y}`);
      }
    }
  } else {
    check("hamburger opens menu @640px", false, "burger not visible");
  }

  // ── 6. Visual proof screenshot ──
  await page.setViewport({ width: 1280, height: 800, deviceScaleFactor: 2 });
  await sleep(500);
  await page.evaluate(() => window.scrollTo(0, 0));
  await sleep(400);
  await page.mouse.move(640, 400, { steps: 20 });
  await sleep(150);
  await page.screenshot({ path: "/tmp/cursor-proof.png", clip: { x: 390, y: 150, width: 500, height: 500 } });

  console.log("\n══════ SUMMARY ══════");
  const fails = report.filter(([, ok]) => !ok).length;
  for (const [name, ok] of report) if (!ok) console.log("FAILED:", name);
  console.log(fails === 0 ? "ALL UI CHECKS PASSED" : `${fails} FAILURES`);

  await browser.close();
  process.exit(fails === 0 ? 0 : 1);
})().catch((e) => {
  console.error("AUDIT CRASHED:", e);
  process.exit(1);
});
