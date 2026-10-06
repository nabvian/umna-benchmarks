# Multi-seed reruns: preregistration

**Version:** 0.1.0 | **Written:** 2026-09-29, before any rerun | **Status:** PROVISIONAL

Every result in docs/PRELIMINARY_RESULTS.md sections 11 to 15 comes from
one seed. This reruns the tests behind the supported claims on five more
seeds and asks whether each claim holds on them. Each script prints this
file's SHA-256; changes afterwards go in docs/MULTISEED_DEVIATIONS.md.

What was looked at before writing this: the seed-0 results of every test
below. No other seed has been run.

## What a seed is

Every random number in these tests comes from a numpy generator created
with a fixed integer seed (the data shuffle, Wing initialisation and
batches, the estimator's sampled triples, the gate router, the shared
network, label shuffles). In replicate s, each of those generators is
created with the seed pair (original seed, s) instead. So the rows that
land in each split, every Wing's training, and every sampled set change;
the frozen Core, the task definitions, the datasets, the preregistered
rules and every hyperparameter do not. Seed 0 is the original run and is
not rerun, except the drift test, which the same-coverage comparison
needs again with per-row data (docs/MATCHED_COVERAGE_PREREGISTRATION.md);
its seed-0 figures must reproduce section 13. Replicates are 1 to 5.

## Tests and the claim each carries

| Test | Script | Claim (its preregistered verdict) | Section |
|---|---|---|---|
| Real data phase 2, N2 | bench.realdata2_nicer | H1 | 11b |
| Real data phase 2, C2 | bench.realdata2_cce | H3 | 11d |
| Capability routing | bench.capability_routing | capability routing hypothesis | 12b |
| Drift on the frozen Core | bench.drift_frozen_core | drift-control hypothesis | 13 |
| Finer-step slow harm | bench.slow_harm_fine | slow-erosion hypothesis | 15 |

H2 (N2) is reported, not judged: it was weak on seed 0 and its test
depends on which datasets composition helps on. Section 14's one-percent
slow-harm series is not rerun; section 15 supersedes it as the test of
the claim.

## Rule

For each claim, count the replicates (of 5) on which the test's own
preregistered verdict is "supported". A test that could not reach a
verdict on a replicate (no dataset qualifies, none is exercised)
counts as not supported there, and is reported as such.

- **Replicates:** supported on all 5.
- **Partly replicates:** supported on 3 or 4.
- **Does not replicate:** supported on 2 or fewer.

Also reported, mean and range over replicates: for N2, wins and losses
against greedy; for C2 and the slow-harm test, harmful or eroded
versions each arm served; for capability routing, NICE-R's own-task hit
rate and its wins and losses against both gates; for the drift test,
task_1's loss in the shared network, the largest drift of any old task
under cce, and PD5.

## Deviations

Recorded in docs/MULTISEED_DEVIATIONS.md.
