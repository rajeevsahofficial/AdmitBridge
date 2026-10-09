"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { X } from "lucide-react";
import { CONTACT_EMAIL } from "@/data/contact";
import EnquiryForm, { FORM_FOCUS, FORM_LABEL } from "./EnquiryForm";
import ContactSignal from "./Contactsignal";

const ease = [0.21, 0.47, 0.32, 0.98] as const;

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]):not([tabindex="-1"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/* ─────────────────────────────────────────────────────────────
   Types
───────────────────────────────────────────────────────────── */

type PanelStatus = "form" | "success";

export interface ProjectModalProps {
  open: boolean;
  onClose: () => void;
}

/* ─────────────────────────────────────────────────────────────
   ProjectModal
───────────────────────────────────────────────────────────── */

export default function ProjectModal({ open, onClose }: ProjectModalProps) {
  const reduce = !!useReducedMotion();
  const [panelStatus, setPanelStatus] = useState<PanelStatus>("form");

  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const successRef = useRef<HTMLDivElement>(null);

  /* ── Lock scroll + return focus on close ── */
  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    const returnTo = document.activeElement as HTMLElement | null;
    document.body.style.overflow = "hidden";
    requestAnimationFrame(() => closeRef.current?.focus());
    return () => {
      document.body.style.overflow = prevOverflow;
      returnTo?.focus?.();
    };
  }, [open]);

  /* ── Escape + focus-trap ── */
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") { onClose(); return; }
      if (e.key !== "Tab" || !panelRef.current) return;
      const els = Array.from(
        panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE)
      );
      if (!els.length) return;
      const first = els[0];
      const last = els[els.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault(); last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault(); first.focus();
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  /* ── Focus success heading when it appears ── */
  useEffect(() => {
    if (panelStatus === "success") successRef.current?.focus();
  }, [panelStatus]);

  /* ── Reset after exit animation ── */
  useEffect(() => {
    if (open) return;
    const t = setTimeout(() => setPanelStatus("form"), 350);
    return () => clearTimeout(t);
  }, [open]);

  const t = (d: number) => ({ duration: reduce ? 0 : d, ease });

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={t(0.3)}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-[#0B0E0B]/70 backdrop-blur-sm"
            aria-hidden="true"
          />

          {/* Positioning layer */}
          <motion.div
            key="panel"
            initial={reduce ? false : { opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: 24 }}
            transition={t(0.4)}
            className="pointer-events-none fixed inset-0 z-50 flex items-end justify-center md:items-center md:p-8"
          >
            <div
              ref={panelRef}
              role="dialog"
              aria-modal="true"
              aria-label="Start a project"
              className="pointer-events-auto relative flex max-h-svh w-full max-w-[1040px] flex-col overflow-hidden bg-[#F4F1EA] shadow-[0_40px_90px_-30px_rgba(0,0,0,0.6)] md:max-h-[88svh] md:flex-row"
            >
              {/* ── Dark statement panel (md+) ── */}
              <aside className="relative hidden w-[38%] shrink-0 flex-col justify-between bg-[#111511] p-10 text-white md:flex">
                <div>
                  <p className={`flex items-center gap-3 ${FORM_LABEL} text-[#E08A52]`}>
                    Start a project
                  </p>

                  <h2 className="mt-10 text-[clamp(2.25rem,3.6vw,3.25rem)] font-medium leading-[0.98] tracking-[-0.055em]">
                    Tell us what
                    <br />
                    <span className="text-white/55">you&apos;re building.</span>
                  </h2>

                  <p className="mt-6 max-w-[22rem] text-[0.9375rem] leading-[1.65] text-white/65">
                    A rough idea or a few sentences are enough to start the
                    conversation.
                  </p>
                </div>

                <div>
                  <ContactSignal />

                  <div className="mt-8 border-t border-white/15 pt-5">
                    <p className={`${FORM_LABEL} text-white/50`}>Prefer email?</p>
                    <a
                      href={`mailto:${CONTACT_EMAIL}`}
                      className={`mt-2 inline-block text-[1rem] text-white underline decoration-white/30 underline-offset-[6px] transition-colors hover:decoration-[#C56A32] ${FORM_FOCUS}`}
                    >
                      {CONTACT_EMAIL}
                    </a>
                  </div>
                </div>
              </aside>

              {/* ── Form panel ── */}
              <div className="flex min-h-0 flex-1 flex-col">

                {/* Header bar */}
                <div className="flex shrink-0 items-center justify-between border-b border-[#D8D4CB] px-6 py-4 sm:px-10">
                  <p className={`flex items-center gap-3 ${FORM_LABEL} text-[#A4511F]`}>
                    <span className="md:hidden">Start a project</span>
                    <span className="hidden md:inline">Enquiry</span>
                  </p>

                  <button
                    ref={closeRef}
                    type="button"
                    onClick={onClose}
                    aria-label="Close modal"
                    className={`flex h-10 w-10 items-center justify-center border border-[#D8D4CB] text-[#686761] transition-colors duration-200 hover:border-[#111511] hover:bg-[#111511] hover:text-white ${FORM_FOCUS}`}
                  >
                    <X size={16} strokeWidth={1.5} />
                  </button>
                </div>

                {/* Scrollable body */}
                <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 md:px-10">

                  {/* Mobile heading (dark panel hidden on small screens) */}
                  <div className="my-6 md:hidden">
                    <h2 className="text-[clamp(2rem,8vw,2.75rem)] font-medium leading-[0.98] tracking-[-0.055em]">
                      Tell us what
                      <br />
                      <span className="text-[#686761]">you&apos;re building.</span>
                    </h2>
                    <p className="mt-4 max-w-[480px] text-[0.9375rem] leading-[1.65] text-[#5C5B55]">
                      A rough idea or a few sentences are enough to start the
                      conversation.
                    </p>
                  </div>

                  {/* Success state */}
                  {panelStatus === "success" ? (
                    <div
                      ref={successRef}
                      tabIndex={-1}
                      role="status"
                      className="border-y border-[#D8D4CB] py-14 outline-none"
                    >
                      <span
                        className="mb-6 block h-2 w-2 bg-[#C56A32]"
                        aria-hidden="true"
                      />
                      <h3 className="text-[clamp(1.75rem,3vw,2.25rem)] font-medium leading-[1.05] tracking-[-0.045em]">
                        Thanks, we&apos;ve received your enquiry.
                      </h3>
                      <p className="mt-4 max-w-[30rem] text-[1rem] leading-[1.65] text-[#5C5B55]">
                        We&apos;ll review it and get back to you at the email
                        address you gave us.
                      </p>
                      <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3">
                        <button
                          type="button"
                          onClick={() => setPanelStatus("form")}
                          className={`border-b border-[#111511] pb-1 text-sm font-medium transition-colors hover:border-[#C56A32] hover:text-[#A4511F] ${FORM_FOCUS}`}
                        >
                          Send another enquiry
                        </button>
                        <button
                          type="button"
                          onClick={onClose}
                          className={`border-b border-[#D8D4CB] pb-1 text-sm text-[#686761] transition-colors hover:border-[#686761] hover:text-[#111511] ${FORM_FOCUS}`}
                        >
                          Close
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* EnquiryForm — delegates success back to the modal */
                    <div className="pb-2">
                      <EnquiryForm
                        idPrefix="modal"
                        statusId="modal-form-status"
                        onSuccess={() => setPanelStatus("success")}
                        compact
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
