/**
 * Site-wide settings and identity. Phase 2 extends this with the full
 * content model (now, resume paths, Formspree ID, analytics).
 */
export const site = {
  name: "Kyle Tranfaglia",
  headline: "Software Engineer · Data Scientist",
  url: "https://kyletranfaglia.top",
  email: "kyletranfaglia@gmail.com",
  socials: {
    github: "https://github.com/ktranfaglia1",
    linkedin: "https://www.linkedin.com/in/kyletranfaglia",
  },
  nav: [
    { label: "Home", href: "/" },
    { label: "Projects", href: "/projects" },
    { label: "Experience", href: "/experience" },
    { label: "Resume", href: "/resume" },
    { label: "Contact", href: "/contact" },
  ],
} as const;

export type NavItem = (typeof site.nav)[number];
