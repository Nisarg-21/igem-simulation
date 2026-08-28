import puppeteer from "puppeteer-core";

const OUT = process.env.SHOT_DIR;
const browser = await puppeteer.launch({
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
  headless: "new",
  args: ["--no-sandbox", "--hide-scrollbars", "--force-device-scale-factor=1"],
});
const page = await browser.newPage();
const problems = [];
page.on("console", (m) => m.type() === "error" && problems.push("CONSOLE: " + m.text()));
page.on("pageerror", (e) => problems.push("PAGEERROR: " + e.message));
page.on("response", (r) => r.status() >= 400 && problems.push("HTTP " + r.status() + " " + r.url()));

function sc_w(r) { return r.frameW; }
const widths = [360, 390, 480, 640, 768, 1024, 1280, 1440, 1920];
for (const w of widths) {
  await page.setViewport({ width: w, height: 900 });
  if (page.url() === "about:blank") {
    await page.goto("http://localhost:3000", { waitUntil: "networkidle0", timeout: 60000 });
    await page.evaluate(() => document.fonts.ready);
  }
  await new Promise((r) => setTimeout(r, 450));

  const res = await page.evaluate(() => {
    const de = document.documentElement;
    const over = [];
    // any element sticking out past the viewport
    for (const el of document.querySelectorAll("body *")) {
      const r = el.getBoundingClientRect();
      if (r.width === 0) continue;
      if (r.right > de.clientWidth + 1 || r.left < -1) {
        over.push(el.tagName.toLowerCase() + "." + (el.className?.toString?.().slice(0, 45) || ""));
      }
    }
    const sc = document.querySelector('[aria-label^="The protein expression story"]');
    return {
      scrollW: de.scrollWidth,
      clientW: de.clientWidth,
      overflowing: [...new Set(over)].slice(0, 4),
      beats: sc ? sc.children.length : 0,
      panelH: sc ? sc.children[0].getBoundingClientRect().height : 0,
      frameH: sc ? sc.clientHeight : 0,
      frameW: sc ? sc.clientWidth : 0,
      scrollable: sc ? sc.scrollHeight > sc.clientHeight + 10 : false,
      storyClipX: sc ? sc.scrollWidth - sc.clientWidth : 0,
      widestPanel: sc
        ? Math.round(
            Math.max(
              ...[...sc.children].map((p) => {
                const kids = [...p.firstElementChild.children];
                const right = Math.max(...kids.map((k) => k.getBoundingClientRect().right));
                return right - sc.getBoundingClientRect().left;
              })
            )
          )
        : 0,
    };
  });

  const bad = res.scrollW > res.clientW + 1;
  const clipped = res.storyClipX > 1 || res.widestPanel > sc_w(res);
  console.log(
    `${String(w).padStart(4)}px  scrollW=${res.scrollW} clientW=${res.clientW}` +
      `  beats=${res.beats} panel=${Math.round(res.panelH)}/${res.frameH}` +
      `  story(clipX=${res.storyClipX} widest=${res.widestPanel}/${sc_w(res)})` +
      `  ${bad ? "PAGE-OVERFLOW -> " + res.overflowing.join(", ") : clipped ? "STORY-CLIPPED" : "ok"}`
  );
  if (bad) problems.push(`page overflow at ${w}px: ${res.overflowing.join(", ")}`);
  if (clipped) problems.push(`story content clipped at ${w}px (widest ${res.widestPanel} > ${sc_w(res)})`);
}

// captures
for (const [w, h, name] of [[1440, 900, "desktop"], [768, 1024, "tablet"], [390, 844, "mobile"]]) {
  await page.setViewport({ width: w, height: h });
  await new Promise((r) => setTimeout(r, 600));
  await page.screenshot({ path: `${OUT}/v-${name}.png`, fullPage: true });
  const frame = await page.$("#story");
  await frame.screenshot({ path: `${OUT}/v-${name}-story.png` });
}

console.log(problems.length ? "\nPROBLEMS:\n" + [...new Set(problems)].join("\n") : "\nNo console errors, no failed requests.");
await browser.close();
