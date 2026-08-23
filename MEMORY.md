# Memory — Lessons from 2026-08-23

## Git Lock File Handling (Windows)

**Never loop on `.git/index.lock`.** The lock is held by a process with an open file handle (often TGitCache, explorer, or OneDrive). Standard `del` / `rm` will fail regardless of how many times you try.

### What to do instead
1. **Acknowledge the block immediately** — tell the user the situation and ask for help or a restart.
2. **Suggest simple user-side fixes**: kill TGitCache (`git-tfsync.exe` / `TGitCache.exe`), restart explorer, or reboot.
3. **Fall back to `Handle.exe` (Sysinternals)** only if available; otherwise stop and hand off.
4. **Check git status first** before retrying — the other side may have already committed/pushed while you were looping.

### Don't do
- Repeatedly try `del`, `Remove-Item`, `rename` on the lock file in a loop.
- Kill random PIDs found via `tasklist` without verifying they're actually holding the handle.
- Ignore the fact that Windows file handles persist across process kills sometimes.

---

## Turn Budget Discipline

When stuck on a technical blocker, **stop escalating attempts after 2–3 failures**. Switch modes:
- Ask the user directly what to do.
- Note the blocker and proceed with what's possible.
- Let the user handle it if it's a simple fix on their end.

Wasting turn budget on a single obstacle prevents all other work.

---

## State Verification Before Action

Before launching into operations that depend on repository state:
1. Run `git log --oneline -3` to see current HEAD.
2. Run `git status` to check for uncommitted changes.
3. Run `git log --oneline origin/main -3` to compare against remote.

This prevents:
- Re-committing work that's already been pushed.
- Pushing from a stale local branch.
- Wasting turns on already-solved problems.
