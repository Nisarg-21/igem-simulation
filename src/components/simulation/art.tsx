/**
 * The four vector props on the simulation stage, rebuilt from the Figma
 * export. Every number below is a design pixel measured off the 1013px-wide
 * content column, so the shapes drop straight onto the absolute positions in
 * `Simulation.tsx` at the `wide:` breakpoint.
 *
 * Each export is just the artwork — the caption underneath ("E.coli",
 * "yeast", ...) is HTML in the stage so it stays readable when the art
 * shrinks on a phone.
 */

import { useId } from "react";

interface ArtProps {
  className?: string;
}

/* --- E. coli -------------------------------------------------------------
 * Ellipse 13: 125 x 78, #088B20, 2px black (border-box, so the stroke eats
 * into the 125 x 78). It sits 5.4px in from the left of the 137.5px group.
 * Ellipse 14 / 15: two 5px #D9D9D9 specks, 27.9px and 87.9px from the
 * ellipse's left edge and 27px down from its top.
 */
export function EcoliArt({ className = "" }: ArtProps) {
  return (
    <svg viewBox="0 0 137.5 78" className={className} aria-hidden="true">
      <ellipse
        cx="67.9"
        cy="39"
        rx="61.5"
        ry="38"
        fill="#088B20"
        stroke="#000000"
        strokeWidth="2"
      />
      <circle cx="35.85" cy="29.5" r="2.5" fill="#D9D9D9" />
      <circle cx="95.85" cy="29.5" r="2.5" fill="#D9D9D9" />
    </svg>
  );
}

/* --- Yeast ---------------------------------------------------------------
 * Ellipse 16: the 80px mother cell, sitting 22px down the group.
 * Ellipse 17: the 40px bud, flush with the mother's top-right.
 */
export function YeastArt({ className = "" }: ArtProps) {
  return (
    <svg viewBox="0 0 80 102" className={className} aria-hidden="true">
      <circle cx="40" cy="62" r="40" fill="#FFAB03" />
      <circle cx="60" cy="20" r="20" fill="#FFAB03" />
    </svg>
  );
}

/* --- Virus ---------------------------------------------------------------
 * Ellipse 18 is a 62px #EF3B3B core. The eight spikes are Groups 107-110,
 * each a mirrored pair; the angles below are read back out of the four
 * `transform: matrix(...)` values, which is why they are a few degrees off a
 * clean 45deg step — that wobble is in the design.
 */
const VIRUS_C = 67.5;
const SPIKE_FROM = 21; // starts inside the core, so no seam shows
const SPIKE_TO = 58.5; // centre of the knob
const VIRUS_ANGLES = [-94.4, -40.5, 5.1, 49.5, 85.6, 139.5, 185.1, 229.5];

/**
 * Resolved once, and rounded on purpose. Raw `Math.cos` output serialises to a
 * slightly different string in Node than in the browser (17 significant digits
 * against 15), which React reports as a hydration mismatch on every spike.
 * Three decimals is well past what a 135px drawing can show.
 */
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
  };
});

export function VirusArt({ className = "" }: ArtProps) {
  return (
    <svg viewBox="0 0 135 135" className={className} aria-hidden="true">
      {VIRUS_SPIKES.map((s) => (
        <g key={s.deg}>
          <line
            x1={s.x1}
            y1={s.y1}
            x2={s.x2}
            y2={s.y2}
            stroke="#000000"
            strokeWidth="4"
          />
          <circle cx={s.x2} cy={s.y2} r="9" fill="#000000" />
        </g>
      ))}
      <circle cx={VIRUS_C} cy={VIRUS_C} r="31" fill="#EF3B3B" />
    </svg>
  );
}

/* --- Plasmid / DNA ring --------------------------------------------------
 * Ellipse 20: a 100px ring, 3px #260338, no fill.
 * Rectangles 35 / 36 / 37: three gene segments lying on the ring. Figma gives
 * each one an unrotated size plus a rotation about its own centre; the
 * centres below all land ~49px from the ring's centre, i.e. on the ring.
 */
export function PlasmidArt({
  className = "",
  /**
   * The "Cut the DNA" frame draws Rectangle 37 at its full 33.58px rather than
   * the stub the earlier frame used, so the second restriction site is as
   * visible as the first. Everything else about the ring is identical.
   */
  longSite = false,
}: ArtProps & { longSite?: boolean }) {
  return (
    <svg viewBox="0 0 105.2 105" className={className} aria-hidden="true">
      <circle
        cx="50.9"
        cy="55"
        r="48.5"
        fill="none"
        stroke="#260338"
        strokeWidth="3"
      />
      {/* Rectangle 35 — 51.1 x 10, unrotated, straddling the top of the ring */}
      <rect x="24.9" y="0" width="51.1" height="10" fill="#F85E5E" />
      {/* Rectangle 36 — 33.4 x 10 at 42.45deg, lower-left of the ring */}
      <rect
        x="-1"
        y="81.95"
        width="33.4"
        height="10"
        fill="#0FB6FE"
        transform="rotate(42.45 15.7 86.95)"
      />
      {/* Rectangle 37 — at -89.65deg, on the right flank of the ring */}
      {longSite ? (
        <rect
          x="83.11"
          y="50"
          width="33.58"
          height="10"
          fill="#BE0FFE"
          transform="rotate(-89.65 99.9 55)"
        />
      ) : (
        <rect
          x="93.35"
          y="46.75"
          width="13.5"
          height="10"
          fill="#BE0FFE"
          transform="rotate(-89.65 100.1 51.75)"
        />
      )}
      <text
        x="50.9"
        y="55"
        textAnchor="middle"
        dominantBaseline="central"
        fontSize="16"
        fill="#000000"
        style={{ fontFamily: "var(--app-outfit)" }}
      >
        Plasmid
      </text>
    </svg>
  );
}

/* --- Scissors (Groups 119 / 120) ----------------------------------------
 * Two 2px arms crossing at a pivot, each ending in a 15px ring stroked #EF3B3B.
 *
 * Figma gives the arms as lengths (51.43, 50.79) plus angles (-165.35deg,
 * 146.46deg) inside a group that is itself turned -138.79deg, but no origins —
 * so where they cross has to be inferred. Running the arms through a pivot one
 * third along, the way real scissors are hinged, and folding in the group
 * rotation reproduces the exported 59px group width almost exactly (58.05);
 * starting both arms from a shared point instead draws a "V", not scissors.
 * Blades point down-right, handles up-left.
 */
const SCISSOR_PIVOT = [41.2, 35.63] as const;
const SCISSOR_ARMS = [
  // blade tip, then the arm's far end stopped a ring-radius short, then the ring
  { tip: [50.74, 49.7], to: [25.75, 12.88], ring: [22.1, 7.5] },
  { tip: [58.05, 37.91], to: [13.94, 31.95], ring: [7.5, 31.08] },
] as const;

export function ScissorsArt({ className = "" }: ArtProps) {
  return (
    <svg viewBox="0 0 59 51" className={className} aria-hidden="true">
      {SCISSOR_ARMS.map(({ tip, to, ring }) => (
        <g key={ring[0]}>
          <line
            x1={tip[0]}
            y1={tip[1]}
            x2={to[0]}
            y2={to[1]}
            stroke="#000000"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <circle
            cx={ring[0]}
            cy={ring[1]}
            r="6.5"
            fill="none"
            stroke="#EF3B3B"
            strokeWidth="2"
          />
        </g>
      ))}
      {/* the hinge */}
      <circle
        cx={SCISSOR_PIVOT[0]}
        cy={SCISSOR_PIVOT[1]}
        r="2"
        fill="#000000"
      />
    </svg>
  );
}

/* --- The gene to be cut out (Rectangles 38 / 39 / 40) --------------------
 * A 96 x 29 #8A38F5 body with a 19 x 10 #FFAB03 sticky end at each side. Those
 * two amber ends are what later join into the single 38px amber bar on the
 * "New DNA ring" in step 5.
 */
export function GeneArt({ className = "" }: ArtProps) {
  return (
    <svg viewBox="0 0 96 29" className={className} aria-hidden="true">
      <rect x="0" y="0" width="96" height="29" fill="#8A38F5" />
      <rect x="0" y="9.5" width="19" height="10" fill="#FFAB03" />
      <rect x="77" y="9.5" width="19" height="10" fill="#FFAB03" />
    </svg>
  );
}

/* --- The recombinant ring carried into a cell (step 5's Group 117) -------
 * A #55087F ring with the joined 38px amber site on top and the rounded 32px
 * #BE0FFE segment on its right flank.
 */
export function NewRingArt({ className = "" }: ArtProps) {
  return (
    <svg viewBox="0 0 105.2 105" className={className} aria-hidden="true">
      <circle
        cx="50.9"
        cy="55"
        r="48.5"
        fill="none"
        stroke="#55087F"
        strokeWidth="3"
      />
      <rect x="31.9" y="0" width="38" height="10" fill="#E49B09" />
      <rect
        x="83.9"
        y="50"
        width="32"
        height="10"
        rx="5"
        fill="#BE0FFE"
        transform="rotate(80.79 99.9 55)"
      />
    </svg>
  );
}

/* --- Colonies on the plate (Ellipses 26-33) ------------------------------
 * An 85px blob holding three cells: two side by side across the upper half and
 * one below, sitting left of centre. Traced off the supplied artwork, so the
 * placement is deliberately hand-set — the top pair is not level and the lower
 * cell is not centred. Do not "tidy" these into an even triangle.
 */
const SEED_CELLS = [
  [29.5, 35.5],
  [58.5, 34.5],
  [40.5, 61],
] as const;

const COLONY_TONES = {
  with: { fill: "#83E595", stroke: "#088B20", cell: "#088B20" },
  without: { fill: "#A6A2A2", stroke: "#545050", cell: "#545050" },
} as const;

export function ColonyArt({
  className = "",
  tone,
}: ArtProps & { tone: keyof typeof COLONY_TONES }) {
  const t = COLONY_TONES[tone];
  return (
    <svg viewBox="0 0 85 85" className={className} aria-hidden="true">
      <circle
        cx="42.5"
        cy="42.5"
        r="41.5"
        fill={t.fill}
        stroke={t.stroke}
        strokeWidth="2"
      />
      {SEED_CELLS.map(([x, y]) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r="10.6" fill={t.cell} />
      ))}
    </svg>
  );
}

/* --- Conical flask (Rectangles 43 / 44 + Line 247) -----------------------
 * A 45.29 x 68.54 neck over a 116 x 130.85 cone, with a 47.67 rim line across
 * the top. Figma exports the cone's bounding box rather than its outline, so
 * the sloped sides are reconstructed from the neck width down to the 116px
 * base — matching the supplied flask drawing.
 *
 * `fill` (0-1) raises the broth; `cells` is how many of the colonies below to
 * show, which is how the flask visibly grows as the dial is turned.
 */
const FLASK_W = 116;
const FLASK_BASE = 197;
const FLASK_NECK_Y = 68.54;
const FLASK_NECK_L = 35.36;
const FLASK_NECK_R = 80.65;
const FLASK_OUTLINE = `M${FLASK_NECK_L} 1 L${FLASK_NECK_L} ${FLASK_NECK_Y} L1 ${FLASK_BASE} L115 ${FLASK_BASE} L${FLASK_NECK_R} ${FLASK_NECK_Y} L${FLASK_NECK_R} 1`;
/** Broth can rise 97px before it would reach the neck. */
const FLASK_HEAD = 97;

/** x, y, r — index 0 is the 30px winning cell; the rest fill from the base up. */
const FLASK_CELLS: [number, number, number][] = [
  [58, 165, 15],
  [58, 185, 10],
  [30, 178, 10],
  [86, 178, 10],
  [25, 155, 10],
  [92, 158, 10],
  [58, 138, 10],
  [36, 128, 10],
  [80, 128, 10],
  [44, 112, 10],
];

export function FlaskArt({
  className = "",
  fill = 0,
  cells = 0,
}: ArtProps & { fill?: number; cells?: number }) {
  const clip = useId().replace(/:/g, "");
  const level = Math.max(0, Math.min(1, fill)) * FLASK_HEAD;
  return (
    <svg viewBox={`0 0 ${FLASK_W} 198`} className={className} aria-hidden="true">
      <defs>
        <clipPath id={clip}>
          <path d={`${FLASK_OUTLINE} Z`} />
        </clipPath>
      </defs>
      {level > 0 && (
        <rect
          x="0"
          y={FLASK_BASE - level}
          width={FLASK_W}
          height={level}
          fill="#FFAB03"
          opacity="0.3"
          clipPath={`url(#${clip})`}
        />
      )}
      {FLASK_CELLS.slice(0, cells).map(([x, y, r]) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r={r} fill="#FFAB03" />
      ))}
      <line
        x1="34.17"
        y1="1"
        x2="81.84"
        y2="1"
        stroke="#000000"
        strokeWidth="2"
      />
      <path
        d={FLASK_OUTLINE}
        fill="none"
        stroke="#000000"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* --- IPTG bottle (Group 136) ---------------------------------------------
 * A 61 x 103 white body under a 36 x 20 #FFAB03 cap, banded with a full-width
 * 20px stripe of #BE0FFE.
 */
export function IptgArt({ className = "" }: ArtProps) {
  return (
    <svg viewBox="0 0 61 123" className={className} aria-hidden="true">
      <rect x="12.5" y="0" width="36" height="20" fill="#FFAB03" />
      <rect
        x="1"
        y="21"
        width="59"
        height="101"
        fill="#FFFFFF"
        stroke="#000000"
        strokeWidth="2"
      />
      <rect x="0" y="72" width="61" height="20" fill="#BE0FFE" />
    </svg>
  );
}
