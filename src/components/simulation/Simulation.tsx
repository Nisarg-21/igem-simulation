"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type React from "react";
import {
  ColonyArt,
  EcoliArt,
  FlaskArt,
  GeneArt,
  IptgArt,
  NewRingArt,
  PlasmidArt,
  ScissorsArt,
  VirusArt,
  YeastArt,
} from "./art";

/* ---------------------------------------------------------------------------
 * The whole walkthrough lives in one card and never navigates: every step swaps
 * the card's contents in place.
 *
 * Geometry is in design pixels on the 1013px content column. Everything on the
 * stage is placed with the `POS` helper, which only takes effect at the `wide:`
 * breakpoint — below that the same nodes fall back to flow layout so the art and
 * captions stay legible on a phone.
 *
 * The header block (title, blurb, Vera, her speech pill) is identical in every
 * step and 387px tall; only the beige stage below it changes height.
 * ------------------------------------------------------------------------ */

type StepId =
  | "pick"
  | "pop"
  | "rescue"
  | "cut"
  | "cell"
  | "winners"
  | "grow"
  | "iptg"
  | "lyse"
  | "purify";

/** Which drop zone each draggable currently sits in. */
type Placement = Record<string, string>;

interface Step {
  /** Step number as printed in front of the title. Blank on the closing card. */
  n: string;
  title: string;
  blurb: string;
  /** Width of the blurb's text column, in design px. */
  blurbW: number;
  /** Vera's line, inside the dark pill. */
  line: string;
  /** Stage height in design px. */
  stageH: number;
  /** Speech pill height; step 9's line needs three lines rather than two. */
  pillH?: number;
}

const OPEN_BLURB =
  "Inside every bacteria is a tiny ring of DNA called a plasmid. Let's pop the cell open and take it out.";

const STEPS: Record<StepId, Step> = {
  pick: {
    n: "1.",
    title: "Pick a Bacteria Friend",
    blurb:
      "Vera needs a tiny living helper to build his protein. Drag the right one onto the table.",
    blurbW: 923,
    line: "Hi, I'm Vera! I need a helper that grows fast and is easy to work with. Can you drag the right one onto my table?",
    stageH: 426,
  },
  pop: {
    n: "2.",
    title: "Open the Cell",
    blurb: OPEN_BLURB,
    blurbW: 1013,
    line: "Press the button to pop the cell open.",
    stageH: 307,
  },
  rescue: {
    n: "2.",
    title: "Open the Cell",
    blurb: OPEN_BLURB,
    blurbW: 1013,
    line: "Then drag the little DNA ring into the clean tube before it gets lost!",
    stageH: 307,
  },
  cut: {
    n: "3.",
    title: "Cut the DNA",
    blurb:
      "Special tools called enzymes work like tiny scissors. They cut DNA at just the right spot.",
    blurbW: 946,
    line: "Drag the scissors onto both — one on the ring, one on the gene. That way the two cut ends will match!",
    stageH: 383,
  },
  cell: {
    n: "5.",
    title: "Give It to a Cell",
    blurb: "Time to put our new DNA ring inside a fresh bacteria cell.",
    blurbW: 626,
    line: "Drag the new DNA ring onto the cell. Then press HEAT SHOCK — a quick blast of warmth opens the door for it to get in!",
    stageH: 294,
  },
  winners: {
    n: "6.",
    title: "Find the Winners",
    blurb:
      "Only cells that got our DNA ring can survive on this special dish. Let's test both groups and see.",
    blurbW: 1033,
    line: "Drag both groups onto the dish, then press INCUBATE. Let's see who is still alive tomorrow!",
    stageH: 383,
  },
  grow: {
    n: "7.",
    title: "Grow More Cells",
    blurb: "Pick a winning cell and grow lots more of them in a flask of food.",
    blurbW: 703,
    line: "Drag a winning cell into the flask. Then slide the dial to grow it — not too little, not too much!",
    stageH: 383,
  },
  iptg: {
    n: "8.",
    title: "Turn On the Protein",
    blurb:
      "Our gene is asleep until we wake it up with a special helper chemical called IPTG.",
    blurbW: 878,
    // The export repeats the blurb inside the pill, and the mock-up confirms it.
    line: "Our gene is asleep until we wake it up with a special helper chemical called IPTG.",
    stageH: 383,
  },
  lyse: {
    n: "9.",
    title: "Break Open the Cells",
    blurb:
      "Our protein is trapped inside the cells. Let's spin them down, then break them open to let it out.",
    blurbW: 1035,
    line: "Drag the flask into the spinner and press SPIN. Then drag the leftover cells into the buffer and press SHAKE to break them open!",
    pillH: 86,
    stageH: 420,
  },
  purify: {
    n: "10.",
    title: "Clean the Protein",
    blurb:
      "Our protein has a special tag that sticks to this column. Let's wash away everything else and keep only our protein.",
    blurbW: 1247,
    line: "Drag the liquid onto the column. Press WASH to rinse away the junk, then press COLLECT to get your clean protein!",
    stageH: 383,
  },
};

/* --- step rules ----------------------------------------------------------
 * `accepts` decides whether a drop is allowed at all; anything it rejects makes
 * the target flash. `complete` says the step's goal is met, and `then` (when
 * present) moves straight on rather than waiting for a button.
 */
interface Rule {
  accepts: (item: string, zone: string, placed: Placement) => boolean;
  complete: (placed: Placement) => boolean;
  then?: StepId;
}

/** True when no other item is already sitting in `zone`. */
const zoneFree = (zone: string, placed: Placement) =>
  !Object.values(placed).includes(zone);

const RULES: Partial<Record<StepId, Rule>> = {
  pick: {
    accepts: (item) => item === "ecoli",
    complete: (p) => !!p.ecoli,
    then: "pop",
  },
  rescue: {
    accepts: (item) => item === "plasmid",
    complete: (p) => !!p.plasmid,
    then: "cut",
  },
  cut: {
    // Either pair of scissors fits either site; one pair per site.
    accepts: (_item, zone, placed) => zoneFree(zone, placed),
    complete: (p) => !!p["scissor-a"] && !!p["scissor-b"],
    then: "cell",
  },
  cell: {
    accepts: (item) => item === "newring",
    complete: (p) => !!p.newring,
  },
  winners: {
    accepts: () => true,
    complete: (p) => !!p["group-with"] && !!p["group-without"],
  },
  grow: {
    accepts: (item) => item === "cell",
    complete: (p) => !!p.cell,
  },
  iptg: {
    accepts: (item) => item === "iptg",
    complete: (p) => !!p.iptg,
  },
  lyse: {
    // The flask only goes in the spinner; the pellet it becomes only goes in
    // the buffer.
    accepts: (item, zone) =>
      (item === "flask" && zone === "spinner") ||
      (item === "pellet" && zone === "buffer"),
    complete: (p) => !!p.pellet,
  },
  purify: {
    accepts: (item) => item === "liquid",
    complete: (p) => !!p.liquid,
  },
};

/* --- stage geometry, in design px ---------------------------------------- */

/** Applied to everything on the stage; inert below the `wide:` breakpoint. */
const POS = "wide:absolute wide:left-[var(--x)] wide:top-[var(--y)]";

function at(x: number, y: number): React.CSSProperties {
  return { "--x": `${x}px`, "--y": `${y}px` } as React.CSSProperties;
}

/* Step 3 lays out as two rows — the ring on the top row and the gene on the
 * bottom one, each with its own cut site and its own pair of scissors, because
 * one cut has to land on each so the two ends match. Three columns: artwork,
 * site, scissors. */
const CUT_SITES: Record<string, [number, number]> = {
  "site-1": [453, 85], // on the ring's row
  "site-2": [453, 270], // on the gene's row
};
const SCISSOR_REST: Record<string, [number, number]> = {
  "scissor-a": [750, 85],
  "scissor-b": [750, 270],
};
/** Scissors sit in a 60px box, so they drop straight onto a 60px site. */
const onSite = (zone: string): [number, number] => CUT_SITES[zone];

/** Step 6 — the blobs start either side of the dish and move into it. */
const BLOB_REST: Record<string, [number, number]> = {
  "group-with": [152.5, 65.5],
  "group-without": [775.5, 65.5],
};
const BLOB_SLOT: Record<string, [number, number]> = {
  "group-with": [417, 65.5],
  "group-without": [511, 65.5],
};
const LABEL_REST: Record<string, [number, number]> = {
  "group-with": [121, 160],
  "group-without": [760.5, 160],
};
const LABEL_SLOT: Record<string, [number, number]> = {
  "group-with": [356, 216],
  "group-without": [532.5, 216],
};

/* The seven colonies that come up overnight (Ellipses 34-40, 20px #FFAB03).
 * Centres relative to the dish's 200px box, scattered across the plate rather
 * than sitting on the group that seeded them — traced off the supplied
 * artwork, which keeps them clear of the green blob and lets a couple land
 * over the faded one. Irregular on purpose. */
const DISH_COLONIES: [number, number][] = [
  [128, 32],
  [163, 72],
  [108, 62],
  [170, 118],
  [136, 150],
  [72, 170],
  [110, 178],
];

/** Absolutely positioned inside the dish, so they scatter over the plate. */
function DishColonies() {
  return (
    <>
      {DISH_COLONIES.map(([x, y]) => (
        <span
          key={`${x}-${y}`}
          data-colony
          // less the dish's 3px border: children sit against the padding box
          style={{ left: x - 10 - 3, top: y - 10 - 3 }}
          className="absolute block size-[20px] rounded-full bg-[#FFAB03]"
        />
      ))}
    </>
  );
}

/* --- speech bubble -------------------------------------------------------
 * Rectangle 31 is a 490 x 64 pill in #545050; Polygon 1 is the sliver that
 * points back at Vera, 48px left of the pill and 23px down from its top.
 */
function VeraBubble({ line, pillH = 64 }: { line: string; pillH?: number }) {
  return (
    <div
      style={{ "--pill-h": `${pillH}px` } as React.CSSProperties}
      className="relative w-full max-w-[420px] flex-1 wide:absolute wide:top-[209px] wide:left-[344px] wide:h-[var(--pill-h)] wide:w-[490px] wide:max-w-none wide:flex-none"
    >
      {/* Below sm the pill sits tight against Vera, with no room for the tail. */}
      <svg
        className="vera-tail hidden sm:block"
        viewBox="0 0 96.37 26.73"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <polygon points="1.485,16.165 93.4,0 96.37,26.728" fill="#545050" />
      </svg>
      <p className="vera-pill relative min-h-[56px] rounded-[22px] px-4 py-3 text-[13px] leading-[17px] sm:rounded-[100px] sm:px-5 sm:text-[15px] sm:leading-[18px] wide:h-full wide:min-h-0 wide:py-0 wide:pr-[18px] wide:pl-[21px]">
        {line}
      </p>
    </div>
  );
}

/* --- captions ------------------------------------------------------------
 * Figma places these by hand and they are not always centred under their art
 * ("virus" hangs off to the right). Offsets are reproduced as measured.
 */
function Caption({
  children,
  left,
  top,
  width,
  color,
}: {
  children: React.ReactNode;
  left: number;
  top: number;
  width: number;
  color?: string;
}) {
  return (
    <span
      className="font-outfit absolute text-center text-[16px] leading-[20px] whitespace-nowrap"
      style={{ left, top, width, color: color ?? "var(--color-ink)" }}
    >
      {children}
    </span>
  );
}

/** A caption that lives on the stage rather than inside a prop's own box. */
function StageLabel({
  children,
  x,
  y,
  width,
  color,
  /** Step 7's dial captions are set in Inter 15, not Outfit 16. */
  font = "outfit",
  className = "",
}: {
  children: React.ReactNode;
  x: number;
  y: number;
  width: number;
  color?: string;
  font?: "outfit" | "inter";
  className?: string;
}) {
  return (
    <span
      style={{ ...at(x, y), width, color }}
      className={`block text-center whitespace-nowrap ${POS} ${
        font === "inter"
          ? "text-[15px] leading-[18px]"
          : "font-outfit text-[16px] leading-[20px]"
      } ${className}`}
    >
      {children}
    </span>
  );
}

/** Step 7's dial has a sweet spot — "not too little, not too much". */
const GROWN_ENOUGH = (dial: number) => dial >= 55 && dial <= 90;

/* --- drag plumbing -------------------------------------------------------
 * Pointer events rather than HTML5 drag-and-drop: one code path covers mouse,
 * pen and touch, and pointer capture keeps the move/up events coming even when
 * the cursor outruns the element.
 *
 * Everything is also operable without dragging — click (or focus and press
 * Enter) to pick a prop up, then click the target to drop it. That is the
 * keyboard path, and the sane path on a small touch screen.
 */
interface DragApi {
  drag: { id: string; dx: number; dy: number } | null;
  armed: string | null;
  down: (e: React.PointerEvent<HTMLElement>, id: string) => void;
  move: (e: React.PointerEvent<HTMLElement>, id: string) => void;
  up: (e: React.PointerEvent<HTMLElement>, id: string) => void;
  cancel: (e: React.PointerEvent<HTMLElement>, id: string) => void;
  click: (id: string) => void;
}

function Draggable({
  id,
  label,
  width,
  height,
  x,
  y,
  api,
  settled = false,
  className = "",
  children,
}: {
  id: string;
  label: string;
  width: number;
  height: number;
  x: number;
  y: number;
  api: DragApi;
  /** Already dropped in place — stop offering it as something to pick up. */
  settled?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  const dragging = api.drag?.id === id;
  const armed = api.armed === id;

  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={armed}
      disabled={settled}
      onPointerDown={(e) => api.down(e, id)}
      onPointerMove={(e) => api.move(e, id)}
      onPointerUp={(e) => api.up(e, id)}
      onPointerCancel={(e) => api.cancel(e, id)}
      onClick={() => api.click(id)}
      style={{
        ...at(x, y),
        width,
        height,
        transform: dragging
          ? `translate3d(${api.drag!.dx}px, ${api.drag!.dy}px, 0)`
          : undefined,
      }}
      className={`grabbable relative block shrink-0 rounded-[10px] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink ${POS} ${
        dragging
          ? "z-30 cursor-grabbing"
          : `transition-[transform,left,top] duration-300 ease-out ${settled ? "cursor-default" : "cursor-grab"}`
      } ${
        armed ? "outline-2 outline-offset-4 outline-dashed outline-ink" : ""
      } ${className}`}
    >
      {children}
    </button>
  );
}

/* A dashed drop target. Turns red and reads "error" when something the step
 * does not want lands on it. */
/* Exactly one width class and one colour class is ever applied, because two
   competing `border-*` utilities have no defined order in the stylesheet. */
const ZONE_WIDTH = { 2: "border-[2px]", 3: "border-[3px]" } as const;
const ZONE_TONE = {
  ink: "border-ink",
  blue: "border-[#0FB6FE]",
  sky: "border-[#0995D1]",
} as const;
/* Rectangle 50 is stroked solid; the flask in steps 7-8 is its own target and
   wants no outline at all. */
const ZONE_EDGE = {
  dashed: "border-dashed",
  solid: "border-solid",
  none: "border-0",
} as const;

function DropZone({
  id,
  register,
  label,
  ariaLabel,
  width,
  height,
  x,
  y,
  shape = "rect",
  stroke = 3,
  tone = "ink",
  edge = "dashed",
  labelTone = "ink",
  wrong,
  hot,
  disabled,
  onClick,
  className = "",
  children,
}: {
  id: string;
  register: (id: string) => (el: HTMLButtonElement | null) => void;
  label?: string;
  ariaLabel: string;
  width: number;
  height: number;
  x: number;
  y: number;
  shape?: "rect" | "circle";
  stroke?: keyof typeof ZONE_WIDTH;
  tone?: keyof typeof ZONE_TONE;
  edge?: keyof typeof ZONE_EDGE;
  /** "blue" is the small label that sits inside a cut site. */
  labelTone?: "ink" | "blue";
  wrong: boolean;
  hot: boolean;
  disabled: boolean;
  onClick: () => void;
  className?: string;
  children?: React.ReactNode;
}) {
  const paint = wrong
    ? "border-danger bg-danger/10 text-danger"
    : hot
      ? `${ZONE_TONE[tone]} bg-ink/[0.06] text-ink`
      : `${ZONE_TONE[tone]} text-ink`;
  // An outline-less zone must not also emit a width class — two competing
  // border-width utilities have no defined order in the stylesheet.
  const rim =
    edge === "none"
      ? ZONE_EDGE.none
      : `${ZONE_EDGE[edge]} ${ZONE_WIDTH[stroke]}`;

  return (
    <button
      ref={register(id)}
      type="button"
      aria-label={ariaLabel}
      data-zone={id}
      disabled={disabled}
      onClick={onClick}
      style={{ ...at(x, y), width, height }}
      className={`grid shrink-0 place-items-center transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink ${POS} ${rim} ${
        shape === "circle" ? "rounded-full" : ""
      } ${paint} ${className}`}
    >
      {children}
      {label && !children && (
        <span
          className={`font-outfit text-center ${
            labelTone === "blue"
              ? "text-[16px] leading-[20px] text-[#0FB6FE]"
              : "text-[20px] leading-[27px] wide:text-[25px] wide:leading-[32px]"
          }`}
        >
          {wrong ? "error" : label}
        </span>
      )}
    </button>
  );
}

/** A pair of scissors, either waiting in its row or seated on a cut site. */
function ScissorsProp({
  id,
  api,
  seat,
}: {
  id: string;
  api: DragApi;
  seat?: string;
}) {
  const [x, y] = seat ? onSite(seat) : SCISSOR_REST[id];
  return (
    <Draggable
      id={id}
      label={seat ? "Scissors, in place" : "Scissors"}
      width={60}
      height={60}
      x={x}
      y={y}
      api={api}
      settled={!!seat}
    >
      <ScissorsArt className="absolute top-[4.5px] left-[0.5px] h-[51px] w-[59px]" />
    </Draggable>
  );
}

/** The rounded action buttons: POP it, HEAT SHOCK, Incubate overnight. */
function ActionButton({
  x,
  y,
  width,
  height,
  color,
  fontSize,
  onClick,
  children,
}: {
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  fontSize: number;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{ ...at(x, y), width, height, background: color, fontSize }}
      className={`font-outfit grid shrink-0 place-items-center rounded-[50px] leading-[32px] text-white transition-transform duration-150 hover:scale-[1.03] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink active:scale-95 ${POS}`}
    >
      {children}
    </button>
  );
}

/** The green NEXT→ that closes out steps 5 and 6. */
function NextButton({
  x,
  y,
  onClick,
}: {
  x: number;
  y: number;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={at(x, y)}
      className={`font-outfit w-[74px] shrink-0 text-center text-[22px] leading-[28px] font-bold text-[#088B20] transition-transform duration-150 hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink ${POS}`}
    >
      NEXT&rarr;
    </button>
  );
}

export default function Simulation() {
  const [stepId, setStepId] = useState<StepId>("pick");
  const [placed, setPlaced] = useState<Placement>({});
  /** Action buttons already pressed. Steps 9 and 10 have two each. */
  const [fired, setFired] = useState<string[]>([]);
  /** An action that is mid-run, so its equipment can judder while it works. */
  const [busy, setBusy] = useState<string | null>(null);
  /** Step 7's growth dial, 0-100. */
  const [dial, setDial] = useState(0);
  const [drag, setDrag] = useState<DragApi["drag"]>(null);
  const [armed, setArmed] = useState<string | null>(null);
  const [wrong, setWrong] = useState<string | null>(null);
  const [hot, setHot] = useState<string | null>(null);

  const zoneRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const startRef = useRef({ x: 0, y: 0, moved: false });
  /* When a drag ends the browser still fires a click on the element it started
     from. Stamping the time and ignoring clicks for a beat afterwards is
     self-healing: a drag that ends by advancing the step unmounts its own
     element and never delivers that click, and a stale boolean flag would then
     have swallowed the next keyboard Enter. */
  const dragEndedAt = useRef(0);
  const wrongTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const busyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (wrongTimer.current) clearTimeout(wrongTimer.current);
      if (busyTimer.current) clearTimeout(busyTimer.current);
    },
    [],
  );

  const step = STEPS[stepId];
  const rule = RULES[stepId];
  const done = rule ? rule.complete(placed) : false;

  const register = (id: string) => (el: HTMLButtonElement | null) => {
    zoneRefs.current[id] = el;
  };

  function goTo(next: StepId) {
    if (wrongTimer.current) clearTimeout(wrongTimer.current);
    if (busyTimer.current) clearTimeout(busyTimer.current);
    zoneRefs.current = {};
    setPlaced({});
    setFired([]);
    setBusy(null);
    setDial(0);
    setWrong(null);
    setHot(null);
    setArmed(null);
    setDrag(null);
    setStepId(next);
  }

  const didFire = (id: string) => fired.includes(id);

  /** Press an action button. Equipment juts about for a beat, then settles. */
  function runAction(id: string, ms = 1100) {
    if (busy || didFire(id)) return;
    setBusy(id);
    if (busyTimer.current) clearTimeout(busyTimer.current);
    busyTimer.current = setTimeout(() => {
      setBusy(null);
      setFired((f) => (f.includes(id) ? f : [...f, id]));
    }, ms);
  }

  /** Which zone is `el` (or the pointer) sitting over, if any? */
  function zoneUnder(el: HTMLElement, px: number, py: number): string | null {
    const r = el.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    for (const [id, node] of Object.entries(zoneRefs.current)) {
      if (!node) continue;
      const z = node.getBoundingClientRect();
      const inside = (x: number, y: number) =>
        x >= z.left && x <= z.right && y >= z.top && y <= z.bottom;
      if (inside(cx, cy) || inside(px, py)) return id;
    }
    return null;
  }

  function resolve(item: string, zone: string) {
    if (wrongTimer.current) clearTimeout(wrongTimer.current);

    if (!rule || !rule.accepts(item, zone, placed)) {
      // Flash the target red, then hand the prop back so it can be retried.
      setWrong(zone);
      wrongTimer.current = setTimeout(() => setWrong(null), 1600);
      return;
    }

    setWrong(null);
    const next = { ...placed, [item]: zone };
    setPlaced(next);
    if (rule.then && rule.complete(next)) goTo(rule.then);
  }

  const api: DragApi = {
    drag,
    armed,
    down(e, id) {
      if (e.pointerType === "mouse" && e.button !== 0) return;
      e.currentTarget.setPointerCapture(e.pointerId);
      startRef.current = { x: e.clientX, y: e.clientY, moved: false };
      setArmed(null);
      setDrag({ id, dx: 0, dy: 0 });
    },
    move(e, id) {
      if (!drag || drag.id !== id) return;
      const dx = e.clientX - startRef.current.x;
      const dy = e.clientY - startRef.current.y;
      if (Math.abs(dx) > 4 || Math.abs(dy) > 4) startRef.current.moved = true;
      setDrag({ id, dx, dy });
      setHot(zoneUnder(e.currentTarget, e.clientX, e.clientY));
    },
    up(e, id) {
      if (e.currentTarget.hasPointerCapture(e.pointerId))
        e.currentTarget.releasePointerCapture(e.pointerId);
      const moved = startRef.current.moved;
      const target = moved
        ? zoneUnder(e.currentTarget, e.clientX, e.clientY)
        : null;
      if (moved) dragEndedAt.current = Date.now();
      setDrag(null);
      setHot(null);
      if (target) resolve(id, target);
    },
    cancel(_e, id) {
      if (drag?.id !== id) return;
      setDrag(null);
      setHot(null);
    },
    click(id) {
      // A click that merely closed out a drag is not a "pick this up" click.
      if (Date.now() - dragEndedAt.current < 300) return;
      setArmed((a) => (a === id ? null : id));
    },
  };

  /** Clicking a zone places whatever is currently armed. */
  const placeInto = (zone: string) => () => {
    if (!armed) return;
    const item = armed;
    setArmed(null);
    resolve(item, zone);
  };

  /** Something is already sitting in this zone. */
  const occupied = (zone: string) => Object.values(placed).includes(zone);

  const zoneProps = (id: string) => ({
    id,
    register,
    wrong: wrong === id,
    hot: hot === id,
    disabled: !armed,
    onClick: placeInto(id),
  });

  return (
    <section
      id="simulate"
      className="mx-auto w-full max-w-[1013px] px-5 sm:px-8 wide:px-0"
    >
      {/* ---- header: title, blurb, Vera and her line ---- */}
      <div className="relative text-center wide:h-[387px]">
        <h2 className="font-outfit inline-flex items-baseline justify-center gap-[14px] text-[clamp(1.55rem,4.6vw,3.125rem)] leading-[1.26] font-bold wide:absolute wide:inset-x-0 wide:top-0 wide:h-[63px] wide:gap-5 wide:text-[50px] wide:leading-[63px]">
          {step.n && <span>{step.n}</span>}
          <span>{step.title}</span>
        </h2>

        <p
          style={{ maxWidth: step.blurbW }}
          className="font-outfit mx-auto mt-4 text-[clamp(1rem,2.1vw,1.5625rem)] leading-[1.28] wide:absolute wide:inset-x-0 wide:top-[94px] wide:mt-0 wide:text-[25px] wide:leading-[32px]"
        >
          {step.blurb}
        </p>

        <div className="mt-8 flex items-center justify-center gap-1 sm:gap-2 wide:mt-0 wide:block">
          <Image
            src="/assets/vera-main.png"
            alt="Vera, the lab guide"
            width={368}
            height={368}
            priority
            className="h-[76px] w-auto shrink-0 object-contain sm:h-[130px] wide:absolute wide:top-[157px] wide:left-[178px] wide:h-[179px] wide:w-[179px]"
          />
          <VeraBubble line={step.line} pillH={step.pillH} />
        </div>
      </div>

      {/* ---- stage: the beige panel every prop lives on ---- */}
      <div
        style={{ "--stage-h": `${step.stageH}px` } as React.CSSProperties}
        className="bg-story relative mt-8 flex flex-col items-center gap-8 px-4 py-9 wide:mt-0 wide:block wide:h-[var(--stage-h)] wide:p-0 wide:transition-[height] wide:duration-300 wide:ease-out"
      >
        {/* =============== 1. Pick a Bacteria Friend =============== */}
        {stepId === "pick" && (
          <>
            <div className="flex flex-wrap items-end justify-center gap-x-10 gap-y-8 wide:block">
              <Draggable
                id="ecoli"
                label="E. coli"
                width={137.5}
                height={110}
                x={120}
                y={58}
                api={api}
              >
                <EcoliArt className="absolute top-0 left-0 h-[78px] w-[137.5px]" />
                <Caption left={36.4} top={90} width={38}>
                  E.coli
                </Caption>
              </Draggable>

              <Draggable
                id="yeast"
                label="Yeast"
                width={80}
                height={128}
                x={458}
                y={40}
                api={api}
              >
                <YeastArt className="absolute top-0 left-0 h-[102px] w-[80px]" />
                <Caption left={20.1} top={108} width={38.9}>
                  yeast
                </Caption>
              </Draggable>

              <Draggable
                id="virus"
                label="Virus"
                width={133}
                height={136}
                x={759}
                y={32}
                api={api}
              >
                <VirusArt className="absolute top-[0.5px] left-[-2.5px] h-[135px] w-[135px]" />
                <Caption left={100.2} top={114} width={32.8}>
                  virus
                </Caption>
              </Draggable>
            </div>

            <DropZone
              {...zoneProps("table")}
              ariaLabel="Vera's table"
              label={"Vera's\ntable"}
              width={254}
              height={142}
              x={377}
              y={241}
              className="whitespace-pre-line"
            />
          </>
        )}

        {/* =============== 2. Open the Cell — pop =============== */}
        {stepId === "pop" && (
          <>
            <div
              style={at(438, 64)}
              className={`relative h-[110px] w-[137.5px] shrink-0 ${POS}`}
            >
              <EcoliArt className="absolute top-0 left-0 h-[78px] w-[137.5px]" />
              <Caption left={36.4} top={90} width={38}>
                E.coli
              </Caption>
            </div>

            <ActionButton
              x={406}
              y={221}
              width={201}
              height={51}
              color="#F55F64"
              fontSize={25}
              onClick={() => goTo("rescue")}
            >
              POP it !!
            </ActionButton>
          </>
        )}

        {/* =============== 2. Open the Cell — rescue the plasmid =============== */}
        {stepId === "rescue" && (
          <>
            <Draggable
              id="plasmid"
              label="Plasmid — the DNA ring"
              width={105.2}
              height={138}
              x={260}
              y={75}
              api={api}
            >
              <PlasmidArt className="absolute top-0 left-0 h-[105px] w-[105.2px]" />
              <Caption left={17.9} top={118} width={66.6}>
                DNA ring
              </Caption>
            </Draggable>

            <DropZone
              {...zoneProps("tube")}
              ariaLabel="Clean tube"
              label="clean tube"
              width={257}
              height={142}
              x={641}
              y={71}
            />
          </>
        )}

        {/* =============== 3. Cut the DNA =============== */}
        {stepId === "cut" && (
          <div className="flex flex-col items-center gap-10 wide:block">
            {/* row 1 — cut the ring open */}
            <div className="flex w-full items-center justify-center gap-5 sm:gap-10 wide:contents">
              <div
                style={at(212.4, 62.5)}
                className={`relative h-[145px] w-[105.2px] shrink-0 ${POS}`}
              >
                <PlasmidArt
                  longSite
                  className="absolute top-0 left-0 h-[105px] w-[105.2px]"
                />
                <Caption left={19.6} top={125} width={66}>
                  DNA ring
                </Caption>
              </div>

              <DropZone
                {...zoneProps("site-1")}
                ariaLabel="Cut site on the ring"
                label={occupied("site-1") ? undefined : "site"}
                labelTone="blue"
                width={60}
                height={60}
                x={CUT_SITES["site-1"][0]}
                y={CUT_SITES["site-1"][1]}
                shape="circle"
                stroke={2}
                tone="blue"
              />

              <ScissorsProp
                id="scissor-a"
                api={api}
                seat={placed["scissor-a"]}
              />
            </div>

            {/* row 2 — cut the gene out */}
            <div className="flex w-full items-center justify-center gap-5 sm:gap-10 wide:contents">
              <div
                style={at(217, 285.5)}
                className={`relative h-[69px] w-[96px] shrink-0 ${POS}`}
              >
                <GeneArt className="absolute top-0 left-0 h-[29px] w-[96px]" />
                <Caption left={28.5} top={49} width={39}>
                  Gene
                </Caption>
              </div>

              <DropZone
                {...zoneProps("site-2")}
                ariaLabel="Cut site on the gene"
                label={occupied("site-2") ? undefined : "site"}
                labelTone="blue"
                width={60}
                height={60}
                x={CUT_SITES["site-2"][0]}
                y={CUT_SITES["site-2"][1]}
                shape="circle"
                stroke={2}
                tone="blue"
              />

              <ScissorsProp
                id="scissor-b"
                api={api}
                seat={placed["scissor-b"]}
              />
            </div>
          </div>
        )}

        {/* =============== 5. Give It to a Cell =============== */}
        {stepId === "cell" && (
          <>
            {!placed.newring && (
              <Draggable
                id="newring"
                label="New DNA ring"
                width={105.2}
                height={133}
                x={215}
                y={30}
                api={api}
              >
                <NewRingArt className="absolute top-0 left-0 h-[105px] w-[105.2px]" />
                <Caption left={2.1} top={113} width={101}>
                  New DNA ring
                </Caption>
              </Draggable>
            )}

            <DropZone
              {...zoneProps("emptycell")}
              ariaLabel="Empty cell"
              label="Empty cell"
              width={258}
              height={80}
              // Once the ring is absorbed the ring itself is gone, so the cell
              // slides to the middle rather than sitting off to one side.
              x={placed.newring ? 377.5 : 540}
              y={42.5}
              className="wide:transition-[left] wide:duration-300"
            >
              {placed.newring ? (
                <NewRingArt className="h-[60px] w-[60px]" />
              ) : undefined}
            </DropZone>

            {done && (
              <ActionButton
                x={415.5}
                y={175}
                width={182}
                height={52}
                color="#F85E5E"
                fontSize={16}
                onClick={() => runAction("shock", 700)}
              >
                HEAT SHOCK
              </ActionButton>
            )}

            {didFire("shock") && (
              <>
                <StageLabel
                  x={291.5}
                  y={244}
                  width={336}
                  color="#088B20"
                  className="whitespace-normal"
                >
                  It worked! The new DNA is safely inside the cell.
                </StageLabel>
                <NextButton x={647.5} y={240} onClick={() => goTo("winners")} />
              </>
            )}
          </>
        )}

        {/* =============== 6. Find the Winners =============== */}
        {stepId === "winners" && (
          <>
            <DropZone
              {...zoneProps("dish")}
              ariaLabel="Selection dish"
              width={200}
              height={200}
              x={406.5}
              y={8}
              shape="circle"
              tone="blue"
              className="relative"
            >
              {didFire("incubate") ? <DishColonies /> : undefined}
            </DropZone>

            {(["group-with", "group-without"] as const).map((id) => {
              const seated = !!placed[id];
              const [x, y] = seated ? BLOB_SLOT[id] : BLOB_REST[id];
              const [lx, ly] = seated ? LABEL_SLOT[id] : LABEL_REST[id];
              const withDna = id === "group-with";
              // After the incubation, only the group carrying the ring is left.
              const faded = didFire("incubate") && !withDna;
              return (
                <div
                  key={id}
                  className={`flex flex-col items-center gap-2 transition-opacity duration-500 wide:contents ${
                    faded ? "opacity-10" : ""
                  }`}
                >
                  <Draggable
                    id={id}
                    label={
                      withDna ? "Group with DNA ring" : "Group without the ring"
                    }
                    width={85}
                    height={85}
                    x={x}
                    y={y}
                    api={api}
                    settled={seated}
                    className={faded ? "wide:opacity-10" : ""}
                  >
                    <ColonyArt
                      tone={withDna ? "with" : "without"}
                      className="absolute top-0 left-0 h-[85px] w-[85px]"
                    />
                  </Draggable>
                  <StageLabel
                    x={lx}
                    y={ly}
                    width={withDna ? 148 : 115}
                    className={`wide:transition-[left,top] wide:duration-300 ${faded ? "wide:opacity-10" : ""}`}
                  >
                    {withDna ? "Group with DNA ring" : "Group without it"}
                  </StageLabel>
                </div>
              );
            })}

            {done && (
              <ActionButton
                x={392.5}
                y={244}
                width={228}
                height={64}
                color="#4F78E0"
                fontSize={16}
                onClick={() => runAction("incubate", 900)}
              >
                Incubate overnight
              </ActionButton>
            )}

            {didFire("incubate") && (
              <>
                <StageLabel
                  x={361.5}
                  y={316}
                  width={290}
                  color="#088B20"
                  className="whitespace-normal"
                >
                  Only the cells with our DNA ring survived.
                </StageLabel>
                <NextButton x={469.5} y={342} onClick={() => goTo("grow")} />
              </>
            )}
          </>
        )}

        {/* =============== 7. Grow More Cells =============== */}
        {stepId === "grow" && (
          <>
            {/* the flask is its own drop target, so it reads as one object at
                every width rather than an invisible zone beside the drawing */}
            <DropZone
              {...zoneProps("flask")}
              ariaLabel="Flask of food"
              width={116}
              height={198}
              x={200}
              y={55}
              edge="none"
            >
              <FlaskArt
                fill={placed.cell ? 0.12 + (dial / 100) * 0.78 : 0}
                cells={placed.cell ? 1 + Math.round((dial / 100) * 9) : 0}
                className="h-[198px] w-[116px]"
              />
            </DropZone>

            {placed.cell ? (
              <StageLabel x={228} y={258} width={86}>
                Winning cell
              </StageLabel>
            ) : (
              <Draggable
                id="cell"
                label="Winning cell"
                width={116}
                height={30}
                x={570}
                y={70}
                api={api}
              >
                <span className="absolute top-0 left-0 block size-[30px] rounded-full bg-[#FFAB03]" />
                <Caption left={30} top={5} width={86}>
                  Winning cell
                </Caption>
              </Draggable>
            )}

            <div
              style={at(570, 175)}
              className={`flex shrink-0 flex-col items-center ${POS}`}
            >
              <input
                type="range"
                min={0}
                max={100}
                value={dial}
                disabled={!placed.cell}
                onChange={(e) => setDial(Number(e.target.value))}
                aria-label="Growth dial"
                className="sim-dial"
              />
            </div>
            <StageLabel x={608} y={215} width={161} font="inter">
              slide the dial to grow it
            </StageLabel>

            {GROWN_ENOUGH(dial) && placed.cell && (
              <>
                <StageLabel
                  x={388}
                  y={300}
                  width={237}
                  color="#088B20"
                  font="inter"
                >
                  Your batch of cells is ready to go.
                </StageLabel>
                <NextButton x={469.5} y={326} onClick={() => goTo("iptg")} />
              </>
            )}
            {placed.cell && dial > 90 && (
              <StageLabel
                x={368}
                y={300}
                width={277}
                color="#E49B09"
                font="inter"
              >
                That is a bit too much — ease the dial back.
              </StageLabel>
            )}
          </>
        )}

        {/* =============== 8. Turn On the Protein =============== */}
        {stepId === "iptg" && (
          <>
            <DropZone
              {...zoneProps("flask")}
              ariaLabel="Flask of cells"
              width={116}
              height={198}
              x={200}
              y={55}
              edge="none"
            >
              <FlaskArt
                fill={0.9}
                cells={placed.iptg ? 10 : 6}
                className="h-[198px] w-[116px]"
              />
            </DropZone>
            <StageLabel x={228} y={258} width={86}>
              Winning cell
            </StageLabel>

            {placed.iptg ? (
              <>
                <div
                  style={at(236.5, 60)}
                  className={`relative h-[44px] w-[43px] shrink-0 ${POS}`}
                >
                  <IptgArt className="absolute top-0 left-0 h-[44px] w-[43px]" />
                </div>
                <StageLabel x={222.5} y={106} width={71}>
                  IPTG
                </StageLabel>
              </>
            ) : (
              <Draggable
                id="iptg"
                label="IPTG"
                width={61}
                height={154}
                x={600}
                y={70}
                api={api}
              >
                <IptgArt className="absolute top-0 left-0 h-[123px] w-[61px]" />
                <Caption left={12.5} top={134} width={36}>
                  IPTG
                </Caption>
              </Draggable>
            )}

            {placed.iptg && (
              <>
                <StageLabel x={306.5} y={300} width={400} color="#088B20">
                  Protein switch ON — the cells are hard at work!
                </StageLabel>
                <NextButton x={469.5} y={330} onClick={() => goTo("lyse")} />
              </>
            )}
          </>
        )}

        {/* =============== 9. Break Open the Cells =============== */}
        {stepId === "lyse" && (
          <>
            <StageLabel x={306.5} y={10} width={53} color="#0995D1">
              spinner
            </StageLabel>
            <DropZone
              {...zoneProps("spinner")}
              ariaLabel="Spinner"
              width={160}
              height={216}
              x={280}
              y={36}
              stroke={2}
              tone="sky"
              className={busy === "spin" ? "sim-working" : ""}
            />

            <StageLabel x={690.5} y={30} width={44} color="#0995D1">
              buffer
            </StageLabel>
            <DropZone
              {...zoneProps("buffer")}
              ariaLabel="Buffer"
              width={125}
              height={125}
              x={650}
              y={56}
              shape="circle"
              stroke={2}
              tone="sky"
              className={busy === "shake" ? "sim-working" : ""}
            />

            {/* the flask of cells, until it has been spun down */}
            {!didFire("spin") && (
              <Draggable
                id="flask"
                label="Flask of cells"
                width={89}
                height={128}
                x={placed.flask ? 313 : 80}
                y={placed.flask ? 90 : 90}
                api={api}
                settled={!!placed.flask}
                className={busy === "spin" ? "sim-working" : ""}
              >
                <span className="absolute top-0 left-[20px] block h-[108px] w-[49px] rounded-[20px] bg-[#0FB6FE]" />
                <Caption left={0} top={108} width={89}>
                  Flask of cells
                </Caption>
              </Draggable>
            )}

            {/* what the spin leaves behind */}
            {didFire("spin") && (
              <Draggable
                id="pellet"
                label="Leftover cells"
                width={94}
                height={84}
                x={placed.pellet ? 665.5 : 313}
                y={placed.pellet ? 76 : 100}
                api={api}
                settled={!!placed.pellet}
                className={busy === "shake" ? "sim-working" : ""}
              >
                <span className="absolute top-0 left-[15.5px] block h-[64px] w-[63px] rounded-[50px] bg-[#4F78E0]" />
                <Caption left={0} top={64} width={94}>
                  Leftover cells
                </Caption>
              </Draggable>
            )}

            {placed.flask && !didFire("spin") && (
              <ActionButton
                x={310}
                y={268}
                width={100}
                height={64}
                color="#4F78E0"
                fontSize={16}
                onClick={() => runAction("spin")}
              >
                SPIN
              </ActionButton>
            )}

            {placed.pellet && (
              <ActionButton
                x={619}
                y={268}
                width={187}
                height={64}
                color="#E49B09"
                fontSize={16}
                onClick={() => runAction("shake")}
              >
                Shake it to open
              </ActionButton>
            )}

            {didFire("shake") && (
              <>
                <StageLabel x={388} y={350} width={237} color="#088B20">
                  The cells are open — protein is out.
                </StageLabel>
                <NextButton x={469.5} y={376} onClick={() => goTo("purify")} />
              </>
            )}
          </>
        )}

        {/* =============== 10. Clean the Protein =============== */}
        {stepId === "purify" && (
          <>
            {!placed.liquid && (
              <Draggable
                id="liquid"
                label="Liquid with protein"
                width={131}
                height={86}
                x={180}
                y={100}
                api={api}
              >
                <span className="absolute top-0 left-[49.5px] block h-[66px] w-[32px] border-2 border-ink bg-[#FFAB03]" />
                <Caption left={0} top={66} width={131}>
                  Liquid with protein
                </Caption>
              </Draggable>
            )}

            <DropZone
              {...zoneProps("column")}
              ariaLabel="Purification column"
              width={96}
              height={224}
              x={490}
              y={60}
              edge="solid"
              className={busy === "wash" ? "sim-working" : ""}
            >
              {placed.liquid ? (
                <span
                  className={`block w-[32px] border-2 border-ink transition-all duration-500 ${
                    didFire("collect")
                      ? "h-[24px] bg-[#FFAB03]"
                      : "h-[66px] bg-[#FFAB03]"
                  }`}
                />
              ) : undefined}
            </DropZone>

            {placed.liquid && !didFire("wash") && (
              <ActionButton
                x={700}
                y={110}
                width={100}
                height={64}
                color="#4F78E0"
                fontSize={16}
                onClick={() => runAction("wash")}
              >
                Wash
              </ActionButton>
            )}

            {didFire("wash") && !didFire("collect") && (
              <ActionButton
                x={705}
                y={110}
                width={90}
                height={35}
                color="#088B20"
                fontSize={16}
                onClick={() => runAction("collect", 700)}
              >
                COLLECT
              </ActionButton>
            )}

            {didFire("collect") && (
              <StageLabel x={306.5} y={320} width={400} color="#088B20">
                Pure protein, collected. That is the whole process.
              </StageLabel>
            )}
          </>
        )}
      </div>

      <p className="mt-4 h-[24px] text-right">
        {stepId !== "pick" && (
          <button
            type="button"
            onClick={() => goTo("pick")}
            className="font-outfit text-[15px] underline underline-offset-4 opacity-60 transition-opacity hover:opacity-100"
          >
            start over
          </button>
        )}
      </p>
    </section>
  );
}
