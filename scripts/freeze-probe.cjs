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
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message.slice(0, 300)));
  page.on("console", (m) => { if (m.type() === "error") errors.push("console: " + m.text().slice(0, 200)); });
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
  await page.evaluate(() => {
    const el = document.getElementById("stack");
    el && el.scrollIntoView({ behavior: "instant", block: "center" });
    window.scrollBy(0, -200);
  });
  await sleep(900);

  const cropMax = (x, y, tag) =>
    parseFloat(execSync(
      `convert /tmp/fz-${tag}.png -crop 44x44+${x - 22}+${y - 22} -colorspace gray -format "%[fx:maxima]" info:`
    ).toString().trim());

  // Move to A
  await page.mouse.move(1050, 650, { steps: 14 });
  await sleep(200);
  await page.screenshot({ path: "/tmp/fz-A.png" });
  console.log("A @old(1050,650):", cropMax(1050, 650, "A"));

  // Move to B — check BOTH B's position and A's old position
  await page.mouse.move(250, 250, { steps: 14 });
  await sleep(200);
  await page.screenshot({ path: "/tmp/fz-B.png" });
  console.log("B @new(250,250):", cropMax(250, 250, "B"));
  console.log("B @old(1050,650) still lit?", cropMax(1050, 650, "B"));

  console.log("state:", await page.evaluate(() => window.__karwinCursor?.state));
  console.log("errors:", errors.length ? errors : "none");
  await browser.close();
})();
