import { calculateTypeScale } from "utopia-core";

const typeScale = calculateTypeScale({
  minWidth: 320,
  maxWidth: 1820,
  minFontSize: 15,
  maxFontSize: 20,
  minTypeScale: 1.1472,
  maxTypeScale: 1.27537,
  positiveSteps: 8,
  negativeSteps: 5,
});

console.dir(typeScale, { depth: null });
