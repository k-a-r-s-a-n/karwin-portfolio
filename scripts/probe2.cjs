const puppeteer = require("puppeteer-core");
const chromium = require("@sparticuz/chromium").default;
(async () => {
  const browser = await puppeteer.launch({
    executablePath: await chromium.executablePath(),
    args: [...chromium.args, "--headless=new"],
    headless: "new",
    defaultViewport: { width: 1280, height: 800 },
  });
  const page = await browser.newPage();
  const errors = [];
  page.on("console", m => { if (m.type() === "error" || m.type() === "warn") errors.push(m.type() + ": " + m.text().slice(0, 150)); });
  page.on("pageerror", e => errors.push("PAGEERROR: " + e.message.slice(0, 200)));
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
  for (const wait of [1500, 1500, 3000]) {
    await new Promise(r => setTimeout(r, wait));
    console.log(await page.evaluate(() => ({
      t: Math.round(performance.now()),
      cls: document.documentElement.className.split(" ").filter(c => !c.includes("variable")).join(","),
      overlay: !!document.querySelector("[data-boot-overlay]"),
      headerVis: getComputedStyle(document.querySelector("header")).visibility,
      cursorHook: !!window.__karwinCursor,
      nextHydrated: !!document.querySelector("#__next") || !!window.next,
    })));
  }
  console.log("console issues:", errors.slice(0, 6));
  await browser.close();
})();
