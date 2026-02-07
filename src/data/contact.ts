import type { LucideIcon } from "lucide-react";
import Github from "lucide-react/dist/esm/icons/github";
import Linkedin from "lucide-react/dist/esm/icons/linkedin";
import Instagram from "lucide-react/dist/esm/icons/instagram";

export interface SocialLink {
  href: string;
  icon: LucideIcon;
  label: string;
}

/** Social media links displayed in the Contact section */
export const socialLinks: SocialLink[] = [
  {
    href: "https://github.com/Kamaiko",
    icon: Github,
    label: "GitHub",
  },
  {
    href: "https://www.linkedin.com/in/patrickpatenaude/",
    icon: Linkedin,
    label: "LinkedIn",
  },
  {
    href: "https://www.instagram.com/patrickpatenaude/",
    icon: Instagram,
    label: "Instagram",
  },
];

/** Primary contact email */
export const CONTACT_EMAIL = "contact@halterofit.ca";

/** Path to the downloadable CV */
export const CV_PATH = "/cv-patrick-patenaude.pdf";
