# iGEM IIT Bombay — "Turn bacteria into tiny protein factories"

Next.js 16 (App Router) · TypeScript · Tailwind CSS v4.

Built from the Figma file `3MqfypyVE0n7R3zIq0eCDq`, frame **Desktop - 2** (`node-id=350-11`).

```bash
npm run dev     # http://localhost:3000
npm run build
```

## Structure

```
src/
  app/
    layout.tsx      Google fonts (Inter, Frank Ruhl Libre, Inika, Outfit) -> --f-* vars on <html>
    globals.css     design tokens, graph-paper background, named breakpoints
    page.tsx        section order
    icon.svg        favicon
  components/
    Band.tsx           the 48px #D9D9D9 rules above the nav and below the hero
    Navbar.tsx         logo lockup, 7 section links, "direct to the process"
    Hero.tsx           "turn bacteria" (Inter 800) + serif lines (Frank Ruhl Libre)
    BuildIntro.tsx     "HOW DO WE BUILD PROTEINS ?" through the scroll CTA
    MeetYourGuide.tsx  Vera's intro card
    StoryFrame.tsx     the scrolling story box
    SpeechBubble.tsx   grey bubble + directional tail
    Glossary.tsx       Quick Glossary cards
  data/
    story.ts        the 36-beat script + cast (single source of truth)
design-source/    the original Figma exports (PNGs, cssalllayer.css)
tools/            headless screenshot + layout-regression scripts
```

## The story box

`StoryFrame` is the 1186×380 panel from the design (`#F1EEE9`, 2px rule,
`overflow-y: scroll`). All 36 beats live in `src/data/story.ts` — edit the copy,
speaker, or cast there and the layout follows. Each beat is one snap page, so a
scroll lands on exactly one exchange. The tail on the bubble points at whoever
is talking.

Three layout tiers, because the Figma composition needs ~980px of horizontal
track:

| width | layout |
| --- | --- |
| `< 768px` | bubble stacked over a row of the two characters |
| `768–1159px` | one row, scaled to the frame |
| `>= 1160px` (`wide:`) | the exact Figma composition, in design pixels |

## Notes for the team

- **Nav links are placeholders.** The Figma file has seven links literally
  labelled "text". Real labels/hrefs go in `NAV_LINKS` at the top of
  `Navbar.tsx`.
- **Glossary definitions were not in the design** — the cards are term-only
  there. They are accordions here; collapsed they match the design, and the
  copy lives in `TERMS` in `Glossary.tsx`. Drop the definitions to get the
  literal design back.
- **Custom breakpoints must be declared in `rem`** (`--breakpoint-wide: 72.5rem`).
  Tailwind v4 emits px-valued breakpoints *ahead* of its rem-valued defaults, so
  a px value would let `md:` override `wide:` on a wide screen.
- The frame sits 17px right of centre at `wide:` — that offset is in the Figma
  file (`calc(50% - 1186px/2 + 17px)`).

## Checking layout

`node tools/verify.mjs` walks nine viewport widths and fails loudly on page
overflow or content clipped inside the story frame. Needs the dev server up and
Chrome installed at the path set in the script.
