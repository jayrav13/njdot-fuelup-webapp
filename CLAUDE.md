# CLAUDE.md

## Workflow: every change is an issue, resolved by a PR

The default branch is `main`. Never commit directly to it.

1. **Issue first.** Before changing anything in the repo, make sure a GitHub issue describes the problem or goal. Reuse an existing issue if one covers the work; otherwise open one (`gh issue create`) with the problem, the proposed approach, and acceptance criteria.
2. **Branch per issue.** Branch off the latest `main` as `<type>/<issue-number>-<short-slug>`, where `<type>` is `fix`, `feat`, `docs`, or `chore` (e.g. `fix/1-boot-on-modern-ruby`).
3. **PR to resolve it.** Open a pull request against `main` whose description starts with `Fixes #<n>` (or `Closes #<n>`) so merging closes the issue, and says how the change was tested.
4. **One issue per PR.** If unrelated work turns up along the way, open a new issue for it rather than widening the current PR.

Reading code, answering questions, and running the app locally don't need an issue; any change that will be committed does.

## Project

Next.js (App Router) + TypeScript + Tailwind CSS, SQLite via Drizzle ORM and libSQL. See README.md for setup and scripts.

- Before opening a PR, run `npm run lint && npm run typecheck && npm test && npm run build` (CI runs the same, plus `npm run db:migrate`).
- Never commit secrets: the Google Maps key lives in `.env.local` (and `.map_key` locally), both gitignored.
- Data: `data/source/*.csv` are the NJDOT exports (values verbatim; never re-save them through Excel, which strips leading zeros from structure numbers); `drizzle/0001_import_njdot_2017_data.sql` is generated from them by `npm run db:generate-data`. Don't hand-edit it; change the parsers in `src/lib/source/` and regenerate. New data goes in a new migration.
- Bridge coordinates in the source are packed DMS (`DD.MMSSss`), decoded in `src/lib/coordinates.ts`; structure numbers are 7-character strings with leading zeros, searched via `structureNumberKey`.

@AGENTS.md
