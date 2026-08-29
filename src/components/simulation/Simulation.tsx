"use client";

import Image from "next/image";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type React from "react";
import {
  BenchArt,
  BufferWellArt,
  CellDotArt,
  CentrifugeArt,
  ColonyArt,
  ColumnArt,
  DishArt,
  EcoliArt,
  FlaskArt,
  GeneArt,
  HostCellArt,
  IptgArt,
  LysateArt,
  NewRingArt,
  PelletArt,
  PlasmidArt,
  ProteinArt,
  ScissorsArt,
  TubeRackArt,
  VirusArt,
  YeastArt,
} from "./art";
import type { ColumnPhase } from "./art";

/* ---------------------------------------------------------------------------
 * The whole walkthrough lives in one card and never navigates: every step
 * swaps the card's contents in place.
 *
 * Geometry is in design pixels on the 1013px content column. Everything on the
 * stage is placed with the `POS` helper, which only takes effect at the `wide:`
 * breakpoint — below that the same nodes fall back to flow layout so the art
 * and captions stay legible on a phone.
 *
 * The header block (title, blurb, Vera, her speech pill) is identical in every
 * step and 387px tall; only the lit stage below it changes height.
 *
 * The stage is a lit bench with real depth: `perspective` lives on the panel
 * and the props move on the Z axis, so lifting one brings it toward the viewer
 * rather than merely scaling it. All of that is in `globals.css` under
 * `.sim-stage`, and one `prefers-reduced-motion` block turns the motion off.
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

/** Screen order — used by the progress rail, which reports where you are and
 *  changes nothing about the walkthrough itself. */
const STEP_ORDER: StepId[] = [
  "pick",
  "pop",
  "rescue",
  "cut",
  "cell",
  "winners",
  "grow",
  "iptg",
  "lyse",
  "purify",
];

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
    stageH: 360,
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
    stageH: 460,
  },
  winners: {
    n: "6.",
    title: "Find the Winners",
    blurb:
      "Only cells that got our DNA ring can survive on this special dish. Let's test both groups and see.",
    blurbW: 1033,
    line: "Drag both groups onto the dish, then press INCUBATE. Let's see who is still alive tomorrow!",
    stageH: 460,
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
    stageH: 470,
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
    stageH: 470,
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

/* Step 6 — the two groups queue up below the dish and are dragged up onto the
 * agar, one under the other rather than flanking the plate. */
const BLOB_REST: Record<string, [number, number]> = {
  "group-with": [464, 236],
  "group-without": [464, 344],
};
/** Where a group lands when it is placed by click or keyboard, which carries
 *  no drop point of its own: half the plate each. */
const BLOB_SLOT: Record<string, [number, number]> = {
  "group-with": [417, 65.5],
  "group-without": [511, 65.5],
};
const LABEL_REST: Record<string, [number, number]> = {
  "group-with": [560, 268],
  "group-without": [560, 376],
};
const LABEL_SLOT: Record<string, [number, number]> = {
  "group-with": [356, 216],
  "group-without": [532.5, 216],
};

/* The dish, for keeping a dropped group on the agar. */
const BLOB = 85;
const DISH: { cx: number; cy: number; r: number } = { cx: 506.5, cy: 108, r: 100 };
/**
 * Nudge a group so the whole 85px blob lands inside the plate. Anywhere on the
 * agar is a legitimate place to streak it, so this only pulls back the ones
 * that would hang over the rim.
 */
function onAgar(x: number, y: number): [number, number] {
  const vx = x + BLOB / 2 - DISH.cx;
  const vy = y + BLOB / 2 - DISH.cy;
  const d = Math.hypot(vx, vy);
  const max = DISH.r - BLOB / 2;
  if (d <= max || d === 0) return [x, y];
  const k = max / d;
  return [DISH.cx + vx * k - BLOB / 2, DISH.cy + vy * k - BLOB / 2];
}

/* The seven colonies that come up overnight. Centres relative to the dish's
 * 200px box, scattered across the plate rather than sitting on the group that
 * seeded them — traced off the supplied artwork, which keeps them clear of the
 * green blob and lets a couple land over the faded one. Irregular on purpose. */
const DISH_COLONIES: [number, number][] = [
  [128, 32],
  [163, 72],
  [108, 62],
  [170, 118],
  [136, 150],
  [72, 170],
  [110, 178],
];

/** Absolutely positioned inside the dish, so they scatter over the plate, and
 *  staggered so the plate visibly comes up rather than snapping on. */
function DishColonies() {
  return (
    <>
      {DISH_COLONIES.map(([x, y], i) => (
        <span
          key={`${x}-${y}`}
          data-colony
          style={{
            left: x - 11,
            top: y - 11,
            animationDelay: `${i * 90}ms`,
          }}
          className="sim-grow-in absolute block size-[22px] rounded-full"
        >
          <span className="block size-full rounded-full bg-[radial-gradient(circle_at_34%_30%,#FFF3C4_0%,#FFAB03_52%,#9C5A00_100%)] shadow-[0_0_10px_rgba(255,171,3,0.65)]" />
        </span>
      ))}
    </>
  );
}

/* --- speech bubble -------------------------------------------------------
 * Rectangle 31 is a 490 x 64 pill; Polygon 1 is the sliver that points back at
 * Vera, 48px left of the pill and 23px down from its top.
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
        <polygon points="1.485,16.165 93.4,0 96.37,26.728" fill="#2b3740" />
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
      className="font-outfit absolute text-center text-[16px] leading-[20px] whitespace-nowrap [text-shadow:0_2px_8px_rgba(0,0,0,0.65)]"
      style={{ left, top, width, color: color ?? "var(--sim-fg)" }}
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
      style={{ ...at(x, y), width, color: color ?? "var(--sim-fg)" }}
      className={`block text-center whitespace-nowrap [text-shadow:0_2px_8px_rgba(0,0,0,0.6)] ${POS} ${
        font === "inter"
          ? "text-[15px] leading-[18px]"
          : "font-outfit text-[16px] leading-[20px]"
      } ${className}`}
    >
      {children}
    </span>
  );
}

/** The green line a step prints when it has gone right. */
function GoodNews({
  children,
  x,
  y,
  width,
  className = "",
}: {
  children: React.ReactNode;
  x: number;
  y: number;
  width: number;
  className?: string;
}) {
  return (
    <StageLabel
      x={x}
      y={y}
      width={width}
      color="#7BF3A5"
      className={`sim-enter ${className}`}
    >
      {children}
    </StageLabel>
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
  /** Ids that were placed on this render and must land without animating. */
  settling: Record<string, boolean>;
}

/* `useLayoutEffect` warns when React renders on the server, and this component
   is prerendered. The effect below only ever has work to do after a pointer
   interaction, so falling back to `useEffect` there costs nothing. */
const useIsoLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

/**
 * A dropped prop must land where it was dropped, with no rubber-band.
 *
 * While a prop is dragged it sits at its old `left`/`top` with a transform
 * carrying the pointer delta. On the render that places it, `left`/`top` jump
 * to the target and React clears that transform — but `.sim-prop` transitions
 * `transform`, so the browser animates the delta back out over a quarter of a
 * second. The eye reads that as the prop snapping home and then crawling to
 * the target.
 *
 * So on the placing render only, clear the transform with transitions off and
 * flush it, then hand styling back to the stylesheet. The prop is simply at
 * its destination on the very next frame.
 *
 * This deliberately does no measuring. An earlier attempt animated a measured
 * first/last delta; the "first" rect it captured was the prop's untransformed
 * position, so it inverted the wrong offset and drove exactly the snap-back it
 * was meant to remove.
 */
function useSettleInPlace(
  id: string,
  api: DragApi,
  ref: React.RefObject<HTMLButtonElement | null>,
) {
  useIsoLayoutEffect(() => {
    if (!api.settling[id]) return;
    delete api.settling[id];
    const el = ref.current;
    if (!el) return;
    const prevTransition = el.style.transition;
    el.style.transition = "none";
    el.style.transform = "none";
    void el.offsetWidth; // commit the jump before transitions come back
    el.style.transition = prevTransition;
    el.style.transform = "";
  });
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
  const nodeRef = useRef<HTMLButtonElement | null>(null);
  useSettleInPlace(id, api, nodeRef);

  return (
    <button
      ref={nodeRef}
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
        // The Z translate is what makes a lifted prop come off the bench:
        // the stage sets `perspective`, so this is real depth, not a scale.
        transform: dragging
          ? `translate3d(${api.drag!.dx}px, ${api.drag!.dy}px, 70px)`
          : undefined,
      }}
      className={`grabbable sim-prop relative block shrink-0 rounded-[10px] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--sim-cyan)] ${POS} ${
        dragging
          ? "sim-prop--lifted z-30 cursor-grabbing !transition-none"
          : `transition-[transform,left,top,filter] duration-300 ease-out ${
              settled ? "sim-prop--settled cursor-default" : "cursor-grab"
            }`
      } ${armed ? "sim-prop--armed" : ""} ${className}`}
    >
      {children}
    </button>
  );
}

/* --- drop targets --------------------------------------------------------
 * A zone is a socket recessed into the bench. `art` is the equipment that
 * lives in it (a centrifuge, a rack, a dish); `label` is the centred word a
 * bare socket shows; `chip` is the small caption a socket with art carries
 * along its bottom edge.
 */
function DropZone({
  id,
  register,
  label,
  chip,
  art,
  ariaLabel,
  width,
  height,
  x,
  y,
  shape = "rect",
  bare = false,
  tiny = false,
  open = false,
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
  chip?: string;
  art?: React.ReactNode;
  ariaLabel: string;
  width: number;
  height: number;
  x: number;
  y: number;
  shape?: "rect" | "circle";
  /** The equipment is the target — no socket rim around it. */
  bare?: boolean;
  /** The small blue label a cut site carries. */
  tiny?: boolean;
  /** Pulse the rim: this is where the next thing goes. */
  open?: boolean;
  wrong: boolean;
  hot: boolean;
  disabled: boolean;
  onClick: () => void;
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <button
      ref={register(id)}
      type="button"
      aria-label={ariaLabel}
      data-zone={id}
      disabled={disabled}
      onClick={onClick}
      style={{ ...at(x, y), width, height }}
      className={`sim-zone relative grid shrink-0 place-items-center focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--sim-cyan)] ${POS} ${
        shape === "circle" ? "sim-zone--circle" : ""
      } ${bare ? "sim-zone--bare" : ""} ${hot ? "sim-zone--hot" : ""} ${
        wrong ? "sim-zone--wrong" : ""
      } ${open && !hot && !wrong ? "sim-zone--open" : ""} ${className}`}
    >
      {art && (
        <span className="pointer-events-none absolute inset-0 block">{art}</span>
      )}

      {children && <span className="relative block">{children}</span>}

      {label && !children && (
        <span
          className={`sim-zone-label relative text-center ${
            tiny
              ? "text-[16px] leading-[20px] text-[var(--sim-cyan)]"
              : "text-[20px] leading-[27px] wide:text-[25px] wide:leading-[32px]"
          }`}
        >
          {wrong ? "error" : label}
        </span>
      )}

      {chip && !children && (
        <span className="sim-zone-chip">{wrong ? "error" : chip}</span>
      )}
    </button>
  );
}

/** The reticle drawn inside a cut site, so it reads as somewhere to aim. */
function SiteReticle() {
  return (
    <svg
      viewBox="0 0 60 60"
      className="h-full w-full"
      aria-hidden="true"
    >
      <circle
        cx="30"
        cy="30"
        r="25"
        fill="none"
        stroke="#38E1FF"
        strokeWidth="1.4"
        strokeDasharray="4 5"
        opacity="0.75"
      />
      <circle
        cx="30"
        cy="30"
        r="13"
        fill="rgba(56,225,255,0.1)"
        stroke="#38E1FF"
        strokeWidth="1"
        opacity="0.6"
      />
      {[
        [30, 2, 30, 12],
        [30, 48, 30, 58],
        [2, 30, 12, 30],
        [48, 30, 58, 30],
      ].map(([x1, y1, x2, y2]) => (
        <line
          key={`${x1}-${y1}`}
          x1={x1}
          y1={y1}
          x2={x2}
          y2={y2}
          stroke="#38E1FF"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      ))}
    </svg>
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
      <ScissorsArt
        closed={!!seat}
        className="absolute top-[4.5px] left-[0.5px] h-[51px] w-[59px]"
      />
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
  edge,
  glow,
  fontSize,
  onClick,
  children,
}: {
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  /** The 3px lip under the button — a darker shade of its own colour. */
  edge: string;
  /** The bloom it throws onto the bench. */
  glow: string;
  fontSize: number;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={
        {
          ...at(x, y),
          width,
          height,
          backgroundColor: color,
          fontSize,
          "--sim-btn-edge": edge,
          "--sim-btn-glow": glow,
        } as React.CSSProperties
      }
      className={`sim-button sim-enter grid shrink-0 place-items-center px-2 text-center leading-[1.2] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--sim-cyan)] ${POS}`}
    >
      {children}
    </button>
  );
}

/** The green NEXT→ that closes out a finished step. */
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
      className={`sim-next sim-enter h-[34px] w-[104px] shrink-0 text-center text-[18px] leading-[32px] font-bold focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--sim-cyan)] ${POS}`}
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
  /** An action that is mid-run, so its equipment can work while it runs. */
  const [busy, setBusy] = useState<string | null>(null);
  /** Step 7's growth dial, 0-100. */
  const [dial, setDial] = useState(0);
  /** Where each prop was dropped, as a delta from its resting spot. Step 6
   *  uses it so a group of cells stays on the patch of agar you chose. */
  const [dropped, setDropped] = useState<Record<string, [number, number]>>({});
  /** Step 2's cell, mid-burst. */
  const [popping, setPopping] = useState(false);
  const [drag, setDrag] = useState<DragApi["drag"]>(null);
  const [armed, setArmed] = useState<string | null>(null);
  const [wrong, setWrong] = useState<string | null>(null);
  const [hot, setHot] = useState<string | null>(null);

  const zoneRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  /** Set the instant before a placement re-render; read by `useSettleInPlace`. */
  const settling = useRef<Record<string, boolean>>({});
  /** How far a prop was dragged when it was dropped, in design px. */
  const dropDelta = useRef<Record<string, [number, number]>>({});
  const startRef = useRef({ x: 0, y: 0, moved: false });
  /* When a drag ends the browser still fires a click on the element it started
     from. Stamping the time and ignoring clicks for a beat afterwards is
     self-healing: a drag that ends by advancing the step unmounts its own
     element and never delivers that click, and a stale boolean flag would then
     have swallowed the next keyboard Enter. */
  const dragEndedAt = useRef(0);
  const wrongTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const busyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const popTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (wrongTimer.current) clearTimeout(wrongTimer.current);
      if (busyTimer.current) clearTimeout(busyTimer.current);
      if (popTimer.current) clearTimeout(popTimer.current);
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
    if (popTimer.current) clearTimeout(popTimer.current);
    zoneRefs.current = {};
    settling.current = {};
    dropDelta.current = {};
    setPlaced({});
    setDropped({});
    setFired([]);
    setBusy(null);
    setDial(0);
    setPopping(false);
    setWrong(null);
    setHot(null);
    setArmed(null);
    setDrag(null);
    setStepId(next);
  }

  const didFire = (id: string) => fired.includes(id);

  /** Press an action button. Equipment runs for a beat, then settles. */
  function runAction(id: string, ms = 1100) {
    if (busy || didFire(id)) return;
    setBusy(id);
    if (busyTimer.current) clearTimeout(busyTimer.current);
    busyTimer.current = setTimeout(() => {
      setBusy(null);
      setFired((f) => (f.includes(id) ? f : [...f, id]));
    }, ms);
  }

  /** Step 2: burst the cell open, then move on to rescuing the plasmid. */
  function popTheCell() {
    if (popping) return;
    setPopping(true);
    popTimer.current = setTimeout(() => goTo("rescue"), 620);
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
      const delta: [number, number] = drag ? [drag.dx, drag.dy] : [0, 0];
      setDrag(null);
      setHot(null);
      if (target) {
        settling.current[id] = true;
        dropDelta.current[id] = delta;
        setDropped((d) => ({ ...d, [id]: delta }));
        resolve(id, target);
      }
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
    settling: settling.current,
  };

  /** Clicking a zone places whatever is currently armed. */
  const placeInto = (zone: string) => () => {
    if (!armed) return;
    const item = armed;
    settling.current[item] = true;
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

  /** Step 10's column walks through four states as the buttons are pressed. */
  const columnPhase: ColumnPhase = didFire("collect")
    ? "collected"
    : didFire("wash")
      ? "washed"
      : placed.liquid
        ? "loaded"
        : "empty";

  const stepIndex = STEP_ORDER.indexOf(stepId);

  return (
    <section
      id="simulate"
      className="mx-auto w-full max-w-[1013px] px-5 sm:px-8 wide:px-0"
    >
      {/* ---- header: title, blurb, Vera and her line ---- */}
      <div className="relative text-center wide:h-[387px]">
        <h2 className="font-outfit inline-flex items-baseline justify-center gap-[14px] text-[clamp(1.55rem,4.6vw,3.125rem)] leading-[1.26] font-bold wide:absolute wide:inset-x-0 wide:top-0 wide:h-[63px] wide:gap-5 wide:text-[50px] wide:leading-[63px]">
          {step.n && (
            <span className="bg-[linear-gradient(135deg,#0F7A9E_0%,#0B8B45_100%)] bg-clip-text text-transparent">
              {step.n}
            </span>
          )}
          <span>{step.title}</span>
        </h2>

        <p
          style={{ maxWidth: step.blurbW }}
          className="font-outfit mx-auto mt-4 text-[clamp(1rem,2.1vw,1.5625rem)] leading-[1.28] wide:absolute wide:inset-x-0 wide:top-[94px] wide:mt-0 wide:text-[25px] wide:leading-[32px]"
        >
          {step.blurb}
        </p>

        <div className="mt-8 flex items-center justify-center gap-1 sm:gap-2 wide:mt-0 wide:block">
          <span
            aria-hidden="true"
            className="vera-glow hidden wide:block wide:top-[170px] wide:left-[150px] wide:size-[235px]"
          />
          <Image
            src="/assets/vera-main.png"
            alt="Vera, the lab guide"
            width={368}
            height={368}
            priority
            className="h-[76px] w-auto shrink-0 object-contain drop-shadow-[0_10px_18px_rgba(6,24,34,0.28)] sm:h-[130px] wide:absolute wide:top-[157px] wide:left-[178px] wide:h-[179px] wide:w-[179px]"
          />
          <VeraBubble line={step.line} pillH={step.pillH} />
        </div>
      </div>

      {/* ---- stage: the lit bench every prop stands on ---- */}
      <div
        style={{ "--stage-h": `${step.stageH}px` } as React.CSSProperties}
        className="sim-stage mt-8 flex flex-col items-center gap-8 px-4 py-9 wide:mt-0 wide:block wide:h-[var(--stage-h)] wide:p-0 wide:transition-[height] wide:duration-300 wide:ease-out"
      >
        {/* =============== 1. Pick a Bacteria Friend =============== */}
        {stepId === "pick" && (
          <>
            <div className="sim-enter flex flex-wrap items-end justify-center gap-x-10 gap-y-8 wide:block">
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
              chip="Vera's table"
              art={<BenchArt className="h-full w-full" />}
              bare
              open
              width={254}
              height={142}
              x={377}
              y={241}
            />
          </>
        )}

        {/* =============== 2. Open the Cell — pop =============== */}
        {stepId === "pop" && (
          <>
            <div
              style={at(438, 64)}
              className={`sim-enter relative h-[110px] w-[137.5px] shrink-0 ${POS}`}
            >
              <div className={popping ? "sim-burst" : ""}>
                <EcoliArt className="absolute top-0 left-0 h-[78px] w-[137.5px]" />
              </div>
              {!popping && (
                <span
                  aria-hidden="true"
                  className="sim-shock absolute top-[-14px] left-[-16px] block h-[106px] w-[170px] rounded-full border-2 border-[var(--sim-rose)]/50"
                />
              )}
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
              edge="#8E1F23"
              glow="rgba(245,95,100,0.7)"
              fontSize={25}
              onClick={popTheCell}
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
              x={453.9}
              y={24}
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
              chip="clean tube"
              art={
                <TubeRackArt filled={occupied("tube")} className="h-full w-full" />
              }
              bare
              open
              width={257}
              height={142}
              x={378}
              y={190}
            />
          </>
        )}

        {/* =============== 3. Cut the DNA =============== */}
        {stepId === "cut" && (
          <div className="sim-enter flex flex-col items-center gap-10 wide:block">
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
                art={occupied("site-1") ? undefined : <SiteReticle />}
                tiny
                bare
                width={60}
                height={60}
                x={CUT_SITES["site-1"][0]}
                y={CUT_SITES["site-1"][1]}
                shape="circle"
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
                art={occupied("site-2") ? undefined : <SiteReticle />}
                tiny
                bare
                width={60}
                height={60}
                x={CUT_SITES["site-2"][0]}
                y={CUT_SITES["site-2"][1]}
                shape="circle"
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
                x={453.9}
                y={14}
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
              chip={placed.newring ? undefined : "Empty cell"}
              art={
                <HostCellArt
                  open={busy === "shock" || didFire("shock")}
                  className="h-full w-full"
                />
              }
              bare
              open={!placed.newring}
              width={258}
              height={80}
              // The ring waits directly above, so the cell stays put on the
              // centre line whether or not it has taken it yet. The ring's box
              // ends at 147 including its caption, so this leaves a clear 53px
              // between the two rather than letting their glows run together.
              x={377.5}
              y={200}
            >
              {placed.newring ? (
                <NewRingArt className="h-[62px] w-[62px]" />
              ) : undefined}
            </DropZone>

            {done && !didFire("shock") && (
              <ActionButton
                x={415.5}
                y={308}
                width={182}
                height={52}
                color="#F85E5E"
                edge="#8A1F1F"
                glow="rgba(248,94,94,0.7)"
                fontSize={16}
                onClick={() => runAction("shock", 700)}
              >
                HEAT SHOCK
              </ActionButton>
            )}

            {didFire("shock") && (
              <>
                <GoodNews x={338.5} y={380} width={336}>
                  It worked! The new DNA is safely inside the cell.
                </GoodNews>
                <NextButton x={454.5} y={406} onClick={() => goTo("winners")} />
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
              art={
                <>
                  <DishArt className="h-full w-full" />
                  {didFire("incubate") && <DishColonies />}
                </>
              }
              bare
              open={!done}
              width={200}
              height={200}
              x={406.5}
              y={8}
              shape="circle"
            />

            {(["group-with", "group-without"] as const).map((id) => {
              const seated = !!placed[id];
              // Dropped by pointer: keep it exactly where it was let go, only
              // reined in far enough to stay wholly on the agar. Placed by
              // click or keyboard, where there is no drop point to honour: the
              // tidy half-and-half slots.
              const [x, y] = seated
                ? dropped[id]
                  ? onAgar(
                      BLOB_REST[id][0] + dropped[id][0],
                      BLOB_REST[id][1] + dropped[id][1],
                    )
                  : BLOB_SLOT[id]
                : BLOB_REST[id];
              // The captions keep their hand-set slots under the dish. Letting
              // them track a freely dropped group put the two long labels on
              // top of each other the moment the groups sat close together.
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

            {done && !didFire("incubate") && (
              <ActionButton
                // Only ever shown once both groups are on the agar, so the
                // bench below them is clear by the time it appears.
                x={392.5}
                y={250}
                width={228}
                height={64}
                color="#4F78E0"
                edge="#22397A"
                glow="rgba(79,120,224,0.7)"
                fontSize={16}
                onClick={() => runAction("incubate", 900)}
              >
                Incubate overnight
              </ActionButton>
            )}

            {didFire("incubate") && (
              <>
                <GoodNews x={361.5} y={334} width={290}>
                  Only the cells with our DNA ring survived.
                </GoodNews>
                <NextButton x={454.5} y={360} onClick={() => goTo("grow")} />
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
              art={
                <FlaskArt
                  fill={placed.cell ? 0.12 + (dial / 100) * 0.78 : 0.1}
                  cells={placed.cell ? 1 + Math.round((dial / 100) * 9) : 0}
                  className="h-full w-full"
                />
              }
              bare
              open={!placed.cell}
              width={116}
              height={198}
              x={200}
              y={55}
            />

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
                <CellDotArt className="absolute top-0 left-0 h-[30px] w-[30px]" />
                <Caption left={30} top={5} width={86}>
                  Winning cell
                </Caption>
              </Draggable>
            )}

            <div
              style={at(570, 175)}
              className={`sim-dial-wrap relative flex shrink-0 flex-col items-center ${POS}`}
            >
              <span aria-hidden="true" className="sim-dial-band" />
              <input
                type="range"
                min={0}
                max={100}
                value={dial}
                disabled={!placed.cell}
                onChange={(e) => setDial(Number(e.target.value))}
                aria-label="Growth dial"
                className="sim-dial relative"
              />
            </div>
            <StageLabel x={608} y={215} width={161} font="inter">
              slide the dial to grow it
            </StageLabel>

            {GROWN_ENOUGH(dial) && placed.cell && (
              <>
                <GoodNews x={388} y={300} width={237}>
                  Your batch of cells is ready to go.
                </GoodNews>
                <NextButton x={454.5} y={326} onClick={() => goTo("iptg")} />
              </>
            )}
            {placed.cell && dial > 90 && (
              <StageLabel
                x={368}
                y={300}
                width={277}
                color="#FFC94A"
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
              art={
                <FlaskArt
                  fill={0.9}
                  cells={placed.iptg ? 10 : 6}
                  tint={placed.iptg ? "green" : "amber"}
                  glow={!!placed.iptg}
                  className="h-full w-full"
                />
              }
              bare
              open={!placed.iptg}
              width={116}
              height={198}
              x={448.5}
              y={16}
            />
            <StageLabel x={463.5} y={220} width={86}>
              Winning cell
            </StageLabel>

            {placed.iptg ? (
              <>
                <div
                  style={at(548, 20)}
                  className={`sim-enter relative h-[64px] w-[32px] shrink-0 rotate-[38deg] ${POS}`}
                >
                  <IptgArt className="absolute top-0 left-0 h-[64px] w-[32px]" />
                </div>
                <StageLabel x={536} y={92} width={56}>
                  IPTG
                </StageLabel>
              </>
            ) : (
              <Draggable
                id="iptg"
                label="IPTG"
                width={61}
                height={154}
                x={476}
                y={268}
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
                <GoodNews x={306.5} y={280} width={400}>
                  Protein switch ON — the cells are hard at work!
                </GoodNews>
                <NextButton x={454.5} y={308} onClick={() => goTo("lyse")} />
              </>
            )}
          </>
        )}

        {/* =============== 9. Break Open the Cells =============== */}
        {stepId === "lyse" && (
          <>
            {/* Three stations on one line — flask, spinner, buffer — with an
                even 150px between them and the row centred on the 1013px
                column. The pellet the spin leaves behind lands in the middle
                of the spinner-to-buffer gap, so the spacing reads evenly both
                before the spin and after it. Each caption is centred over its
                own station. */}
            <StageLabel x={462} y={10} width={53} color="var(--sim-cyan)">
              spinner
            </StageLabel>
            <DropZone
              {...zoneProps("spinner")}
              ariaLabel="Spinner"
              art={
                <CentrifugeArt
                  spinning={busy === "spin"}
                  loaded={!!placed.flask}
                  className="h-full w-full"
                />
              }
              bare
              open={!placed.flask}
              width={160}
              height={216}
              x={408.5}
              y={36}
              className={busy === "spin" ? "sim-working" : ""}
            />

            <StageLabel x={759} y={30} width={44} color="var(--sim-cyan)">
              buffer
            </StageLabel>
            <DropZone
              {...zoneProps("buffer")}
              ariaLabel="Buffer"
              art={
                <BufferWellArt
                  active={busy === "shake" || didFire("shake")}
                  className="h-full w-full"
                />
              }
              bare
              open={didFire("spin") && !placed.pellet}
              width={125}
              height={125}
              x={718.5}
              y={56}
              shape="circle"
              className={busy === "shake" ? "sim-working" : ""}
            />

            {/* the flask of cells, until it goes into the machine — after that
                it is inside with the lid down, and the loaded buckets say so */}
            {!placed.flask && (
              <Draggable
                id="flask"
                label="Flask of cells"
                width={89}
                height={150}
                x={169.5}
                y={90}
                api={api}
              >
                <FlaskArt
                  fill={0.9}
                  cells={10}
                  tint="green"
                  className="absolute top-0 left-[7px] h-[128px] w-[75px]"
                />
                <Caption left={0} top={130} width={89}>
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
                x={placed.pellet ? 734 : 596.5}
                y={placed.pellet ? 76 : 84}
                api={api}
                settled={!!placed.pellet}
                className={busy === "shake" ? "sim-working" : ""}
              >
                <PelletArt className="absolute top-0 left-0 h-[84px] w-[94px]" />
                {!placed.pellet && (
                  <Caption left={0} top={86} width={94}>
                    Leftover cells
                  </Caption>
                )}
              </Draggable>
            )}

            {placed.flask && !didFire("spin") && (
              <ActionButton
                x={438.5}
                y={268}
                width={100}
                height={64}
                color="#4F78E0"
                edge="#22397A"
                glow="rgba(79,120,224,0.7)"
                fontSize={16}
                onClick={() => runAction("spin")}
              >
                SPIN
              </ActionButton>
            )}

            {placed.pellet && !didFire("shake") && (
              <ActionButton
                x={687.5}
                y={268}
                width={187}
                height={64}
                color="#E49B09"
                edge="#7A5200"
                glow="rgba(228,155,9,0.7)"
                fontSize={16}
                onClick={() => runAction("shake")}
              >
                Shake it to open
              </ActionButton>
            )}

            {didFire("shake") && (
              <>
                <GoodNews x={388} y={350} width={237}>
                  The cells are open — protein is out.
                </GoodNews>
                <NextButton x={454.5} y={376} onClick={() => goTo("purify")} />
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
                x={441}
                y={300}
                api={api}
              >
                <LysateArt className="absolute top-0 left-0 h-[86px] w-[131px]" />
                <Caption left={0} top={88} width={131}>
                  Liquid with protein
                </Caption>
              </Draggable>
            )}

            <DropZone
              {...zoneProps("column")}
              ariaLabel="Purification column"
              art={<ColumnArt phase={columnPhase} className="h-full w-full" />}
              bare
              open={!placed.liquid}
              width={96}
              height={224}
              x={458.5}
              y={16}
              className={busy === "wash" ? "sim-working" : ""}
            />
            <StageLabel x={446.5} y={246} width={120}>
              column
            </StageLabel>

            {placed.liquid && !didFire("wash") && (
              <ActionButton
                x={456.5}
                y={300}
                width={100}
                height={64}
                color="#4F78E0"
                edge="#22397A"
                glow="rgba(79,120,224,0.7)"
                fontSize={16}
                onClick={() => runAction("wash")}
              >
                Wash
              </ActionButton>
            )}

            {didFire("wash") && !didFire("collect") && (
              <ActionButton
                x={456.5}
                y={300}
                width={100}
                height={48}
                color="#0E9B3A"
                edge="#065A21"
                glow="rgba(14,155,58,0.7)"
                fontSize={16}
                onClick={() => runAction("collect", 700)}
              >
                COLLECT
              </ActionButton>
            )}

            {didFire("collect") && (
              <>
                <div
                  style={at(446.5, 286)}
                  className={`sim-enter relative h-[104px] w-[120px] shrink-0 ${POS}`}
                >
                  <ProteinArt className="h-[104px] w-[120px]" />
                </div>
                <StageLabel x={446.5} y={396} width={120}>
                  your protein
                </StageLabel>
                <GoodNews x={306.5} y={430} width={400}>
                  Pure protein, collected. That is the whole process.
                </GoodNews>
              </>
            )}
          </>
        )}
      </div>

      {/* ---- footer: where you are, and the way back to the start ---- */}
      <div className="mt-5 flex min-h-[24px] items-center justify-between gap-4">
        <div
          className="sim-rail"
          role="img"
          aria-label={`Step ${stepIndex + 1} of ${STEP_ORDER.length}`}
        >
          {STEP_ORDER.map((id, i) => (
            <span
              key={id}
              className={`sim-pip ${
                i === stepIndex
                  ? "sim-pip--now"
                  : i < stepIndex
                    ? "sim-pip--done"
                    : ""
              }`}
            />
          ))}
        </div>

        {stepId !== "pick" && (
          <button
            type="button"
            onClick={() => goTo("pick")}
            className="font-outfit shrink-0 text-[15px] underline underline-offset-4 opacity-60 transition-opacity hover:opacity-100"
          >
            start over
          </button>
        )}
      </div>
    </section>
  );
}
