# Process overview

A reading-guide to how the work came together --- a map to your process, not an
essay about it. Markers read this file and follow its citations; they don't
trawl the repo for evidence you didn't point at, so if a moment mattered, cite
it.

## What I built

An explainer of why proteins fold the way they do, built around a small
playable HP-model: a chain of Hydrophobic/Polar residues that the visitor
folds themselves, one step at a time on a grid, watching an energy score
change as hydrophobic residues get buried or left exposed. A "reveal the
optimal fold" button runs an exhaustive search for the true minimum-energy
fold and shows it side by side with the visitor's own attempt, so the point
of the whole page --- that water forces the fold, the protein doesn't choose
it --- has something concrete to click against.

## The moments that mattered

1. **A half-finished feature had left the build broken.** `hp-model.ts` had
   already been rewritten to generate a random sequence at a chosen length
   instead of a fixed one, but `main.ts` still imported the removed export in
   six places, so `pnpm check` failed at typecheck before the build ever ran.
   Rather than revert the model change, I read `hp-model.ts`'s own comments
   (the length ceiling is picked from benchmarking how long the exhaustive
   optimal-fold search stays fast) and finished the feature it was clearly
   building towards: wired a range input in `index.html` to regenerate the
   sequence and reset the board on change. I knew it was right when
   `pnpm check` went from a typecheck failure to fully green: 26 passing
   tests, clean build, clean lint
   ([`74f35e0`](https://github.com/comp4020-agentic-coding-studio/comp4020-ass1-OLDecker/commit/74f35e0)).

2. **A visibility bug that no test caught.** The "your fold vs. optimal fold"
   comparison panels have a `hidden` attribute in the markup, but they were
   rendering on page load anyway --- and `pnpm check` stayed green the whole
   time, because the interaction spec only asserts that the elements exist,
   not what they look like. I only found this by actually opening the
   rendered page and taking a full-page screenshot, per the harness's own
   standing instruction ("the rendered page is the truth; your mental model of
   it isn't"). The cause was `.comparison { display: flex; }` beating the UA
   `[hidden]` default on a specificity tie. I added the explicit override and
   confirmed it with a second screenshot showing the panels correctly hidden
   until "Reveal the optimal fold" is clicked. Since no automated check in
   this repo would have caught a regression here, I wrote the failure mode
   into `CLAUDE.md` as a rule for any future `hidden`-toggled element, rather
   than just fixing this one instance
   ([`b199bff`](https://github.com/comp4020-agentic-coding-studio/comp4020-ass1-OLDecker/commit/b199bff)).

3. **Splitting one working tree into commits that each stand on their own.**
   A background-image feature, the chain-length slider, and the visibility
   bugfix above had all landed in the same uncommitted working tree, touching
   overlapping files (`styles.css`, `index.html`). Instead of one combined
   commit, I used `git add -p` to stage exactly the hunks belonging to each
   concern, and `git stash push --keep-index` to run `pnpm check` against
   each staged subset in isolation before committing it --- so each commit is
   independently buildable and independently correct, not just correct in
   combination
   ([`7a9ca45...b199bff`](https://github.com/comp4020-agentic-coding-studio/comp4020-ass1-OLDecker/compare/7a9ca45...b199bff)).

## Before you ship

`pnpm check:evidence` verifies your citations resolve to real commits, that the
current reflection entry is in `reflections/`, and that your `CLAUDE.md` is
there --- before a marker ever opens the file. It checks that your map is
traceable, not that it is good: the marker judges whether your small,
deliberately chosen set of moments shows real judgement and reflection. A green
check is not a substitute for that curation.
