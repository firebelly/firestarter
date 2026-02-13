// Hand-authored token metadata for Storybook viewers.
// Min/max values sourced from design.tokens.json primitive groups.

export interface ColorToken {
  cssVar: string;
  label: string;
  hsl: string;
}

export interface FontToken {
  cssVar: string;
  label: string;
  value: string;
}

export interface FluidToken {
  cssVar: string;
  label: string;
  minPx: number;
  maxPx: number;
}

// ---------------------------------------------------------------------------
// Colors
// ---------------------------------------------------------------------------

export const colorTokens = {
  gray: [
    {
      cssVar: "--color-primitives-gray-000",
      label: "000",
      hsl: "hsl(0 0% 100%)",
    },
    {
      cssVar: "--color-primitives-gray-000-50",
      label: "000-50",
      hsl: "hsl(0 0% 100% / 0.5)",
    },
    {
      cssVar: "--color-primitives-gray-001",
      label: "001",
      hsl: "hsl(60 4% 91%)",
    },
    {
      cssVar: "--color-primitives-gray-002",
      label: "002",
      hsl: "hsl(233 7% 75%)",
    },
    {
      cssVar: "--color-primitives-gray-003",
      label: "003",
      hsl: "hsl(233 8% 43%)",
    },
    {
      cssVar: "--color-primitives-gray-004",
      label: "004",
      hsl: "hsl(234 16% 24%)",
    },
    {
      cssVar: "--color-primitives-gray-005",
      label: "005",
      hsl: "hsl(235 51% 15%)",
    },
  ] satisfies ColorToken[],

  blue: [
    {
      cssVar: "--color-primitives-blue-101",
      label: "101",
      hsl: "hsl(225 41% 85%)",
    },
    {
      cssVar: "--color-primitives-blue-102",
      label: "102",
      hsl: "hsl(234 79% 64%)",
    },
    {
      cssVar: "--color-primitives-blue-103",
      label: "103",
      hsl: "hsl(248 88% 36%)",
    },
    {
      cssVar: "--color-primitives-blue-104",
      label: "104",
      hsl: "hsl(235 51% 15%)",
    },
  ] satisfies ColorToken[],

  magenta: [
    {
      cssVar: "--color-primitives-magenta-201",
      label: "201",
      hsl: "hsl(327 84% 83%)",
    },
    {
      cssVar: "--color-primitives-magenta-202",
      label: "202",
      hsl: "hsl(325 89% 43%)",
    },
    {
      cssVar: "--color-primitives-magenta-203",
      label: "203",
      hsl: "hsl(328 88% 26%)",
    },
    {
      cssVar: "--color-primitives-magenta-204",
      label: "204",
      hsl: "hsl(328 83% 14%)",
    },
  ] satisfies ColorToken[],

  lemon: [
    {
      cssVar: "--color-primitives-lemon-301",
      label: "301",
      hsl: "hsl(58 80% 88%)",
    },
    {
      cssVar: "--color-primitives-lemon-302",
      label: "302",
      hsl: "hsl(56 93% 48%)",
    },
    {
      cssVar: "--color-primitives-lemon-303",
      label: "303",
      hsl: "hsl(42 100% 40%)",
    },
    {
      cssVar: "--color-primitives-lemon-304",
      label: "304",
      hsl: "hsl(34 100% 28%)",
    },
  ] satisfies ColorToken[],

  teal: [
    {
      cssVar: "--color-primitives-teal-401",
      label: "401",
      hsl: "hsl(183 85% 92%)",
    },
    {
      cssVar: "--color-primitives-teal-402",
      label: "402",
      hsl: "hsl(178 85% 66%)",
    },
    {
      cssVar: "--color-primitives-teal-403",
      label: "403",
      hsl: "hsl(187 72% 37%)",
    },
    {
      cssVar: "--color-primitives-teal-404",
      label: "404",
      hsl: "hsl(186 90% 19%)",
    },
  ] satisfies ColorToken[],
};

// ---------------------------------------------------------------------------
// Font families
// ---------------------------------------------------------------------------

export const fontFamilies: FontToken[] = [
  {
    cssVar: "--type-primitives-font-family-body",
    label: "Body",
    value: "Inter",
  },
  {
    cssVar: "--type-primitives-font-family-heading",
    label: "Heading",
    value: "Platform",
  },
];

// ---------------------------------------------------------------------------
// Font weights
// ---------------------------------------------------------------------------

export const fontWeights: FontToken[] = [
  {
    cssVar: "--type-primitives-font-weight-medium",
    label: "Medium",
    value: "Medium",
  },
  {
    cssVar: "--type-primitives-font-weight-bold",
    label: "Bold",
    value: "Bold",
  },
];

// ---------------------------------------------------------------------------
// Type scale (font size) — steps -5 through 8
// ---------------------------------------------------------------------------

export const typeSteps: FluidToken[] = [
  { cssVar: "--step--5", label: "Step -5", minPx: 7.55, maxPx: 5.93 },
  { cssVar: "--step--4", label: "Step -4", minPx: 8.66, maxPx: 7.56 },
  { cssVar: "--step--3", label: "Step -3", minPx: 9.94, maxPx: 9.64 },
  { cssVar: "--step--2", label: "Step -2", minPx: 11.4, maxPx: 12.3 },
  { cssVar: "--step--1", label: "Step -1", minPx: 13.08, maxPx: 15.68 },
  { cssVar: "--step-0", label: "Step 0", minPx: 15, maxPx: 20 },
  { cssVar: "--step-1", label: "Step 1", minPx: 17.21, maxPx: 25.51 },
  { cssVar: "--step-2", label: "Step 2", minPx: 19.74, maxPx: 32.53 },
  { cssVar: "--step-3", label: "Step 3", minPx: 22.65, maxPx: 41.49 },
  { cssVar: "--step-4", label: "Step 4", minPx: 25.98, maxPx: 52.91 },
  { cssVar: "--step-5", label: "Step 5", minPx: 29.8, maxPx: 67.49 },
  { cssVar: "--step-6", label: "Step 6", minPx: 34.19, maxPx: 86.07 },
  { cssVar: "--step-7", label: "Step 7", minPx: 39.23, maxPx: 109.77 },
  { cssVar: "--step-8", label: "Step 8", minPx: 45, maxPx: 140 },
];

// ---------------------------------------------------------------------------
// Line height — body — steps -5 through 8
// ---------------------------------------------------------------------------

export const lineHeightBodySteps: FluidToken[] = [
  { cssVar: "--lh-body-step--5", label: "Step -5", minPx: 12.05, maxPx: 11.72 },
  { cssVar: "--lh-body-step--4", label: "Step -4", minPx: 13.33, maxPx: 14.14 },
  { cssVar: "--lh-body-step--3", label: "Step -3", minPx: 14.76, maxPx: 17.07 },
  { cssVar: "--lh-body-step--2", label: "Step -2", minPx: 16.33, maxPx: 20.6 },
  { cssVar: "--lh-body-step--1", label: "Step -1", minPx: 18.07, maxPx: 24.86 },
  { cssVar: "--lh-body-step-0", label: "Step 0", minPx: 20, maxPx: 30 },
  { cssVar: "--lh-body-step-1", label: "Step 1", minPx: 22.13, maxPx: 36.21 },
  { cssVar: "--lh-body-step-2", label: "Step 2", minPx: 24.49, maxPx: 43.69 },
  { cssVar: "--lh-body-step-3", label: "Step 3", minPx: 27.11, maxPx: 52.73 },
  { cssVar: "--lh-body-step-4", label: "Step 4", minPx: 30, maxPx: 63.64 },
  { cssVar: "--lh-body-step-5", label: "Step 5", minPx: 33.2, maxPx: 76.8 },
  { cssVar: "--lh-body-step-6", label: "Step 6", minPx: 36.74, maxPx: 92.69 },
  { cssVar: "--lh-body-step-7", label: "Step 7", minPx: 40.66, maxPx: 111.86 },
  { cssVar: "--lh-body-step-8", label: "Step 8", minPx: 38.49, maxPx: 135 },
];

// ---------------------------------------------------------------------------
// Line height — heading — steps -5 through 8
// ---------------------------------------------------------------------------

export const lineHeightHeadingSteps: FluidToken[] = [
  {
    cssVar: "--lh-heading-step--5",
    label: "Step -5",
    minPx: 12.05,
    maxPx: 7.18,
  },
  {
    cssVar: "--lh-heading-step--4",
    label: "Step -4",
    minPx: 13.33,
    maxPx: 8.98,
  },
  {
    cssVar: "--lh-heading-step--3",
    label: "Step -3",
    minPx: 14.76,
    maxPx: 11.24,
  },
  {
    cssVar: "--lh-heading-step--2",
    label: "Step -2",
    minPx: 16.33,
    maxPx: 14.06,
  },
  {
    cssVar: "--lh-heading-step--1",
    label: "Step -1",
    minPx: 18.07,
    maxPx: 17.59,
  },
  { cssVar: "--lh-heading-step-0", label: "Step 0", minPx: 20, maxPx: 22 },
  {
    cssVar: "--lh-heading-step-1",
    label: "Step 1",
    minPx: 22.13,
    maxPx: 27.52,
  },
  {
    cssVar: "--lh-heading-step-2",
    label: "Step 2",
    minPx: 24.49,
    maxPx: 34.43,
  },
  {
    cssVar: "--lh-heading-step-3",
    label: "Step 3",
    minPx: 27.11,
    maxPx: 43.07,
  },
  { cssVar: "--lh-heading-step-4", label: "Step 4", minPx: 30, maxPx: 53.89 },
  { cssVar: "--lh-heading-step-5", label: "Step 5", minPx: 33.2, maxPx: 67.41 },
  {
    cssVar: "--lh-heading-step-6",
    label: "Step 6",
    minPx: 36.74,
    maxPx: 84.34,
  },
  {
    cssVar: "--lh-heading-step-7",
    label: "Step 7",
    minPx: 40.66,
    maxPx: 105.51,
  },
  { cssVar: "--lh-heading-step-8", label: "Step 8", minPx: 38.49, maxPx: 132 },
];

// ---------------------------------------------------------------------------
// Space sizes — 3XS through 6XL
// ---------------------------------------------------------------------------

export const spaceSizes: FluidToken[] = [
  { cssVar: "--space-3xs", label: "3XS", minPx: 4, maxPx: 5 },
  { cssVar: "--space-2xs", label: "2XS", minPx: 8, maxPx: 10 },
  { cssVar: "--space-xs", label: "XS", minPx: 11, maxPx: 15 },
  { cssVar: "--space-s", label: "S", minPx: 15, maxPx: 20 },
  { cssVar: "--space-m", label: "M", minPx: 23, maxPx: 30 },
  { cssVar: "--space-l", label: "L", minPx: 30, maxPx: 40 },
  { cssVar: "--space-xl", label: "XL", minPx: 45, maxPx: 60 },
  { cssVar: "--space-2xl", label: "2XL", minPx: 60, maxPx: 80 },
  { cssVar: "--space-3xl", label: "3XL", minPx: 90, maxPx: 120 },
  { cssVar: "--space-4xl", label: "4XL", minPx: 120, maxPx: 160 },
  { cssVar: "--space-5xl", label: "5XL", minPx: 150, maxPx: 200 },
  { cssVar: "--space-6xl", label: "6XL", minPx: 180, maxPx: 240 },
];

// ---------------------------------------------------------------------------
// Space pairs — adjacent + custom
// ---------------------------------------------------------------------------

export const spacePairs: FluidToken[] = [
  { cssVar: "--space-3xs-2xs", label: "3XS-2XS", minPx: 4, maxPx: 10 },
  { cssVar: "--space-2xs-xs", label: "2XS-XS", minPx: 8, maxPx: 15 },
  { cssVar: "--space-xs-s", label: "XS-S", minPx: 11, maxPx: 20 },
  { cssVar: "--space-s-m", label: "S-M", minPx: 15, maxPx: 30 },
  { cssVar: "--space-m-l", label: "M-L", minPx: 23, maxPx: 40 },
  { cssVar: "--space-l-xl", label: "L-XL", minPx: 30, maxPx: 60 },
  { cssVar: "--space-xl-2xl", label: "XL-2XL", minPx: 45, maxPx: 80 },
  { cssVar: "--space-2xl-3xl", label: "2XL-3XL", minPx: 60, maxPx: 120 },
  { cssVar: "--space-3xl-4xl", label: "3XL-4XL", minPx: 90, maxPx: 160 },
  { cssVar: "--space-4xl-5xl", label: "4XL-5XL", minPx: 120, maxPx: 200 },
  { cssVar: "--space-5xl-6xl", label: "5XL-6XL", minPx: 150, maxPx: 240 },
  { cssVar: "--space-s-l", label: "S-L", minPx: 15, maxPx: 40 },
  { cssVar: "--space-xs-m", label: "XS-M", minPx: 11, maxPx: 30 },
];
