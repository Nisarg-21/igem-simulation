import Link from "next/link";

/**
 * Seven placeholder links, exactly as they sit in the Figma file. Swap the
 * labels/hrefs here once the section names are decided.
 */
const NAV_LINKS = [
  { label: "text", href: "#" },
  { label: "text", href: "#" },
  { label: "text", href: "#" },
  { label: "text", href: "#" },
  { label: "text", href: "#" },
  { label: "text", href: "#" },
  { label: "text", href: "#" },
];

export default function Navbar() {
  return (
    <header className="mx-auto w-full max-w-[1440px] px-5 pt-6 sm:px-8 lg:px-14">
      <nav
        className="sticker flex flex-col items-stretch gap-4 rounded-[15px] px-4 py-4 sm:flex-row sm:items-center sm:gap-6 lg:h-32 lg:gap-8 lg:py-0"
        aria-label="Main"
      >
        {/* Logo lockup */}
        <Link href="#" className="flex min-w-0 shrink-0 items-center gap-4 lg:pl-4">
          <span className="block size-12 rounded-full bg-band lg:size-20" />
          <span className="leading-none">
            <span className="block text-[28px] font-bold tracking-tight lg:text-[48px]">
              iGEM
            </span>
            <span className="block text-[12px] font-normal lg:text-[21px]">
              IIT BOMBAY
            </span>
          </span>
        </Link>

        {/* Section links */}
        <ul className="hidden min-w-0 flex-1 items-center justify-center gap-7 text-[25px] xl:flex full:gap-[54px]">
          {NAV_LINKS.map((link, i) => (
            <li key={i}>
              <Link
                href={link.href}
                className="transition-opacity hover:opacity-55"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <Link
          href="#build"
          className="sticker grid h-[52px] shrink-0 place-items-center rounded-[28px] px-6 text-[16px] transition-colors hover:bg-band sm:ml-auto lg:ml-0 lg:w-[286px] lg:px-0 lg:text-[20px]"
        >
          direct to the process
        </Link>
      </nav>
    </header>
  );
}
