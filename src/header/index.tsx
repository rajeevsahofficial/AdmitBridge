"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
} from "framer-motion";
import {
  ArrowUpRight,
  ChevronDown,
  Menu,
  Plus,
  X,
} from "lucide-react";
import ProjectModal from "@/components/common/ProjectModal";

/* =========================================================
   CONFIG
========================================================= */

const EASE = [0.21, 0.47, 0.32, 0.98] as const;
const CLOSE_DELAY = 120;

const FOCUS =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C56A32]";

const FOCUS_INSET =
  "focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-[#C56A32]";

const FOCUSABLE =
  'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

/* =========================================================
   SERVICE DATA
========================================================= */

const SERVICE_GROUPS = [
  {
    number: "01",
    title: "Technologies",
    description: "Digital products built for scale.",
    href: "/services/technologies",
    items: [
      { label: "Web Development",  href: "/services/technologies/web-development" },
      { label: "Custom Software",  href: "/services/technologies/custom-software" },
      { label: "Web Applications", href: "/services/technologies/web-applications" },
      { label: "UI/UX Design",     href: "/services/technologies/ui-ux-design" },
    ],
  },
  {
    number: "02",
    title: "Growth",
    description: "Turn visibility into measurable growth.",
    href: "/services/growth",
    items: [
      { label: "SEO",                  href: "/services/growth/seo" },
      { label: "Google Ads",           href: "/services/growth/google-ads" },
      { label: "Meta Ads",             href: "/services/growth/meta-ads" },
      { label: "Analytics & Tracking", href: "/services/growth/analytics-tracking" },
    ],
  },
  {
    number: "03",
    title: "Education",
    description: "Technology for modern institutions.",
    href: "/services/education",
    items: [
      { label: "Admission Platforms",  href: "/services/education/admission-platforms" },
      { label: "Lead Management",      href: "/services/education/lead-management" },
      { label: "College CRM",          href: "/services/education/college-crm" },
      { label: "Education Technology", href: "/services/education/education-technology" },
    ],
  },
];

const PRIMARY_LINKS = [
  {
    label: "Home",
    href: "/",
  },
  {
    label: "About",
    href: "/about",
  },
  {
    label: "Work",
    href: "/work",
  },
  {
    label: "Contact",
    href: "/contact",
  },
];

/* =========================================================
   HELPERS
========================================================= */

function isActive(pathname: string, href: string) {
  return href === "/"
    ? pathname === "/"
    : pathname === href || pathname.startsWith(`${href}/`);
}

/* =========================================================
   NAVBAR
========================================================= */

export default function Navbar() {
  const pathname = usePathname() ?? "";
  const reduce = !!useReducedMotion();
  const megaId = useId();
  const mobileMenuId = useId();

  const [megaOpen, setMegaOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileServicesOpen, setMobileServicesOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const headerRef = useRef<HTMLElement>(null);
  const megaWrapRef = useRef<HTMLDivElement>(null);
  const megaButtonRef = useRef<HTMLButtonElement>(null);
  const hamburgerRef = useRef<HTMLButtonElement>(null);
  const mobileCloseRef = useRef<HTMLButtonElement>(null);

  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const focusMegaFirst = useRef(false);

  /* =========================================================
     MEGA MENU
  ========================================================== */

  const openMega = useCallback(() => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
    }

    setMegaOpen(true);
  }, []);

  const closeMega = useCallback(() => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
    }

    setMegaOpen(false);
  }, []);

  const closeMegaSoon = useCallback(() => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
    }

    closeTimer.current = setTimeout(() => {
      setMegaOpen(false);
    }, CLOSE_DELAY);
  }, []);

  /* =========================================================
     MOBILE
  ========================================================== */

  const closeMobile = useCallback(() => {
    setMobileOpen(false);
    setMobileServicesOpen(false);
  }, []);

  const toggleMobileServices = useCallback(() => {
    setMobileServicesOpen((value) => !value);
  }, []);

  /* =========================================================
     SCROLL
  ========================================================== */

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 8);
    };

    handleScroll();

    window.addEventListener("scroll", handleScroll, {
      passive: true,
    });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  /* =========================================================
     CLOSE ON ROUTE CHANGE
  ========================================================== */

  useEffect(() => {
    setMegaOpen(false);
    setMobileOpen(false);
    setMobileServicesOpen(false);
  }, [pathname]);

  /* =========================================================
     DESKTOP BREAKPOINT
  ========================================================== */

  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 1024px)");

    const handleChange = (event: MediaQueryListEvent) => {
      if (event.matches) {
        setMobileOpen(false);
        setMobileServicesOpen(false);
      }
    };

    mediaQuery.addEventListener("change", handleChange);

    return () => {
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, []);

  /* =========================================================
     MEGA MENU KEYBOARD + OUTSIDE CLICK
  ========================================================== */

  useEffect(() => {
    if (!megaOpen) return;

    if (focusMegaFirst.current) {
      focusMegaFirst.current = false;

      requestAnimationFrame(() => {
        megaWrapRef.current
          ?.querySelector<HTMLElement>("[data-mega-panel] a")
          ?.focus();
      });
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;

      const inside =
        megaWrapRef.current?.contains(
          document.activeElement
        );

      setMegaOpen(false);

      if (inside) {
        megaButtonRef.current?.focus();
      }
    };

    const handlePointerDown = (event: PointerEvent) => {
      if (
        !megaWrapRef.current?.contains(
          event.target as Node
        )
      ) {
        setMegaOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener(
      "pointerdown",
      handlePointerDown
    );

    return () => {
      document.removeEventListener(
        "keydown",
        handleKeyDown
      );

      document.removeEventListener(
        "pointerdown",
        handlePointerDown
      );
    };
  }, [megaOpen]);

  /* =========================================================
     MOBILE FOCUS TRAP
  ========================================================== */

  useEffect(() => {
    if (!mobileOpen) return;

    const previousOverflow = document.body.style.overflow;
    const returnFocus = hamburgerRef.current;

    document.body.style.overflow = "hidden";

    requestAnimationFrame(() => {
      mobileCloseRef.current?.focus();
    });

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeMobile();
        return;
      }

      if (
        event.key !== "Tab" ||
        !headerRef.current
      ) {
        return;
      }

      const mobilePanel =
        document.getElementById(mobileMenuId);

      if (!mobilePanel) return;

      const elements = Array.from(
        mobilePanel.querySelectorAll<HTMLElement>(
          FOCUSABLE
        )
      );

      if (!elements.length) return;

      const first = elements[0];
      const last = elements[elements.length - 1];

      if (
        event.shiftKey &&
        document.activeElement === first
      ) {
        event.preventDefault();
        last.focus();
      }

      if (
        !event.shiftKey &&
        document.activeElement === last
      ) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      document.removeEventListener(
        "keydown",
        handleKeyDown
      );

      document.body.style.overflow =
        previousOverflow;

      requestAnimationFrame(() => {
        returnFocus?.focus();
      });
    };
  }, [
    mobileOpen,
    mobileMenuId,
    closeMobile,
  ]);

  /* =========================================================
     CLEANUP
  ========================================================== */

  useEffect(() => {
    return () => {
      if (closeTimer.current) {
        clearTimeout(closeTimer.current);
      }
    };
  }, []);

  /* =========================================================
     ACTIVE STATES
  ========================================================== */

  const servicesActive = SERVICE_GROUPS.some(
    (group) => isActive(pathname, group.href)
  );

  /* =========================================================
     RENDER
  ========================================================== */

  return (
    <>
      {/* =====================================================
          SKIP LINK
      ====================================================== */}

      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:bg-[#111511] focus:px-4 focus:py-2 focus:text-sm focus:text-white"
      >
        Skip to content
      </a>

      {/* =====================================================
          HEADER
      ====================================================== */}

      <header
        ref={headerRef}
        className={`fixed inset-x-0 top-0 z-50 border-b border-[#D8D4CB] bg-[#F4F1EA] transition-shadow duration-300 ${
          scrolled
            ? "shadow-[0_1px_0_rgba(17,21,17,0.04),0_8px_24px_-12px_rgba(17,21,17,0.12)]"
            : ""
        }`}
      >
        <div className="mx-auto max-w-[1440px] px-5 md:px-10">
          <div className="flex h-16 items-center gap-8">
            {/* =================================================
                LOGO
            ================================================== */}

            <Link
              href="/"
              aria-label="AdmitBridge, home"
              className={`group flex shrink-0 items-center gap-3 ${FOCUS}`}
            >
              <span
                aria-hidden="true"
                className="flex h-9 w-9 shrink-0 items-center justify-center bg-[#111511] text-[14px] font-semibold leading-none tracking-[-0.05em] text-white transition-colors duration-200 group-hover:bg-[#C56A32] group-hover:text-[#111511]"
              >
                AB
              </span>

              <span>
                <span className="block text-[1rem] font-medium leading-none tracking-[-0.03em] text-[#111511]">
                  AdmitBridge
                </span>

                <span className="mt-1.5 block text-[10px] uppercase leading-none tracking-[0.12em] text-[#686761]">
                  Technology &amp; Digital Solutions
                </span>
              </span>
            </Link>

            {/* =================================================
                DESKTOP NAVIGATION
            ================================================== */}

            <nav
              aria-label="Main navigation"
              className="hidden flex-1 items-center justify-center lg:flex"
            >
              {/* HOME */}

              {PRIMARY_LINKS.slice(0, 2).map(
                (link) => {
                  const active = isActive(
                    pathname,
                    link.href
                  );

                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      aria-current={
                        active ? "page" : undefined
                      }
                      className={`group relative flex h-16 items-center px-4 text-sm font-medium transition-colors duration-150 ${FOCUS_INSET} ${
                        active
                          ? "text-[#111511]"
                          : "text-[#686761] hover:text-[#111111]"
                      }`}
                    >
                      {link.label}

                      <span
                        aria-hidden="true"
                        className={`absolute inset-x-4 -bottom-px h-0.5 origin-left transition-transform duration-300 ${
                          active
                            ? "scale-x-100 bg-[#C56A32]"
                            : "scale-x-0 bg-[#111511] group-hover:scale-x-100"
                        }`}
                      />
                    </Link>
                  );
                }
              )}

              {/* =================================================
                  SERVICES
              ================================================== */}

              <div
                ref={megaWrapRef}
                className="flex h-16 items-center"
                onPointerEnter={(event) => {
                  if (event.pointerType === "mouse") {
                    openMega();
                  }
                }}
                onPointerLeave={(event) => {
                  if (event.pointerType === "mouse") {
                    closeMegaSoon();
                  }
                }}
                onBlur={(event) => {
                  if (
                    !event.currentTarget.contains(
                      event.relatedTarget as Node | null
                    )
                  ) {
                    closeMega();
                  }
                }}
              >
                <button
                  ref={megaButtonRef}
                  type="button"
                  aria-expanded={megaOpen}
                  aria-controls={megaId}
                  onClick={(event) => {
                    if (megaOpen) {
                      closeMega();
                    } else {
                      focusMegaFirst.current =
                        event.detail === 0;

                      openMega();
                    }
                  }}
                  onKeyDown={(event) => {
                    if (event.key === "ArrowDown") {
                      event.preventDefault();

                      focusMegaFirst.current = true;

                      openMega();
                    }
                  }}
                  className={`group relative flex h-16 items-center gap-2 px-4 text-sm font-medium transition-colors duration-150 ${FOCUS_INSET} ${
                    megaOpen || servicesActive
                      ? "text-[#111511]"
                      : "text-[#686761] hover:text-[#111111]"
                  }`}
                >
                  Services

                  <ChevronDown
                    size={14}
                    strokeWidth={1.5}
                    aria-hidden="true"
                    className={`transition-transform duration-200 ${
                      megaOpen ? "rotate-180" : ""
                    }`}
                  />

                  <span
                    aria-hidden="true"
                    className={`absolute inset-x-4 -bottom-px h-0.5 origin-left transition-transform duration-300 ${
                      megaOpen || servicesActive
                        ? "scale-x-100 bg-[#C56A32]"
                        : "scale-x-0 bg-[#111511] group-hover:scale-x-100"
                    }`}
                  />
                </button>

                {/* =================================================
                    DESKTOP MEGA MENU
                ================================================== */}

                <AnimatePresence>
                  {megaOpen && (
                    <motion.div
                      id={megaId}
                      data-mega-panel
                      initial={
                        reduce
                          ? false
                          : {
                              opacity: 0,
                              y: -8,
                            }
                      }
                      animate={{
                        opacity: 1,
                        y: 0,
                      }}
                      exit={
                        reduce
                          ? {
                              opacity: 0,
                            }
                          : {
                              opacity: 0,
                              y: -8,
                            }
                      }
                      transition={{
                        duration: reduce ? 0 : 0.22,
                        ease: EASE,
                      }}
                      className="absolute left-0 right-0 top-full border-b border-[#D8D4CB] bg-[#F4F1EA]"
                    >
                      <div className="mx-auto max-w-[1440px] px-5 py-12 md:px-10">
                        <div className="grid grid-cols-[minmax(0,0.9fr)_repeat(3,minmax(0,1fr))] divide-x divide-[#D8D4CB]">
                          {/* Intro */}

                          <div className="pr-10">
                            <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-[#686761]">
                              Services
                            </p>

                            <p className="mt-5 max-w-60 text-[1.625rem] font-medium leading-[1.08] tracking-[-0.04em] text-[#111511]">
                              One partner across
                              technology, growth
                              and education.
                            </p>

                            <button
                              type="button"
                              onClick={() => { closeMega(); setModalOpen(true); }}
                              className={`mt-8 inline-flex items-center gap-2 border-b border-[#111511] pb-1 text-sm font-medium text-[#111511] transition-colors hover:border-[#C56A32] hover:text-[#A4511F] ${FOCUS}`}
                            >
                              Start a project
                              <ArrowUpRight
                                size={14}
                                aria-hidden="true"
                              />
                            </button>
                          </div>

                          {/* Service columns */}

                          {SERVICE_GROUPS.map(
                            (group) => (
                              <div
                                key={group.title}
                                className="px-8 last:pr-0"
                              >
                                <Link
                                  href={group.href}
                                  onClick={closeMega}
                                  className={`group block ${FOCUS}`}
                                >
                                  <span className="block text-[11px] font-medium uppercase tracking-[0.14em] text-[#A4511F]">
                                    {group.number}
                                  </span>

                                  <span className="mt-3 flex items-center justify-between text-[1.125rem] font-medium tracking-tight text-[#111511]">
                                    {group.title}

                                    <ArrowUpRight
                                      size={16}
                                      aria-hidden="true"
                                      className="text-[#9A978E] transition-all duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[#A4511F]"
                                    />
                                  </span>

                                  <span className="mt-1.5 block text-[0.8125rem] leading-normal text-[#686761]">
                                    {
                                      group.description
                                    }
                                  </span>
                                </Link>

                                <ul className="mt-7">
                                  {group.items.map(
                                    (item) => (
                                      <li
                                        key={
                                          item.label
                                        }
                                        className="border-t border-[#E3DFD5]"
                                      >
                                        <Link
                                          href={
                                            item.href
                                          }
                                          onClick={
                                            closeMega
                                          }
                                          className={`group flex items-center justify-between py-3 text-sm transition-all duration-200 hover:pl-1 hover:text-[#111111] ${FOCUS} ${
                                            pathname ===
                                            item.href
                                              ? "text-[#111511]"
                                              : "text-[#686761]"
                                          }`}
                                        >
                                          {
                                            item.label
                                          }

                                          <ArrowUpRight
                                            size={13}
                                            aria-hidden="true"
                                            className="-translate-x-1 text-[#A4511F] opacity-0 transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100"
                                          />
                                        </Link>
                                      </li>
                                    )
                                  )}
                                </ul>
                              </div>
                            )
                          )}
                        </div>
                      </div>

                      <div
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-x-0 top-full h-screen bg-[#111511]/25"
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* WORK + CONTACT */}

              {PRIMARY_LINKS.slice(2).map(
                (link) => {
                  const active = isActive(
                    pathname,
                    link.href
                  );

                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      aria-current={
                        active ? "page" : undefined
                      }
                      className={`group relative flex h-16 items-center px-4 text-sm font-medium transition-colors duration-150 ${FOCUS_INSET} ${
                        active
                          ? "text-[#111511]"
                          : "text-[#686761] hover:text-[#111111]"
                      }`}
                    >
                      {link.label}

                      <span
                        aria-hidden="true"
                        className={`absolute inset-x-4 -bottom-px h-[2px] origin-left transition-transform duration-300 ${
                          active
                            ? "scale-x-100 bg-[#C56A32]"
                            : "scale-x-0 bg-[#111511] group-hover:scale-x-100"
                        }`}
                      />
                    </Link>
                  );
                }
              )}
            </nav>

            {/* =================================================
                DESKTOP CTA
            ================================================== */}

            <div className="ml-auto hidden items-center lg:flex">
              <button
                type="button"
                onClick={() => setModalOpen(true)}
                className={`group inline-flex h-10 items-center gap-2 bg-[#111511] px-5 text-[0.8125rem] font-medium text-white transition-colors duration-200 hover:bg-[#C56A32] hover:text-[#111511] ${FOCUS}`}
              >
                Start a project

                <ArrowUpRight
                  size={14}
                  strokeWidth={1.8}
                  aria-hidden="true"
                  className="transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                />
              </button>
            </div>

            {/* =================================================
                MOBILE MENU BUTTON
            ================================================== */}

            <button
              ref={hamburgerRef}
              type="button"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
              aria-haspopup="dialog"
              aria-expanded={mobileOpen}
              aria-controls={mobileMenuId}
              className={`ml-auto flex h-10 w-10 items-center justify-center text-[#111511] transition-colors hover:text-[#A4511F] lg:hidden ${FOCUS}`}
            >
              <Menu
                size={23}
                strokeWidth={1.5}
                aria-hidden="true"
              />
            </button>
          </div>
        </div>
      </header>

      {/* =========================================================
          MOBILE NAVIGATION
      ========================================================== */}

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            id={mobileMenuId}
            role="dialog"
            aria-modal="true"
            aria-label="Mobile navigation"
            initial={
              reduce
                ? false
                : {
                    x: "100%",
                  }
            }
            animate={{
              x: 0,
            }}
            exit={
              reduce
                ? {
                    opacity: 0,
                  }
                : {
                    x: "100%",
                  }
            }
            transition={{
              duration: reduce ? 0 : 0.42,
              ease: EASE,
            }}
            className="fixed inset-0 z-100 flex flex-col bg-[#111511] text-white lg:hidden"
          >
            {/* =================================================
                MOBILE HEADER
            ================================================== */}

            <div className="flex h-16 shrink-0 items-center justify-between border-b border-white/10 px-5 md:px-10">
              <Link
                href="/"
                onClick={closeMobile}
                aria-label="AdmitBridge, home"
                className={`group flex items-center gap-3 ${FOCUS}`}
              >
                <span className="flex h-9 w-9 items-center justify-center bg-white text-[14px] font-semibold tracking-tighter text-[#111511] transition-colors group-hover:bg-[#C56A32]">
                  AB
                </span>

                <span className="hidden sm:block">
                  <span className="block text-[1rem] font-medium leading-none text-white">
                    AdmitBridge
                  </span>

                  <span className="mt-1.5 block text-[10px] uppercase tracking-[0.12em] text-white/45">
                    Technology &amp; Digital Solutions
                  </span>
                </span>
              </Link>

              <button
                ref={mobileCloseRef}
                type="button"
                onClick={closeMobile}
                aria-label="Close menu"
                className={`flex h-10 w-10 items-center justify-center text-white/75 transition-colors hover:text-white ${FOCUS}`}
              >
                <X
                  size={23}
                  strokeWidth={1.5}
                  aria-hidden="true"
                />
              </button>
            </div>

            {/* =================================================
                MOBILE CONTENT
            ================================================== */}

            <nav
              aria-label="Mobile navigation"
              className="flex-1 overflow-y-auto overscroll-contain px-5 md:px-10"
            >
              <ul>
                {PRIMARY_LINKS.slice(0, 2).map(
                  (link) => {
                    const active = isActive(
                      pathname,
                      link.href
                    );

                    return (
                      <li
                        key={link.href}
                        className="border-b border-white/10"
                      >
                        <Link
                          href={link.href}
                          onClick={closeMobile}
                          aria-current={
                            active
                              ? "page"
                              : undefined
                          }
                          className={`group flex items-center justify-between py-5 text-[clamp(2rem,9vw,3.2rem)] font-medium leading-none tracking-[-0.055em] transition-colors ${FOCUS} ${
                            active
                              ? "text-white"
                              : "text-white/50 hover:text-white"
                          }`}
                        >
                          <span>
                            {link.label}
                          </span>

                          <ArrowUpRight
                            size={20}
                            strokeWidth={1.5}
                            aria-hidden="true"
                            className={`transition-all duration-200 ${
                              active
                                ? "text-[#C56A32]"
                                : "text-white/20 group-hover:text-[#C56A32]"
                            }`}
                          />
                        </Link>
                      </li>
                    );
                  }
                )}

                {/* =================================================
                    SERVICE
                ================================================== */}

                <li className="border-b border-white/10">
                  <button
                    type="button"
                    onClick={
                      toggleMobileServices
                    }
                    aria-expanded={
                      mobileServicesOpen
                    }
                    aria-controls={`${mobileMenuId}-services`}
                    className={`group flex w-full items-center justify-between py-5 text-left text-[clamp(2rem,9vw,3.2rem)] font-medium leading-none tracking-[-0.055em] text-white/50 transition-colors hover:text-white ${FOCUS}`}
                  >
                    <span>Service</span>

                    <ChevronDown
                      size={24}
                      strokeWidth={1.4}
                      aria-hidden="true"
                      className={`text-white/35 transition-transform duration-300 ${
                        mobileServicesOpen
                          ? "rotate-180 text-[#C56A32]"
                          : ""
                      }`}
                    />
                  </button>

                  <AnimatePresence initial={false}>
                    {mobileServicesOpen && (
                      <motion.div
                        id={`${mobileMenuId}-services`}
                        initial={
                          reduce
                            ? false
                            : {
                                height: 0,
                                opacity: 0,
                              }
                        }
                        animate={{
                          height: "auto",
                          opacity: 1,
                        }}
                        exit={
                          reduce
                            ? {
                                opacity: 0,
                              }
                            : {
                                height: 0,
                                opacity: 0,
                              }
                        }
                        transition={{
                          duration: reduce ? 0 : 0.3,
                          ease: EASE,
                        }}
                        className="overflow-hidden"
                      >
                        <div className="pb-5">
                          {SERVICE_GROUPS.map(
                            (group) => (
                              <div
                                key={group.number}
                                className="border-t border-white/[0.07] py-4"
                              >
                                <Link
                                  href={
                                    group.href
                                  }
                                  onClick={
                                    closeMobile
                                  }
                                  className={`group flex items-center justify-between py-2 ${FOCUS}`}
                                >
                                  <span className="flex items-center gap-4">
                                    <span className="font-mono text-[10px] tracking-[0.14em] text-[#C56A32]">
                                      {
                                        group.number
                                      }
                                    </span>

                                    <span className="text-base font-medium text-white">
                                      {
                                        group.title
                                      }
                                    </span>
                                  </span>

                                  <ArrowUpRight
                                    size={16}
                                    strokeWidth={1.5}
                                    className="text-white/30 transition-colors group-hover:text-[#C56A32]"
                                  />
                                </Link>

                                <div className="ml-8 mt-2 space-y-1">
                                  {group.items.map(
                                    (item) => (
                                      <Link
                                        key={
                                          item.label
                                        }
                                        href={
                                          item.href
                                        }
                                        onClick={
                                          closeMobile
                                        }
                                        className={`block py-2 text-sm transition-colors ${FOCUS} ${
                                          pathname ===
                                          item.href
                                            ? "text-white"
                                            : "text-white/45 hover:text-white"
                                        }`}
                                      >
                                        {
                                          item.label
                                        }
                                      </Link>
                                    )
                                  )}
                                </div>
                              </div>
                            )
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </li>

                {/* =================================================
                    WORK + CONTACT
                ================================================== */}

                {PRIMARY_LINKS.slice(2).map(
                  (link) => {
                    const active = isActive(
                      pathname,
                      link.href
                    );

                    return (
                      <li
                        key={link.href}
                        className="border-b border-white/10"
                      >
                        <Link
                          href={link.href}
                          onClick={closeMobile}
                          aria-current={
                            active
                              ? "page"
                              : undefined
                          }
                          className={`group flex items-center justify-between py-5 text-[clamp(2rem,9vw,3.2rem)] font-medium leading-none tracking-[-0.055em] transition-colors ${FOCUS} ${
                            active
                              ? "text-white"
                              : "text-white/50 hover:text-white"
                          }`}
                        >
                          <span>
                            {link.label}
                          </span>

                          <ArrowUpRight
                            size={20}
                            strokeWidth={1.5}
                            aria-hidden="true"
                            className={`transition-all duration-200 ${
                              active
                                ? "text-[#C56A32]"
                                : "text-white/20 group-hover:text-[#C56A32]"
                            }`}
                          />
                        </Link>
                      </li>
                    );
                  }
                )}
              </ul>
            </nav>

            {/* =================================================
                MOBILE CTA
            ================================================== */}

            <div className="shrink-0 border-t border-white/10 bg-[#111511] px-5 pb-6 pt-5 md:px-10">
              <button
                type="button"
                onClick={() => { closeMobile(); setModalOpen(true); }}
                className={`group flex h-14 w-full items-center justify-between bg-[#C56A32] px-6 text-[0.95rem] font-medium text-[#111511] transition-colors hover:bg-white ${FOCUS}`}
              >
                <span>Start a project</span>

                <ArrowUpRight
                  size={18}
                  strokeWidth={1.7}
                  aria-hidden="true"
                  className="transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <ProjectModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}