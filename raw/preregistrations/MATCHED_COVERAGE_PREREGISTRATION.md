# Same-coverage accuracy comparison: preregistration

**Version:** 0.1.0 | **Written:** 2026-09-29, before any number in it was computed | **Status:** PROVISIONAL

The drift test (docs/DRIFT_PREREGISTRATION.md, results in
docs/PRELIMINARY_RESULTS.md section 13) compared UMNA's served accuracy
with a shared network's. The two are not comparable as reported: UMNA's
accuracy counts a row it declines as not correct (it declined 5 to 12% of
audit rows and was right on over 99% of the rest), while the shared
network answers every row. This test scores both on the same share of
rows. Each script prints this file's SHA-256; changes afterwards go in
docs/MATCHED_COVERAGE_DEVIATIONS.md.

What was looked at before writing this: section 13's results, including
UMNA's coverage and its accuracy on answered rows at each task's first
stage. Nothing about the shared network's confidence has been computed.

## Data

The drift test's sequence, unchanged, recording per audit row: whether
UMNA accepted, its prediction when it accepted, and its fused score
(present on every row, declined or not); and the shared network's
probability. Seed 0 is the drift test as preregistered; its section 13
figures must come out unchanged, which is checked. Seeds 1 to 5 are the
drift test's multi-seed reruns (docs/MULTISEED_PREREGISTRATION.md).

## Measures, per task, seed and point

Two points: **first**, each task at the stage it was introduced; **final**,
every task after stage 6. UMNA is scored in both arms (no_cce, cce); the
shared network is the same one for both.

- **At UMNA's coverage.** c is the share of audit rows UMNA accepts; its
  selective accuracy is the share of those it gets right. The shared
  network answers the round(c n) rows on which its probability is
  furthest from 0.5 (ties by row order), and its selective accuracy is
  the share of those it gets right. Difference: shared minus UMNA.
- **At full coverage.** UMNA's forced answer on every row is its fused
  score at 0.5 or above; the shared network's is its probability at 0.5
  or above. Difference: shared minus UMNA.

Per seed, each difference is averaged over tasks: all six at the first
point, tasks 1 to 5 (the old ones) and task 6 separately at the final
point.

## Questions and reading rules

Across seeds 0 to 5 (six values of each averaged difference), a two-sided
95% t interval.

- **Q1, does the frozen Core cost accuracy when a task is first learned?**
  First point, no_cce, at UMNA's coverage. Interval above 0: the shared
  network is more accurate at the same coverage, so the frozen Core
  costs accuracy. Below 0: UMNA is more accurate. Straddling 0: no
  difference detected. The same reading at full coverage is reported.
- **Q2, prediction: after six tasks, UMNA is more accurate on the old
  tasks at the same coverage.** Final point, tasks 1 to 5, no_cce. Holds
  if the interval is entirely below 0 (shared minus UMNA).
- **Q3, reported:** the same differences for cce, for task 6 at the final
  point, and at full coverage; and seed 0 alone next to section 13.

## Deviations

Recorded in docs/MATCHED_COVERAGE_DEVIATIONS.md.
