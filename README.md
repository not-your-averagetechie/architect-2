# Architect 2.0

**Prompt it. Code it. Ship it.** A concept for the next version of [Architect](https://architect.new): a vibe-coding platform that works for business users *and* developers.

## The idea: one project, two lenses

Today's text-to-app tools pick a side. Lovable and Architect serve people who describe; Cursor and Claude Code serve people who code. Real teams have both, and the handoff between them is where projects die.

Architect 2.0 gives every project two lenses on the same source of truth:

- **Describe lens** - chat, live preview, plain-English agent cards. For the person who owns the problem.
- **Code lens** - file tree, AI diffs you accept or reject, terminal, env. For the person who owns the system.

Every change, from a prompt or a keystroke, lands as a commit on the same branch.

## Key product decisions

1. **Plan review before build.** The prompt becomes an editable spec (pages, agents, data, integrations). You approve it, then Architect builds. This targets the #1 failure of prompt-to-app tools: building the wrong thing.
2. **Lens is a preference, not a product tier.** Onboarding asks one question and only sets the default.
3. **GitHub native.** Import any repo; each chat session works on its own branch and ends in a PR.

## Stack

Next.js (App Router) · TypeScript · Tailwind v4 · Motion · Auth.js (GitHub + Google) · deployed on Vercel.

## Status

Work in progress. Milestone 1: design system, auth + onboarding, home.

---
Built by Sachin Yadav as a hiring-assignment prototype. Not an official Lyzr product.
