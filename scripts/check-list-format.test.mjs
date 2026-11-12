import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  checkListFormat,
  slugify,
  compareNames,
  findBannedAdjective,
  findTrackingParam,
  countDescriptionWords,
  checkDescriptionLengths,
  DESCRIPTION_WORD_WARNING_THRESHOLD,
} from './check-list-format.mjs';

const FREE = '![free](https://img.shields.io/badge/free-2489CA?style=flat-square)';
const FREEMIUM = '![freemium](https://img.shields.io/badge/freemium-F5A623?style=flat-square)';

// A minimal, fully-valid README + CONTRIBUTING pair. Each negative test starts
// from these and introduces exactly one defect via string replacement.
const VALID_README = `# Title

## Table of Contents

- [Alpha](#alpha)
- [Beta](#beta)

## Alpha

<details open>
<summary>Show resources</summary>

- **[Apple](https://apple.example)** - A fruit tool ${FREE}.
- **[Banana](https://banana.example)** - Another fruit tool ${FREE}.

</details>

## Beta

<details open>
<summary>Show resources</summary>

- **[Cherry](https://cherry.example)** - A small red fruit ${FREE}.

</details>
`;

const VALID_CONTRIBUTING = `# Contributing

## Where it goes

- Alpha
- Beta

## Submitting

Go.
`;

function errorsFor(readme = VALID_README, contributing = VALID_CONTRIBUTING) {
  return checkListFormat(readme, contributing);
}

test('valid fixture produces no errors', () => {
  assert.deepEqual(errorsFor(), []);
});

test('malformed entry (no trailing period) is flagged', () => {
  const readme = VALID_README.replace(
    `- **[Apple](https://apple.example)** - A fruit tool ${FREE}.`,
    `- **[Apple](https://apple.example)** - A fruit tool ${FREE}`
  );
  const errors = errorsFor(readme);
  assert.equal(errors.length, 1);
  assert.match(errors[0], /doesn't match .*format/);
});

test('malformed entry (plain link, no bold) is flagged', () => {
  const readme = VALID_README.replace(
    `- **[Apple](https://apple.example)** - A fruit tool ${FREE}.`,
    `- [Apple](https://apple.example) - A fruit tool ${FREE}.`
  );
  const errors = errorsFor(readme);
  assert.ok(errors.some((e) => /doesn't match .*format/.test(e)));
});

test('out-of-order entries are flagged', () => {
  const readme = VALID_README.replace(
    `- **[Apple](https://apple.example)** - A fruit tool ${FREE}.
- **[Banana](https://banana.example)** - Another fruit tool ${FREE}.`,
    `- **[Banana](https://banana.example)** - Another fruit tool ${FREE}.
- **[Apple](https://apple.example)** - A fruit tool ${FREE}.`
  );
  const errors = errorsFor(readme);
  assert.ok(errors.some((e) => /not alphabetically sorted/.test(e)));
});

test('alphabetical order is case-insensitive', () => {
  // "apple" (lowercase) before "Banana" must still pass.
  const readme = VALID_README.replace(
    `- **[Apple](https://apple.example)** - A fruit tool ${FREE}.`,
    `- **[apple](https://apple.example)** - A fruit tool ${FREE}.`
  );
  assert.deepEqual(errorsFor(readme), []);
});

test('duplicate URL within a section is flagged', () => {
  const readme = VALID_README.replace(
    `- **[Banana](https://banana.example)** - Another fruit tool ${FREE}.`,
    `- **[Banana](https://apple.example)** - Another fruit tool ${FREE}.`
  );
  const errors = errorsFor(readme);
  assert.ok(errors.some((e) => /Duplicate URL/.test(e)));
});

test('same URL across different sections is allowed', () => {
  // Cherry (in Beta) reuses Apple's URL (in Alpha) — cross-section reuse is fine.
  const readme = VALID_README.replace(
    `- **[Cherry](https://cherry.example)** - A small red fruit ${FREE}.`,
    `- **[Cherry](https://apple.example)** - A small red fruit ${FREE}.`
  );
  assert.deepEqual(errorsFor(readme), []);
});

test('heading missing from the Table of Contents is flagged', () => {
  const readme = VALID_README.replace('- [Beta](#beta)\n', '');
  const errors = errorsFor(readme);
  assert.ok(errors.some((e) => /missing from the Table of Contents/.test(e)));
});

test('Table of Contents entry with no matching heading is flagged', () => {
  const readme = VALID_README.replace('- [Beta](#beta)', '- [Beta](#beta)\n- [Ghost](#ghost)');
  const errors = errorsFor(readme);
  assert.ok(errors.some((e) => /doesn't match any section heading/.test(e)));
});

test('marketing adjective in a description is flagged', () => {
  const readme = VALID_README.replace(
    `- **[Apple](https://apple.example)** - A fruit tool ${FREE}.`,
    `- **[Apple](https://apple.example)** - An amazing fruit tool ${FREE}.`
  );
  const errors = errorsFor(readme);
  assert.ok(errors.some((e) => /marketing adjective.*amazing/.test(e)));
});

test('CONTRIBUTING missing a README section is flagged', () => {
  const contributing = VALID_CONTRIBUTING.replace('- Beta\n', '');
  const errors = errorsFor(VALID_README, contributing);
  assert.ok(errors.some((e) => /"Beta".*missing from CONTRIBUTING/.test(e)));
});

test('CONTRIBUTING listing a non-existent section is flagged', () => {
  const contributing = VALID_CONTRIBUTING.replace('- Beta', '- Beta\n- Gamma');
  const errors = errorsFor(VALID_README, contributing);
  assert.ok(errors.some((e) => /"Gamma".*isn't a README content section/.test(e)));
});

test('CONTRIBUTING in a different order than README is flagged', () => {
  const contributing = VALID_CONTRIBUTING.replace('- Alpha\n- Beta', '- Beta\n- Alpha');
  const errors = errorsFor(VALID_README, contributing);
  assert.ok(errors.some((e) => /different order/.test(e)));
});

test('trailing " (...)" notes in CONTRIBUTING bullets are ignored when matching', () => {
  const contributing = VALID_CONTRIBUTING.replace('- Alpha', '- Alpha (Apples, Bananas)');
  assert.deepEqual(errorsFor(VALID_README, contributing), []);
});

test('an entry with no badge at all is fine (the list is free-only; no per-entry tags)', () => {
  const readme = VALID_README.replace(
    `- **[Apple](https://apple.example)** - A fruit tool ${FREE}.`,
    `- **[Apple](https://apple.example)** - A fruit tool.`
  );
  assert.deepEqual(errorsFor(readme), []);
});

// --- Exported helpers ---

test('an entry URL with a tracking parameter is flagged with its line number', () => {
  const readme = VALID_README.replace(
    '(https://apple.example)',
    '(https://apple.example/?utm_source=github-awesome&utm_medium=list)'
  );
  const errors = errorsFor(readme);
  assert.equal(errors.length, 1);
  assert.match(errors[0], /README\.md:\d+ .*Apple.*tracking or referral parameter \("utm_source"\)/);
});

test('an entry URL with a legitimate query string passes', () => {
  const readme = VALID_README.replace('(https://apple.example)', '(https://apple.example/page?id=123&lang=en)');
  assert.deepEqual(errorsFor(readme), []);
});

test('findTrackingParam recognises utm_*, fbclid, gclid, ref, ref_* and referral', () => {
  for (const name of ['utm_source', 'UTM_Campaign', 'fbclid', 'gclid', 'ref', 'ref_src', 'referral', 'referral_code']) {
    assert.equal(findTrackingParam(`https://a.example/?${name}=x`), name, name);
  }
});

test('findTrackingParam ignores look-alike names, other parameters and unparseable URLs', () => {
  for (const url of [
    'https://a.example/',
    'https://a.example/?id=1',
    'https://a.example/?preference=1',
    'https://a.example/?reference=1',
    'https://a.example/?source=utm_ok',
    'https://a.example/#ref=1',
    'not a url',
  ]) {
    assert.equal(findTrackingParam(url), null, url);
  }
});

test('slugify matches GitHub anchor rules', () => {
  assert.equal(slugify('Exam & Curriculum Prep'), 'exam--curriculum-prep');
  assert.equal(slugify('Notes & Knowledge Management'), 'notes--knowledge-management');
  assert.equal(slugify('Building Software / Learn to Code'), 'building-software--learn-to-code');
});

test('compareNames is case-insensitive', () => {
  assert.ok(compareNames('apple', 'Banana') < 0);
  assert.ok(compareNames('Banana', 'apple') > 0);
  assert.equal(compareNames('Apple', 'apple'), 0);
});

test('findBannedAdjective matches hyphen and space variants, respects word boundaries', () => {
  assert.equal(findBannedAdjective('a powerful tool'), 'powerful');
  assert.equal(findBannedAdjective('a game-changing tool'), 'game-changing');
  assert.equal(findBannedAdjective('a game changing tool'), 'game-changing');
  assert.equal(findBannedAdjective('reliable power tools listed here'), null);
  assert.equal(findBannedAdjective('clear, plain description'), null);
});

test('countDescriptionWords ignores trailing badges and the closing period', () => {
  assert.equal(countDescriptionWords(`One two three ${FREE}.`), 3);
  assert.equal(countDescriptionWords(`One two three ${FREEMIUM}.`), 3);
  assert.equal(countDescriptionWords('One two three.'), 3);
});

test('checkDescriptionLengths is silent for descriptions at or under the threshold', () => {
  const readme = `## Alpha

- **[Apple](https://apple.example)** - ${'word '.repeat(DESCRIPTION_WORD_WARNING_THRESHOLD).trim()} ${FREE}.
`;
  assert.deepEqual(checkDescriptionLengths(readme), []);
});

test('checkDescriptionLengths warns once a description runs past the threshold', () => {
  const longDesc = 'word '.repeat(DESCRIPTION_WORD_WARNING_THRESHOLD + 1).trim();
  const readme = `## Alpha

- **[Apple](https://apple.example)** - ${longDesc} ${FREE}.
`;
  const warnings = checkDescriptionLengths(readme);
  assert.equal(warnings.length, 1);
  assert.match(warnings[0], /"Apple" description is \d+ words/);
});

test('checkListFormat does not fail on an over-length description (advisory only)', () => {
  const longDesc = 'word '.repeat(DESCRIPTION_WORD_WARNING_THRESHOLD + 5).trim();
  const readme = VALID_README.replace(
    `- **[Apple](https://apple.example)** - A fruit tool ${FREE}.`,
    `- **[Apple](https://apple.example)** - ${longDesc} ${FREE}.`
  );
  assert.deepEqual(errorsFor(readme), []);
});
