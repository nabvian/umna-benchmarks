# Drift test on the frozen Core: preregistration

**Version:** 0.1.0 | **Written:** 2026-09-29, before any Wing for this test was trained | **Status:** PROVISIONAL

UMNA's Core is frozen: new capabilities train through it and never write
it, so the Core's parameters and every old Wing's outputs cannot change.
That is true by construction and is checked here, not claimed as a
finding. The question this test asks is behavioural: as new capabilities
are added, do the answers the system serves for old tasks drift anyway,
because the planner starts routing them through new Wings? Does CCE keep
that drift inside its budget? And how does this compare with the usual
alternative, one shared network fine-tuned task after task? Each script
prints this file's SHA-256; changes afterwards go in
docs/DRIFT_DEVIATIONS.md.

What was looked at before writing this: the six task definitions, which
use only the class names.

## Data and tasks

UCI Multiple Features (OpenML ids 12, 14, 16, 18, 20, 22, version 1).
Six binary tasks, balanced splits of the ten class labels drawn with seed
2029 (the first four are the capability-routing test's):

| Task | Positive class labels |
|---|---|
| task_1 | 4, 5, 7, 8, 10 |
| task_2 | 2, 3, 4, 5, 8 |
| task_3 | 4, 5, 6, 7, 9 |
| task_4 | 1, 4, 5, 6, 8 |
| task_5 | 1, 2, 3, 5, 8 |
| task_6 | 1, 3, 6, 7, 10 |

Rows shuffled with seed 4242 and split: training 800, validation 250,
calibration 350, gate 300, audit 300. Audit rows are never shown to any
gate or router; they define every reported accuracy.

## The sequence

Stage s = 1 to 6 introduces task_s. At each stage:

**UMNA.** Three new Wings for task_s are trained through the frozen Core
(as in the capability-routing test: two view Wings and a generalist of
three) and installed. Each Wing's cost is measured once, when it is
installed, and reused. The new task's eta is chosen once, at its stage, by
the per-deployment rule on validation rows, and then kept. For every task
seen so far, the estimator is refitted on its current candidate Wings,
calibration classes are refitted, and NICE-R serves the task under the
loose budget (a generalist and 3.5 view Wings), log-odds fusion.

Two arms differ only in each old task's candidate Wings:
- **no_cce**: every installed Wing is a candidate for every task.
- **cce**: when new Wings arrive, each old task is served in shadow with
  them added, on the gate rows, and a CCE drift gate (Tier B, epsilon 0.02,
  E = 0.05, paired rounds on the gate rows, the task's served accuracy at
  its own first stage as origin) decides. Pass: the new Wings join that
  task's candidates. Otherwise the task keeps its pinned candidates.

**Shared network.** One network: an input transform and the Core's two
layers shared by every task, one head per task, all trainable, same
initial Core. At stage s it is trained on task_s only (same steps, batch
and learning rate as a Wing), updating the shared layers and task_s's
head. Every task seen so far is scored with its own head.

## Measurements per stage and task

Audit accuracy of what is served; its change from the task's own first
stage (origin) and from the previous stage; route displacement (the share
of audit rows whose served graph differs from the task's first-stage
choice); the largest absolute change in any old Wing's audit output; the
Core's SHA-256.

## Predictions

- **PD1, by construction.** The Core's SHA-256 is the same at every stage,
  and every Wing's audit outputs are bit-identical at every stage.
- **PD2, routing moves even when parameters do not.** In no_cce, at least
  one old task's route displacement reaches 10% at some stage.
- **PD3, CCE bounds served drift.** In cce, no old task's audit accuracy
  falls below its origin minus E at any stage.
- **PD4, the usual alternative forgets.** In the shared network, task_1's
  audit accuracy after stage 6 is at least E below its accuracy right
  after stage 1.
- **PD5, reported without a threshold.** Mean audit accuracy over tasks
  1 to 5 at stage 6, cce against no_cce: what pinning costs or saves.
- **Drift-control hypothesis:** supported if PD1, PD3 and PD4 hold.

## Deviations

Recorded in docs/DRIFT_DEVIATIONS.md.
