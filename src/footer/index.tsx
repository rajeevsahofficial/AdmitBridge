"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { contactInfo } from "@/data/contact";
import { useState } from "react";
import ProjectModal from "@/components/common/ProjectModal";

const companyLinks = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Work", href: "/work" },
  { label: "Contact", href: "/contact" },
];

const serviceLinks = [
  { label: "Services", href: "/services" },
  { label: "Technologies", href: "/services/technologies" },
  { label: "Growth", href: "/services/growth" },
  { label: "Education", href: "/services/education" },
];

function FooterColumn({
  number,
  title,
  links,
}: {
  number: string;
  title: string;
  links: { label: string; href: string }[];
}) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <span className="type-label text-[#C56A32]">{number}</span>
        <h3 className="type-label font-medium text-[#F4F1EA]" style={{ letterSpacing: "0.27em" }}>
          {title}
        </h3>
      </div>
      <div className="my-7 h-px w-full bg-[#505256]" />

      <div className="space-y-0">
        {links.map((link) => (
          <Link
            key={link.label}
            href={link.href}
            className="group flex min-h-10 items-center justify-between type-body font-normal text-[#E4E3DF] transition-colors duration-300 hover:text-white"
          >
            <span>{link.label}</span>
            <ArrowUpRight
              size={20}
              strokeWidth={1.4}
              className="text-[#E99A5F] transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1"
            />
          </Link>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   Footer
───────────────────────────────────────────────────────────── */

export default function Footer() {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <footer className="relative overflow-hidden bg-[#0D0E0F] text-[#F4F1EA]">
        <div className="relative mx-auto max-w-[1440px] px-5 py-5 md:py-10 md:px-10">

          {/* =========================================================
            MAIN GRID
        ========================================================== */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.7 }}
            className="grid grid-cols-1 gap-5 md:gap-10 lg:grid-cols-4 lg:gap-15"
          >
            {/* =====================================================
              BRAND
          ====================================================== */}
            <div>
              <div>
                <div className="type-h3 font-semibold tracking-[-0.035em] text-[#F4F1EA]">
                  AdmitBridge
                </div>
                <div className="mt-2 type-label text-[#A8A8A5]">
                  Technology &amp; Digital Solutions
                </div>
              </div>

              <p className="mt-5 type-body-lg font-normal leading-[1.45] tracking-[-0.02em] text-[#E2E1DD]">
                We build digital products, grow brands, and simplify education technology.
              </p>

              <div className="mt-5">
                <div className="type-label text-[#A8A8A5]">Digital Partner</div>
                <div className="mt-4 flex flex-wrap items-center gap-2 type-body text-[#E2E1DD]">
                  <span>Technology</span>
                  <span className="text-[#C56A32]">·</span>
                  <span>Growth</span>
                  <span className="text-[#C56A32]">·</span>
                  <span>Education</span>
                </div>
              </div>
            </div>

            {/* =====================================================
              COMPANY
          ====================================================== */}
            <FooterColumn number="01" title="Company" links={companyLinks} />

            {/* =====================================================
              SERVICES
          ====================================================== */}
            <FooterColumn number="02" title="Services" links={serviceLinks} />

            {/* =====================================================
              CONTACT DETAILS  — data from @/data/contact
          ====================================================== */}
            <div>
              <div className="flex items-center justify-between">
                <span className="type-label text-[#C56A32]">03</span>
                <h3 className="type-label font-medium text-[#F4F1EA]" style={{ letterSpacing: "0.27em" }}>
                  Contact
                </h3>
              </div>
              <div className="my-7 h-px w-full bg-[#505256]" />

              {/* Rows — rendered as <Link> when href is present, <div> otherwise */}
              <div className="space-y-0">
                {contactInfo.map(({ icon: Icon, label, value, href }) => {
                  const rowClass =
                    "group flex items-center gap-4 border-b border-[#505256] py-2.5 last:border-b-0 transition-colors duration-300";
                  const inner = (
                    <>
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center border border-[#505256] transition-colors duration-300 group-hover:border-[#C56A32] group-hover:bg-[#C56A32]">
                        <Icon
                          size={14}
                          strokeWidth={1.4}
                          className="text-[#AEB0B3] transition-colors duration-300 group-hover:text-white"
                        />
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="type-label text-[#65676A]">{label}</p>
                        <p className="mt-0.5 type-body font-normal text-[#E4E3DF] truncate transition-colors duration-300 group-hover:text-white">
                          {value}
                        </p>
                      </div>
                      <ArrowUpRight
                        size={16}
                        strokeWidth={1.4}
                        className="shrink-0 text-[#E99A5F] transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1"
                      />
                    </>
                  );

                  return href ? (
                    <Link key={label} href={href} className={rowClass}>
                      {inner}
                    </Link>
                  ) : (
                    <div key={label} className={rowClass}>
                      {inner}
                    </div>
                  );
                })}
              </div>

              {/* CTA */}
              <button
                type="button"
                onClick={() => setModalOpen(true)}
                className="group mt-7 inline-flex items-center gap-3 border border-[#505256] px-4 py-2.5 type-label text-[#E4E3DF] transition-all duration-300 hover:border-[#C56A32] hover:text-white"
              >
                Start a project
                <ArrowUpRight
                  size={13}
                  strokeWidth={1.5}
                  className="text-[#E99A5F] transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                />
              </button>
            </div>
          </motion.div>

          {/* =========================================================
            BOTTOM BAR
        ========================================================== */}
          <div className="mt-10 border-t border-[#45474A] pt-7 md:mt-16">
            <div className="flex flex-col gap-5 md:flex-row items-center md:justify-between">
              <div className="type-body tracking-[0.09em] text-[#A9AAAD]">
                © 2026 AdmitBridge. &nbsp;All rights reserved.
              </div>

              <div className="flex items-center gap-5 type-label text-[#A9AAAD]">
                <Link href="/privacy" className="transition-colors hover:text-[#F4F1EA]">
                  Privacy
                </Link>
                <span className="text-[#65676A]">|</span>
                <Link href="/terms" className="transition-colors hover:text-[#F4F1EA]">
                  Terms
                </Link>
                <span className="text-[#65676A]">|</span>
                <span>India</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
      <ProjectModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}