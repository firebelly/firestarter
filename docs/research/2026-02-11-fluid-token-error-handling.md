# Error handling for fluid token plugin

## Context

The Terrazzo fluid token plugin currently has no error handling. Bad input produces either cryptic runtime errors (`Cannot read properties of undefined`) or silently broken CSS output. This becomes a real problem once the Figma-to-PR pipeline is automated (Tokens Brucke push → GitHub Action → PR), since there's no human reviewing the raw token JSON before it hits the build.

## Timing

Implement error handling as part of the Figma-to-PR pipeline setup, not as a standalone task. The pipeline context informs what the error messages need to say and where they surface (CI logs, PR checks).

## Approach

Add validation directly in the plugin rather than a separate validation script. The build itself (`pnpm run tokens`) is the validation step — if it fails with clear messages, the GitHub Action flags the PR. No need for a separate pre-check that duplicates the same logic.

## Error categories

| Category                 | Trigger                                            | Example message                                                 |
| ------------------------ | -------------------------------------------------- | --------------------------------------------------------------- |
| Missing token            | A referenced token ID doesn't exist in the map     | `Token not found: "Utopia.Viewport.Min width"`                  |
| Missing mode             | A fluid token lacks a required Min or Max mode     | `Token "Fluid tokens.Space size.3XS" is missing "Min" mode`     |
| Unparseable value        | A value that should be numeric can't be parsed     | `Token "Utopia.Viewport.Min width" value "abc" is not a number` |
| Bad pair label           | A pair token's label can't be split on the em-dash | `Cannot parse pair label "3XS2XS" — expected em-dash separator` |
| Missing pair constituent | A pair references a size token that doesn't exist  | `Pair "3XS—FOO": token "Fluid tokens.Space size.FOO" not found` |

## Design considerations

- Error messages should identify the specific token that caused the problem, so a CI log points directly to what changed
- Collect all errors and report them together rather than failing on the first one. A single Figma export could break multiple tokens at once (e.g., a renamed group), and failing on the first means repeated CI round-trips to discover them all. One failed build should show the full picture.
- Consider whether errors should include suggestions (e.g., "did the token get renamed in Figma?") to help whoever triages the failed PR
