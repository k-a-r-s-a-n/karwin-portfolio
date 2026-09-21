/* Simulates the user's broken state: a JS chunk fails to load.
   Verifies the page STILL becomes visible + scrollable within the failsafe window. */
const puppeteer = require("puppeteer-core");
const chromium = require("@sparticuz/chromium").default;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
  const browser = await puppeteer.launch({
    executablePath: await chromium.executablePath(),
    args: [...chromium.args, "--headless=new"],
    headless: "new",
    defaultViewport: { width: 1280, height: 800 },
  });
  const page = await browser.newPage();

  // Block ONE JS chunk — the 500 scenario that broke the live preview.
  let blocked = false;
  await page.setRequestInterception(true);
  page.on("request", (req) => {
    if (!blocked && req.url().endsWith(".js") && req.url().includes("/chunks/")) {
      blocked = true;
      req.abort();
    } else {
      req.continue();
    }
  });

  await page.goto("http://localhost:3000", { waitUntil: "domcontentloaded", timeout: 30000 });

  const t0 = Date.now();
  let headerVisibleAt = null;
  let overflowFreeAt = null;
  while (Date.now() - t0 < 8000) {
    const s = await page.evaluate(() => ({
      header: getComputedStyle(document.querySelector("header")).visibility,
      overflow: getComputedStyle(document.documentElement).overflow,
      cls: document.documentElement.className.includes("is-booting"),
    }));
    if (headerVisibleAt === null && s.header === "visible") headerVisibleAt = Date.now() - t0;
    if (overflowFreeAt === null && s.overflow !== "hidden") overflowFreeAt = Date.now() - t0;
    if (headerVisibleAt && overflowFreeAt) break;
    await sleep(200);
  }

  console.log(`chunk was blocked: ${blocked}`);
  console.log(`header became clickable at: ${headerVisibleAt ?? "NEVER"} ms`);
  console.log(`scroll unlocked at:        ${overflowFreeAt ?? "NEVER"} ms`);

  const pass = blocked && headerVisibleAt !== null && overflowFreeAt !== null;
  console.log(pass ? "\nFAILSAFE VERIFIED — broken chunk no longer traps the page" : "\nFAILSAFE FAILED");
  await browser.close();
  process.exit(pass ? 0 : 1);
})();
