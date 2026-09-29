# Real-data test phase 2: preregistration

**Version:** 0.1.0 | **Written:** 2026-09-29, before any held-out run of the designs below | **Status:** PROVISIONAL

Phase 1 (docs/REALDATA_PREREGISTRATION.md, results in
docs/PRELIMINARY_RESULTS.md section 10) left three things open: NICE-R's
per-Wing cost was a number someone had to pick, H2 could not be tested
because no composition helped on the six datasets, and H3 was not tested
because the harm never reached the served system. This file fixes the
design and predictions for the follow-up. Each script prints this file's
SHA-256; changes after the hash go in docs/REALDATA2_DEVIATIONS.md.

**What is already known.** Phase 1's results on the six held-out CC18
datasets are known, and the predictions below that concern them are
informed by that. What is new: the per-Wing cost rule, the multi-view
dataset, and the harm manipulation. The harm manipulation was chosen by a
pilot on Bioresponse only (bench/realdata_harm_pilot.py, rule stated in
that file): with the four-Wing served graph no manipulation lowered served
accuracy by 0.10, because fusion with three healthy Wings absorbed the
damage; with the updated Wing served alone, the poisoned-region
manipulation did (0.621 to 0.503). No held-out dataset has been run with
the new designs.

## The per-Wing cost rule

eta, NICE-R's per-Wing cost, is a deployment setting, chosen for each
dataset on its own validation rows: from {0, 0.02, 0.05, 0.1, 0.2}, the value
with the highest net correct rate averaged over the tight and loose
budgets, ties within 0.005 going to the larger (cheaper) eta. So NICE-R
pays for a second Wing only when validation shows it buys correct answers.
The value 0.2 in docs/UMNA_MAIN_PAPER.md becomes the default for a
deployment that has not validated one.

## Experiment N2: NICE-R with the rule, and H2 on multi-view data

**Datasets.** The six held-out CC18 datasets of phase 1, and UCI Multiple
Features: six OpenML datasets (ids 12, 14, 16, 18, 20, 22; version 1),
2,000 handwritten characters each, described by six feature families
(factors 216, Fourier 76, Karhunen-Loeve 64, morphological 6, pixel 240,
Zernike 47). OpenML's description states that corresponding rows describe
the same character; their class sequences are identical. Target: 1 for
the upper five of the ten class labels ("6" to "10"), balanced. Bioresponse
is excluded: it was used for the harm pilot.

**Wings on Multiple Features.** One view Wing per feature family (seeds 1
to 6) and a generalist over all 649 features (ensemble of seeds 7, 8, 9).
The CC18 datasets keep phase 1's family.

**Splits.** Training 40% (at most 3,000), validation 15% (at most 600),
calibration 20% (at most 800), evaluation 20% (at most 800).

**Pipeline.** As phase 1: log-odds fusion, the S5 harness, tight and loose
budgets, all eight arms, NICE-R at its per-dataset eta. Tuning budget:
5 trials per dataset for NICE-R, on validation rows; 0 for every other arm.

**H1.** Fourteen cells (seven datasets, two budgets), won or lost against
greedy as in phase 1. Supported: wins at least 8 and losses at most 2.
Not supported: wins at most 4 or losses at least 6. Otherwise partly.

**H2, mechanism.** As phase 1: the best single Wing and the best graph of
two or three Wings, chosen on calibration rows, compared on evaluation
rows; composition helps if the graph is at least 0.01 more accurate.
Prediction: it helps on Multiple Features.

**H2, planner.** On every dataset where composition helps, NICE-R builds a
graph of two or more Wings on at least 20% of evaluation rows under at
least one budget. Supported if that holds on at least half of those
datasets. Prediction: supported, because the rule lowers eta where
validation rewards a second Wing.

## Experiment C2: CCE with a harm that reaches the served system

**Datasets.** Every held-out CC18 dataset whose origin Wing clears its
majority floor by 0.10 on gate rows (phase 1's rule, applied to all of
them, not only the largest).

**Served system.** The updated Wing alone, the route NICE-R served on
every held-out row in phase 1. Protected capability: its accuracy.

**Splits and tolerances.** As phase 1 (training 40%, gate 35%, audit 25%;
Tier B; E = 0.05), with epsilon the smallest of {0.01, 0.02, 0.03, 0.05} that
the phase 1 formula allows. Every round is measured on the same gate
rows and carries their ids, so the gate uses the paired test.

**Sequence.** Origin v1: clean labels, seed 10. Candidates, in order:
c1 clean retrain (seed 11); c2 clean, twice the steps (seed 12); c3 to c7
poisoned region at 10%, 20%, 30%, 40%, 50% (labels inverted where the
first feature is in its top share; seeds 13 to 17); c8 clean retrain
(seed 18).

**Ground truth.** On audit rows: harmful if accuracy is below the current
version's by more than epsilon, or below the origin's by more than E.

**Arms.** no_gate, step_point, step_origin_point, cce, as in phase 1.

**Predictions, per dataset.**
- PC1: cce never serves a version whose audit accuracy is below origin - E;
  no_gate does at some point in the sequence.
- PC2: cce promotes no harmful candidate; no_gate promotes every one.
- PC3: step_point promotes at least one candidate that is harmful against
  the origin.
- PC4: cce rejects at most one of c1, c2, c8 among those benign by the
  audit truth.
- H3 on a dataset: supported if PC1 and PC2 hold. Overall: supported if
  supported on at least two datasets, or on the only one if one qualifies.

## Deviations

Recorded in docs/REALDATA2_DEVIATIONS.md.
