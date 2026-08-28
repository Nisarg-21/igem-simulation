"use client";

import { useState } from "react";

/**
 * The Figma file has these four as term-only cards with no body copy. The
 * definitions below are drawn from the story script itself, and stay collapsed
 * by default so the resting state matches the design exactly.
 */
const TERMS = [
  {
    term: "Gene",
    definition:
      "A piece of DNA that carries the instructions for making one specific protein.",
  },
  {
    term: "Protein",
    definition:
      "The molecule the whole process is built to produce — insulin and enzymes are proteins.",
  },
  {
    term: "Plasmid",
    definition:
      "A small, circular piece of DNA. We drop the gene into it so bacteria can read it.",
  },
  {
    term: "E. coli",
    definition:
      "The bacterium doing the work. DH5\u03B1 stores the plasmid; BL21 (DE3) mass-produces the protein.",
  },
];

function Card({ term, definition }: (typeof TERMS)[number]) {
  const [open, setOpen] = useState(false);

  return (
    <button
      type="button"
      onClick={() => setOpen((v) => !v)}
      aria-expanded={open}
      className="sticker sticker-thin group w-full rounded-[15px] px-8 py-[22px] text-left transition-colors hover:bg-story"
    >
      <span className="flex items-center justify-between gap-4">
        <span className="text-[18px] font-bold">{term}</span>
        <svg
          width="14"
          height="9"
          viewBox="0 0 14 9"
          aria-hidden="true"
          className={`shrink-0 transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        >
          <path
            d="M1 1l6 6 6-6"
            stroke="currentColor"
            strokeWidth="1.6"
            fill="none"
          />
        </svg>
      </span>
      <span
        className={`grid transition-[grid-template-rows,opacity] duration-200 ease-out ${
          open ? "mt-3 grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <span className="overflow-hidden">
          <span className="block text-[15px] leading-[21px]">{definition}</span>
        </span>
      </span>
    </button>
  );
}

export default function Glossary() {
  return (
    <section className="mx-auto w-full max-w-[1440px] px-5 pt-24 pb-28 sm:px-8 lg:pt-[120px]">
      <h2 className="text-center text-[28px] font-bold">
        <span aria-hidden="true">🧬</span> Quick Glossary
      </h2>

      <div className="mt-[72px] grid gap-x-[53px] gap-y-[23px] sm:grid-cols-2">
        {TERMS.map((t) => (
          <Card key={t.term} {...t} />
        ))}
      </div>
    </section>
  );
}
