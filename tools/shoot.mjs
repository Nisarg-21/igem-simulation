import puppeteer from "puppeteer-core";

const OUT = process.env.SHOT_DIR;
const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: "new",
  args: ["--no-sandbox", "--hide-scrollbars", "--force-device-scale-factor=1"],
});
const page = await browser.newPage();
const errors = [];
page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
page.on("pageerror", (e) => errors.push("PAGEERROR: " + e.message));

await page.setViewport({ width: 1440, height: 900 });
await page.goto("http://localhost:3000", { waitUntil: "networkidle0", timeout: 60000 });
await page.evaluate(() => document.fonts.ready);
await new Promise((r) => setTimeout(r, 1200));

await page.screenshot({ path: `${OUT}/desktop-full.png`, fullPage: true });

// A few story beats, scrolled inside the frame.
const beats = [0, 6, 13, 21, 28, 35];
for (const i of beats) {
  await page.evaluate((idx) => {
    const sc = document.querySelector('[aria-label^="The protein expression story"]');
    const prev = sc.style.scrollBehavior;
    sc.style.scrollBehavior = "auto";
    sc.scrollTop = idx * sc.clientHeight;
    sc.style.scrollBehavior = prev;
  }, i);
  await new Promise((r) => setTimeout(r, 700));
  const frame = await page.$("#story");
  await frame.screenshot({ path: `${OUT}/beat-${String(i).padStart(2, "0")}.png` });
}

// Mobile
await page.setViewport({ width: 390, height: 844 });
await new Promise((r) => setTimeout(r, 800));
await page.screenshot({ path: `${OUT}/mobile-full.png`, fullPage: true });

console.log(errors.length ? "CONSOLE ERRORS:\n" + errors.join("\n") : "no console errors");
await browser.close();
