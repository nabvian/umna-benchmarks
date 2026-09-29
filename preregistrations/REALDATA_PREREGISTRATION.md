# Real-data test phase: preregistration

**Version:** 0.1.0 | **Written:** 2026-09-29, before any model was trained on these datasets | **Status:** PROVISIONAL

Three experiments on real OpenML data: NICE-R against simpler planners on
held-out datasets, CCE under a sequence of real updates, and operational
transparency under injected faults. This file fixes the design, metrics
and predictions. Each script prints this file's SHA-256 with its results;
a different hash means the predictions were edited afterwards. Any change
to the design after the hash is recorded below as a deviation.

What was looked at before writing this: OpenML's dataset metadata, and
the feature-group sizes produced by the label-free grouping rule. No Wing
had been trained and no label-based number had been computed.

## Shared substrate

**Datasets.** Every OpenML-CC18 dataset (suite 99) with a binary target,
only numeric features, no missing values, at least 1,000 rows and a
minority class of at least 20%: spambase (44), banknote-authentication
(1462), madelon (1485), phoneme (1489), qsar-biodeg (1494), Bioresponse
(4134), numerai28.6 (23517). `bench/realdata.check_selection` re-applies
the rule. The minority class is label 1. Rows are shuffled once with seed
4242. Features are standardised with the training split's mean and spread.

**Core.** The frozen Core of epoch 1.x, unchanged. Each Wing's input
transform maps its dataset's features onto the Core's input. Whether a
Core trained on synthetic tasks carries real data well is part of the test.

**Wings, per dataset.** Features are ordered by average-linkage clustering
on 1 - |correlation| in the training rows (no labels) and cut into three
near-equal groups. view_1, view_2, view_3 each see one group (seeds 1, 2,
3); view_1_copy sees view_1's group (seed 4), a known redundant pair;
generalist sees every feature, an ensemble of three (seeds 5, 6, 7), three
times the cost; noise sees every feature and is trained on shuffled
labels (seed 8), a known useless Wing. Default training settings.

**Fusion.** Log-odds only. Under mean fusion a graph's utility is the
average of its members', so composition cannot help (tests/test_fusion.py);
repeating that is not informative.

**Budgets.** Tight: 2.5 times the most expensive view Wing's FLOPs (two
views, not the generalist). Loose: the generalist plus 3.5 views.

**Pipeline.** The S5 harness unchanged: estimator on training rows with
pairwise interaction features, calibration classes fitted on the rows each
arm routes to them (alpha 0.1), admission with a fail-closed drift gate,
evaluation rows scored against labels.

## Experiment N: NICE-R on held-out datasets

**Splits.** Training 40% (at most 3,000 rows), calibration 20% (at most
800), evaluation 20% (at most 800).

**Development dataset.** The dataset with the median number of rows:
Bioresponse (3,751). It is used only to set eta and is excluded from every
verdict. The other six are held out.

**Tuning.** eta, NICE-R's per-Wing cost, from {0, 0.02, 0.05, 0.1, 0.2}. The
criterion is the net correct rate, (correct accepted answers - wrong
accepted answers) / rows, on Bioresponse's evaluation rows, averaged over
the tight and loose budgets. Ties within 0.005 go to the larger eta. The
other NICE-R constants stay as in docs/UMNA_MAIN_PAPER.md. Tuning budget:
5 trials for NICE-R, 0 for every other arm, all printed.

**Arms.** All eight: greedy, density, topk, gates, pairs, beam, exhaustive,
nice_r (at the chosen eta).

**Metrics per dataset and budget.** Coverage, accuracy on answered rows,
net correct rate (primary), mean graph size, mean active FLOPs (primary),
regret (reported, not judged: it uses an improper score).

**H1 verdict.** Twelve cells (six datasets, two budgets). NICE-R *wins* a
cell against greedy if its net correct rate is at least greedy's + 0.01,
or within 0.01 of greedy's at no more than 0.8 times greedy's FLOPs. It
*loses* a cell if its net correct rate is below greedy's - 0.01.
Supported: wins at least 7 and loses at most 2. Not supported: wins at
most 3 or loses at least 5. Otherwise partly supported. Pareto dominance
of NICE-R by any arm is reported for every cell.

**H2, mechanism.** Per held-out dataset, with no planner: the best single
Wing and the best graph of two or three Wings (noise excluded), each
chosen by accuracy on calibration rows, then compared on evaluation rows.
Composition *helps* on a dataset if the graph's evaluation accuracy is at
least 0.01 above the single Wing's.

**H2, planner.** On the datasets where composition helps, NICE-R builds a
graph of two or more Wings on at least 20% of evaluation rows under at
least one budget. Supported if that holds on at least half of those
datasets; not testable if composition helps on none.

## Experiment C: CCE under a sequence of real updates

**Dataset.** The held-out dataset with the most rows on which the origin
Wing's accuracy on the gate rows is at least 0.10 above the majority
floor. Decided after training the origin Wing only, before any candidate.

**Splits.** Training 40%, gate 35%, audit 25%, each at most 20,000 rows.
Gate rows feed the gate. Audit rows are never shown to any gate; they
define the ground truth.

**Capabilities.** An all-features single Wing, `updated`, is the one being
changed. Protected: `updated` itself, the served graph {updated, view_1,
view_2, view_3} under log-odds fusion, and the three views. Per-row
outcome: 1 if the decision at 0.5 is right, 0 otherwise.

**Tolerances.** Tier B (alpha 0.10, at least 50 rows), E = 0.05. epsilon is
the smallest of {0.01, 0.02, 0.03} for which an unchanged capability would
pass the step gate: z(0.90) * sqrt(2 p(1 - p) / n_gate) < epsilon, with p the
origin accuracy of the protected capability closest to 0.5. Fixed after
training the origin, before any candidate.

**Sequence.** Origin v1: clean labels, seed 10. Candidates, in order:
c1 clean retrain (seed 11); c2 clean, twice the training steps (seed 12);
c3 to c8 labels flipped at 3%, 6%, 9%, 12%, 15%, 18% (seeds 13 to 18);
c9 labels flipped at 45% (seed 19); c10 clean retrain (seed 20). Every
candidate is a new version of `updated`, compared with whatever version is
current. A rejected candidate leaves the current version in place.

**Ground truth.** On audit rows, with the served graph: a candidate is
*harmful* if its accuracy is below the current version's by more than
epsilon, or below the origin's by more than E. Otherwise *benign*.

**Arms.** no_gate: promote everything. step_point: promote if the point
estimate of step drift on gate rows is at least -epsilon. step_origin_point:
both point estimates. cce: `runtime.cce.CCEPromotionPipeline` with the
drift gate on confidence bounds, every protected capability measured
after the last promotion.

**Predictions.**
- PC1: cce's final served accuracy on audit rows is at least origin - E;
  no_gate's is below origin - E.
- PC2: cce promotes no harmful candidate; no_gate promotes every one.
- PC3: step_point promotes at least one candidate that is harmful against
  the origin (slow erosion passes one step at a time).
- PC4: cce rejects at most one of the three benign clean candidates
  (c1, c2, c10) if they are benign by the audit truth.
- H3 on this dataset: supported if PC1 and PC2 hold.

**Not tested here.** The shadow-readiness step of promotion (accept rate on
shadow runs); only the drift gate decides.

## Experiment T: operational transparency under injected faults

**Dataset and production system.** The Experiment C dataset, with the
Experiment N splits. The production system is the greedy arm under the
tight budget, log-odds fusion, with calibration classes fitted by the
harness and every Wing registered with the drift gate.

**Faults.** Twenty incidents of each, on evaluation rows, plus 60 healthy
rows as controls:
- F1 wrong_version: view_1 1.1.0, trained with 30% flipped labels, is
  served in place of 1.0.0.
- F2 corrupted_calibrator: the class keeps its id, but its calibrator is
  refitted on shuffled labels.
- F3 demoted_wing: view_2 is demoted at the drift gate.
- F4 route_change: the planner uses an estimator trained on shuffled
  utilities.
- F5 wing_crash: view_3 raises.
- F6 nan_output: view_1 returns NaN.
- F7 hardware_mismatch: the binding names a GPU profile.
- F8 fusion_mismatch: the binding says mean fusion.
- F9 slow_wing: view_2 sleeps 30 ms.
- F10 input_oversize: the input is larger than the Wings' declared ceiling.

**Records.** The UMNA trace, and a conventional service log: request id,
service name, deployment version, decision, score, total latency, and the
error text a service would log for a caught failure.

**Diagnoser.** One rule-based diagnoser, written before the run, reads a
single record and a healthy profile built from the healthy control
records of the same kind, and names a fault class and, where it applies,
a component. The same rules run on both record kinds; a rule that needs a
field the record lacks does not fire.

**Metrics.** Localisation (class and component right) per fault, false
alarms on healthy rows, trace completeness, and replay: whether the exact
graph is rebuilt from the trace.

**Predictions.** Much of this is true by construction, because a record
cannot reveal a field it does not have. The predictions say so; the
informative ones are PT4 to PT6.
- PT1: replay rebuilds the served graph for every incident that reached
  execution.
- PT2: from the UMNA trace, F1, F5, F6, F7, F8 and F10 are localised on
  at least 95% of incidents.
- PT3: from the conventional log, F5, F6 and F10 are localised on at
  least 95% (their error text names the Wing), and F1, F7 and F8 on at
  most 5%.
- PT4: neither record localises F2 on more than 5%: the trace names the
  calibration class, not a fingerprint of its calibrator.
- PT5: from the UMNA trace, F3 is detected as an admission refusal on at
  least 95%, but the demoted Wing is named on at most 5%: the trace does
  not record why admission refused.
- PT6: F9 is flagged as slow on at least 90% from both records, and the
  slow Wing is named on at most 5% from either: latency is recorded per
  phase, not per Wing.
- PT7: false alarms on healthy rows at most 5% for both records.
- F4 is reported without a threshold: a changed route is visible in the
  trace only when it falls outside the healthy route set.
- H6 on this dataset: supported if PT1, PT2 and PT3 hold. PT4 to PT6, if
  confirmed, are gaps in what the trace records.

## Deviations

None yet.
