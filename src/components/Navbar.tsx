import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";

// Shared by "/" and "/simulate", so the story anchor is rooted at "/".
// Accents walk the logo's gradient: gear blue, helix teal, helix green.
const NAV_LINKS = [
  { label: "Explore Story", href: "/#story", external: false, accent: "#0b57a4" },
  { label: "iGEM IIT Bombay", href: "https://igem-iitb.vercel.app/", external: true, accent: "#1f8fa6" },
  { label: "Simulation", href: "/simulate", external: false, accent: "#5cb82e" },
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
        <ul className="flex min-w-0 flex-1 flex-wrap items-center justify-center gap-x-4 gap-y-3 pb-1 text-[16px] sm:justify-end sm:text-[18px] lg:gap-7 lg:pr-4 lg:text-[21px]">
          {NAV_LINKS.map((link) => (
            <li key={link.label}>
              <Link
                href={link.href}
                className="nav-pill px-4 py-1.5 font-medium lg:px-6 lg:py-2.5"
                style={{ "--accent": link.accent } as CSSProperties}
                {...(link.external
                  ? { target: "_blank", rel: "noopener noreferrer" }
                  : {})}
              >
                <span className="nav-pill-dot" aria-hidden />
                {link.label}
                {link.external && (
                  <svg
                    aria-hidden
                    viewBox="0 0 12 12"
                    className="-ml-1 size-[0.6em]"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  >
                    <path d="M3 9 9 3M4 3h5v5" />
                  </svg>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
