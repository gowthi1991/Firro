# How to start the overnight build

Prerequisites (one-time): Node 20+, git, GitHub CLI logged in (`gh auth status`), Claude Code installed.

```bash
git clone https://github.com/gowthi1991/Firro.git firro-build
cd firro-build
unzip ~/Downloads/firro-site-handoff.zip     # adds CLAUDE.md and handoff/ at the repo root
claude --dangerously-skip-permissions
```

Then paste the contents of `handoff/PROMPT.md` into Claude Code and leave it running.

- `--dangerously-skip-permissions` lets it work without stopping for approvals. Only use it in
  this fresh clone, never in a folder with other projects or secrets.
- If the session stops, resume with `claude --dangerously-skip-permissions -c` and say
  "continue from docs/PLAN.md".
- In the morning: open the PR, read docs/PR_BODY.md, then `npm install && npm run dev` to try it.
