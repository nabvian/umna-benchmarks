# Slow-harm test of CCE: preregistration

**Version:** 0.1.0 | **Written:** 2026-09-29, before any candidate for this test was trained | **Status:** PROVISIONAL

CCE tests two things before it promotes a new version: step drift (the
candidate against the version serving now, tolerance epsilon) and origin
drift (the candidate against the first version, budget E). In experiment
C2 (docs/REALDATA2_PREREGISTRATION.md, results in
docs/PRELIMINARY_RESULTS.md section 11d) every harmful candidate already
failed the step test, so the origin test was never needed and its value
was not shown (PC3 failed). What the origin test is for is slow erosion:
a series of updates each within epsilon of the one before, adding up to
more than E. This test builds such a series and asks whether the origin
budget stops it. Each script prints this file's SHA-256; changes
afterwards go in docs/SLOW_HARM_DEVIATIONS.md.

What was looked at before writing this: C2's results, which used the same
harm at 10% steps (0%, 10%, 20%, ... poisoned). No candidate at the 1%
steps below has been trained.

## Datasets, splits and tolerances

As C2: every held-out OpenML CC18 dataset whose origin Wing clears its
majority floor by 0.10 on gate rows (the development dataset, Bioresponse,
excluded); training 40%, gate 35%, audit 25%; Tier B; E = 0.05; epsilon the
smallest of {0.01, 0.02, 0.03, 0.05} that C2's formula allows. Every round
is measured on the same gate rows and carries their ids, so the gate uses
the paired test. Audit rows are never shown to any gate.

## The series

The served system is one Wing alone, as in C2. Origin v0: clean labels.
Candidates c1 to c30: the same Wing retrained with the poisoned region at
1%, 2%, ..., 30% (labels inverted where the first feature is in its top
share; bench/realdata_harm_pilot.poisoned_region). Every version, origin
included, uses the same training seed (10) and steps, so the only thing
that changes from one candidate to the next is one more percent of
poisoned labels. The candidates are offered in order; a rejected
candidate is not served, and the next is compared with whatever is.

## Arms

- **no_gate**: promotes every candidate.
- **step_point**: promotes when the candidate's gate accuracy is within
  epsilon of the serving version's (point estimates).
- **step_origin_point**: as step_point, and within E of the origin's.
- **cce_step_only**: the CCE pipeline with the same epsilon and E = 1.0,
  so the origin test can never fail. Step test only, on bounds.
- **cce**: the CCE pipeline with epsilon and E = 0.05. Both tests, on
  bounds.

cce_step_only and cce differ only in E.

## Ground truth

On audit rows. A version is **eroded** if its audit accuracy is more than
E below the origin's.

## Predictions, per qualifying dataset

- **PS1, the series is slow enough to test the budget.** cce_step_only
  serves an eroded version at some point. If it does not, the step test
  alone stopped the harm and the dataset is recorded as not exercised; it
  neither supports nor refutes.
- **PS2, the origin budget stops the erosion.** cce never serves an
  eroded version.
- **PS3, reported without a threshold.** The candidate at which cce first
  rejects, and the audit accuracy each arm serves at the end of the series.
- **PS4, reported without a threshold.** How many candidates cce rejects
  that are not eroded and are within epsilon of the serving version on
  audit rows (what the bound costs).
- **Slow-erosion hypothesis on a dataset:** supported if PS1 and PS2 hold;
  not supported if PS1 holds and PS2 fails; not exercised if PS1 fails.
  **Overall:** not tested if no dataset is exercised; otherwise not
  supported if it is not supported on any exercised dataset; otherwise
  supported.

Also reported: for each dataset, the share of consecutive candidates
whose audit accuracies differ by less than epsilon (how slow the series
really was).

## Deviations

Recorded in docs/SLOW_HARM_DEVIATIONS.md.
