"use client";

import Image from "next/image";
import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { CAST, STORY, VERA_POSES, type Beat } from "@/data/story";
import SpeechBubble from "./SpeechBubble";

/*
 * Three layout tiers, because the Figma composition needs ~980px of track:
 *   < 768px            stacked — bubble over a row of the two characters
 *   768px – 1159px     one row, scaled to the frame
 *   >= 1160px          the exact Figma composition, in design pixels
 */

function DuoPanel({ beat }: { beat: Extract<Beat, { kind: "duo" }> }) {
  const costar = CAST[beat.costar];
  const veraSpeaks = beat.speaker === "vera";

  return (
    <div className="grid h-full w-full grid-cols-2 grid-rows-[auto_auto] content-center items-end justify-items-center gap-x-4 gap-y-7 px-6 md:flex md:items-center md:justify-start md:gap-0 md:px-0 md:pr-6 md:pl-6 wide:pr-0 wide:pl-[82px]">
      <Image
        src={CAST.vera.src}
        alt="Vera"
        width={368}
        height={368}
        className="order-2 h-[145px] w-auto object-contain md:order-none md:h-[62%] wide:h-[326px]"
      />

      <SpeechBubble
        line={beat.line}
        tail={veraSpeaks ? "left" : "right"}
        className="order-1 col-span-2 w-full max-w-[288px] shrink-0 md:order-none md:col-span-1 md:-ml-8 md:w-auto md:min-w-0 md:max-w-[260px] md:flex-1 wide:-ml-[64px] wide:w-[319px] wide:max-w-none wide:flex-none"
      />

      <div className="order-3 flex shrink-0 items-center justify-center md:order-none md:ml-4 md:h-full wide:ml-[59px] wide:w-[260px]">
        <Image
          src={costar.src}
          alt={costar.name}
          width={512}
          height={512}
          className="h-[105px] w-auto object-contain md:h-auto md:max-h-[45%] md:max-w-[170px] wide:h-[var(--costar-h)] wide:max-h-[72%] wide:max-w-none"
          style={{ "--costar-h": `${costar.height}px` } as React.CSSProperties}
        />
      </div>
    </div>
  );
}

function SoloPanel({ beat }: { beat: Extract<Beat, { kind: "solo" }> }) {
  return (
    <div className="flex h-full w-full items-center justify-center gap-3 px-6 md:justify-start md:gap-9 md:pl-6 wide:pl-[92px]">
      <Image
        src={VERA_POSES[beat.pose]}
        alt="Vera"
        width={347}
        height={734}
        className="h-[150px] w-auto shrink-0 object-contain md:h-[70%] wide:h-[332px]"
      />
      <SpeechBubble
        line={beat.line}
        tail="left"
        className="w-full max-w-[215px] shrink-0 md:max-w-[330px] wide:w-[390px] wide:max-w-none"
      />
    </div>
  );
}

export default function StoryFrame() {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);

  const onScroll = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const max = el.scrollHeight - el.clientHeight;
    setProgress(max > 0 ? el.scrollTop / max : 0);
  }, []);

  useEffect(() => {
    onScroll();
  }, [onScroll]);

  return (
    <section
      id="story"
      className="mx-auto mt-16 w-full max-w-[1440px] px-5 sm:px-8 lg:mt-[99px]"
    >
      <div className="relative mx-auto h-[420px] w-full max-w-[1186px] border-2 border-ink bg-story md:h-[380px] wide:translate-x-[17px]">
        {/* Left rail: the "Scroll down" cue, doubling as a progress track. */}
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 hidden w-[70px] flex-col items-center justify-center gap-4 md:flex">
          <span
            className="font-outfit text-[13px] font-medium whitespace-nowrap"
            style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
          >
            Scroll down
          </span>
          <span className="relative block h-[110px] w-px bg-ink/25">
            <span
              className="absolute inset-x-0 top-0 block bg-ink transition-[height] duration-150 ease-out"
              style={{ height: `${Math.max(progress * 100, 2)}%` }}
            />
            <svg
              width="11"
              height="8"
              viewBox="0 0 11 8"
              className="absolute -bottom-2 -left-[5px]"
              aria-hidden="true"
            >
              <path d="M5.5 8 0 0h11L5.5 8Z" fill="currentColor" />
            </svg>
          </span>
        </div>

        {/* Mobile stand-in for the rail: a hairline progress bar. */}
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-[3px] bg-ink/10 md:hidden"
          aria-hidden="true"
        >
          <div
            className="h-full bg-ink transition-[width] duration-150 ease-out"
            style={{ width: `${Math.max(progress * 100, 3)}%` }}
          />
        </div>

        <div
          ref={scrollerRef}
          onScroll={onScroll}
          tabIndex={0}
          role="region"
          aria-label="The protein expression story — scroll to read"
          className="no-scrollbar h-full snap-y snap-mandatory overflow-y-auto scroll-smooth focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-ink md:pl-[70px]"
        >
          {STORY.map((beat, i) => (
            <div key={i} className="h-full w-full shrink-0 snap-start">
              {beat.kind === "duo" ? (
                <DuoPanel beat={beat} />
              ) : (
                <SoloPanel beat={beat} />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
