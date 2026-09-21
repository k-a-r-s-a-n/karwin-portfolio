const puppeteer = require("puppeteer-core");
const chromium = require("@sparticuz/chromium").default;
const { execSync } = require("child_process");
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
  const browser = await puppeteer.launch({
    executablePath: await chromium.executablePath(),
    args: [...chromium.args, "--headless=new"],
    headless: "new",
    defaultViewport: { width: 1280, height: 800 },
  });
  const page = await browser.newPage();
  await page.evaluateOnNewDocument(() => {
    const orig = window.matchMedia.bind(window);
    window.matchMedia = (q) => {
      if (typeof q === "string" && q.includes("pointer: fine")) {
        return { matches: true, media: q, onchange: null,
          addEventListener: () => {}, removeEventListener: () => {},
          addListener: () => {}, removeListener: () => {}, dispatchEvent: () => false };
      }
      return orig(q);
    };
  });
  await page.goto("http://localhost:3000", { waitUntil: "networkidle0" });
  await sleep(4500);

  // Scroll to a quiet part of the About section (no text/3D behind).
  await page.evaluate(() => {
    const el = document.getElementById("work");
    el && (window.scrollTo ? el.scrollIntoView({ behavior: "instant" }) : 0);
  });
  await sleep(800);

  async function probe(x, y, label) {
    await page.mouse.move(x, y, { steps: 12 });
    await sleep(150);
    const S = 30; // half-size of crop
    const scrollY = await page.evaluate(() => window.scrollY);
    await page.screenshot({
      path: `/tmp/probe-${label}.png`,
      clip: { x: x - S, y: y - S + scrollY, width: S * 2, height: S * 2 },
      captureBeyondViewport: false,
    });
    const maxima = execSync(
      `convert /tmp/probe-${label}.png -colorspace gray -format "%[fx:maxima]" info:`
    ).toString();
    console.log(`${label}: pointer=(${x},${y}) maxBrightness=${maxima} -> ${parseFloat(maxima) > 0.8 ? "CURSOR VISIBLE & TRACKING" : "NOT FOUND"}`);
    return parseFloat(maxima) > 0.8;
  }

  const a = await probe(1000, 300, "A");
  // idle, then jump somewhere else — the staleness scenario
  await sleep(1200);
  const b = await probe(300, 600, "B");
  await sleep(1200);
  const c = await probe(640, 200, "C");

  console.log(a && b && c ? "\nVISUAL TRACKING: ALL PASS" : "\nVISUAL TRACKING: FAILURES");
  await browser.close();
  process.exit(a && b && c ? 0 : 1);
})();
