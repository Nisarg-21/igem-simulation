import type { Metadata } from "next";
import Band from "@/components/Band";
import Navbar from "@/components/Navbar";
import Simulation from "@/components/simulation/Simulation";

export const metadata: Metadata = {
  title: "Run the process — iGEM IIT Bombay",
  description:
    "Walk the bench yourself: pick the right host, pop the cell open and rescue the plasmid, one step at a time.",
};

/**
 * Figma "Desktop - 3". The band, the nav and the headline are static; every
 * step of the walkthrough below happens inside <Simulation /> without leaving
 * this route.
 */
export default function SimulatePage() {
  return (
    <main>
      <Band />
      <Navbar />

      <section className="mx-auto w-full max-w-[1440px] px-5 pt-14 sm:px-8 lg:px-14 wide:pt-[82px]">
        {/* 48px base with the two beats set larger, as drawn. */}
        <h1 className="mx-auto max-w-[941px] text-center text-[clamp(1.75rem,3.4vw,3rem)] leading-[1.34] font-bold tracking-[-0.01em] wide:min-h-[185px]">
          Let&rsquo;s <span className="text-[1.33em]">begin</span> the journey
          from bacteria to <span className="text-[1.33em]">protein</span>.
        </h1>
      </section>

      <div className="mt-10 pb-24 wide:mt-[108px] wide:pb-[120px]">
        <Simulation />
      </div>
    </main>
  );
}
