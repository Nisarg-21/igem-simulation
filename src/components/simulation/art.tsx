"use client";

import { useId } from "react";
import type React from "react";

/* =========================================================================
 * Simulation artwork — every prop that stands on the bench is drawn here.
 *
 * Each export keeps the viewBox of the original Figma rebuild, so the shapes
 * still drop straight onto the design-pixel positions in `Simulation.tsx`.
 * What changed is what is inside them: real glass, real steel, real liquid,
 * all lit from the top-left with a specular highlight and a contact shadow,
 * so a prop reads as an object standing on a surface rather than a flat
 * sticker.
 *
 * Rules of the house:
 *   - no `Math.random()` anywhere. Every scatter is a literal, so the server
 *     and the client render the same string and hydration stays quiet;
 *   - gradient and clip ids are namespaced per instance with `useUid()`,
 *     because several of these are on screen at the same time;
 *   - motion lives in `globals.css` as `sim-*` keyframes, which one
 *     `prefers-reduced-motion` block switches off wholesale.
 * ====================================================================== */

interface ArtProps {
  className?: string;
}

/** A collision-free prefix for the gradient / clip ids inside one instance. */
function useUid() {
  return useId().replace(/:/g, "");
}

/* --- E. coli -------------------------------------------------------------
 * A rod with a rounded cap at each end: nucleoid and ribosomes inside, pili
 * around the rim, two flagella trailing off the left. The cell drifts and the
 * flagella beat, which is most of what makes it read as alive rather than
 * drawn.
 */
const ECOLI_PILI = [
  [44, 11, 42, 4],
  [66, 9, 66, 2],
  [92, 11, 95, 3],
  [50, 67, 47, 74],
  [78, 68, 80, 75],
  [108, 63, 114, 69],
];
const ECOLI_RIBOSOMES = [
  [45, 30],
  [58, 55],
  [72, 22],
  [86, 57],
  [99, 47],
  [112, 25],
  [120, 45],
  [66, 41],
];

export function EcoliArt({
  className = "",
  still = false,
}: ArtProps & { still?: boolean }) {
  const u = useUid();
  return (
    <svg viewBox="0 0 137.5 78" className={className} aria-hidden="true">
      <defs>
        <linearGradient id={`${u}-body`} x1="0.15" y1="0" x2="0.55" y2="1">
          <stop offset="0" stopColor="#A8F8B9" />
          <stop offset="0.3" stopColor="#48D06D" />
          <stop offset="0.68" stopColor="#12A03C" />
          <stop offset="1" stopColor="#04591D" />
        </linearGradient>
        <radialGradient id={`${u}-sheen`}>
          <stop offset="0" stopColor="#FFFFFF" stopOpacity="0.9" />
          <stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`${u}-halo`}>
          <stop offset="0" stopColor="#4BE07A" stopOpacity="0.42" />
          <stop offset="1" stopColor="#4BE07A" stopOpacity="0" />
        </radialGradient>
      </defs>

      <ellipse cx="80" cy="39" rx="60" ry="33" fill={`url(#${u}-halo)`} />

      <g className={still ? "" : "sim-drift"}>
        <g className={still ? "" : "sim-beat"}>
          <path
            d="M28 31 C17 24 12 35 3 27"
            fill="none"
            stroke="#0C7F2E"
            strokeWidth="2.4"
            strokeLinecap="round"
          />
          <path
            d="M28 47 C17 55 11 45 2 53"
            fill="none"
            stroke="#0C7F2E"
            strokeWidth="2.2"
            strokeLinecap="round"
            opacity="0.8"
          />
        </g>

        {ECOLI_PILI.map(([x1, y1, x2, y2]) => (
          <line
            key={`${x1}-${y1}`}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke="#0C7F2E"
            strokeWidth="1.3"
            strokeLinecap="round"
            opacity="0.55"
          />
        ))}

        <rect
          x="26"
          y="10"
          width="105"
          height="58"
          rx="29"
          fill={`url(#${u}-body)`}
          stroke="#04431A"
          strokeWidth="1.6"
        />

        {/* the loose tangle of chromosome */}
        <path
          d="M52 44 C60 28 72 52 84 34 C92 23 100 40 110 32"
          fill="none"
          stroke="#E4FFEC"
          strokeWidth="4.5"
          strokeLinecap="round"
          opacity="0.32"
        />

        {ECOLI_RIBOSOMES.map(([cx, cy]) => (
          <circle
            key={`${cx}-${cy}`}
            cx={cx}
            cy={cy}
            r="2.1"
            fill="#F0FFF4"
            opacity="0.6"
          />
        ))}

        <ellipse
          cx="64"
          cy="23"
          rx="31"
          ry="7.5"
          fill={`url(#${u}-sheen)`}
          opacity="0.55"
        />
        <ellipse cx="47" cy="21" rx="6" ry="3.2" fill="#FFFFFF" opacity="0.8" />
        {/* bounce light along the underside */}
        <path
          d="M34 58 C60 74 104 70 124 52"
          fill="none"
          stroke="#8CFFA9"
          strokeWidth="1.6"
          strokeLinecap="round"
          opacity="0.35"
        />
      </g>
    </svg>
  );
}

/* --- Yeast ---------------------------------------------------------------
 * A mother cell with a bud coming off the top right: thick translucent wall,
 * a vacuole and a nucleus showing through, and two bud scars on the flank.
 */
export function YeastArt({ className = "" }: ArtProps) {
  const u = useUid();
  return (
    <svg viewBox="0 0 80 102" className={className} aria-hidden="true">
      <defs>
        <radialGradient id={`${u}-cell`} cx="0.34" cy="0.28" r="0.82">
          <stop offset="0" stopColor="#FFE9A8" />
          <stop offset="0.42" stopColor="#FFC24A" />
          <stop offset="0.8" stopColor="#E08A05" />
          <stop offset="1" stopColor="#9C5A00" />
        </radialGradient>
        <radialGradient id={`${u}-halo`}>
          <stop offset="0" stopColor="#FFB92E" stopOpacity="0.4" />
          <stop offset="1" stopColor="#FFB92E" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`${u}-sheen`}>
          <stop offset="0" stopColor="#FFFFFF" stopOpacity="0.95" />
          <stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
        </radialGradient>
      </defs>

      <ellipse cx="40" cy="60" rx="40" ry="42" fill={`url(#${u}-halo)`} />

      <g className="sim-breathe">
        {/* the bud, drawn first so the mother's rim overlaps it */}
        <circle
          cx="60"
          cy="20"
          r="19"
          fill={`url(#${u}-cell)`}
          stroke="#8A4E00"
          strokeWidth="1.5"
        />
        <ellipse cx="54" cy="13" rx="7" ry="4" fill={`url(#${u}-sheen)`} />

        <circle
          cx="40"
          cy="62"
          r="39"
          fill={`url(#${u}-cell)`}
          stroke="#8A4E00"
          strokeWidth="1.6"
        />

        <circle cx="30" cy="70" r="13" fill="#FFF0C4" opacity="0.42" />
        <circle cx="52" cy="52" r="7.5" fill="#B36B00" opacity="0.5" />
        <circle cx="52" cy="52" r="3" fill="#7A4400" opacity="0.6" />

        <circle
          cx="14"
          cy="46"
          r="4.6"
          fill="none"
          stroke="#B06400"
          strokeWidth="1.6"
          opacity="0.6"
        />
        <circle
          cx="24"
          cy="93"
          r="3.6"
          fill="none"
          stroke="#B06400"
          strokeWidth="1.4"
          opacity="0.45"
        />

        <ellipse
          cx="27"
          cy="42"
          rx="15"
          ry="9"
          fill={`url(#${u}-sheen)`}
          opacity="0.65"
          transform="rotate(-28 27 42)"
        />
      </g>
    </svg>
  );
}

/* --- Virus ---------------------------------------------------------------
 * A glossy capsid with eight spike proteins. The spike angles keep the wobble
 * that was in the Figma export — they are a few degrees off a clean 45deg
 * step, and evening them out makes the thing look manufactured.
 */
const VIRUS_C = 67.5;
const SPIKE_FROM = 24;
const SPIKE_TO = 55;
const VIRUS_ANGLES = [-94.4, -40.5, 5.1, 49.5, 85.6, 139.5, 185.1, 229.5];

/** Rounded on purpose: raw `Math.cos` output serialises to 17 significant
 *  digits in Node and 15 in the browser, which React reports as a hydration
 *  mismatch on every single spike. Three decimals is well past what a 135px
 *  drawing can show. */
const VIRUS_SPIKES = VIRUS_ANGLES.map((deg) => {
  const rad = (deg * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  const round = (n: number) => Math.round(n * 1000) / 1000;
  return {
    deg,
    x1: round(VIRUS_C + SPIKE_FROM * cos),
    y1: round(VIRUS_C + SPIKE_FROM * sin),
    x2: round(VIRUS_C + SPIKE_TO * cos),
    y2: round(VIRUS_C + SPIKE_TO * sin),
    kx: round(VIRUS_C + (SPIKE_TO + 5) * cos),
    ky: round(VIRUS_C + (SPIKE_TO + 5) * sin),
  };
});

/** The facet seams that make the capsid read as a solid rather than a ball. */
const CAPSID_FACETS = [
  "M67.5 37 L92 55 L83 84 L52 84 L43 55 Z",
  "M67.5 37 L43 55 L52 84 L67.5 61 Z",
  "M92 55 L83 84 L67.5 61 Z",
];

export function VirusArt({ className = "" }: ArtProps) {
  const u = useUid();
  return (
    <svg viewBox="0 0 135 135" className={className} aria-hidden="true">
      <defs>
        <radialGradient id={`${u}-capsid`} cx="0.34" cy="0.28" r="0.8">
          <stop offset="0" stopColor="#FF9C9C" />
          <stop offset="0.42" stopColor="#F2454B" />
          <stop offset="0.85" stopColor="#B00E1C" />
          <stop offset="1" stopColor="#6E0410" />
        </radialGradient>
        <radialGradient id={`${u}-knob`} cx="0.35" cy="0.3" r="0.8">
          <stop offset="0" stopColor="#7E8CA6" />
          <stop offset="0.5" stopColor="#3C4A63" />
          <stop offset="1" stopColor="#141C2C" />
        </radialGradient>
        <radialGradient id={`${u}-halo`}>
          <stop offset="0" stopColor="#FF4A5A" stopOpacity="0.4" />
          <stop offset="0.6" stopColor="#FF4A5A" stopOpacity="0.12" />
          <stop offset="1" stopColor="#FF4A5A" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`${u}-sheen`}>
          <stop offset="0" stopColor="#FFFFFF" stopOpacity="0.95" />
          <stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
        </radialGradient>
      </defs>

      <circle cx={VIRUS_C} cy={VIRUS_C} r="66" fill={`url(#${u}-halo)`} />

      <g className="sim-orbit">
        {VIRUS_SPIKES.map((s) => (
          <g key={s.deg}>
            <line
              x1={s.x1}
              y1={s.y1}
              x2={s.x2}
              y2={s.y2}
              stroke="#26304A"
              strokeWidth="4.5"
              strokeLinecap="round"
            />
            <line
              x1={s.x1}
              y1={s.y1}
              x2={s.x2}
              y2={s.y2}
              stroke="#8290AC"
              strokeWidth="1.4"
              strokeLinecap="round"
              opacity="0.55"
            />
            <circle cx={s.kx} cy={s.ky} r="8.5" fill={`url(#${u}-knob)`} />
            <circle
              cx={s.kx - 2.4}
              cy={s.ky - 2.6}
              r="2.6"
              fill="#FFFFFF"
              opacity="0.45"
            />
          </g>
        ))}
      </g>

      <g className="sim-breathe">
        <circle cx={VIRUS_C} cy={VIRUS_C} r="31" fill={`url(#${u}-capsid)`} />
        {CAPSID_FACETS.map((d) => (
          <path
            key={d}
            d={d}
            fill="none"
            stroke="#FFD5D5"
            strokeWidth="0.9"
            opacity="0.28"
          />
        ))}
        <circle
          cx={VIRUS_C}
          cy={VIRUS_C}
          r="31"
          fill="none"
          stroke="#4E0009"
          strokeWidth="1.4"
        />
        <ellipse
          cx="56"
          cy="54"
          rx="13"
          ry="8"
          fill={`url(#${u}-sheen)`}
          opacity="0.75"
          transform="rotate(-32 56 54)"
        />
      </g>
    </svg>
  );
}

/* --- Plasmid / DNA ring --------------------------------------------------
 * A closed circle of double-stranded DNA: two backbones a few px apart with
 * base-pair rungs between them, and the genes riding on it painted as thick
 * arcs. `pathLength={100}` lets those arcs be written as plain percentages of
 * the circumference instead of arithmetic on 2*pi*r.
 */
const RING_CX = 50.9;
const RING_CY = 55;
const RING_R = 48.5;

/** 44 rungs around the ring, precomputed for the same reason as the spikes. */
const RING_RUNGS = Array.from({ length: 44 }, (_, i) => {
  const rad = ((i * 360) / 44) * (Math.PI / 180);
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  const round = (n: number) => Math.round(n * 100) / 100;
  return {
    i,
    x1: round(RING_CX + (RING_R - 3.4) * cos),
    y1: round(RING_CY + (RING_R - 3.4) * sin),
    x2: round(RING_CX + (RING_R + 3.4) * cos),
    y2: round(RING_CY + (RING_R + 3.4) * sin),
  };
});

function DnaRing({ u, tint }: { u: string; tint: [string, string] }) {
  return (
    <g>
      <circle
        cx={RING_CX}
        cy={RING_CY}
        r={RING_R + 3.4}
        fill="none"
        stroke={tint[0]}
        strokeWidth="2.6"
      />
      <circle
        cx={RING_CX}
        cy={RING_CY}
        r={RING_R - 3.4}
        fill="none"
        stroke={tint[1]}
        strokeWidth="2.6"
      />
      <g opacity="0.65">
        {RING_RUNGS.map((r) => (
          <line
            key={r.i}
            x1={r.x1}
            y1={r.y1}
            x2={r.x2}
            y2={r.y2}
            stroke={r.i % 2 ? "#8E6BFF" : "#5AC8FF"}
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        ))}
      </g>
      <circle
        cx={RING_CX}
        cy={RING_CY}
        r={RING_R}
        fill="none"
        stroke={`url(#${u}-glowline)`}
        strokeWidth="7"
        opacity="0.18"
      />
    </g>
  );
}

export function PlasmidArt({
  className = "",
  /** The "Cut the DNA" frame shows the second restriction site at full length,
   *  so it reads as plainly as the first. */
  longSite = false,
}: ArtProps & { longSite?: boolean }) {
  const u = useUid();
  return (
    <svg
      viewBox="0 0 105.2 105"
      className={className}
      aria-hidden="true"
      style={{ filter: "drop-shadow(0 0 7px rgba(124,92,255,0.55))" }}
    >
      <defs>
        <linearGradient id={`${u}-glowline`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#9BE9FF" />
          <stop offset="1" stopColor="#C58CFF" />
        </linearGradient>
      </defs>

      <g className="sim-turn">
        <DnaRing u={u} tint={["#3C1B6B", "#4B2B7F"]} />

        <circle
          cx={RING_CX}
          cy={RING_CY}
          r={RING_R}
          pathLength={100}
          fill="none"
          stroke="#FF6B6B"
          strokeWidth="9"
          strokeLinecap="round"
          strokeDasharray="17 83"
          strokeDashoffset="21.5"
        />
        <circle
          cx={RING_CX}
          cy={RING_CY}
          r={RING_R}
          pathLength={100}
          fill="none"
          stroke="#2FC7FF"
          strokeWidth="9"
          strokeLinecap="round"
          strokeDasharray="11 89"
          strokeDashoffset="-38"
        />
        <circle
          cx={RING_CX}
          cy={RING_CY}
          r={RING_R}
          pathLength={100}
          fill="none"
          stroke="#C86BFF"
          strokeWidth="9"
          strokeLinecap="round"
          strokeDasharray={longSite ? "11 89" : "5 95"}
          strokeDashoffset={longSite ? "-80.5" : "-83.5"}
        />
      </g>

      <text
        x={RING_CX}
        y={RING_CY}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize="13"
        letterSpacing="1.2"
        fill="#CBB6FF"
        opacity="0.85"
        style={{ fontFamily: "var(--app-outfit)" }}
      >
        plasmid
      </text>
    </svg>
  );
}

/* --- The recombinant ring ------------------------------------------------
 * The same ring, except the two amber sticky ends have healed into one joint
 * and the gene we cut out is riding on the right flank. It sparkles, because
 * this is the payoff of the cutting step.
 */
export function NewRingArt({ className = "" }: ArtProps) {
  const u = useUid();
  return (
    <svg
      viewBox="0 0 105.2 105"
      className={className}
      aria-hidden="true"
      style={{ filter: "drop-shadow(0 0 8px rgba(255,185,46,0.6))" }}
    >
      <defs>
        <linearGradient id={`${u}-glowline`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#FFD98A" />
          <stop offset="1" stopColor="#C58CFF" />
        </linearGradient>
      </defs>

      <g className="sim-turn">
        <DnaRing u={u} tint={["#4B1B6B", "#5A2B8A"]} />

        {/* the healed join, across the top */}
        <circle
          cx={RING_CX}
          cy={RING_CY}
          r={RING_R}
          pathLength={100}
          fill="none"
          stroke="#FFB92E"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray="13 87"
          strokeDashoffset="19.5"
        />
        {/* the gene we spliced in */}
        <circle
          cx={RING_CX}
          cy={RING_CY}
          r={RING_R}
          pathLength={100}
          fill="none"
          stroke="#C86BFF"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray="12 88"
          strokeDashoffset="-79"
        />
      </g>

      <g className="sim-sparkle">
        <path
          d="M86 16 l2.4 6.6 6.6 2.4 -6.6 2.4 -2.4 6.6 -2.4 -6.6 -6.6 -2.4 6.6 -2.4 z"
          fill="#FFF3C4"
        />
      </g>
      <g className="sim-sparkle sim-delay-1">
        <path
          d="M18 78 l1.7 4.7 4.7 1.7 -4.7 1.7 -1.7 4.7 -1.7 -4.7 -4.7 -1.7 4.7 -1.7 z"
          fill="#FFE9A8"
        />
      </g>
    </svg>
  );
}

/* --- The gene to be cut out ----------------------------------------------
 * A short length of double helix: two backbones crossing over each other,
 * base pairs between them, and an amber overhang at each end — the sticky
 * ends that later heal into the single joint on the new ring.
 */
const GENE_RUNGS = [22, 30, 38, 46, 54, 62, 70];

export function GeneArt({ className = "" }: ArtProps) {
  const u = useUid();
  return (
    <svg viewBox="0 0 96 29" className={className} aria-hidden="true">
      <defs>
        <linearGradient id={`${u}-strand`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#B98BFF" />
          <stop offset="0.5" stopColor="#8A38F5" />
          <stop offset="1" stopColor="#5E17C0" />
        </linearGradient>
        <linearGradient id={`${u}-sticky`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFD98A" />
          <stop offset="1" stopColor="#E08A05" />
        </linearGradient>
      </defs>

      {/* sticky ends — a stepped overhang, not a butt joint */}
      <path d="M0 9.5 h19 v10 H0 z" fill={`url(#${u}-sticky)`} />
      <path d="M77 9.5 h19 v10 H77 z" fill={`url(#${u}-sticky)`} />

      <path
        d="M17 6 C31 6 31 23 45 23 C59 23 59 6 73 6 C77 6 78 7 79 8"
        fill="none"
        stroke={`url(#${u}-strand)`}
        strokeWidth="4.6"
        strokeLinecap="round"
      />
      <path
        d="M17 23 C31 23 31 6 45 6 C59 6 59 23 73 23 C77 23 78 22 79 21"
        fill="none"
        stroke={`url(#${u}-strand)`}
        strokeWidth="4.6"
        strokeLinecap="round"
      />
      <g opacity="0.75">
        {GENE_RUNGS.map((x) => (
          <line
            key={x}
            x1={x}
            y1="9"
            x2={x}
            y2="20"
            stroke="#E4D2FF"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        ))}
      </g>
      <circle cx="9.5" cy="14.5" r="2.2" fill="#FFF6DC" opacity="0.8" />
      <circle cx="86.5" cy="14.5" r="2.2" fill="#FFF6DC" opacity="0.8" />
    </svg>
  );
}

/* --- Scissors ------------------------------------------------------------
 * The restriction enzyme, drawn as the pair of scissors the copy calls it:
 * two ground blades on a shoulder screw, with moulded handles. Blades point
 * down-right and handles up-left, the orientation the export had, so the tool
 * still seats on a 60px cut site the same way — but the proportions are a real
 * pair of scissors now (blade about as long as the shank) rather than the two
 * crossed lines the rebuild started from.
 *
 * `closed` swings the lower blade shut about the pivot: the snip that fires
 * when the tool lands on a site.
 */
const SCISSOR_PIVOT: [number, number] = [32, 28];

/**
 * One arm. `tip` is the point of the blade, `back` the blade's heel at the
 * pivot and `bow` the control point that bellies its spine out, `ring` the
 * handle's centre and `tilt` how the ring is turned to line up with the shank.
 */
const SCISSOR_ARMS = [
  {
    tip: [54, 43],
    back: [29.6, 31.8],
    bow: [40.6, 42.1],
    ring: [8.5, 12.5],
    tilt: 32,
    close: -12,
  },
  {
    tip: [54, 29.5],
    back: [32.4, 23.5],
    bow: [44, 21.8],
    ring: [8.5, 26],
    tilt: 5,
    close: 0,
  },
] as const;

export function ScissorsArt({
  className = "",
  closed = false,
}: ArtProps & { closed?: boolean }) {
  const u = useUid();
  const [px, py] = SCISSOR_PIVOT;
  return (
    <svg viewBox="0 0 59 51" className={className} aria-hidden="true">
      <defs>
        <linearGradient id={`${u}-steel`} x1="0" y1="0" x2="0.4" y2="1">
          <stop offset="0" stopColor="#FFFFFF" />
          <stop offset="0.28" stopColor="#C8D6E4" />
          <stop offset="0.5" stopColor="#F2F7FC" />
          <stop offset="0.74" stopColor="#8496AA" />
          <stop offset="1" stopColor="#4E5F72" />
        </linearGradient>
        <linearGradient id={`${u}-grip`} x1="0" y1="0" x2="0.6" y2="1">
          <stop offset="0" stopColor="#FF9B9B" />
          <stop offset="0.42" stopColor="#EF3B3B" />
          <stop offset="1" stopColor="#8E0C16" />
        </linearGradient>
        <radialGradient id={`${u}-screw`} cx="0.35" cy="0.3" r="0.8">
          <stop offset="0" stopColor="#FBFDFF" />
          <stop offset="0.6" stopColor="#9AA9BC" />
          <stop offset="1" stopColor="#414D5C" />
        </radialGradient>
      </defs>

      {SCISSOR_ARMS.map((arm, i) => {
        const [tx, ty] = arm.tip;
        const [bx, by] = arm.back;
        const [qx, qy] = arm.bow;
        const [rx, ry] = arm.ring;
        return (
          <g
            key={i}
            style={{
              transform: closed ? `rotate(${arm.close}deg)` : "rotate(0deg)",
              transformOrigin: `${px}px ${py}px`,
              transformBox: "view-box",
              transition: "transform 260ms cubic-bezier(.34,1.4,.5,1)",
            }}
          >
            {/* shank, drawn first so the blade and the handle sit over it */}
            <line
              x1={px}
              y1={py}
              x2={rx}
              y2={ry}
              stroke="#2E3A47"
              strokeWidth="5"
              strokeLinecap="round"
              opacity="0.55"
            />
            <line
              x1={px}
              y1={py}
              x2={rx}
              y2={ry}
              stroke={`url(#${u}-steel)`}
              strokeWidth="3.6"
              strokeLinecap="round"
            />

            {/* blade: straight cutting edge, bellied spine, point at the tip */}
            <path
              d={`M${px} ${py} L${tx} ${ty} Q${qx} ${qy} ${bx} ${by} Z`}
              fill={`url(#${u}-steel)`}
              stroke="#33404F"
              strokeWidth="0.7"
              strokeLinejoin="round"
            />
            <line
              x1={px}
              y1={py}
              x2={tx}
              y2={ty}
              stroke="#FFFFFF"
              strokeWidth="1"
              opacity="0.9"
              strokeLinecap="round"
            />

            {/* moulded handle */}
            <ellipse
              cx={rx}
              cy={ry}
              rx="8"
              ry="6.4"
              fill="none"
              stroke="#5C0A11"
              strokeWidth="4.4"
              transform={`rotate(${arm.tilt} ${rx} ${ry})`}
              opacity="0.5"
            />
            <ellipse
              cx={rx}
              cy={ry}
              rx="8"
              ry="6.4"
              fill="none"
              stroke={`url(#${u}-grip)`}
              strokeWidth="3.2"
              transform={`rotate(${arm.tilt} ${rx} ${ry})`}
            />
            <path
              d={`M${rx - 5.6} ${ry - 3.6} Q${rx} ${ry - 7.2} ${rx + 5.2} ${ry - 3.2}`}
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="1.2"
              strokeLinecap="round"
              opacity="0.5"
              transform={`rotate(${arm.tilt} ${rx} ${ry})`}
            />
          </g>
        );
      })}

      {/* shoulder screw */}
      <circle cx={px} cy={py} r="3.6" fill={`url(#${u}-screw)`} />
      <line
        x1={px - 2}
        y1={py - 0.4}
        x2={px + 2}
        y2={py + 0.4}
        stroke="#33404F"
        strokeWidth="0.9"
        strokeLinecap="round"
      />
      <circle
        cx={px}
        cy={py}
        r="3.6"
        fill="none"
        stroke="#33404F"
        strokeWidth="0.8"
      />
    </svg>
  );
}

/* --- Colonies on the plate -----------------------------------------------
 * An 85px blob of packed cells with a wet sheen on it. The three big seed
 * cells are traced off the supplied artwork, so the placement is deliberately
 * hand-set — the top pair is not level and the lower cell is not centred. Do
 * not "tidy" these into an even triangle.
 */
const SEED_CELLS = [
  [29.5, 35.5],
  [58.5, 34.5],
  [40.5, 61],
] as const;

/** Smaller cells packed around them, so the blob has texture at the rim. */
const PACKED_CELLS = [
  [22, 55, 6],
  [63, 58, 6.5],
  [45, 20, 5.5],
  [66, 45, 5],
  [30, 20, 4.5],
  [17, 42, 5],
  [52, 71, 5.5],
  [70, 30, 4.5],
] as const;

const COLONY_TONES = {
  with: {
    light: "#B9F7C6",
    mid: "#4FD16F",
    dark: "#0A6E26",
    cell: "#0B8B2C",
    rim: "#064E1B",
  },
  without: {
    light: "#D7D5D5",
    mid: "#A6A2A2",
    dark: "#6A6666",
    cell: "#5A5656",
    rim: "#3E3B3B",
  },
} as const;

export function ColonyArt({
  className = "",
  tone,
}: ArtProps & { tone: keyof typeof COLONY_TONES }) {
  const u = useUid();
  const t = COLONY_TONES[tone];
  return (
    <svg viewBox="0 0 85 85" className={className} aria-hidden="true">
      <defs>
        <radialGradient id={`${u}-blob`} cx="0.35" cy="0.3" r="0.78">
          <stop offset="0" stopColor={t.light} />
          <stop offset="0.55" stopColor={t.mid} />
          <stop offset="1" stopColor={t.dark} />
        </radialGradient>
        <radialGradient id={`${u}-sheen`}>
          <stop offset="0" stopColor="#FFFFFF" stopOpacity="0.9" />
          <stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
        </radialGradient>
      </defs>

      <circle
        cx="42.5"
        cy="42.5"
        r="41.5"
        fill={`url(#${u}-blob)`}
        stroke={t.rim}
        strokeWidth="1.8"
      />

      {PACKED_CELLS.map(([x, y, r]) => (
        <circle
          key={`${x}-${y}`}
          cx={x}
          cy={y}
          r={r}
          fill={t.cell}
          opacity="0.5"
        />
      ))}
      {SEED_CELLS.map(([x, y]) => (
        <g key={`${x}-${y}`}>
          <circle cx={x} cy={y} r="10.6" fill={t.cell} />
          <circle
            cx={x - 3}
            cy={y - 3.6}
            r="3.2"
            fill="#FFFFFF"
            opacity="0.32"
          />
        </g>
      ))}

      <ellipse
        cx="30"
        cy="22"
        rx="17"
        ry="9"
        fill={`url(#${u}-sheen)`}
        opacity="0.6"
        transform="rotate(-24 30 22)"
      />
    </svg>
  );
}

/* --- Conical flask -------------------------------------------------------
 * A real Erlenmeyer: glass body with a rim ellipse, a lit left edge and a
 * shaded right one, broth with a moving surface, a rising bubble train, and
 * cells suspended in it.
 *
 * `fill` (0-1) raises the broth; `cells` is how many colonies to suspend,
 * which is how the flask visibly grows as the dial is turned; `glow` is the
 * expression step, where the culture starts to shine.
 */
const FLASK_W = 116;
const FLASK_BASE = 197;
const FLASK_NECK_Y = 68.54;
const FLASK_NECK_L = 35.36;
const FLASK_NECK_R = 80.65;
const FLASK_OUTLINE = `M${FLASK_NECK_L} 6 L${FLASK_NECK_L} ${FLASK_NECK_Y} L4 ${FLASK_BASE} L112 ${FLASK_BASE} L${FLASK_NECK_R} ${FLASK_NECK_Y} L${FLASK_NECK_R} 6`;
/** Broth can rise 100px before it would reach the neck. */
const FLASK_HEAD = 100;

/** x, y, r — index 0 is the winning cell that seeded it; the rest fill up. */
const FLASK_CELLS: [number, number, number][] = [
  [58, 165, 9],
  [58, 185, 6],
  [32, 178, 6],
  [84, 178, 6],
  [27, 158, 5.5],
  [90, 160, 5.5],
  [58, 140, 6],
  [38, 130, 5.5],
  [78, 130, 5.5],
  [46, 114, 5],
];

/** x offset, radius, delay — the bubble train coming off the bottom. */
const FLASK_BUBBLES: [number, number, number][] = [
  [44, 2.6, 0],
  [62, 2, 0.9],
  [53, 3.2, 1.7],
  [72, 2.2, 2.4],
  [38, 2.4, 3.1],
];

const FLASK_TINTS = {
  amber: ["#FFD98A", "#F2A413", "#B96C00"],
  green: ["#B6FFD0", "#2FD37A", "#0B8B45"],
  cyan: ["#B7ECFF", "#31B6E8", "#0A6D95"],
} as const;

export function FlaskArt({
  className = "",
  fill = 0,
  cells = 0,
  tint = "amber",
  glow = false,
}: ArtProps & {
  fill?: number;
  cells?: number;
  tint?: keyof typeof FLASK_TINTS;
  glow?: boolean;
}) {
  const u = useUid();
  const [light, mid, dark] = FLASK_TINTS[tint];
  const level = Math.max(0, Math.min(1, fill)) * FLASK_HEAD;
  const top = FLASK_BASE - level;

  return (
    <svg viewBox={`0 0 ${FLASK_W} 198`} className={className} aria-hidden="true">
      <defs>
        <clipPath id={`${u}-glass`}>
          <path d={`${FLASK_OUTLINE} Z`} />
        </clipPath>
        <clipPath id={`${u}-liquid`}>
          <rect x="0" y={top - 8} width={FLASK_W} height={level + 12} />
        </clipPath>
        <linearGradient id={`${u}-broth`} x1="0" y1="0" x2="1" y2="0.4">
          <stop offset="0" stopColor={light} />
          <stop offset="0.4" stopColor={mid} />
          <stop offset="1" stopColor={dark} />
        </linearGradient>
        <linearGradient id={`${u}-body`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#FFFFFF" stopOpacity="0.26" />
          <stop offset="0.35" stopColor="#FFFFFF" stopOpacity="0.05" />
          <stop offset="0.8" stopColor="#0B2230" stopOpacity="0.18" />
          <stop offset="1" stopColor="#FFFFFF" stopOpacity="0.2" />
        </linearGradient>
        <radialGradient id={`${u}-glow`}>
          <stop offset="0" stopColor={mid} stopOpacity="0.55" />
          <stop offset="1" stopColor={mid} stopOpacity="0" />
        </radialGradient>
      </defs>

      {glow && <ellipse cx="58" cy="150" rx="66" ry="58" fill={`url(#${u}-glow)`} />}

      {/* the glass itself */}
      <path d={`${FLASK_OUTLINE} Z`} fill={`url(#${u}-body)`} />

      <g clipPath={`url(#${u}-glass)`}>
        {level > 0 && (
          <g clipPath={`url(#${u}-liquid)`}>
            <rect
              x="0"
              y={top}
              width={FLASK_W}
              height={level + 4}
              fill={`url(#${u}-broth)`}
              opacity="0.85"
            />
            {/* the moving surface: one period is 58 user units */}
            <g transform={`translate(-58 ${top - 5})`}>
              <g className="sim-wave">
                <path
                  d="M0 5 q14.5 -5 29 0 t29 0 t29 0 t29 0 t29 0 t29 0 t29 0 t29 0 L232 40 L0 40 Z"
                  fill={`url(#${u}-broth)`}
                  opacity="0.9"
                />
                <path
                  d="M0 5 q14.5 -5 29 0 t29 0 t29 0 t29 0 t29 0 t29 0 t29 0 t29 0"
                  fill="none"
                  stroke="#FFFFFF"
                  strokeWidth="1.4"
                  opacity="0.5"
                />
              </g>
            </g>

            {FLASK_BUBBLES.map(([x, r, d]) => (
              <circle
                key={x}
                cx={x}
                cy={FLASK_BASE - 6}
                r={r}
                fill="#FFFFFF"
                opacity="0.55"
                className="sim-bubble"
                style={
                  {
                    "--rise": `${-(level - 10)}px`,
                    animationDelay: `${d}s`,
                  } as React.CSSProperties
                }
              />
            ))}

            {FLASK_CELLS.slice(0, cells).map(([x, y, r], i) => (
              <g
                key={`${x}-${y}`}
                /* the layout test counts these to prove the dial grows the
                   culture, so the hook is an attribute rather than a fill
                   colour that any repaint would invalidate */
                data-cell
                className="sim-jitter"
                style={{ animationDelay: `${(i % 5) * 0.35}s` }}
              >
                <circle
                  cx={x}
                  cy={y}
                  r={r}
                  fill={glow ? "#DFFFE9" : "#FFF0C4"}
                  opacity="0.95"
                />
                <circle cx={x} cy={y} r={r + 2.5} fill={mid} opacity="0.35" />
              </g>
            ))}
          </g>
        )}

        {/* specular streak down the left shoulder */}
        <path
          d="M40 14 L40 66 L14 178"
          fill="none"
          stroke="#FFFFFF"
          strokeWidth="4"
          opacity="0.35"
          strokeLinecap="round"
        />
        <path
          d="M74 20 L74 64"
          fill="none"
          stroke="#FFFFFF"
          strokeWidth="2"
          opacity="0.18"
          strokeLinecap="round"
        />
      </g>

      {/* rim and outline last, so they sit over the liquid */}
      <ellipse
        cx="58"
        cy="6"
        rx="23"
        ry="4.4"
        fill="none"
        stroke="#DDEAF2"
        strokeWidth="2"
      />
      <ellipse cx="58" cy="6" rx="23" ry="4.4" fill="#0B2230" opacity="0.25" />
      <path
        d={FLASK_OUTLINE}
        fill="none"
        stroke="#DDEAF2"
        strokeWidth="2"
        strokeLinejoin="round"
        opacity="0.9"
      />
      <path
        d={`M4 ${FLASK_BASE} L112 ${FLASK_BASE}`}
        stroke="#FFFFFF"
        strokeWidth="2.4"
        opacity="0.5"
      />
      {/* graduation marks */}
      {[150, 168].map((y) => (
        <line
          key={y}
          x1="86"
          y1={y}
          x2="98"
          y2={y}
          stroke="#FFFFFF"
          strokeWidth="1.4"
          opacity="0.4"
        />
      ))}
    </svg>
  );
}

/* --- IPTG bottle ---------------------------------------------------------
 * A reagent bottle: glass with the solution showing through, a ribbed screw
 * cap, and a printed label. The 20px violet band from the export survives as
 * the label's stripe.
 */
export function IptgArt({ className = "" }: ArtProps) {
  const u = useUid();
  return (
    <svg viewBox="0 0 61 123" className={className} aria-hidden="true">
      <defs>
        <linearGradient id={`${u}-glass`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#FFFFFF" stopOpacity="0.55" />
          <stop offset="0.3" stopColor="#DFF1FA" stopOpacity="0.3" />
          <stop offset="0.75" stopColor="#0B2230" stopOpacity="0.25" />
          <stop offset="1" stopColor="#FFFFFF" stopOpacity="0.35" />
        </linearGradient>
        <linearGradient id={`${u}-fluid`} x1="0" y1="0" x2="1" y2="0.3">
          <stop offset="0" stopColor="#E6C6FF" />
          <stop offset="0.45" stopColor="#BE0FFE" />
          <stop offset="1" stopColor="#6A0193" />
        </linearGradient>
        <linearGradient id={`${u}-cap`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#FFD98A" />
          <stop offset="0.45" stopColor="#F2A413" />
          <stop offset="1" stopColor="#A96400" />
        </linearGradient>
      </defs>

      {/* body */}
      <path
        d="M6 34 q0 -8 8 -10 l0 -6 h33 l0 6 q8 2 8 10 v76 q0 10 -10 10 h-29 q-10 0 -10 -10 z"
        fill={`url(#${u}-glass)`}
        stroke="#DDEAF2"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      {/* solution inside */}
      <path
        d="M9 62 h43 v46 q0 8 -8 8 h-27 q-8 0 -8 -8 z"
        fill={`url(#${u}-fluid)`}
        opacity="0.9"
      />
      <path
        d="M9 62 q10.75 -4 21.5 0 t21.5 0"
        fill="none"
        stroke="#F3D9FF"
        strokeWidth="1.6"
        opacity="0.7"
      />

      {/* label */}
      <rect x="7" y="70" width="47" height="26" rx="3" fill="#F6F2EA" opacity="0.94" />
      <rect x="7" y="70" width="47" height="6" fill="#BE0FFE" opacity="0.9" />
      <text
        x="30.5"
        y="87"
        textAnchor="middle"
        fontSize="11"
        letterSpacing="0.6"
        fill="#3A2350"
        style={{ fontFamily: "var(--app-outfit)" }}
      >
        IPTG
      </text>

      {/* ribbed screw cap */}
      <rect x="12.5" y="0" width="36" height="20" rx="3" fill={`url(#${u}-cap)`} />
      {[17, 22, 27, 32, 37, 42].map((x) => (
        <line
          key={x}
          x1={x}
          y1="2"
          x2={x}
          y2="18"
          stroke="#7A4400"
          strokeWidth="1"
          opacity="0.35"
        />
      ))}
      <rect
        x="12.5"
        y="0"
        width="36"
        height="20"
        rx="3"
        fill="none"
        stroke="#7A4400"
        strokeWidth="1.2"
      />

      {/* glass highlight */}
      <path
        d="M13 40 v66"
        stroke="#FFFFFF"
        strokeWidth="3"
        opacity="0.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

/* =========================================================================
 * Bench equipment. These are new: the steps used to draw them as dashed
 * boxes with a word in the middle, and a dashed box is not a centrifuge.
 * Each one still fits the drop zone it replaces, to the pixel.
 * ====================================================================== */

/* --- Vera's bench (254 x 142) -------------------------------------------- */
export function BenchArt({ className = "" }: ArtProps) {
  const u = useUid();
  return (
    <svg viewBox="0 0 254 142" className={className} aria-hidden="true">
      <defs>
        <linearGradient id={`${u}-top`} x1="0" y1="0" x2="0.3" y2="1">
          <stop offset="0" stopColor="#8FA6B8" />
          <stop offset="0.45" stopColor="#5D7386" />
          <stop offset="1" stopColor="#3B4C5B" />
        </linearGradient>
        <linearGradient id={`${u}-edge`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#C7D7E2" />
          <stop offset="0.4" stopColor="#7B90A2" />
          <stop offset="1" stopColor="#2C3A47" />
        </linearGradient>
      </defs>

      {/* the top, in perspective */}
      <path d="M52 26 L202 26 L246 88 L8 88 Z" fill={`url(#${u}-top)`} />
      {/* brushed-steel grain */}
      {[36, 47, 58, 69, 80].map((y, i) => (
        <path
          key={y}
          d={`M${50 - i * 9} ${y} L${204 + i * 9} ${y}`}
          stroke="#FFFFFF"
          strokeWidth="1"
          opacity="0.07"
        />
      ))}
      {/* front edge */}
      <path d="M8 88 L246 88 L246 100 L8 100 Z" fill={`url(#${u}-edge)`} />
      <path d="M8 88 L246 88" stroke="#DCEBF2" strokeWidth="1.6" opacity="0.7" />
      {/* legs */}
      <path d="M26 100 L38 100 L44 118 L32 118 Z" fill="#2C3A47" />
      <path d="M216 100 L228 100 L222 118 L210 118 Z" fill="#2C3A47" />
      {/* contact shadow */}
      <ellipse cx="127" cy="112" rx="106" ry="8" fill="#02080D" opacity="0.4" />
      {/* a highlight across the far edge */}
      <path
        d="M52 26 L202 26"
        stroke="#EAF4FA"
        strokeWidth="1.4"
        opacity="0.45"
      />
    </svg>
  );
}

/* --- Tube in a rack (257 x 142) ------------------------------------------ */
export function TubeRackArt({
  className = "",
  filled = false,
}: ArtProps & { filled?: boolean }) {
  const u = useUid();
  return (
    <svg viewBox="0 0 257 142" className={className} aria-hidden="true">
      <defs>
        <linearGradient id={`${u}-tube`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#FFFFFF" stopOpacity="0.5" />
          <stop offset="0.4" stopColor="#DFF1FA" stopOpacity="0.22" />
          <stop offset="0.8" stopColor="#0B2230" stopOpacity="0.26" />
          <stop offset="1" stopColor="#FFFFFF" stopOpacity="0.34" />
        </linearGradient>
        <linearGradient id={`${u}-rack`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3E5568" />
          <stop offset="1" stopColor="#1B2836" />
        </linearGradient>
        <linearGradient id={`${u}-buf`} x1="0" y1="0" x2="1" y2="0.4">
          <stop offset="0" stopColor="#BFEFFF" />
          <stop offset="1" stopColor="#1E9AD6" />
        </linearGradient>
      </defs>

      {/* the two empty slots either side */}
      {[46, 211].map((cx) => (
        <g key={cx} opacity="0.5">
          <path
            d={`M${cx - 13} 44 h26 v34 q0 13 -13 20 q-13 -7 -13 -20 z`}
            fill={`url(#${u}-tube)`}
            stroke="#8FA9B8"
            strokeWidth="1.4"
          />
        </g>
      ))}

      {/* the clean tube, centre */}
      <g>
        {/* hinged cap, flipped open */}
        <path
          d="M112 30 q-14 -12 -2 -20 q12 -7 20 3"
          fill="none"
          stroke="#9FE9FF"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <ellipse cx="112" cy="9" rx="11" ry="5" fill="#7FD6F2" opacity="0.8" />

        <path
          d="M110 30 h38 v46 q0 22 -19 34 q-19 -12 -19 -34 z"
          fill={`url(#${u}-tube)`}
          stroke="#DDEAF2"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        {filled && (
          <path
            d="M112 62 h34 v14 q0 21 -17 32 q-17 -11 -17 -32 z"
            fill={`url(#${u}-buf)`}
            opacity="0.85"
          />
        )}
        {/* graduations */}
        {[44, 56, 68].map((y) => (
          <line
            key={y}
            x1="141"
            y1={y}
            x2="147"
            y2={y}
            stroke="#FFFFFF"
            strokeWidth="1.2"
            opacity="0.45"
          />
        ))}
        <path
          d="M116 34 v50"
          stroke="#FFFFFF"
          strokeWidth="2.6"
          opacity="0.4"
          strokeLinecap="round"
        />
      </g>

      {/* the rack the tubes stand in */}
      <path d="M14 96 h229 v18 q0 6 -6 6 H20 q-6 0 -6 -6 z" fill={`url(#${u}-rack)`} />
      <path d="M14 96 h229" stroke="#7FA6BC" strokeWidth="1.4" opacity="0.6" />
      <ellipse cx="128" cy="126" rx="112" ry="8" fill="#02080D" opacity="0.35" />
    </svg>
  );
}

/* --- The recipient cell (258 x 80) ---------------------------------------
 * A competent E. coli waiting to be transformed. `open` is the heat shock:
 * the membrane opens a transient pore and the wall flushes warm.
 */
export function HostCellArt({
  className = "",
  open = false,
}: ArtProps & { open?: boolean }) {
  const u = useUid();
  return (
    <svg viewBox="0 0 258 80" className={className} aria-hidden="true">
      <defs>
        <linearGradient id={`${u}-wall`} x1="0.1" y1="0" x2="0.5" y2="1">
          <stop offset="0" stopColor={open ? "#FFD3A0" : "#A8F8B9"} />
          <stop offset="0.4" stopColor={open ? "#FF9F5A" : "#48D06D"} />
          <stop offset="1" stopColor={open ? "#B54A00" : "#0A6E26"} />
        </linearGradient>
        <radialGradient id={`${u}-halo`}>
          <stop
            offset="0"
            stopColor={open ? "#FF8A3D" : "#4BE07A"}
            stopOpacity="0.4"
          />
          <stop
            offset="1"
            stopColor={open ? "#FF8A3D" : "#4BE07A"}
            stopOpacity="0"
          />
        </radialGradient>
      </defs>

      <ellipse cx="129" cy="40" rx="128" ry="38" fill={`url(#${u}-halo)`} />

      <rect
        x="6"
        y="8"
        width="246"
        height="64"
        rx="32"
        fill={`url(#${u}-wall)`}
        fillOpacity="0.34"
        stroke={open ? "#FF9F5A" : "#4BE07A"}
        strokeWidth="2.2"
        strokeDasharray={open ? "10 7" : undefined}
        className={open ? "sim-pore" : ""}
      />
      {/* cytoplasm texture */}
      {[
        [40, 26],
        [70, 52],
        [104, 22],
        [196, 54],
        [222, 30],
      ].map(([cx, cy]) => (
        <circle
          key={`${cx}-${cy}`}
          cx={cx}
          cy={cy}
          r="2.4"
          fill="#EAFFF1"
          opacity="0.4"
        />
      ))}
      <ellipse
        cx="72"
        cy="21"
        rx="42"
        ry="7"
        fill="#FFFFFF"
        opacity="0.18"
      />
    </svg>
  );
}

/* --- Petri dish (200 x 200) ----------------------------------------------
 * Seen from above: a glass dish with a poured agar bed, the meniscus ring
 * where the agar climbs the wall, and the lid's reflection across the top
 * left. Colonies are drawn by the stage on top of this.
 */
export function DishArt({ className = "" }: ArtProps) {
  const u = useUid();
  return (
    <svg viewBox="0 0 200 200" className={className} aria-hidden="true">
      <defs>
        <radialGradient id={`${u}-agar`} cx="0.38" cy="0.32" r="0.75">
          <stop offset="0" stopColor="#FFE9B8" />
          <stop offset="0.6" stopColor="#E8B85E" />
          <stop offset="1" stopColor="#9E6E1C" />
        </radialGradient>
        <linearGradient id={`${u}-lid`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#FFFFFF" stopOpacity="0.5" />
          <stop offset="0.45" stopColor="#FFFFFF" stopOpacity="0.06" />
          <stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
        </linearGradient>
      </defs>

      <circle cx="100" cy="100" r="98" fill="#0A1A24" opacity="0.4" />
      <circle cx="100" cy="100" r="93" fill={`url(#${u}-agar)`} opacity="0.9" />
      {/* the agar's meniscus against the wall */}
      <circle
        cx="100"
        cy="100"
        r="88"
        fill="none"
        stroke="#FFF2CE"
        strokeWidth="3"
        opacity="0.28"
      />
      {/* glass rim */}
      <circle
        cx="100"
        cy="100"
        r="97"
        fill="none"
        stroke="#DDEAF2"
        strokeWidth="2.6"
        opacity="0.85"
      />
      <circle
        cx="100"
        cy="100"
        r="92"
        fill="none"
        stroke="#DDEAF2"
        strokeWidth="1.2"
        opacity="0.4"
      />
      {/* lid reflection */}
      <path
        d="M22 74 A88 88 0 0 1 104 14 A96 96 0 0 0 22 74 Z"
        fill={`url(#${u}-lid)`}
      />
      <ellipse
        cx="62"
        cy="52"
        rx="40"
        ry="20"
        fill="#FFFFFF"
        opacity="0.12"
        transform="rotate(-38 62 52)"
      />
    </svg>
  );
}

/* --- A single cell on the bench (30 x 30) -------------------------------- */
export function CellDotArt({ className = "" }: ArtProps) {
  const u = useUid();
  return (
    <svg viewBox="0 0 30 30" className={className} aria-hidden="true">
      <defs>
        <radialGradient id={`${u}-c`} cx="0.35" cy="0.3" r="0.8">
          <stop offset="0" stopColor="#FFF0C4" />
          <stop offset="0.5" stopColor="#FFAB03" />
          <stop offset="1" stopColor="#9C5A00" />
        </radialGradient>
        <radialGradient id={`${u}-h`}>
          <stop offset="0" stopColor="#FFAB03" stopOpacity="0.55" />
          <stop offset="1" stopColor="#FFAB03" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="15" cy="15" r="15" fill={`url(#${u}-h)`} />
      <circle cx="15" cy="15" r="10.5" fill={`url(#${u}-c)`} />
      <circle cx="11.5" cy="11" r="3" fill="#FFFFFF" opacity="0.55" />
    </svg>
  );
}

/* --- Benchtop centrifuge (160 x 216) -------------------------------------
 * Lid up, rotor visible, tubes in the buckets. `spinning` blurs the rotor
 * into a disc, which is what a centrifuge actually looks like at speed.
 */
/** How far the rotor is flattened by the angle we look at it from. */
const ROTOR_TILT = 0.382;
/** Six buckets, at a radius of 34 in the rotor's own circular space. Rounded
 *  for the same reason as the virus spikes: raw trig serialises differently in
 *  Node and in the browser, and every one would be a hydration mismatch. */
const ROTOR_BUCKETS = [0, 60, 120, 180, 240, 300].map((deg) => {
  const rad = (deg * Math.PI) / 180;
  const round = (n: number) => Math.round(n * 100) / 100;
  return { deg, bx: round(34 * Math.cos(rad)), by: round(34 * Math.sin(rad)) };
});

export function CentrifugeArt({
  className = "",
  spinning = false,
  loaded = false,
}: ArtProps & { spinning?: boolean; loaded?: boolean }) {
  const u = useUid();
  return (
    <svg viewBox="0 0 160 216" className={className} aria-hidden="true">
      <defs>
        <linearGradient id={`${u}-shell`} x1="0" y1="0" x2="1" y2="0.6">
          <stop offset="0" stopColor="#E9F2F8" />
          <stop offset="0.4" stopColor="#B4C6D4" />
          <stop offset="1" stopColor="#6C8092" />
        </linearGradient>
        <linearGradient id={`${u}-bowl`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#16242F" />
          <stop offset="1" stopColor="#31465A" />
        </linearGradient>
        <linearGradient id={`${u}-rotor`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#DCE8F0" />
          <stop offset="0.5" stopColor="#8FA3B5" />
          <stop offset="1" stopColor="#4C5E70" />
        </linearGradient>
        <radialGradient id={`${u}-glow`}>
          <stop offset="0" stopColor="#38E1FF" stopOpacity="0.5" />
          <stop offset="1" stopColor="#38E1FF" stopOpacity="0" />
        </radialGradient>
      </defs>

      {spinning && <ellipse cx="80" cy="96" rx="78" ry="66" fill={`url(#${u}-glow)`} />}

      {/* lid, hinged open at the back */}
      <path
        d="M18 58 q62 -34 124 0 l0 8 q-62 -30 -124 0 z"
        fill={`url(#${u}-shell)`}
        stroke="#5E7387"
        strokeWidth="1.4"
      />
      <path
        d="M22 56 q58 -30 116 0"
        fill="none"
        stroke="#FFFFFF"
        strokeWidth="2"
        opacity="0.5"
      />

      {/* body */}
      <path
        d="M14 74 h132 q8 0 8 8 v96 q0 10 -10 10 H16 q-10 0 -10 -10 V82 q0 -8 8 -8 z"
        fill={`url(#${u}-shell)`}
        stroke="#5E7387"
        strokeWidth="1.6"
      />
      {/* the bowl the rotor sits in */}
      <ellipse cx="80" cy="96" rx="60" ry="24" fill={`url(#${u}-bowl)`} />
      <ellipse
        cx="80"
        cy="96"
        rx="60"
        ry="24"
        fill="none"
        stroke="#8FA9B8"
        strokeWidth="1.6"
      />

      {/* The rotor plate is a disc of revolution, so it does not itself turn —
          only what is bolted to it moves.

          The buckets orbit the machine's vertical axis. Rotating the drawing
          as it appears would tumble the whole rotor end over end, like a wheel
          seen face-on; what is wanted is the buckets travelling round a circle
          that we happen to be looking at from above and in front. So they turn
          in true circular space inside a group that is then flattened to the
          angle we are viewing the rotor from — which also squashes each bucket
          into the ellipse the projection calls for. */}
      <ellipse cx="80" cy="94" rx="46" ry="18" fill={`url(#${u}-rotor)`} />
      <g transform={`translate(80 94) scale(1 ${ROTOR_TILT})`}>
        <g className={spinning ? "sim-rotor" : ""}>
          {ROTOR_BUCKETS.map(({ deg, bx, by }) => (
            <g key={deg}>
              <circle cx={bx} cy={by} r="9.5" fill="#22323F" />
              {loaded && (
                <circle cx={bx} cy={by} r="6" fill="#9FE9FF" opacity="0.85" />
              )}
            </g>
          ))}
        </g>
      </g>
      <circle cx="80" cy="94" r="7" fill="#4C5E70" />
      <circle cx="80" cy="94" r="3" fill="#DCE8F0" />
      {spinning && (
        <ellipse
          cx="80"
          cy="94"
          rx="46"
          ry="18"
          fill="#DCE8F0"
          opacity="0.28"
        />
      )}

      {/* control panel */}
      <rect x="24" y="132" width="112" height="40" rx="7" fill="#132029" />
      <rect x="32" y="140" width="58" height="24" rx="4" fill="#04121A" />
      <text
        x="61"
        y="157"
        textAnchor="middle"
        fontSize="13"
        letterSpacing="1"
        fill={spinning ? "#5CF2A0" : "#3E5E6E"}
        style={{ fontFamily: "var(--app-outfit)" }}
      >
        {spinning ? "13.2k" : "0000"}
      </text>
      <circle cx="107" cy="146" r="5" fill={spinning ? "#FF6B6B" : "#43596A"} />
      <circle cx="122" cy="146" r="5" fill={spinning ? "#FFB92E" : "#43596A"} />
      <rect x="100" y="156" width="29" height="7" rx="3.5" fill="#43596A" />

      {/* feet + contact shadow */}
      <rect x="20" y="188" width="18" height="7" rx="3" fill="#22323F" />
      <rect x="122" y="188" width="18" height="7" rx="3" fill="#22323F" />
      <ellipse cx="80" cy="200" rx="70" ry="9" fill="#02080D" opacity="0.4" />
    </svg>
  );
}

/* --- Buffer well (125 x 125) ---------------------------------------------
 * Looking straight down into a dish of lysis buffer. Ripples run out from the
 * middle whenever the step is shaking it.
 */
export function BufferWellArt({
  className = "",
  active = false,
}: ArtProps & { active?: boolean }) {
  const u = useUid();
  return (
    <svg viewBox="0 0 125 125" className={className} aria-hidden="true">
      <defs>
        {/* Shallow, so the shading is nearly flat across the middle and only
            darkens where the liquid meets the wall — a deep radial here reads
            as a glass marble instead of a dish of buffer. */}
        <radialGradient id={`${u}-fluid`} cx="0.42" cy="0.38" r="0.78">
          <stop offset="0" stopColor="#7FD9F7" />
          <stop offset="0.62" stopColor="#41B7E4" />
          <stop offset="0.9" stopColor="#1B7BA8" />
          <stop offset="1" stopColor="#0E5B80" />
        </radialGradient>
        <radialGradient id={`${u}-glow`}>
          <stop offset="0.55" stopColor="#38E1FF" stopOpacity="0.4" />
          <stop offset="1" stopColor="#38E1FF" stopOpacity="0" />
        </radialGradient>
      </defs>

      <circle cx="62.5" cy="62.5" r="62" fill={`url(#${u}-glow)`} />
      <circle cx="62.5" cy="62.5" r="56" fill={`url(#${u}-fluid)`} opacity="0.92" />

      {/* the meniscus climbing the wall */}
      <circle
        cx="62.5"
        cy="62.5"
        r="51"
        fill="none"
        stroke="#CFF3FF"
        strokeWidth="3"
        opacity="0.22"
      />

      {/* ripples running out from the middle */}
      <g className={active ? "sim-ripple" : ""}>
        <circle
          cx="62.5"
          cy="62.5"
          r="20"
          fill="none"
          stroke="#EAFBFF"
          strokeWidth="2"
          opacity="0.5"
        />
      </g>
      <g className={active ? "sim-ripple sim-delay-1" : ""}>
        <circle
          cx="62.5"
          cy="62.5"
          r="20"
          fill="none"
          stroke="#EAFBFF"
          strokeWidth="1.6"
          opacity="0.35"
        />
      </g>

      {/* the glass rim of the dish */}
      <circle
        cx="62.5"
        cy="62.5"
        r="56"
        fill="none"
        stroke="#DDEAF2"
        strokeWidth="2.4"
        opacity="0.85"
      />
      <circle
        cx="62.5"
        cy="62.5"
        r="60"
        fill="none"
        stroke="#DDEAF2"
        strokeWidth="1.2"
        opacity="0.35"
      />

      {/* the room light lying on the surface */}
      <ellipse
        cx="44"
        cy="38"
        rx="22"
        ry="9"
        fill="#FFFFFF"
        opacity="0.28"
        transform="rotate(-34 44 38)"
      />
    </svg>
  );
}

/* --- The pellet the spin leaves behind (94 x 84) ------------------------- */
export function PelletArt({ className = "" }: ArtProps) {
  const u = useUid();
  return (
    <svg viewBox="0 0 94 84" className={className} aria-hidden="true">
      <defs>
        <linearGradient id={`${u}-tube`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#FFFFFF" stopOpacity="0.5" />
          <stop offset="0.4" stopColor="#DFF1FA" stopOpacity="0.2" />
          <stop offset="0.82" stopColor="#0B2230" stopOpacity="0.28" />
          <stop offset="1" stopColor="#FFFFFF" stopOpacity="0.3" />
        </linearGradient>
        <radialGradient id={`${u}-pellet`} cx="0.35" cy="0.3" r="0.8">
          <stop offset="0" stopColor="#FFF0C4" />
          <stop offset="0.55" stopColor="#E7C173" />
          <stop offset="1" stopColor="#8A6420" />
        </radialGradient>
      </defs>

      <path
        d="M24 4 h46 v38 q0 24 -23 38 q-23 -14 -23 -38 z"
        fill={`url(#${u}-tube)`}
        stroke="#DDEAF2"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      {/* the pellet, packed at the tip */}
      <path
        d="M31 54 q16 -9 32 0 q-3 17 -16 26 q-13 -9 -16 -26 z"
        fill={`url(#${u}-pellet)`}
      />
      <path
        d="M31 54 q16 -9 32 0"
        fill="none"
        stroke="#FFF6DC"
        strokeWidth="1.6"
        opacity="0.7"
      />
      <path
        d="M29 10 v40"
        stroke="#FFFFFF"
        strokeWidth="2.6"
        opacity="0.4"
        strokeLinecap="round"
      />
      <ellipse cx="47" cy="4" rx="23" ry="4" fill="#9FE9FF" opacity="0.5" />
    </svg>
  );
}

/* --- Lysate: the liquid with the protein in it (131 x 86) ---------------- */
const LYSATE_SPECKS: [number, number, number][] = [
  [58, 46, 2.4],
  [70, 58, 2],
  [64, 68, 1.8],
  [76, 40, 1.6],
  [52, 60, 1.6],
];

export function LysateArt({ className = "" }: ArtProps) {
  const u = useUid();
  return (
    <svg viewBox="0 0 131 86" className={className} aria-hidden="true">
      <defs>
        <linearGradient id={`${u}-vial`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#FFFFFF" stopOpacity="0.5" />
          <stop offset="0.45" stopColor="#DFF1FA" stopOpacity="0.18" />
          <stop offset="0.85" stopColor="#0B2230" stopOpacity="0.26" />
          <stop offset="1" stopColor="#FFFFFF" stopOpacity="0.3" />
        </linearGradient>
        <linearGradient id={`${u}-fluid`} x1="0" y1="0" x2="1" y2="0.4">
          <stop offset="0" stopColor="#FFE29A" />
          <stop offset="0.5" stopColor="#F2A413" />
          <stop offset="1" stopColor="#9E6100" />
        </linearGradient>
        <radialGradient id={`${u}-glow`}>
          <stop offset="0" stopColor="#FFB92E" stopOpacity="0.42" />
          <stop offset="1" stopColor="#FFB92E" stopOpacity="0" />
        </radialGradient>
      </defs>

      <ellipse cx="65" cy="48" rx="46" ry="40" fill={`url(#${u}-glow)`} />

      <rect
        x="46"
        y="6"
        width="38"
        height="74"
        rx="6"
        fill={`url(#${u}-vial)`}
        stroke="#DDEAF2"
        strokeWidth="2"
      />
      <path d="M48 34 h34 v40 q0 4 -4 4 h-26 q-4 0 -4 -4 z" fill={`url(#${u}-fluid)`} opacity="0.9" />
      <path
        d="M48 34 q8.5 -4 17 0 t17 0"
        fill="none"
        stroke="#FFF6DC"
        strokeWidth="1.6"
        opacity="0.75"
      />
      {LYSATE_SPECKS.map(([cx, cy, r], i) => (
        <circle
          key={`${cx}-${cy}`}
          cx={cx}
          cy={cy}
          r={r}
          fill="#FFF9E6"
          opacity="0.85"
          className="sim-jitter"
          style={{ animationDelay: `${i * 0.4}s` }}
        />
      ))}
      <path
        d="M52 12 v58"
        stroke="#FFFFFF"
        strokeWidth="2.6"
        opacity="0.4"
        strokeLinecap="round"
      />
      <ellipse cx="65" cy="6" rx="19" ry="3.6" fill="#9FE9FF" opacity="0.55" />
    </svg>
  );
}

/* --- Purification column (96 x 224) --------------------------------------
 * A gravity column: reservoir on top, a packed resin bed in the middle held
 * between two frits, and a tapered outlet with a stopcock.
 *
 *   empty     — resin only, waiting
 *   loaded    — the lysate is sitting on the bed
 *   washed    — the junk has run through; the tagged protein stays bound and
 *               glows on the resin
 *   collected — the band is coming off the bottom as drops
 */
export type ColumnPhase = "empty" | "loaded" | "washed" | "collected";

const RESIN_BEADS: [number, number, number][] = [
  [30, 108, 5],
  [46, 104, 6],
  [62, 110, 5],
  [36, 120, 5.5],
  [55, 122, 5],
  [68, 118, 4.5],
  [28, 134, 5],
  [45, 136, 6],
  [62, 138, 5],
  [36, 150, 5.5],
  [56, 152, 5],
  [68, 146, 4.5],
];

export function ColumnArt({
  className = "",
  phase = "empty",
}: ArtProps & { phase?: ColumnPhase }) {
  const u = useUid();
  const loaded = phase === "loaded";
  const washed = phase === "washed";
  const collected = phase === "collected";
  return (
    <svg viewBox="0 0 96 224" className={className} aria-hidden="true">
      <defs>
        <linearGradient id={`${u}-glass`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#FFFFFF" stopOpacity="0.42" />
          <stop offset="0.4" stopColor="#DFF1FA" stopOpacity="0.14" />
          <stop offset="0.85" stopColor="#0B2230" stopOpacity="0.26" />
          <stop offset="1" stopColor="#FFFFFF" stopOpacity="0.3" />
        </linearGradient>
        <linearGradient id={`${u}-load`} x1="0" y1="0" x2="1" y2="0.4">
          <stop offset="0" stopColor="#FFE29A" />
          <stop offset="1" stopColor="#C88200" />
        </linearGradient>
        <radialGradient id={`${u}-bead`} cx="0.35" cy="0.3" r="0.8">
          <stop offset="0" stopColor="#EAF4FA" />
          <stop offset="0.6" stopColor="#94A9BC" />
          <stop offset="1" stopColor="#3F5164" />
        </radialGradient>
        <radialGradient id={`${u}-bound`} cx="0.35" cy="0.3" r="0.8">
          <stop offset="0" stopColor="#FFF3C4" />
          <stop offset="0.55" stopColor="#FFB92E" />
          <stop offset="1" stopColor="#9E6100" />
        </radialGradient>
      </defs>

      {/* barrel */}
      <path
        d="M18 10 h60 v152 l-14 24 h-32 l-14 -24 z"
        fill={`url(#${u}-glass)`}
        stroke="#DDEAF2"
        strokeWidth="2"
        strokeLinejoin="round"
      />

      {/* the sample sitting on the bed */}
      {loaded && (
        <>
          <rect x="20" y="62" width="56" height="36" fill={`url(#${u}-load)`} opacity="0.85" />
          <path
            d="M20 62 q14 -5 28 0 t28 0"
            fill="none"
            stroke="#FFF6DC"
            strokeWidth="1.6"
            opacity="0.75"
          />
        </>
      )}

      {/* frits */}
      <rect x="20" y="98" width="56" height="4" fill="#7E93A6" opacity="0.8" />
      <rect x="20" y="160" width="56" height="4" fill="#7E93A6" opacity="0.8" />

      {/* resin bed */}
      {RESIN_BEADS.map(([cx, cy, r]) => (
        <circle
          key={`${cx}-${cy}`}
          cx={cx}
          cy={cy}
          r={r}
          fill={washed ? `url(#${u}-bound)` : `url(#${u}-bead)`}
        />
      ))}
      {washed && (
        <rect x="20" y="100" width="56" height="60" fill="#FFB92E" opacity="0.16" />
      )}

      {/* outlet, stopcock, and the drops coming off it */}
      <rect x="42" y="186" width="12" height="18" rx="2" fill={`url(#${u}-glass)`} stroke="#DDEAF2" strokeWidth="1.6" />
      <rect x="32" y="188" width="32" height="7" rx="3.5" fill="#8FA9B8" />
      <circle cx="48" cy="191.5" r="5" fill="#5E7387" stroke="#DDEAF2" strokeWidth="1.2" />
      {collected && (
        <>
          <circle cx="48" cy="208" r="4" fill="#FFC94A" className="sim-drip" />
          <circle
            cx="48"
            cy="208"
            r="3.4"
            fill="#FFE29A"
            className="sim-drip sim-delay-1"
          />
        </>
      )}

      {/* highlight */}
      <path
        d="M24 18 v150"
        stroke="#FFFFFF"
        strokeWidth="3"
        opacity="0.35"
        strokeLinecap="round"
      />
      <ellipse cx="48" cy="10" rx="30" ry="5" fill="#9FE9FF" opacity="0.5" />
    </svg>
  );
}

/* --- The purified protein (120 x 104) ------------------------------------
 * A folded protein: two helices and a sheet, drawn as a ribbon. This is the
 * thing the whole walkthrough is for, so it gets a glow.
 */
export function ProteinArt({ className = "" }: ArtProps) {
  const u = useUid();
  return (
    <svg viewBox="0 0 120 104" className={className} aria-hidden="true">
      <defs>
        <linearGradient id={`${u}-ribbon`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#9BFFC4" />
          <stop offset="0.45" stopColor="#2FD37A" />
          <stop offset="1" stopColor="#0B8B45" />
        </linearGradient>
        <linearGradient id={`${u}-sheet`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#FFD98A" />
          <stop offset="1" stopColor="#E08A05" />
        </linearGradient>
        <radialGradient id={`${u}-glow`}>
          <stop offset="0" stopColor="#4BE07A" stopOpacity="0.5" />
          <stop offset="1" stopColor="#4BE07A" stopOpacity="0" />
        </radialGradient>
      </defs>

      <ellipse cx="60" cy="52" rx="58" ry="50" fill={`url(#${u}-glow)`} />

      <g className="sim-breathe">
        {/* helix 1 */}
        <path
          d="M22 78 C22 62 44 62 44 46 C44 30 22 30 22 16"
          fill="none"
          stroke={`url(#${u}-ribbon)`}
          strokeWidth="9"
          strokeLinecap="round"
        />
        {/* the loop across */}
        <path
          d="M22 78 C36 96 70 96 84 80"
          fill="none"
          stroke="#7FE8B0"
          strokeWidth="5"
          strokeLinecap="round"
          opacity="0.85"
        />
        {/* helix 2 */}
        <path
          d="M84 80 C84 64 62 64 62 48 C62 32 84 32 84 18"
          fill="none"
          stroke={`url(#${u}-ribbon)`}
          strokeWidth="9"
          strokeLinecap="round"
        />
        {/* beta sheet arrow */}
        <path
          d="M32 34 h44 l-6 -7 14 10 -14 10 6 -7 h-44 z"
          fill={`url(#${u}-sheet)`}
          opacity="0.9"
        />
      </g>

      <g className="sim-sparkle">
        <path
          d="M100 20 l2.4 6.6 6.6 2.4 -6.6 2.4 -2.4 6.6 -2.4 -6.6 -6.6 -2.4 6.6 -2.4 z"
          fill="#EAFFF1"
        />
      </g>
    </svg>
  );
}
