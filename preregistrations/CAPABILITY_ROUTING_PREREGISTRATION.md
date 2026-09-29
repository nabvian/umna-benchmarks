# Capability-routing test: preregistration

**Version:** 0.1.0 | **Written:** 2026-09-29, before any Wing for this test was trained | **Status:** PROVISIONAL

Every earlier test gave the planner one task at a time, with every
installed Wing built for that task. This one installs Wings for several
different tasks side by side. Each request says which task it asks, as a
real request would, but nothing tells the router which Wings serve which
task: no tags, no names read, only host measurement. The question is the
one UMNA's design rests on: does NICE-R find the right capability, and
does it do so better than a normal router? Each script prints this file's
SHA-256; changes afterwards go in docs/CAPABILITY_ROUTING_DEVIATIONS.md.

What was looked at before writing this: the four task definitions below,
which use only the class names, and how often the tasks agree.

## Data and tasks

UCI Multiple Features (OpenML ids 12, 14, 16, 18, 20, 22, version 1):
2,000 characters, 649 features in six families, the same rows in every
family. Four binary tasks, each a balanced split of the ten class labels,
drawn with seed 2029, no task equal or complementary to another:

| Task | Positive class labels |
|---|---|
| task_1 | 4, 5, 7, 8, 10 |
| task_2 | 2, 3, 4, 5, 8 |
| task_3 | 4, 5, 6, 7, 9 |
| task_4 | 1, 4, 5, 6, 8 |

Pairs of tasks agree on 40% to 60% of the classes. Rows are shuffled with
seed 4242 and split: training 800, validation 300, calibration 400,
evaluation 500.

## Capabilities

For each task k, three Wings trained on that task's labels through the
frozen Core: a view Wing on feature family 2(k-1) mod 6, a view Wing on
family 2(k-1)+1 mod 6 (families in the order factors, fourier, karhunen,
morphological, pixel, zernike), and a generalist over all 649 features
(an ensemble of three, three times the cost). Twelve Wings in the base
condition. The distractor condition adds eight Wings trained on shuffled
labels, noise_1 to noise_8, on families 1 to 6 then 1 to 2, twenty in all.

## Routers

Every router sees every installed Wing as a candidate and gets the same
host-measured costs. Each learns only from the requested task's training
labels.

- **nice_r**: NICE-R, eta chosen per task by the per-deployment rule on
  validation rows (docs/REALDATA2_PREREGISTRATION.md).
- **gate_top1**: a normal router. A softmax gate over the Wings, trained on
  the task's training rows to predict which single Wing gives the true
  label the highest probability, as mixture-of-experts gating does; it
  serves its highest-scoring Wing that fits the budget.
- **gate_top2**: the same gate, serving its two highest-scoring Wings that
  fit together.
- **greedy, topk, gates, beam, exhaustive**: the existing arms.
- **oracle_map**: greedy restricted to the requested task's own three
  Wings. It is told the mapping no other router gets; a reference, not a
  competitor.
- **random**: a uniformly random single Wing that fits the budget.

The distractor condition runs nice_r, gate_top1, gate_top2, greedy, topk
and oracle_map; beam and exhaustive are left out for their cost.

**Estimator.** The harness estimator with pairwise interaction features,
trained on every subset of one or two Wings and on 300 subsets of three
(seed 7) per task, on the first 300 training rows.

**Pipeline.** As before: log-odds fusion, tight budget (2.5 view Wings,
no generalist) and loose budget (a generalist and 3.5 view Wings),
calibration classes fitted on the rows each router sends to them,
admission with a fail-closed drift gate, evaluation rows scored against
the requested task's labels.

## Metrics, per task and budget

Net correct rate (primary), coverage, accuracy on answered rows, mean
FLOPs, own-task share (the share of served Wings built for the requested
task), and own-task hit rate (rows served with at least one such Wing).

## Predictions

- **PR1, finding the capability.** In every base cell, nice_r's own-task
  share is at least 0.80 and its own-task hit rate at least 0.95.
- **PR2, the price of not being told.** In every base cell, nice_r's net
  correct rate is within 0.02 of oracle_map's.
- **PR3, against a normal router.** Over the eight base cells, nice_r
  against gate_top1: a win is a net correct rate at least 0.01 higher, or
  within 0.01 at no more than 0.8 times the FLOPs; a loss is a net correct
  rate more than 0.01 lower. Supported: at least 5 wins and at most 1
  loss. Not supported: at most 2 wins or at least 4 losses. Otherwise
  partly. The same comparison against gate_top2 is reported.
- **PR4, distractors.** Adding the eight noise Wings lowers nice_r's
  own-task share by at most 0.10 and its net correct rate by at most 0.02
  in every cell. The gates' changes are reported beside it.
- **Capability-routing hypothesis:** supported if PR1 and PR3 hold.

## Deviations

Recorded in docs/CAPABILITY_ROUTING_DEVIATIONS.md.
