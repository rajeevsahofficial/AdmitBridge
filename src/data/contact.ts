import { Mail, MapPin, Phone } from "lucide-react";

/* ─────────────────────────────────────────────────────────────
   Canonical contact constants
   Update these values before launch — every component that
   renders contact information imports from here.
───────────────────────────────────────────────────────────── */

export const CONTACT_EMAIL = "contact.admitbridge@gmail.com";
export const CONTACT_PHONE_DISPLAY = "+91 95086 90371";
export const CONTACT_PHONE_TEL = "tel:+919508690371";
export const CONTACT_LOCATION = "South Delhi, India";

/** POST endpoint for the enquiry form */
export const CONTACT_ENDPOINT = "/api/contact";

/* ─────────────────────────────────────────────────────────────
   Contact info rows
   Used in: footer, contact page, any future component that
   needs to render the three canonical contact details.
───────────────────────────────────────────────────────────── */

export interface ContactInfoItem {
  /** Lucide icon component */
  icon: typeof Mail;
  /** Short category label shown above the value */
  label: string;
  /** Human-readable display value */
  value: string;
  /** Optional href — omit for non-linkable items (e.g. plain location) */
  href?: string;
}

export const contactInfo: ContactInfoItem[] = [
  {
    icon: Mail,
    label: "Email",
    value: CONTACT_EMAIL,
    href: `mailto:${CONTACT_EMAIL}`,
  },
  {
    icon: Phone,
    label: "Phone",
    value: CONTACT_PHONE_DISPLAY,
    href: CONTACT_PHONE_TEL,
  },
  {
    icon: MapPin,
    label: "Location",
    value: CONTACT_LOCATION,
    // no href — location is informational only
  },
];

/* ─────────────────────────────────────────────────────────────
   Enquiry form — project type options
   Used in: contact page select field
───────────────────────────────────────────────────────────── */

export const projectTypes: string[] = [
  "Website / Web Application",
  "Custom Software",
  "SEO & Organic Growth",
  "Google Ads",
  "Meta Ads",
  "Education / Admissions Technology",
  "Something else",
];
