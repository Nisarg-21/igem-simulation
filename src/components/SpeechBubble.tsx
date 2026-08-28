interface Props {
  line: string;
  /** Which side the tail hangs off — the side the speaker stands on. */
  tail: "left" | "right";
  className?: string;
}

/*
 * Geometry recovered from the Figma export (see .bubble / .bubble-tail in
 * globals.css for the measurements). The tail's vertices, relative to the
 * bubble's bottom-left corner:
 *     apex  (-35.8, bottom + 43.2)   <- the point
 *     base  (  5.2, bottom - 39.5) .. (28.4, bottom - 25.7)   <- inside the pill
 */
const TAIL_POINTS = "41,0 64.2,13.7 0,82.7";

export default function SpeechBubble({ line, tail, className = "" }: Props) {
  return (
    <div className={`relative ${className}`}>
      {/* Drawn before the bubble so the pill paints over the tail's base. */}
      <svg
        viewBox="0 0 64.2 82.7"
        preserveAspectRatio="none"
        aria-hidden="true"
        className={`bubble-tail${tail === "right" ? " bubble-tail--right" : ""}`}
      >
        <polygon points={TAIL_POINTS} className="fill-bubble" />
      </svg>

      <div className="bubble relative">
        <p className="dialogue text-[15px] leading-[21px] wide:text-[17.69px]">
          {line}
        </p>
      </div>
    </div>
  );
}
