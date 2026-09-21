const puppeteer = require("puppeteer-core");
const chromium = require("@sparticuz/chromium").default;
const { execSync } = require("child_process");
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
  const browser = await puppeteer.launch({
    executablePath: await chromium.executablePath(),
    args: ["--headless=new", "--no-sandbox", "--disable-gpu", "--disable-software-rasterizer"],
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

  // Quiet area: scroll to the gap between projects and stack.
  await page.evaluate(() => {
    const el = document.getElementById("stack");
    el && el.scrollIntoView({ behavior: "instant", block: "center" });
    window.scrollBy(0, -200);
  });
  await sleep(900);

  let allPass = true;
  for (const [x, y, label] of [[1050, 650, "A"], [250, 250, "B"], [640, 550, "C"]]) {
    await page.mouse.move(x, y, { steps: 14 });
    await sleep(200);
    await page.screenshot({ path: `/tmp/full-${label}.png` });
    // Is there a near-white pixel (the head core) within 20px of the pointer?
    // Crop from the FULL screenshot (viewport coords) around the pointer.
    const maxima = parseFloat(
      execSync(
        `convert /tmp/full-${label}.png -crop 40x40+${x - 20}+${y - 20} -colorspace gray -format "%[fx:maxima]" info:`
      ).toString().trim()
    );
    const ok = maxima > 0.8; // head core is 0.95 white; idle elements stay dark here
    if (!ok) allPass = false;
    console.log(`${label}: pointer=(${x},${y}) cropMax=${maxima} -> ${ok ? "PASS" : "FAIL"}`);
  }
  console.log(allPass ? "\nVISUAL TRACKING: ALL PASS" : "\nVISUAL TRACKING: FAILED");
  await browser.close();
  process.exit(allPass ? 0 : 1);
})();
