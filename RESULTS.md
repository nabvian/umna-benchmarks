# Results, test by test

**Version:** 0.1.0

In the order they were run, all on 2026-09-29. Each entry names its
preregistration in `preregistrations/` and its raw output in `results/`
(see `results/INDEX.md`). Accuracy is on audit rows that no gate or
router ever saw.

## 1. Composition benchmark (synthetic)

*Preregistration:* COMPOSITION_PREREGISTRATION.md.
*Question:* on a task family built so that two Wings are complementary,
does NICE-R find the pair?

The pair is real: under log-odds fusion it is right 91.8% of the time
against 72% for its better half. Greedy, beam, density and exhaustive
search find it. NICE-R did not: at its per-Wing cost it answered with
one Wing. H2 not supported for NICE-R on this family. The first run
predates a code audit; both it and the rerun are kept.

## 2. Real data, phase 1

*Preregistration:* REALDATA_PREREGISTRATION.md, with deviations.
Seven OpenML CC18 datasets; Bioresponse for development only.

- **N, NICE-R against simpler planners.** Its per-Wing cost, tuned on
  Bioresponse and carried over, made it answer with one Wing on every
  held-out row. H1 partly supported.
- **C, CCE under a series of real updates (spambase).** The harm, labels
  flipped up to 45%, did not reach the served system: fusion with three
  untouched Wings kept it between 0.913 and 0.923 while the updated Wing
  itself fell from 0.907 to 0.652. CCE caught the Wing's drift. It also
  refused two of three harmless retrains as inconclusive. Two defects in
  the promotion gate were found and fixed.
- **T, the trace against a conventional log, under injected faults.**
  Wrong version, hardware and fusion mismatches were localised from the
  trace every time and from the log never, largely because the log has
  no field for them. A corrupted calibrator was invisible to both. Two
  faults were aimed at a Wing the system never served, so tested
  nothing.
- **After four fixes** (a calibrator fingerprint, the admission reason
  and per-Wing latency in the trace, a paired drift test): the corrupted
  calibrator was localised 20 of 20 times, and CCE refused one harmless
  retrain of three instead of two.

## 3. Real data, phase 2

*Preregistration:* REALDATA2_PREREGISTRATION.md, with deviations.

- **The per-Wing cost is set by a rule**, per deployment: the value, of
  0, 0.02, 0.05, 0.1 and 0.2, with the best net correct rate on
  validation rows, ties to the larger.
- **N2.** With the rule, NICE-R against greedy: 8 wins, 2 losses in 14
  cells, H1 supported on this seed (see section 9: it does not
  replicate). Combining Wings helped on one dataset (qsar-biodeg), where
  NICE-R tied greedy. H2 weak.
- **Harm pilot** (development dataset only) chose a harm that reaches
  the served system: labels inverted in one region of the input space,
  with the updated Wing served alone.
- **C2.** On all three qualifying datasets CCE promoted none of 15
  harmful versions and never served one more than E below the first
  version; with no gate the served accuracy fell to 0.070, 0.528 and
  0.430. The step test alone caught every harmful version here, so the
  cumulative budget was not needed (section 5).

## 4. Capability routing

*Preregistration:* CAPABILITY_ROUTING_PREREGISTRATION.md, with deviations.
*Question:* four tasks on UCI Multiple Features, three Wings each, plus
distractor Wings; NICE-R is not told which Wing belongs to which task.
Does it route each request to its task's Wings, and does it beat a
normal gating router?

The preregistered run is **invalid**: the utility estimator failed
silently (predicted zero for every candidate on three tasks), so every
estimator-based planner routed blind. It is kept. After the fix, the
rerun: NICE-R served its task's Wings on every row; 7 wins, 0 losses
against a top-1 gate and 8, 0 against a top-2 gate. It matches simpler
planners that use the same estimator, and is cheaper under a loose
budget. HC supported.

## 5. Drift on the frozen Core

*Preregistration:* DRIFT_PREREGISTRATION.md.
Six tasks added one at a time. UMNA trains three Wings per task through
the frozen Core; the comparison is one shared network fine-tuned task by
task.

- The Core's hash never changed and every old Wing's outputs stayed
  bit-identical.
- Old tasks' served answers still moved, because the planner started
  using new Wings: on one task every audit row was rerouted, and its
  accuracy fell 0.017. CCE kept every old task within E.
- The shared network forgot: its first task fell from 0.963 to 0.743.
  UMNA's old tasks moved by at most 0.017.

## 6. Slow harm, one percent per step

*Preregistration:* SLOW_HARM_PREREGISTRATION.md.
Thirty versions, each with one more percent of the poisoned region. CCE
against the same gate with the cumulative budget switched off. The budget
was needed on one dataset (qsar-biodeg: the step test alone let the Wing
fall from 0.817 to 0.616; CCE held it at 0.821). On the other two the
step test stopped the erosion by itself, because one borderline step was
refused and every later version was then compared with the same one.

## 7. Slow harm, one label per step

*Preregistration:* SLOW_HARM_FINE_PREREGISTRATION.md.
Each version inverts one more training label. On spambase the step test
alone passed all 552 versions and let accuracy fall from 0.907 to 0.683;
CCE held at 0.863. On qsar-biodeg, the same pattern. On banknote one label
already moves several gate rows, which the step test refuses, so the
series could not test the budget there. An origin check on point
estimates, without bounds, served eroded versions on two datasets.

## 8. Accuracy at the same coverage

*Preregistration:* MATCHED_COVERAGE_PREREGISTRATION.md.
UMNA declines rows it cannot answer with calibrated confidence (5 to 12%
here), so its plain accuracy undercounts. Scored on the same share of
rows as a shared network, over six seeds, shared minus UMNA:

| When | Difference | 95% interval |
|---|---|---|
| A task first learned | -0.009 | [-0.013, -0.005] |
| Old tasks after six | -0.106 | [-0.145, -0.067] |
| Newest task after six | -0.003 | [-0.013, +0.007] |

UMNA is slightly more accurate when a task is learned and well ahead on
old tasks. This compares UMNA as built (several small Wings, chosen and
fused) with the simplest fine-tuning baseline; it does not show that
freezing a Core is free in general.

## 9. Multi-seed reruns

*Preregistration:* MULTISEED_PREREGISTRATION.md.
Five further seeds for each supported claim. A claim replicates if its
own preregistered verdict holds on all five.

| Claim | Supported on | Result |
|---|---|---|
| H3, harmful updates | 5 of 5 | Replicates; 0 of 75 poisoned versions promoted |
| HC, capability routing | 4 of 5 | Partly; the one miss added another task's Wing in one cell |
| HD, drift on the frozen Core | 4 of 5 | Partly; UMNA's side held on all 5, the baseline forgot less than E once |
| H1, NICE-R against greedy | 0 of 5 | Does not replicate |
| Slow harm, one label per step | 2 of 5 | Did not replicate: failed on qsar-biodeg, 369 gate rows (fixed in section 10) |

## 10. The gate's minimum rows

*Preregistration:* GATE_POWER_PREREGISTRATION.md.
The gate now refuses to decide on fewer rows than a non-inferiority test
at margin E needs for its power. Rerun on six seeds: no eroded version
served anywhere. qsar-biodeg needs 424 to 568 gate rows and has 369, so
it now refuses every update; spambase and banknote decide exactly as
before. The drift test's 300-row gate turned out to be too small for some
tasks. Not addressed: the audit rows that define "eroded" are a finite
sample, and every version in a series is a new look at the same origin.
