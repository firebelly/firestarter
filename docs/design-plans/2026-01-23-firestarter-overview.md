# Firestarter: Project Overview

## The Problem

The studio has a gap between two offerings:

- **High-end:** Full custom Craft CMS builds ($100k+) — strategy, design, development
- **Budget-friendly:** Squarespace/Framer sites — faster, cheaper, but limited

The budget option has real drawbacks:

1. **Design constraints** — Designers are locked into template structures, not studio-quality decisions
2. **Growth ceiling** — Clients hit platform limitations when they want to expand
3. **No upgrade path** — Moving from Squarespace to custom means starting from scratch

## The Solution

Firestarter is a **duplicatable starter system** — a pre-built, studio-designed foundation that can be cloned and skinned for each new client.

## The Pipeline

```
Figma Design System → Storybook → Craft CMS (headless) → Next.js Frontend
```

- **Figma:** A skeleton design system with considered structural decisions, components, layouts, page types — all designed by the studio
- **Storybook:** Tightly integrated with Figma; design token changes (colors, fonts, spacing) flow through to code
- **Craft CMS:** Headless, pre-configured with matching components, page builders, navigation
- **Next.js:** Frontend consuming Craft's API

## The Workflow

1. Duplicate the Figma design system
2. Clone the repo
3. Designers update tokens to match client brand
4. Changes propagate through the system
5. Deploy — a working site out of the box, ready to customize

## Key Benefits

- **Speed:** Get clients live quickly
- **Quality:** Studio-designed, not constrained by third-party templates
- **Growth path:** Clients can expand on the same platform later (no rebuild)
- **Studio alignment:** Matches internal processes and standards
