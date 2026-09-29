# Composition benchmark: preregistration

**Version:** 0.1.0 | **Written:** 2026-09-29, before the first run | **Status:** PROVISIONAL

This file fixes the design, the metrics, and the predictions of
`bench/composition_benchmark.py` before any result exists. The benchmark
prints this file's SHA-256 with its results; if the hash differs from the
one recorded at the first run, the predictions were edited afterwards.

## Why this benchmark exists

On the S5 benchmark every graph was fused by averaging its Wings'
probabilities, and scored by the probability it gave the true label. That
score is linear in the fused probability, so a graph's utility is exactly
the average of its members' utilities (verified to 1e-16 over all 57
multi-Wing graphs, and pinned by `tests/test_fusion.py`). Under that rule no
combination of Wings can beat its best member, so neither composition nor
NICE-R's complementarity modelling could be tested.

Adding log-odds is the standard way to pool independent evidence. Under it,
Wings that see different evidence can combine into a stronger answer, and
Wings that see the same evidence are counted twice and become
overconfident. Those are the two situations NICE-R's complementarity bonus
and redundancy penalty were designed for. The fusion rule is therefore the
experimental variable, and mean fusion is kept as the control.

## Design

**Task `sum4`.** x ~ U[-1, 1]^8; y = 1 if x0 + x1 + x2 + x3 > 0, else 0;
each label flipped with probability 0.05. 3000 training, 500 calibration,
500 evaluation rows, data seed 31415.

**Wings.** All trained through the frozen Core with the write firewall
(`core.firewall.train_wing_through_core`, default steps and learning rate),
on the training rows and the `sum4` labels, with inputs outside the Wing's
view set to zero.

| Wing | Sees | Training seed | Role |
|---|---|---|---|
| half_a | x0, x1 | 1 | half of the evidence |
| half_b | x2, x3 | 2 | the other half |
| half_a_copy | x0, x1 | 3 | redundant with half_a |
| half_b_copy | x2, x3 | 4 | redundant with half_b |
| distractor | x5, x6 | 5 | no evidence |
| generalist | x0..x3 | 6, 7, 8 | ensemble of three, logits averaged |

Host metrics are measured, not declared: FLOPs and memory from the
parameter artifacts (the generalist runs the Core three times, so it costs
three times as much), latency by timing, reliability as the fraction of
valid outputs, and label-free score statistics. Capability tags are the same
neutral tag for every Wing, so the pair proposer is given no hints.

**Regimes.** Fusion {mean, log-odds} x budget {tight, loose}. Tight allows
at most two small Wings and excludes the generalist. Loose allows the
generalist plus up to three small Wings. The budget numbers are set from
the measured FLOPs by that rule, not chosen after seeing results.

**Arms.** All eight: greedy, density, topk, gates, pairs, beam, exhaustive,
nice_r. Every arm uses the same estimator, fitted on training rows with the
label-based utility of the regime's fusion rule, with pairwise interaction
features. No arm is tuned; NICE-R runs at its frozen v0.2 settings.

**Pipeline.** Identical to S5: classes fitted on the calibration rows each
arm routes to them, admission with a fail-closed drift gate, evaluation
rows scored against their labels.

**Reported per arm and regime:** coverage; accuracy on answered rows;
complementary-pair rate (the graph holds one of the half_a Wings and one of
the half_b Wings); redundant-pair rate (it holds both half_a Wings or both
half_b Wings); graph size; mean active FLOPs; regret against the
label-based restricted oracle. Also a truth table of key graphs per fusion
rule: accuracy, utility, and log-loss.

## Predictions

**P1, an identity, not a prediction.** Under mean fusion, the utility of
every graph equals the average utility of its members.

**P2, synergy exists under log-odds.** {half_a, half_b} has accuracy at
least 0.05 above the better of half_a and half_b, and higher utility than
either.

**P3, redundancy under log-odds.** {half_a, half_a_copy} has accuracy
within 0.02 of half_a alone, and worse log-loss than half_a alone.

**P4, H2 at planner level.** Under log-odds with the tight budget, NICE-R
chooses a complementary pair on at least 90% of evaluation rows, and at
least as often as value-greedy.

**P5, top-k's rule.** Under log-odds with the tight budget, top-k takes the
two strongest single Wings. If both belong to the same half it builds a
redundant pair and answers with lower accuracy than NICE-R.

**P6, H1.** Under log-odds, in both budgets, NICE-R is on the Pareto front
of the arms: no arm has coverage and accuracy on answered rows at least as
high, with mean active FLOPs at most as high, and is strictly better on one
of the three.

**P7, a limitation of NICE-R v0.2.** Its FLOP cost weight contributes
about 1e-5 x (added FLOPs) / 1e6, roughly 1e-8 per FLOP, which is
numerically inert. Whether NICE-R picks the generalist is decided by
predicted utility and its 0.2 per-Wing size penalty, not by what the
generalist costs.

## Verdict rule

- H2 is **supported on this family** if P2 and P4 hold.
- H1 is **supported on this family** if P6 holds in both budgets.
- Otherwise each is reported as **not supported** or **partly supported**,
  naming the prediction that failed.

A supported verdict here would mean the mechanism works on a family built
from the theory's premises. It would not mean it works on real tasks; that
needs external data such as OpenML, and held-out task families.
