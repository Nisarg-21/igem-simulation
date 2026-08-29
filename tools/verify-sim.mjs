/**
 * Responsive + interaction check for the walkthrough at /simulate.
 *
 *   node tools/verify-sim.mjs          (dev server must be on :3000)
 *
 * Three passes: no horizontal overflow on either route at any width; the stage
 * props sit on their design coordinates at the `wide` breakpoint; and one full
 * play-through, driven by real pointer events, lands on every expected state.
 */
import puppeteer from "puppeteer-core";

const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const BASE = "http://localhost:3000";
const WIDTHS = [360, 390, 480, 640, 768, 1024, 1160, 1280, 1440, 1920];

/**
 * Design pixels. Card-relative for the header, stage-relative for the props.
 * Steps 1-2 come from a Figma export that carried left/top; every later export
 * gave sizes only, so those layouts are composed and these numbers guard them
 * against drift rather than proving a match to the design.
 */
const EXPECTED = {
  pick: {
    "@card": { title: [0, 0, 1013, 63], vera: [178, 157, 179, 179], pill: [344, 209, 490, 64], stage: [0, 387, 1013, 426] },
    grabs: { "E. coli": [120, 58, 137.5, 110], Yeast: [458, 40, 80, 128], Virus: [759, 32, 133, 136] },
    zones: { table: [377, 241, 254, 142] },
  },
  rescue: {
    "@card": { stage: [0, 387, 1013, 307] },
    grabs: { "@0": [260, 75, 105.2, 138] },
    zones: { tube: [641, 71, 257, 142] },
  },
  cut: {
    "@card": { stage: [0, 387, 1013, 383] },
    grabs: { "@0": [750, 85, 60, 60], "@1": [750, 270, 60, 60] },
    zones: { "site-1": [453, 85, 60, 60], "site-2": [453, 270, 60, 60] },
  },
  cell: {
    "@card": { stage: [0, 387, 1013, 294] },
    grabs: { "@0": [215, 30, 105.2, 133] },
    zones: { emptycell: [540, 42.5, 258, 80] },
  },
  winners: {
    "@card": { stage: [0, 387, 1013, 383] },
    grabs: { "@0": [152.5, 65.5, 85, 85], "@1": [775.5, 65.5, 85, 85] },
    zones: { dish: [406.5, 8, 200, 200] },
  },
  grow: {
    "@card": { stage: [0, 387, 1013, 383] },
    grabs: { "@0": [570, 70, 116, 30] },
    zones: { flask: [200, 55, 116, 198] },
  },
  iptg: {
    "@card": { stage: [0, 387, 1013, 383] },
    grabs: { "@0": [600, 70, 61, 154] },
    zones: { flask: [200, 55, 116, 198] },
  },
  lyse: {
    "@card": { stage: [0, 387, 1013, 420], pill: [344, 209, 490, 86] },
    grabs: { "@0": [80, 90, 89, 128] },
    zones: { spinner: [280, 36, 160, 216], buffer: [650, 56, 125, 125] },
  },
  purify: {
    "@card": { stage: [0, 387, 1013, 383] },
    grabs: { "@0": [180, 100, 131, 86] },
    zones: { column: [490, 60, 96, 224] },
  },
};

const problems = [];
const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: "new",
  args: ["--no-sandbox", "--hide-scrollbars", "--force-device-scale-factor=1"],
});
const page = await browser.newPage();
page.on("console", (m) => m.type() === "error" && problems.push("CONSOLE: " + m.text().slice(0, 200)));
page.on("pageerror", (e) => problems.push("PAGEERROR: " + e.message));
page.on("response", (r) => r.status() >= 400 && problems.push(`HTTP ${r.status()} ${r.url()}`));

// ---- page-side helpers, installed once per load ---------------------------
const HELPERS = () => {
  const w = window;
  w.__sec = () => document.querySelector("#simulate");
  w.__stage = () =>
    [...w.__sec().querySelectorAll("div")].find(
      (d) => getComputedStyle(d).backgroundColor === "rgb(241, 238, 233)"
    );
  w.__grabs = () => [...w.__sec().querySelectorAll("button")].filter((b) => b.className.includes("grabbable"));
  w.__zones = () => [...w.__sec().querySelectorAll("[data-zone]")];
  w.__acts = () =>
    [...w.__sec().querySelectorAll("button")].filter(
      (b) => !b.className.includes("grabbable") && !b.hasAttribute("data-zone")
    );
  w.__title = () => w.__sec().querySelector("h2").innerText.replace(/\s+/g, " ").trim();
  w.__act = (re) => w.__acts().find((b) => new RegExp(re, "i").test(b.innerText));

  // Synthetic pointers cannot be captured, so neutralise the capture API.
  Element.prototype.setPointerCapture = function () {};
  Element.prototype.releasePointerCapture = function () {};
  Element.prototype.hasPointerCapture = function () { return false; };

  w.__pe = (el, type, x, y) =>
    el.dispatchEvent(new PointerEvent(type, {
      pointerId: 1, pointerType: "mouse", isPrimary: true, clientX: x, clientY: y,
      button: 0, buttons: type === "pointerup" ? 0 : 1, bubbles: true, cancelable: true, composed: true,
    }));

  /** Drag grabbable #gi onto a drop zone, named or by index, for real.
   *  Props already seated stay in the DOM but disabled — refuse them loudly. */
  w.__drag = async (gi, zi) => {
    const el = w.__grabs()[gi];
    const z = typeof zi === "string" ? w.__sec().querySelector(`[data-zone="${zi}"]`) : w.__zones()[zi];
    if (!el) throw new Error(`no grabbable #${gi}`);
    if (!z) throw new Error(`no drop zone ${zi}`);
    if (el.disabled) throw new Error(`grabbable #${gi} is already settled`);
    const r = el.getBoundingClientRect();
    const q = z.getBoundingClientRect();
    const sx = r.left + r.width / 2, sy = r.top + r.height / 2;
    const zx = q.left + q.width / 2, zy = q.top + q.height / 2;
    const wait = (ms) => new Promise((res) => setTimeout(res, ms));
    w.__pe(el, "pointerdown", sx, sy); await wait(25);
    w.__pe(el, "pointermove", sx + 25, sy + 15); await wait(25);
    w.__pe(el, "pointermove", zx, zy); await wait(40);
    w.__pe(el, "pointerup", zx, zy); await wait(180);
  };

  /** React tracks the input's value, so poke the native setter. */
  w.__setDial = (v) => {
    const el = w.__sec().querySelector('input[type="range"]');
    const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
    setter.call(el, String(v));
    el.dispatchEvent(new Event("input", { bubbles: true }));
  };
};

const load = async (width = 1440) => {
  await page.setViewport({ width, height: 900 });
  await page.goto(BASE + "/simulate", { waitUntil: "networkidle0", timeout: 60000 });
  await page.evaluate(() => document.fonts.ready);
  await page.evaluate(HELPERS);
  await new Promise((r) => setTimeout(r, 300));
};

const measure = () =>
  page.evaluate(() => {
    const c = window.__sec().getBoundingClientRect();
    const s = window.__stage().getBoundingClientRect();
    const box = (el, o) => {
      const r = el.getBoundingClientRect();
      return [+(r.left - o.left).toFixed(1), +(r.top - o.top).toFixed(1), +r.width.toFixed(1), +r.height.toFixed(1)];
    };
    const card = {
      title: box(window.__sec().querySelector("h2"), c),
      vera: box(window.__sec().querySelector("img"), c),
      pill: box(window.__sec().querySelector(".vera-pill"), c),
      stage: box(window.__stage(), c),
    };
    const grabs = {};
    window.__grabs().forEach((b, i) => { grabs["@" + i] = box(b, s); grabs[b.getAttribute("aria-label")] = box(b, s); });
    const zones = {};
    window.__zones().forEach((b, i) => { zones["@" + i] = box(b, s); zones[b.getAttribute("data-zone")] = box(b, s); });
    return { card, grabs, zones };
  });

function checkGeometry(stepKey, got) {
  const want = EXPECTED[stepKey];
  if (!want) return;
  console.log(`  -- geometry: ${stepKey}`);
  const cmp = (label, w, g) => {
    if (!g) { problems.push(`geometry ${stepKey}/${label}: element missing`); console.log(`  ${label.padEnd(18)} MISSING`); return; }
    const ok = w.every((v, i) => Math.abs(v - g[i]) < 0.6);
    if (!ok) problems.push(`geometry ${stepKey}/${label}: expected [${w}] got [${g}]`);
    console.log(`  ${label.padEnd(18)} ${ok ? "ok  " : "BAD "} [${g}]`);
  };
  for (const [k, v] of Object.entries(want["@card"] ?? {})) cmp(k, v, got.card[k]);
  for (const [k, v] of Object.entries(want.grabs ?? {})) cmp(k, v, got.grabs[k]);
  for (const [k, v] of Object.entries(want.zones ?? {})) cmp(k, v, got.zones[k]);
}

// =========================== 1. overflow ===================================
for (const route of ["/", "/simulate"]) {
  console.log(`\n=== ${route} ===`);
  for (const w of WIDTHS) {
    await page.setViewport({ width: w, height: 900 });
    await page.goto(BASE + route, { waitUntil: "networkidle0", timeout: 60000 });
    await page.evaluate(() => document.fonts.ready);
    await new Promise((r) => setTimeout(r, 220));
    const res = await page.evaluate(() => {
      const de = document.documentElement;
      const out = [];
      for (const el of document.querySelectorAll("body *")) {
        const r = el.getBoundingClientRect();
        if (r.width === 0) continue;
        if (r.right > de.clientWidth + 1 || r.left < -1)
          out.push(el.tagName.toLowerCase() + "." + (el.className?.toString?.().slice(0, 40) || ""));
      }
      return { scrollW: de.scrollWidth, clientW: de.clientWidth, over: [...new Set(out)].slice(0, 4) };
    });
    const bad = res.scrollW > res.clientW + 1;
    if (bad) problems.push(`${route} overflows at ${w}px: ${res.over.join(", ")}`);
    console.log(`${String(w).padStart(4)}px  scrollW=${res.scrollW} clientW=${res.clientW}  ${bad ? "OVERFLOW -> " + res.over.join(", ") : "ok"}`);
  }
}

// ================= 2. walk the whole flow, checking as we go ===============
await load();
const seen = [];
const step = async (tag, fn, wait = 460) => {
  if (fn) await page.evaluate(fn);
  await new Promise((r) => setTimeout(r, wait));
  const title = await page.evaluate(() => window.__title());
  const acts = await page.evaluate(() => window.__acts().map((b) => b.innerText.replace(/\s+/g, " ").trim()));
  seen.push({ tag, title, acts });
  console.log(`\n--- ${tag} :: ${title} :: [${acts.join(" | ")}]`);
};

console.log("\n=== walkthrough + geometry ===");
await step("load", null);
checkGeometry("pick", await measure());

await page.evaluate(() => window.__drag(2, "table")); // virus — wrong
const wrongText = await page.evaluate(() => window.__sec().querySelector('[data-zone="table"]').innerText.trim());
console.log(`\n--- wrong drop :: zone reads "${wrongText}"`);
if (wrongText !== "error") problems.push(`wrong drop should read "error", read "${wrongText}"`);
await new Promise((r) => setTimeout(r, 1900));
const reverted = await page.evaluate(() => window.__sec().querySelector('[data-zone="table"]').innerText.replace(/\n/g, "/").trim());
if (reverted !== "Vera's/table") problems.push(`error did not revert, reads "${reverted}"`);
console.log(`--- after revert :: zone reads "${reverted}"`);

await step("drop E. coli", () => window.__drag(0, "table"));
await step("press POP", () => window.__act("POP it").click());
checkGeometry("rescue", await measure());

await step("drop plasmid", () => window.__drag(0, "tube"));
checkGeometry("cut", await measure());

await step("scissors 1 -> site 1", () => window.__drag(0, "site-1"));
await step("scissors 2 -> site 2", () => window.__drag(1, "site-2"));
checkGeometry("cell", await measure());

await step("drop new DNA ring", () => window.__drag(0, "emptycell"));
await step("press HEAT SHOCK", () => window.__act("HEAT SHOCK").click(), 1100);
await step("press NEXT", () => window.__act("NEXT").click());
checkGeometry("winners", await measure());

await step("group 1 -> dish", () => window.__drag(0, "dish"));
await step("group 2 -> dish", () => window.__drag(1, "dish"));
const grown = await page.evaluate(() => window.__sec().querySelectorAll("[data-colony]").length);
await step("press INCUBATE", () => window.__act("Incubate").click(), 1300);
const grownAfter = await page.evaluate(() => window.__sec().querySelectorAll("[data-colony]").length);
await step("press NEXT", () => window.__act("NEXT").click());
checkGeometry("grow", await measure());

// ---- step 7: the dial ----
const cellsAt = () => page.evaluate(() => window.__sec().querySelectorAll('circle[fill="#FFAB03"]').length);
const cellsEmpty = await cellsAt();
await step("cell -> flask", () => window.__drag(0, "flask"));
const cellsSeeded = await cellsAt();
await step("dial to 30 (too little)", () => window.__setDial(30));
await step("dial to 70 (just right)", () => window.__setDial(70));
const cellsGrown = await cellsAt();
await step("dial to 100 (too much)", () => window.__setDial(100));
await step("dial back to 70", () => window.__setDial(70));
await step("press NEXT", () => window.__act("NEXT").click());
checkGeometry("iptg", await measure());

// ---- step 8: IPTG ----
await step("drop IPTG", () => window.__drag(0, "flask"));
await step("press NEXT", () => window.__act("NEXT").click());
checkGeometry("lyse", await measure());

// ---- step 9: spin then shake ----
await step("flask -> spinner", () => window.__drag(0, "spinner"));
await step("press SPIN", () => window.__act("SPIN").click(), 1600);
await step("pellet -> buffer", () => window.__drag(0, "buffer"));
await step("press SHAKE", () => window.__act("Shake it").click(), 1600);
await step("press NEXT", () => window.__act("NEXT").click());
checkGeometry("purify", await measure());

// ---- step 10: wash then collect ----
await step("liquid -> column", () => window.__drag(0, "column"));
await step("press WASH", () => window.__act("Wash").click(), 1600);
await step("press COLLECT", () => window.__act("COLLECT").click(), 1200);
const finalText = await page.evaluate(() => window.__stage().innerText.replace(/\s+/g, " ").trim());

// =============================== assertions ================================
/* Keyed by tag rather than position: several tags are recorded per step, and
   an index-based list silently slides when one is inserted. */
const nth = (tag, k = 0) => seen.filter((s) => s.tag === tag)[k];
const t = (tag, k) => nth(tag, k).title;
const has = (tag, re, k) => nth(tag, k).acts.some((a) => new RegExp(re, "i").test(a));
const expect = [
  [t("load") === "1. Pick a Bacteria Friend", "starts on step 1"],
  [t("drop E. coli") === "2. Open the Cell" && has("drop E. coli", "POP it"), "right organism advances to Open the Cell"],
  [t("drop plasmid") === "3. Cut the DNA", "the plasmid reaching the tube advances to Cut the DNA"],
  [t("scissors 1 -> site 1") === "3. Cut the DNA", "one pair of scissors is not enough"],
  [t("scissors 2 -> site 2") === "5. Give It to a Cell", "both pairs of scissors advance to step 5"],
  [has("drop new DNA ring", "HEAT SHOCK"), "the ring reaching the cell reveals HEAT SHOCK"],
  [has("press HEAT SHOCK", "NEXT"), "HEAT SHOCK reveals the result and NEXT"],
  [t("press NEXT", 0) === "6. Find the Winners", "NEXT advances to step 6"],
  [has("group 2 -> dish", "Incubate"), "both groups reveal INCUBATE"],
  [grown === 0 && grownAfter === 7, `incubation grows 7 colonies (was ${grown}, now ${grownAfter})`],
  [t("press NEXT", 1) === "7. Grow More Cells", "NEXT advances to step 7"],
  [cellsEmpty === 0 && cellsSeeded === 1, `flask starts empty and takes one cell (${cellsEmpty} -> ${cellsSeeded})`],
  [cellsGrown === 7, `the dial grows the culture (7 cells at 70, got ${cellsGrown})`],
  [!has("dial to 30 (too little)", "NEXT"), "too little growth offers no NEXT"],
  [has("dial to 70 (just right)", "NEXT"), "the sweet spot offers NEXT"],
  [!has("dial to 100 (too much)", "NEXT"), "over-growing withdraws NEXT"],
  [has("dial back to 70", "NEXT"), "easing the dial back restores NEXT"],
  [t("press NEXT", 2) === "8. Turn On the Protein", "NEXT advances to step 8"],
  [has("drop IPTG", "NEXT"), "IPTG in the flask reveals the result and NEXT"],
  [t("press NEXT", 3) === "9. Break Open the Cells", "NEXT advances to step 9"],
  [has("flask -> spinner", "SPIN"), "the flask in the spinner reveals SPIN"],
  [!has("press SPIN", "SPIN"), "spinning consumes the SPIN button"],
  [has("pellet -> buffer", "Shake it"), "the pellet in the buffer reveals SHAKE"],
  [has("press SHAKE", "NEXT"), "shaking reveals the result and NEXT"],
  [t("press NEXT", 4) === "10. Clean the Protein", "NEXT advances to step 10"],
  [has("liquid -> column", "Wash"), "the liquid on the column reveals WASH"],
  [has("press WASH", "COLLECT"), "washing reveals COLLECT"],
  [/Pure protein/i.test(finalText), "collecting ends on the pure-protein result"],
];
console.log("");
for (const [ok, what] of expect) {
  console.log(`${ok ? "PASS" : "FAIL"}  ${what}`);
  if (!ok) problems.push("walkthrough: " + what);
}

console.log(problems.length ? "\nPROBLEMS:\n" + [...new Set(problems)].join("\n") : "\nAll clear — no overflow, no console errors, geometry matches, walkthrough passes.");
await browser.close();
process.exit(problems.length ? 1 : 0);
