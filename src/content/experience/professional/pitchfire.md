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
summary: Co-founder and the only engineer behind an AI platform for startups and investment teams. I own architecture, the full stack, AI systems, data infrastructure, releases, and production for 145 active users across 111 venture capital and private equity firms.
highlights:
  - Rebuilt an internal Python/AWS tool as a multi-tenant TypeScript platform (React, Node.js/Express, PostgreSQL), moved it to Replit, and grew it from a VC-only tool into a two-sided product for VC firms, PE firms, and founders.
  - Platform architecture. Designed the data model with firm-level isolation and four-role access control across founder, investor, and shared workflows, and cut API, query, and page-load latency with caching, join and foreign-key redesign, and N+1 removal.
  - AI systems. Built document extraction, structured deck analysis, thesis-match scoring, a four-persona advisor panel, pgvector matching across nearly 5,000 VC firms, and a permission-aware assistant with confirmed writes, plus model routing, prompt caching, and cost controls. Moved the AI layer from a local model to OpenAI and then Anthropic Claude.
  - Production reliability. Ingested 1,600+ pitch decks (840+ AI-analyzed) through asynchronous pipelines with retries, deduplication, and recovery for interrupted jobs; maintain integrations, monitoring, migrations, security, and regression tests.
  - Connected workflows. Shipped the founder workspace (pitch analysis and benchmarking, investor matching, outreach, investor updates, data rooms, cap tables with vesting and dilution modeling) and the investor workspace (deal intake, CIM analysis, configurable pipelines, team voting, NDAs, portfolio tools), and made analysis, matching, outreach, and pipeline activity flow between them.
  - As a co-founder, also drive product strategy and go-to-market direction, customer targeting, QA, market research, and hiring.
skills:
  [
    TypeScript,
    React,
    Node.js,
    Express,
    PostgreSQL,
    pgvector,
    Drizzle ORM,
    Anthropic Claude,
    OpenAI,
    System design,
    Replit,
    AWS,
  ]
project: pitchfire
---
