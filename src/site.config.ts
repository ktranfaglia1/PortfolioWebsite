/**
 * Site-wide settings and identity. Everything else (projects, experience,
 * education, skills, page copy) lives in src/content/.
 *
 * The home page "Now" card is derived from the experience collection: it shows
 * the professional entry whose `end` is `present`.
 */
export const site = {
  name: "Kyle Tranfaglia",
  headline: "Software Engineer",
  /** From LinkedIn; used under the headline and in meta copy. */
  tagline: "Full-Stack Development, Data & Analytics, AI",
  /** Home fact rail "Focus" card: the kind of work, not a tool list. */
  focus: {
    primary: "Full-stack AI products",
    secondary: "Web platforms, LLM pipelines, data & analytics",
  },
  url: "https://kyletranfaglia.top",
  location: "Raleigh-Durham-Chapel Hill Area",
  /** Structured-data address (JSON-LD); the display string above stays general. */
  address: { region: "NC", country: "US" },
  email: "kyletranfaglia@gmail.com",
  socials: {
    github: "https://github.com/ktranfaglia1",
    linkedin: "https://www.linkedin.com/in/kyletranfaglia",
  },
  /** GitHub username for the build-time activity card. */
  githubUser: "ktranfaglia1",
  /**
   * Show the GitHub contribution heatmap on the home page (needs GITHUB_TOKEN
   * at build time). Off for now: most recent work (Pitchfire) isn't on GitHub,
   * so the public graph undersells it. Flip to true when it looks representative.
   */
  showGitHubActivity: false,
  /** This site's source, linked from the console greeting. */
  repo: "https://github.com/ktranfaglia1/PortfolioWebsite",
  files: {
    resume: "/resume/Kyle_Tranfaglia_Resume.pdf",
    transcript: "/resume/Kyle_Tranfaglia_Unofficial_Transcript.pdf",
  },
  /** Formspree form ID (https://formspree.io/f/<id>). */
  formspreeId: "xdoqywoa",
  /**
   * Cloudflare Web Analytics beacon token. Empty means no beacon is loaded.
   * Leave empty: kyletranfaglia.top uses Cloudflare's automatic setup, which
   * injects the beacon at the edge. Setting a token too would double-count.
   * Only fill this in if the site moves to manual (JS snippet) setup.
   */
  cloudflareAnalyticsToken: "",
  nav: [
    { label: "Home", href: "/" },
    { label: "Projects", href: "/projects" },
    { label: "Experience", href: "/experience" },
    { label: "Resume", href: "/resume" },
    { label: "Contact", href: "/contact" },
  ],
} as const;

export type NavItem = (typeof site.nav)[number];
