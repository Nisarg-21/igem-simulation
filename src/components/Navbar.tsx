import Image from "next/image";
import Link from "next/link";

// Shared by "/" and "/simulate", so the story anchor is rooted at "/".
const NAV_LINKS = [
  { label: "Explore Story", href: "/#story", external: false },
  { label: "iGEM IIT Bombay", href: "https://igem-iitb.vercel.app/", external: true },
  { label: "Simulation", href: "/simulate", external: false },
];

export default function Navbar() {
  return (
    <header className="mx-auto w-full max-w-[1440px] px-5 pt-6 sm:px-8 lg:px-14">
      <nav
        className="sticker flex flex-col items-center gap-4 rounded-[15px] px-4 py-3 sm:flex-row sm:gap-6 lg:h-32 lg:gap-8 lg:py-0"
        aria-label="Main"
      >
        {/* Logo */}
        <Link href="/" className="shrink-0 lg:pl-4" aria-label="iGEM IIT Bombay home">
          <Image
            src="/assets/igem-logo.webp"
            alt="iGEM IIT Bombay"
            width={400}
            height={400}
            priority
            className="size-16 lg:size-[108px]"
          />
        </Link>

        {/* Section links */}
        <ul className="flex min-w-0 flex-1 flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[17px] sm:justify-end sm:text-[20px] lg:gap-12 lg:pr-6 lg:text-[25px]">
          {NAV_LINKS.map((link) => (
            <li key={link.label}>
              <Link
                href={link.href}
                className="transition-opacity hover:opacity-55"
                {...(link.external
                  ? { target: "_blank", rel: "noopener noreferrer" }
                  : {})}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
