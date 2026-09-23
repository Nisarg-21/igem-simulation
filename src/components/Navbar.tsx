"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { CSSProperties, MouseEvent } from "react";

// Shared by "/" and "/simulate", so the story anchor is rooted at "/".
// Accents walk the logo's gradient: gear blue, helix teal, helix green.
const NAV_LINKS = [
  {
    label: "Explore Story",
    href: "/#story",
    external: false,
    accent: "#0b57a4",
  },
  {
    label: "iGEM IIT Bombay",
    href: "https://igem-iitb.vercel.app/",
    external: true,
    accent: "#1f8fa6",
  },
  {
    label: "Simulation",
    href: "/simulate",
    external: false,
    accent: "#5cb82e",
  },
];

export default function Navbar() {
  const pathname = usePathname();

  // Next's <Link> ignores a click whose hash already matches the URL, so once
  // "#story" is set, scrolling back up and clicking again did nothing. On the
  // home page, scroll to the story frame ourselves every time.
  const toStory = (e: MouseEvent<HTMLAnchorElement>) => {
    if (pathname !== "/") return;
    const story = document.getElementById("story");
    if (!story) return;
    e.preventDefault();
    story.scrollIntoView({ block: "center" });
    history.replaceState(null, "", "/#story");
  };

  return (
    <header className="mx-auto w-full max-w-[1440px] px-5 pt-6 sm:px-8 lg:px-14">
      <nav
        className="sticker flex flex-col items-center gap-4 rounded-[15px] px-4 py-3 sm:flex-row sm:gap-6 lg:h-32 lg:gap-8 lg:py-0"
        aria-label="Main"
      >
        {/* Logo */}
        <Link
          href="/"
          className="shrink-0 lg:pl-4"
          aria-label="iGEM IIT Bombay home"
        >
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
                className="nav-pill font-medium"
                style={{ "--accent": link.accent } as CSSProperties}
                onClick={link.href === "/#story" ? toStory : undefined}
                {...(link.external
                  ? { target: "_blank", rel: "noopener noreferrer" }
                  : {})}
              >
                <span className="nav-pill-face px-4 py-1.5 lg:px-6 lg:py-2.5">
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
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
