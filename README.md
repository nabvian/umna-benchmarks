# UMNA benchmark results

**Version:** 0.1.0 | **Author:** Koushik Das | **Status:** preliminary

This repository holds the benchmark results for UMNA: what each test
asked, what it found, the preregistration written before it ran, and the
raw output. The UMNA source code is not published here. Every result
file is tied to the signed commit of the code that produced it
(PROVENANCE.md), so the record can be checked against the code when it
is released.

**Browse the results in Colab:**
[notebooks/umna_results_viewer.ipynb](https://colab.research.google.com/github/nabvian/umna-benchmarks/blob/main/notebooks/umna_results_viewer.ipynb)
(loads the files in this repository and plots them; nothing to install).

## What UMNA is, in brief

- **A frozen Core and Wings.** A small shared network (the Core) is
  trained once and never written again. Each capability is a Wing: a
  small module trained through the frozen Core for one job. Adding a
  capability adds Wings; it cannot change the Core or any other Wing.
- **NICE-R, a capability planner.** For each request NICE-R chooses which
  Wings to run, and whether to combine them, by estimated utility minus
  cost (compute, latency, memory, and a per-Wing charge set per
  deployment on validation rows). It is told nothing about which Wing
  serves which task.
- **Calibrated admission.** A chosen set of Wings may answer only through
  a calibration class fitted for it (split conformal). Otherwise the
  system declines to answer.
- **CCE, a promotion gate for updates.** A new version is promoted only
  if, on the same evaluation rows, the lower confidence bound of its
  change against the version serving is within a step tolerance epsilon,
  and against the first version within a cumulative budget E. With fewer
  rows than a non-inferiority test at margin E needs,
  ((z_alpha + z_beta) sqrt(2 var(origin)) / E) squared, the gate does not
  decide and nothing is promoted.

## Where each claim stands

| Claim | Status |
|---|---|
| **HC** NICE-R routes by capability, without being told which Wing serves which task | Supported; replicated on 4 of 5 further seeds. Right task's Wings on every row of every seed; never lost to a normal gating router |
| **H3** CCE blocks harmful updates | Supported; replicated on 5 of 5 further seeds. None of 75 poisoned versions promoted |
| **H3-slow** The cumulative budget stops slow erosion that every step passes | Supported on all six seeds once the gate's minimum rows are enforced; a gate too small for the budget now refuses every update instead |
| **HD** Adding capabilities leaves the Core and old Wings unchanged, and old tasks do not forget | Supported; replicated on 4 of 5 further seeds (UMNA's side on all 5). At the same coverage UMNA is about 1 point more accurate than a fine-tuned shared network when a task is learned, and about 11 points ahead on old tasks after six |
| **H1** NICE-R beats simpler planners on real data | Does not replicate. Met its bar on the first seed only; over six seeds 40 wins, 23 losses against greedy |
| **H2** Combining Wings finds useful pairs | Weak. Helped on one real dataset of seven |
| **H6** The trace localises operational faults a conventional log misses | Supported, largely by construction; the gaps it exposed were fixed |

RESULTS.md has each test: question, design, preregistration, outcome.

## How the tests were run

- Every test was preregistered: design, predictions and decision rules
  written and SHA-256 hashed before it ran. Each result file records the
  hash of the preregistration it ran under; the preregistrations are in
  `preregistrations/` byte for byte, so the hashes can be checked.
- Changes after a preregistration are listed in its deviations file.
- Nothing is dropped. Runs later found invalid (a silent estimator
  failure) or superseded (by a fix) are kept and marked as such in
  `results/INDEX.md`.
- Multi-seed reruns reseed every random generator; the Core, tasks,
  datasets, rules and hyperparameters stay fixed.
- Runs that route requests use host-measured latency, so two runs of the
  same seed under different machine load can route a few rows
  differently. Single-Wing results are exactly reproducible.

## Data

Public datasets from OpenML: the CC18 binary tasks spambase (44),
banknote-authentication (1462), madelon (1485), phoneme (1489),
qsar-biodeg (1494), Bioresponse (4134, used only for development) and
numerai28.6 (23517); and UCI Multiple Features (OpenML 12, 14, 16, 18,
20, 22). Credit to their authors and to OpenML and the UCI repository.

## License

Results, text, figures and notebook: CC BY 4.0 (see LICENSE). Cite as
"UMNA benchmark results, Koushik Das, 2026". The UMNA source code is not
included or licensed here.
