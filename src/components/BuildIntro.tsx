import MeetYourGuide from "./MeetYourGuide";

export default function BuildIntro() {
  return (
    <section
      id="build"
      className="mx-auto w-full max-w-[1440px] px-5 pt-16 text-center sm:px-8 lg:pt-[92px]"
    >
      <h2 className="mx-auto max-w-[924px] font-extrabold leading-[1.2] text-[clamp(1.75rem,4.4vw,3.48rem)]">
        HOW DO WE BUILD PROTEINS&nbsp;?
      </h2>

      <p className="mx-auto mt-8 max-w-[1290px] leading-[1.2] text-[clamp(1.05rem,2.3vw,1.82rem)] lg:mt-[66px]">
        Making proteins in a lab isn&rsquo;t magic&mdash;it&rsquo;s smart
        science! Using plasmids and E. coli, scientists turn bacteria into tiny
        factories to produce useful proteins like insulin and enzymes.
      </p>

      <div className="mt-16 lg:mt-[124px]">
        <MeetYourGuide />
      </div>

      <p className="mx-auto mt-12 max-w-[1121px] leading-[1.22] text-[clamp(1rem,1.9vw,1.54rem)] lg:mt-[71px]">
        Imagine you want to make a specific toy car. You need the blueprints for
        that car, the factory to build it, and workers to assemble it. In
        protein expression, here&rsquo;s how we do it:
      </p>

      <a
        href="#story"
        className="sticker mt-10 inline-flex h-[52px] w-[367px] max-w-full items-center justify-center gap-2 rounded-[28px] text-[clamp(1rem,1.9vw,1.54rem)] transition-colors hover:bg-band lg:mt-[58px]"
      >
        Scroll to know the story
        <svg
          width="14"
          height="18"
          viewBox="0 0 14 18"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M7 0v16M1 10l6 6 6-6"
            stroke="currentColor"
            strokeWidth="1.5"
          />
        </svg>
      </a>
    </section>
  );
}
