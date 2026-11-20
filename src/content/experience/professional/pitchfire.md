---
org: Pitchfire
orgDescription: Two-sided AI deal-flow platform, incubated by New North Ventures
# The company is being acquired; keep the link hidden until Kyle says otherwise.
showLink: false
# TODO(kyle): add the Pitchfire logo (SVG preferred) and set orgLogo.
logoPlaceholder: Pitchfire logo
role: Co-Founder & Lead Software Engineer
group: professional
start: 2025-12-01
end: present
summary: As the sole engineer, I own architecture, UI/UX, AI, releases, and operations for 145 active users across 111 venture capital and private equity firms.
highlights:
  - Re-architected an internal Python/AWS tool into a multi-tenant, production TypeScript platform (React, Express, PostgreSQL) and expanded it from VC-only to support PE firms.
  - Ingested 1,600+ pitch decks (840+ AI-analyzed) through uploads, embeddable intake forms, DocSend links, and inbound email.
  - Designed the PostgreSQL schema and pgvector semantic search behind matching across nearly 5,000 VC firms, and cut API, query, and page-load latency with caching, join and foreign-key redesign, and N+1 removal.
  - Built the AI layer (deck analysis, thesis-match scoring, multi-persona deal evaluations, and a permission-aware assistant with human-confirmed writes and a per-firm kill switch), moving from a local model to OpenAI and then Anthropic Claude.
  - Built async pipelines with retries and failure recovery for deck processing, investor-catalog enrichment, and news synthesis.
  - Secured the platform with malware-scanned uploads, role-based access with firm-level isolation, 2FA, encryption at rest, and audit logging.
  - Shipped the founder workspace (pitch benchmarking, VC matching, outreach tracking, data rooms, cap tables) and the investor workspace (deal intake, team-voting pipelines, NDAs, portfolio tracking).
  - As co-founder, also shape product direction, customer targeting, QA, market research, and hiring.
skills:
  [
    TypeScript,
    React,
    Express,
    PostgreSQL,
    pgvector,
    Drizzle ORM,
    Anthropic Claude,
    OpenAI,
    Replit,
    AWS,
  ]
---
