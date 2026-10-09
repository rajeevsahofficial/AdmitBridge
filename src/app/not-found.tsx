import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";

const quickLinks = [
  { number: "01", label: "Home",         href: "/"            },
  { number: "02", label: "About",        href: "/about"       },
  { number: "03", label: "Services",     href: "/services"    },
  { number: "04", label: "Technologies", href: "/services/technologies" },
  { number: "05", label: "Growth",       href: "/services/growth"      },
  { number: "06", label: "Education",    href: "/services/education"   },
  { number: "07", label: "Contact",      href: "/contact"     },
];

export default function NotFound() {
  return (
    <main className="bg-[#F4F1EA] text-[#111511]">
      <div className="mx-auto max-w-[1440px] px-5 md:px-10">

        <section className="flex min-h-[calc(100svh-40vh)] md:min-h-screen flex-col justify-between pt-32">
          {/* Centre — big 404 + message */}
          <div className="grid gap-12 lg:grid-cols-[1fr_390px] lg:items-end xl:grid-cols-[1fr_420px]">
            <div>
              {/* Large 404 numeral */}
              <p
                className="font-medium leading-none tracking-[-0.07em] text-[#D8D4CB] select-none"
                style={{ fontSize: "clamp(8rem, 22vw, 22rem)" }}
                aria-hidden="true"
              >
                404
              </p>
            </div>

            {/* Right — explanation + CTA */}
            <div className="flex flex-col items-start lg:items-end gap-8 lg:pb-3">
              <div className="border-l-2 border-[#C56A32] pl-5 lg:border-l-0 lg:border-r-2 lg:pr-5 lg:pl-0 lg:text-right">
                <p
                  className="text-[#686761] leading-relaxed"
                  style={{ fontSize: "clamp(0.9375rem, 1.1vw, 1.0625rem)" }}
                >
                  The page you&apos;re looking for may have been moved, renamed
                  or never existed. Try one of the links below or head back
                  to the home page.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link
                  href="/"
                  className="group inline-flex items-center gap-6 border border-[#111511] bg-[#111511] px-6 py-4 text-sm font-medium text-white transition-colors duration-300 hover:border-[#C56A32] hover:bg-[#C56A32]"
                >
                  <span>Go home</span>
                  <span className="flex h-7 w-7 items-center justify-center border border-white/20">
                    <ArrowRight size={14} strokeWidth={1.5} className="transition-transform duration-300 group-hover:translate-x-1" />
                  </span>
                </Link>

                <Link
                  href="/contact"
                  className="group inline-flex items-center gap-6 border border-[#D8D4CB] px-6 py-4 text-sm font-medium text-[#111511] transition-colors duration-300 hover:border-[#111511]"
                >
                  <span>Contact us</span>
                  <span className="flex h-7 w-7 items-center justify-center border border-[#D8D4CB]">
                    <ArrowUpRight size={14} strokeWidth={1.5} className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </span>
                </Link>
              </div>
            </div>
          </div>

          {/* Bottom — quick links */}
          <div className="border-t border-[#D8D4CB] py-8">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
              <span className="type-label text-[#85847D] shrink-0">Quick links</span>

              <div className="flex flex-wrap gap-x-8 gap-y-3">
                {quickLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="group flex items-center gap-2 type-label text-[#85847D] transition-colors duration-200 hover:text-[#C56A32]"
                  >
                    <span className="font-mono text-[#D8D4CB]">{link.number}</span>
                    {link.label}
                    <ArrowUpRight
                      size={11}
                      strokeWidth={1.6}
                      className="opacity-0 transition-all duration-200 group-hover:opacity-100 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                    />
                  </Link>
                ))}
              </div>
            </div>
          </div>

        </section>
      </div>
    </main>
  );
}
