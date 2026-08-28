import Link from "next/link";

export default function Hero() {
  return (
    <section className="mx-auto w-full max-w-[1440px] px-5 pt-16 pb-24 text-center sm:px-8 lg:pt-[103px] lg:pb-[116px]">
      <h1 className="mx-auto max-w-[1092px]">
        <span className="block font-body font-bold leading-[1.05] tracking-[-0.03em] text-[clamp(2.75rem,11.53vw,10.38rem)]">
          turn bacteria
        </span>
        <span className="block font-display font-bold leading-[1.24] text-[clamp(2rem,8.41vw,7.57rem)]">
          into tiny protein
          <br />
          factories
        </span>
      </h1>

      <Link
        href="https://igem.org"
        target="_blank"
        rel="noreferrer"
        className="sticker mt-12 inline-grid h-[52px] w-[286px] max-w-full place-items-center rounded-[28px] text-[20px] transition-colors hover:bg-band lg:mt-[72px]"
      >
        direct to iGEM IITB
      </Link>
    </section>
  );
}
