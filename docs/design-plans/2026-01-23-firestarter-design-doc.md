# Firestarter

**Created:** 2026-01-23
**Status:** Design

---

## Overview

**What:** A duplicatable starter system — a pre-built, studio-designed foundation that can be cloned and skinned for each new client project.

**Why:** The studio needs a middle-tier offering between full custom Craft CMS builds ($100k+) and Squarespace/Framer sites. Current budget options constrain designers to third-party templates and leave clients with no upgrade path when they outgrow the platform.

**Type:** Product

---

## Vision & Goals

### Core Goals

1. **Speed** — Significantly reduce time from project start to live website
2. **Quality** — Studio-designed components and architecture, not constrained by third-party templates
3. **Client Safety** — CMS structure that empowers clients without letting them break things
4. **Growth Path** — Clients can expand on the same platform later (no rebuild required)
5. **Studio Alignment** — Fits existing workflows, tools, and team strengths

---

## Tech Stack

### The Pipeline

```
Figma Design System → Storybook → Craft CMS (headless) → Next.js Frontend
```

| Layer | Role |
|-------|------|
| **Figma** | Design system source of truth — tokens, components, layouts, page types |
| **Storybook** | Component library — tightly integrated with Figma tokens; designers review, developers build |
| **Craft CMS** | Headless CMS — content modeling matches design system components; client-managed post-launch |
| **Next.js** | Frontend — App Router, Server/Client Components, consumes Craft via API |

### Integration Points (Requiring Research)

- Figma → Storybook token sync (Tokens Studio + Style Dictionary vs. Figma Variables API + custom)
- Craft → Next.js data fetching (GraphQL vs. Element API)
- Rendering strategy (SSG vs. ISR vs. SSR)
- Hosting solution for all three services

---

## Design System

### Structure

| Layer | Contents |
|-------|----------|
| **Tokens** | Typography, color, spacing, icons |
| **Elements** | Buttons, images, text groups |
| **Components** | Navigation, heroes, CTAs, card grids, filters, footers |
| **Pages** | Assembled layouts |

### Principle

The system builds up in layers — from token values, to foundational elements, to full components, to page-level compositions. The boundaries between layers are practical, not doctrinal.

Most projects use off-the-shelf components, with only a few custom additions. The exact component inventory will be determined collaboratively with the design team.

### Designer Workflow (Per Project)

1. **Token adjustments** — Update colors, fonts, spacing scale, border radius options, etc. to match client brand
2. **Component adjustments** — Override token usage per component (e.g., change card padding from `space-lg` to `space-xl`, or card border radius from `radius-default` to `radius-sm`)

### Automation Goal

- Token changes → Storybook/code sync (known to be feasible)
- Component-level overrides → Storybook/code sync (research needed — ideal but not required)
- Where automation isn't possible, developers apply changes manually

The goal is "automate as much as we can" — not all or nothing.

---

## CMS Structure (Craft)

### Content Architecture (Studio Patterns)

- **Static fields** for hero sections, page metadata, taxonomy — not everything in a page builder
- **Matrix page builders** using Craft 5's entry type system
  - Components defined once as entry types, assigned to one or multiple builders
  - Universal page builder OR specialized builders per page type (decided per project)
- **CKEditor** for long-form content (blog posts)
- **Optional component fields** — e.g., "Include CTA?" toggle with conditional fields
- **Global/reusable content** — standalone sections for things like CTAs that pages reference (single source of truth)

### Page Types (V1)

- Homepage
- About
- Contact
- Blog index
- Blog post
- Generic flexible page

### Client Safety Principle

The CMS must be structured so clients can manage content independently without breaking layouts or design decisions.

---

## Requirements

### Must Have (V1)

- [ ] Figma design system (tokens, elements, components, page templates)
- [ ] Storybook component library with Figma token integration
- [ ] Craft CMS scaffold (page types, page builders, component blocks, navigation)
- [ ] Next.js frontend consuming Craft headless
- [ ] Simple contact forms (likely MailChimp integration)
- [ ] Deployable out-of-the-box baseline site

### Nice to Have

- [ ] Automated component-level sync from Figma to Storybook
- [ ] Live preview for content editors

### Out of Scope (V1)

- E-commerce
- Multilingual
- Member/login areas
- Advanced forms
- Third-party integrations (donations, scheduling, etc.)

**Future Consideration:** Common integrations may become plug-and-play additions if patterns emerge.

---

## Design Decisions

### Design Token Pipeline

**Options considered:**
1. Tokens Studio + Style Dictionary — well-established, good community support, requires manual export or paid sync
2. Figma Variables API + Custom Pipeline — uses native Figma features, requires custom tooling to build/maintain

**Decision:** Deferred — dedicated research spike before committing. System should be token-pipeline-agnostic initially.

### Craft CMS Content Architecture

**Decision:** Apply existing studio patterns (static fields, Matrix page builders, CKEditor for long-form, global content sections). Specific field architecture will be determined collaboratively as the system is built.

### Next.js Rendering Strategy

**Options considered:**
1. SSG — fastest, requires full rebuilds for content changes
2. ISR — near-static performance, pages regenerate on-demand
3. SSR — always fresh, simpler preview, higher server cost

**Decision:** Deferred — research needed alongside hosting decisions.

---

## Open Questions

| Area | Question |
|------|----------|
| Figma → Storybook sync | Tokens Studio + Style Dictionary vs. Figma Variables API + custom? What level of component-level sync is feasible? |
| Craft → Next.js data fetching | GraphQL vs. Element API? |
| Rendering strategy | SSG vs. ISR vs. SSR — what fits content update needs and preview experience? |
| Hosting | Where to host frontend, Craft + DB, and Storybook? Cost and workflow considerations. |
| Live preview | How to enable content editors to preview changes before publishing? |

---

## Acceptance Criteria

### System Ready

- [ ] Figma design system exists with tokens, elements, components, page templates
- [ ] Storybook displays all components, integrated with Figma tokens
- [ ] Craft CMS scaffold is configured (page types, builders, component blocks)
- [ ] Next.js frontend renders all components and page types from Craft
- [ ] Full system is deployable as a baseline site out of the box

### Workflow Validated

- [ ] A designer can duplicate the Figma system and update tokens for a new client
- [ ] Token changes flow into Storybook (automation level TBD by research)
- [ ] A client can manage content in Craft without breaking layouts
- [ ] A developer can clone the repo and spin up a working local environment

---

## Users

| Role | Touchpoints |
|------|-------------|
| Strategists | Light involvement — page types, structure decisions |
| Designers | Figma (primary), Storybook (review) |
| Developers | Storybook (build), codebase, hosting, deployment |
| Clients | Craft CMS (content management post-handoff) |

---

## Files to Create/Modify

*To be determined during implementation planning*

---

## Build Log

*Filled in during `/build` phase*

| Date | Task | Files | Notes |
|------|------|-------|-------|
| | | | |

---

## Completion

**Completed:** [Date]
**Final Status:** [Complete | Partial | Abandoned]

**Summary:** [Brief description of what was actually built]

**Deviations from Plan:** [Any significant changes from original design]
