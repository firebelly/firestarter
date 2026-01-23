# /document

You are starting **Phase 4: Document**

---

## Your Role

Complete project documentation and update developer-facing docs. This is the final phase.

---

## Prerequisite

Build phase must be complete.

If the user does not provide a design doc path, ask them for the file path.

Then locate the corresponding implementation plan in `docs/implementation-plans/` and the changelog at `docs/changelog.md`.

---

## Announce Your Location

Every response must begin with:
```
**Phase 4: Document** | Step [N]: [Step Name]
```

---

## Steps

### Step 1: Load and Summarize

- Read the design document
- Locate the corresponding implementation plan
- Review the Build Log entries
- Summarize what was built and any deviations noted
- Confirm this is the correct feature to document

### Step 2: Complete Design Document

Update the design document:

1. **Fill in Completion section:**
   - Completed date
   - Final status (Complete | Partial | Abandoned)
   - Summary of what was actually built
   - Deviations from original plan

2. **Update Status** at top of document to "Complete"

3. **Review Build Log** - Ensure it captures the full build history

### Step 3: Update Changelog

Append an entry to `docs/changelog.md`:

```markdown
## YYYY-MM-DD: Feature Name

Brief description of what was built.

**Design:** [link to design doc]
**Plan:** [link to implementation plan]
**Key files:** list of main files created/modified
```

### Step 4: Update README (if applicable)

If the feature adds user-facing functionality:
- Add or update relevant README sections
- Keep README as a comprehensive standalone reference
- Do not mention this Claude workflow (that's internal tooling)

Skip this step if the feature doesn't affect the README.

### Step 5: Final Notes

Ask user: "Anything to note? (discoveries, surprises, or context not captured in the Build Log)"

Incorporate any final notes into the design document's Completion section.

---

## Phase Complete

When documentation is complete, announce:

```
**Phase 4: Document** | Complete

Documentation updated:
- Design doc completed: docs/design-plans/YYYY-MM-DD-feature-name.md
- Changelog updated: docs/changelog.md
- README: [updated | no changes needed]

**Commit checkpoint:** Commit the documentation updates before ending this session.

Feature complete! The workflow cycle is finished.
```

---

## Rules

1. **Accurate history** - Document what actually happened, not what was planned
2. **User-facing only** - README updates should help future developers, not document process
3. **Complete the loop** - Don't skip this phase; documentation is part of done
4. **Stay local** - All files created must stay within the current project directory. No system-level or global configuration changes.
5. **No git operations** - Never run git commands (commit, add, push, etc.). User handles all version control manually.
6. **Slash commands only** - Phase transitions happen ONLY via explicit `/command`. This is the final phase, but the rule applies if restarting the workflow.
7. **One phase per session** - Complete this phase, then end the session. The workflow cycle is complete.
