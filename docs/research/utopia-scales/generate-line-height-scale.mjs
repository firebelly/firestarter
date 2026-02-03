import { calculateClamp } from 'utopia-core';
import { readFileSync } from 'fs';

const tokens = JSON.parse(readFileSync('./src/tokens/design.tokens.json', 'utf-8'));

const minWidth = 320;
const maxWidth = 1820;

const lhMin = tokens['type-primitives']['Line height @min'];
const lhMaxBody = tokens['type-primitives']['Line height body @max'];
const lhMaxHeading = tokens['type-primitives']['Line height heading @max'];

const steps = [8, 7, 6, 5, 4, 3, 2, 1, 0, -1, -2, -3, -4, -5];

const bodyScale = steps.map((step) => {
  const key = `Step ${step}`;
  const min = parseFloat(lhMin[key].$value);
  const max = parseFloat(lhMaxBody[key].$value);
  return {
    step,
    min,
    max,
    clamp: calculateClamp({ minWidth, maxWidth, minSize: min, maxSize: max }),
  };
});

const headingScale = steps.map((step) => {
  const key = `Step ${step}`;
  const min = parseFloat(lhMin[key].$value);
  const max = parseFloat(lhMaxHeading[key].$value);
  return {
    step,
    min,
    max,
    clamp: calculateClamp({ minWidth, maxWidth, minSize: min, maxSize: max }),
  };
});

console.log('Body:');
console.dir(bodyScale, { depth: null });

console.log('\nHeading:');
console.dir(headingScale, { depth: null });
