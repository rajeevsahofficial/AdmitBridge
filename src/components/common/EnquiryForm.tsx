"use client";


import { useEffect, useRef, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import { ArrowUpRight, ChevronDown } from "lucide-react";
import {
  projectTypes,
  CONTACT_ENDPOINT,
  CONTACT_EMAIL,
} from "@/data/contact";

/* ─────────────────────────────────────────────────────────────
   Shared style tokens
───────────────────────────────────────────────────────────── */

export const FORM_INPUT =
  "w-full border-0 bg-transparent p-0 text-[1.0625rem] text-[#111511] outline-none placeholder:text-[#6F6D66] focus:ring-0";

export const FORM_LABEL = "text-[11px] font-medium uppercase tracking-[0.14em]";

export const FORM_FOCUS =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#C56A32]";

/* ─────────────────────────────────────────────────────────────
   Field wrapper
   Renders an underline-style field with a copper focus-line
   animation that draws in from the left when any child is
   focused.
───────────────────────────────────────────────────────────── */

interface FieldProps {
  id: string;
  /** Mono number shown next to the label (e.g. "01") */
  n: string;
  label: string;
  optional?: boolean;
  children: ReactNode;
}

export function Field({ id, n, label, optional, children }: FieldProps) {
  return (
    <div className="group relative border-b border-[#D8D4CB] pb-2 pt-5 transition-colors duration-200 focus-within:border-[#111511]">
      <div className="mb-3 flex items-baseline justify-between gap-4">
        <label
          htmlFor={id}
          className={`flex items-baseline gap-3 ${FORM_LABEL} text-[#686761]`}
        >
          <span className="font-mono text-[11px] tabular-nums tracking-normal text-[#A4511F]">
            {n}
          </span>
          {label}
        </label>
        {optional && (
          <span className="text-[12px] text-[#6F6D66]">Optional</span>
        )}
      </div>

      {children}

      {/* Copper underline draws in on focus */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 -bottom-px h-0.5 origin-left scale-x-0 bg-[#C56A32] transition-transform duration-300 group-focus-within:scale-x-100"
      />
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   Types
───────────────────────────────────────────────────────────── */

export type FormStatus = "idle" | "submitting" | "success" | "error";

export interface EnquiryFormProps {
  /** Prefix for all input/label ids — must be unique per mount. */
  idPrefix: string;
  /** id used for aria-describedby on the submit row. */
  statusId: string;
  /**
   * Optional callback fired after a successful submission.
   * When provided, the component delegates success rendering to the
   * caller (e.g. the modal shows its own panel).
   * When omitted, the component renders an inline success state.
   */
  onSuccess?: () => void;
  /** Reduce textarea rows and outer padding (modal context). */
  compact?: boolean;
}

/* ─────────────────────────────────────────────────────────────
   EnquiryForm
───────────────────────────────────────────────────────────── */

export default function EnquiryForm({
  idPrefix,
  statusId,
  onSuccess,
  compact = false,
}: EnquiryFormProps) {
  const [selectedType, setSelectedType] = useState("");
  const [status, setStatus] = useState<FormStatus>("idle");
  const successRef = useRef<HTMLDivElement>(null);

  /* Move focus to the success message when it appears */
  useEffect(() => {
    if (status === "success") successRef.current?.focus();
  }, [status]);

  /* Allow parent to reset state (e.g. when modal re-opens) */
  function reset() {
    setStatus("idle");
    setSelectedType("");
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status === "submitting") return;

    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());

    // Honeypot — silently succeed so bots think they submitted
    if (data.website) {
      if (onSuccess) onSuccess();
      else setStatus("success");
      return;
    }

    setStatus("submitting");

    try {
      const res = await fetch(CONTACT_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(`${res.status}`);
      form.reset();
      setSelectedType("");
      if (onSuccess) {
        onSuccess();
      } else {
        setStatus("success");
      }
    } catch {
      setStatus("error");
    }
  }

  /* ── Inline success state (used only when onSuccess is not provided) ── */
  if (status === "success") {
    return (
      <div
        ref={successRef}
        tabIndex={-1}
        role="status"
        className="border-y border-[#D8D4CB] py-14 outline-none"
      >
        <span className="mb-6 block h-2 w-2 bg-[#C56A32]" aria-hidden="true" />
        <h3 className="text-[clamp(1.75rem,3vw,2.5rem)] font-medium leading-[1.05] tracking-[-0.045em]">
          Thanks, we&apos;ve received your enquiry.
        </h3>
        <p className="mt-4 max-w-[30rem] text-[1rem] leading-[1.65] text-[#5C5B55]">
          We&apos;ll review it and get back to you at the email address you
          gave us.
        </p>
        <button
          type="button"
          onClick={reset}
          className={`mt-8 border-b border-[#111511] pb-1 text-sm font-medium transition-colors hover:border-[#C56A32] hover:text-[#A4511F] ${FORM_FOCUS}`}
        >
          Send another enquiry
        </button>
      </div>
    );
  }

  /* ── Form ── */
  return (
    <form
      onSubmit={handleSubmit}
      aria-describedby={statusId}
      noValidate
    >
      {/* Honeypot — visually hidden, never autofilled */}
      <div
        aria-hidden="true"
        className="absolute left-[-9999px] h-0 w-0 overflow-hidden"
      >
        <label htmlFor={`${idPrefix}-website`}>Leave this field empty</label>
        <input
          id={`${idPrefix}-website`}
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      {/* Fields */}
      <Field id={`${idPrefix}-name`} n="01" label="Your name">
        <input
          id={`${idPrefix}-name`}
          name="name"
          type="text"
          required
          maxLength={120}
          autoComplete="name"
          className={FORM_INPUT}
        />
      </Field>

      <Field id={`${idPrefix}-email`} n="02" label="Email address">
        <input
          id={`${idPrefix}-email`}
          name="email"
          type="email"
          required
          maxLength={160}
          autoComplete="email"
          className={FORM_INPUT}
        />
      </Field>

      <Field id={`${idPrefix}-company`} n="03" label="Company / organisation" optional>
        <input
          id={`${idPrefix}-company`}
          name="company"
          type="text"
          maxLength={160}
          autoComplete="organization"
          className={FORM_INPUT}
        />
      </Field>

      <Field id={`${idPrefix}-project`} n="04" label="What can we help with?">
        <div className="relative">
          <select
            id={`${idPrefix}-project`}
            name="project"
            required
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className={`${FORM_INPUT} cursor-pointer appearance-none pr-8 ${
              selectedType ? "" : "text-[#6F6D66]"
            }`}
          >
            <option value="" disabled>
              Select a service
            </option>
            {projectTypes.map((type) => (
              <option key={type} value={type} className="text-[#111511]">
                {type}
              </option>
            ))}
          </select>
          <ChevronDown
            size={16}
            strokeWidth={1.5}
            aria-hidden="true"
            className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 text-[#686761]"
          />
        </div>
      </Field>

      <Field id={`${idPrefix}-message`} n="05" label="Tell us about the project">
        <textarea
          id={`${idPrefix}-message`}
          name="message"
          required
          rows={compact ? 2 : 4}
          maxLength={4000}
          className={`${FORM_INPUT} resize-none leading-7`}
        />
      </Field>

      {/* Submit row */}
      <div
        className={`flex flex-col gap-6 ${compact ? "pt-6" : "pt-8"} sm:flex-row sm:items-center sm:justify-between`}
      >
        <div id={statusId} className="max-w-[360px]" aria-live="polite">
          {status === "error" ? (
            <p role="alert" className="text-[13px] leading-[1.6] text-[#A4511F]">
              Something went wrong. Please try again or email{" "}
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="underline underline-offset-2"
              >
                {CONTACT_EMAIL}
              </a>
              .
            </p>
          ) : (
            <p className="text-[13px] leading-[1.6] text-[#686761]">
              By submitting you&apos;re starting a conversation with
              AdmitBridge.
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={status === "submitting"}
          className={`group inline-flex h-14 w-full shrink-0 items-center justify-between gap-6 bg-[#111511] px-8 text-[15px] font-medium text-white transition-colors duration-200 hover:bg-[#C56A32] hover:text-[#111511] disabled:cursor-wait disabled:opacity-60 sm:w-fit sm:justify-start ${FORM_FOCUS}`}
        >
          {status === "submitting" ? "Sending…" : "Send enquiry"}
          <ArrowUpRight
            size={17}
            strokeWidth={1.8}
            aria-hidden="true"
            className="transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
          />
        </button>
      </div>
    </form>
  );
}
