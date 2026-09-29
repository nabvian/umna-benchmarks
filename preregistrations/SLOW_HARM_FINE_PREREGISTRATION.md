# Finer-step slow-harm test of CCE: preregistration

**Version:** 0.1.0 | **Written:** 2026-09-29, before any candidate for this test was trained | **Status:** PROVISIONAL

The slow-harm test (docs/SLOW_HARM_PREREGISTRATION.md, results in
docs/PRELIMINARY_RESULTS.md section 14) supported the origin budget on
the one dataset it exercised, qsar-biodeg. On spambase and banknote it
was not exercised: at one percent per step, the step test on bounds
stopped the erosion by itself. One step came out inconclusive, the
serving version stopped moving, and every later candidate was further
from it. This test makes the steps as small as the data allows, so that
the step test has as little as possible to catch, and asks again whether
the origin budget holds. Each script prints this file's SHA-256; changes
afterwards go in docs/SLOW_HARM_FINE_DEVIATIONS.md.

What was looked at before writing this: the section 14 results. The step
size below was chosen because of them; that is why this is a new
preregistration and not a rerun.

## What is the same as section 14

Datasets and the rule that qualifies them, splits, Tier B, E = 0.05,
epsilon by C2's formula, paired rounds on the same gate rows, the served
system (one Wing alone), the training seed (10) and steps for every
version, the five arms (no_gate, step_point, step_origin_point,
cce_step_only with E = 1.0, cce), and the ground truth: a version is
eroded if its audit accuracy is more than E below the origin's.

## What changes: one label per step

Candidate k has exactly k training labels inverted: those of the k rows
with the largest first feature (ties broken by row order). k runs from 1
to 30% of the training rows, rounded down, one at a time. Section 14's
region flipped every row tied at the cut together, so on a feature with
many equal values (spambase's first feature is mostly zero) one step
could flip hundreds of labels; here no step flips more than one.

## Predictions, per qualifying dataset

- **PF1, the series is slow enough to test the budget.** cce_step_only
  serves an eroded version at some point. If it does not, the dataset is
  not exercised.
- **PF2, the origin budget stops the erosion.** cce never serves an
  eroded version.
- **PF3, reported without a threshold.** How many candidates
  cce_step_only rejected before it first served an eroded version; the
  candidate at which cce first rejects; the audit accuracy each arm
  serves at the end.
- **PF4, reported without a threshold.** How many candidates cce rejects
  that are not eroded and are within epsilon of the serving version on
  audit rows.
- **Slow-erosion hypothesis on a dataset:** supported if PF1 and PF2 hold;
  not supported if PF1 holds and PF2 fails; not exercised if PF1 fails.
  **Overall:** not tested if no dataset is exercised; otherwise not
  supported if it is not supported on any exercised dataset; otherwise
  supported.

## Deviations

Recorded in docs/SLOW_HARM_FINE_DEVIATIONS.md.
