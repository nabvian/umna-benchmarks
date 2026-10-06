# Gate minimum rows from the power calculation: preregistration

**Version:** 0.1.0 | **Written:** 2026-09-29, after the change to the gate and before any rerun | **Status:** PROVISIONAL

The multi-seed reruns (docs/PRELIMINARY_RESULTS.md section 17) found that
CCE's origin budget failed on qsar-biodeg on three of five replicates:
with 369 gate rows, gate and audit estimates of the same version differed
by up to 0.06, more than E. The drift gate now refuses to decide on fewer
rows than a one-sided non-inferiority test at margin E needs for its
tier's power (runtime/drift.py, `DriftGate.required_rows`):
((z_alpha + z_beta) sqrt(2 var(origin)) / E) squared, never below the
tier's floor. Nothing else changed. This reruns the three tests that use
the gate, on seeds 0 to 5, to see what the change buys and what it
costs. Each script prints this file's SHA-256; changes afterwards go in
docs/GATE_POWER_DEVIATIONS.md.

What was looked at before writing this: sections 15 to 17, and the
minimum the rule gives at each dataset's seed-0 origin accuracy (Tier B,
E = 0.05): about 293 rows for spambase (1610 available), 29 for
banknote (480), 424 for qsar-biodeg (369), and about 325 for a served
accuracy of 0.9 on the drift test's 300 gate rows.

## Tests

Unchanged scripts and seeds (replicate s as in
docs/MULTISEED_PREREGISTRATION.md), seeds 0 to 5, written to
bench/gate_power/ so the earlier results stay as they are:
bench.slow_harm_fine, bench.realdata2_cce, bench.drift_frozen_core.

## Predictions

- **PG1, the budget holds.** In the finer-step slow-harm test, cce serves
  no eroded version on any dataset on any of the six seeds.
- **PG2, where it refuses.** qsar-biodeg's gate is below the minimum on
  every seed, so cce promotes no candidate there; on spambase and
  banknote the gate is above it and cce still promotes candidates.
- **PG3, reported without a threshold.** C2's per-seed verdict under the
  new gate, and for each dataset whether cce promoted anything at all
  (a verdict that rests on promoting nothing is marked as such).
- **PG4, reported without a threshold.** In the drift test, how many old
  tasks' rounds are below the minimum, PD3, and PD5 (what pinning costs).
- **The fix is supported if PG1 holds on all six seeds.** PG2 to PG4 are
  its cost.

Two things this does not address, stated in advance: "eroded" is judged
on audit rows, themselves a finite sample; and each candidate in a
series is a new look at the same origin, at the same alpha, so the chance
that some eroded version passes grows with the number of looks.

## Deviations

Recorded in docs/GATE_POWER_DEVIATIONS.md.
