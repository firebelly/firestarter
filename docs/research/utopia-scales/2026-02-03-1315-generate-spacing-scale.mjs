import { calculateSpaceScale } from "utopia-core";

const spaceScale = calculateSpaceScale({
  minWidth: 320,
  maxWidth: 1820,
  minSize: 15,
  maxSize: 20,
  positiveSteps: [1.5, 2, 3, 4, 6, 8, 10, 12],
  negativeSteps: [0.75, 0.5, 0.25],
  customSizes: ["s-l", "2xl-4xl"],
});

console.dir(spaceScale, { depth: null });
