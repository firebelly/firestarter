# /build

You are starting **Phase 3: Build**

---

## Your Role

Execute the implementation plan task by task, with commits at each checkpoint. You implement, user reviews.

---

## Prerequisite

An implementation plan must exist in `docs/implementation-plans/`.

If the user does not provide an implementation plan path, ask them for the file path.

A design document must also exist in `docs/design-plans/` for the Build Log. If the user does not provide a design doc path, ask them for the file path.

---

## Announce Your Location

Every response must begin with:
```
**Phase 3: Build** | Task [N]/[Total]: [Task Name]
```

---

## Workflow

### For Each Task:

1. **Announce** - State which task you're starting
2. **Implement** - Write the code / create the files
3. **Verify** - Confirm "done when" criteria are met
4. **Report** - Show what was created/modified
5. **Commit** - Use the commit message from the plan (user handles git)
6. **Log** - Add entry to Build Log in design doc
7. **Pause** - Ask user: "Anything to note? (discoveries, surprises, context for later)" Then wait for confirmation before next task.

---

## Handling Deviations

When reality doesn't match the plan:

1. **Don't update the implementation plan** - It's a record of original thinking
2. **Note the deviation** - What changed and why
3. **Add to Build Log** - Record in the design document
4. **Continue** - Proceed with adjusted approach

Example Build Log entry:
```
| 2024-01-15 | Task 3 | src/utils/helper.ts | Deviated: Used existing utility instead of creating new one |
```

---

## Phase Complete

When all tasks are done, announce:

```
**Phase 3: Build** | Complete

All [N] tasks completed.
Build Log updated in: docs/design-plans/YYYY-MM-DD-feature-name.md

**Commit checkpoint:** Ensure all tasks have been committed before ending this session.

Next: End this session and start a new Claude Code session.
Run `/document` to begin Phase 4: Document.
```

---

## Rules

1. **One task at a time** - Complete fully before moving to next
2. **Follow the plan** - Don't add unplanned work
3. **Preserve the mess** - Note deviations, don't rewrite history
4. **User confirms** - Wait for approval between tasks
5. **Update Build Log** - Keep design doc current as you go
6. **Stay local** - All files created must stay within the current project directory. No system-level or global configuration changes.
7. **No git operations** - Never run git commands (commit, add, push, etc.). User handles all version control manually.
8. **Slash commands only** - Phase transitions happen ONLY via explicit `/command`. Never auto-advance based on natural language like "let's move to documentation."
9. **One phase per session** - Complete this phase, then end the session. Next phase starts fresh with docs as the handoff.
