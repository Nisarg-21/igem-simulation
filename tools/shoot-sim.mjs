/**
 * Captures the walkthrough at /simulate, one image per state.
 *
 *   SHOT_DIR=some/dir node tools/shoot-sim.mjs      (dev server must be on :3000)
 *
 * The companion to tools/shoot.mjs, which covers the landing page.
 */
import puppeteer from "puppeteer-core";

const OUT = process.env.SHOT_DIR ?? ".";
const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: "new",
  args: ["--no-sandbox", "--hide-scrollbars", "--force-device-scale-factor=2"],
});
const page = await browser.newPage();
const errors = [];
page.on("console", (m) => m.type() === "error" && errors.push(m.text().slice(0, 200)));
page.on("pageerror", (e) => errors.push("PAGEERROR: " + e.message));

const HELPERS = () => {
  const w = window;
  w.__sec = () => document.querySelector("#simulate");
  w.__grabs = () => [...w.__sec().querySelectorAll("button")].filter((b) => b.className.includes("grabbable"));
  w.__zones = () => [...w.__sec().querySelectorAll("[data-zone]")];
  w.__zone = (n) => w.__sec().querySelector(`[data-zone="${n}"]`);
  w.__acts = () =>
    [...w.__sec().querySelectorAll("button")].filter(
      (b) => !b.className.includes("grabbable") && !b.hasAttribute("data-zone")
    );
  w.__act = (re) => w.__acts().find((b) => new RegExp(re, "i").test(b.innerText));
  w.__arm = (gi) => w.__grabs()[gi].click();
  w.__drop = (zi) => (typeof zi === "string" ? w.__zone(zi) : w.__zones()[zi]).click();
  w.__setDial = (v) => {
    const el = w.__sec().querySelector("input[type=range]");
    const s = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
    s.call(el, String(v));
    el.dispatchEvent(new Event("input", { bubbles: true }));
  };
};

const settle = (ms = 450) => new Promise((r) => setTimeout(r, ms));
const card = () => page.$("#simulate");
const shot = async (name) => (await card()).screenshot({ path: `${OUT}/${name}.png` });
const run = async (fn, ms) => { await page.evaluate(fn); await settle(ms); };
/** Click-to-place, as two separate round trips: an evaluate that returns a
 *  page-side promise gets collected when React re-renders underneath it. */
const place = async (gi, zi) => {
  await page.evaluate((i) => window.__arm(i), gi);
  await settle(140);
  await page.evaluate((i) => window.__drop(i), zi);
  await settle(450);
};

async function load(width = 1440) {
  await page.setViewport({ width, height: 1000 });
  await page.goto("http://localhost:3000/simulate", { waitUntil: "networkidle0", timeout: 60000 });
  await page.evaluate(() => document.fonts.ready);
  await page.evaluate(HELPERS);
  await settle(700);
}

/** `page.evaluate` serialises the callback, so the pattern must be passed in
 *  as an argument rather than closed over. */
const press = async (re, ms = 1300) => {
  await page.evaluate((r) => window.__act(r).click(), re);
  await settle(ms);
};

/** Fast-forward to the head of a step without capturing the way there. */
async function advanceTo(step) {
  await place(0, "table"); // E. coli
  await press("POP it", 900);
  if (step === "rescue") return;
  await place(0, "tube"); // plasmid -> cut
  if (step === "cut") return;
  await place(0, "site-1");
  await place(1, "site-2"); // -> cell
  if (step === "cell") return;
  await place(0, "emptycell");
  await press("HEAT SHOCK");
  await press("NEXT", 500); // -> winners
  if (step === "winners") return;
  await place(0, "dish");
  await place(1, "dish");
  await press("Incubate");
  await press("NEXT", 500); // -> grow
  if (step === "grow") return;
  await place(0, "flask");
  await run(() => window.__setDial(70));
  await press("NEXT", 500); // -> iptg
  if (step === "iptg") return;
  await place(0, "flask");
  await press("NEXT", 500); // -> lyse
  if (step === "lyse") return;
  await place(0, "spinner");
  await press("SPIN");
  await place(0, "buffer");
  await press("Shake it");
  await press("NEXT", 500); // -> purify
}

await load();
await shot("sim-1-pick");
await place(0, "table"); // -> pop
await shot("sim-2-pop");
await press("POP it", 900); // -> rescue
await shot("sim-3-rescue");
await place(0, "tube"); // -> cut
await shot("sim-4-cut");

await load();
await advanceTo("cut");
await shot("sim-5-cut");
await place(0, "site-1");
await shot("sim-6-cut-one");

await load();
await advanceTo("cell");
await shot("sim-7-cell");
await place(0, "emptycell");
await shot("sim-8-cell-ready");
await press("HEAT SHOCK");
await shot("sim-9-cell-done");

await load();
await advanceTo("winners");
await shot("sim-10-winners");
await place(0, "dish");
await place(1, "dish");
await shot("sim-11-winners-ready");
await press("Incubate");
await shot("sim-12-winners-grown");

await load();
await advanceTo("grow");
await shot("sim-13-grow");
await place(0, "flask");
await run(() => window.__setDial(70));
await shot("sim-14-grow-dialled");

await load();
await advanceTo("iptg");
await shot("sim-15-iptg");
await place(0, "flask");
await shot("sim-16-iptg-on");

await load();
await advanceTo("lyse");
await shot("sim-17-lyse");
await place(0, "spinner");
await press("SPIN");
await shot("sim-18-lyse-spun");
await place(0, "buffer");
await press("Shake it");
await shot("sim-19-lyse-open");

await load();
await advanceTo("purify");
await shot("sim-20-purify");
await place(0, "column");
await press("Wash");
await press("COLLECT");
await shot("sim-21-purify-done");

// narrow layouts for the most crowded steps
await load(390);
await advanceTo("cut");
await shot("sim-mobile-cut");
await load(390);
await advanceTo("lyse");
await shot("sim-mobile-lyse");

console.log(errors.length ? "CONSOLE ERRORS:\n" + [...new Set(errors)].join("\n") : "no console errors");
await browser.close();
