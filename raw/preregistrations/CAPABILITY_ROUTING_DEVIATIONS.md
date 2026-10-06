# Capability-routing test: deviations from the preregistration

**Version:** 0.1.0

The preregistration, docs/CAPABILITY_ROUTING_PREREGISTRATION.md, is hashed
(SHA-256 `e7700b9db43b4681dd030f143024dc6a55ac3aa0bded2932a3ebfd0279b531a6`,
2026-09-29T11:48:12Z) and is not edited.

Before the full run, one smoke test built the base condition and ran three
cells of task_1 under the tight budget, to time the slowest router; its
numbers were not used.

1. **The utility estimator failed silently in the preregistered run.**
   Found in its results, so everything below came after seeing them. In
   the base condition the estimators for task_2 to task_4 did not fit:
   task_2's had a bias of -282 and a residual of 105 on utilities between
   0 and 1, and it predicted zero for every graph. Every router that uses
   the estimator was routing blind on those tasks; even oracle_map served
   nothing. Only the gates, which do not use it, were unaffected. The
   preregistered verdict (not supported, 3 wins and 4 losses against
   gate_top1) therefore compares a broken NICE-R with a working gate.

   Cause: `UtilityEstimator.train` solved an unscaled regression in
   float32. Its features mix 0/1 memberships with FLOP counts in the tens
   of thousands, and some are exact sums of others; at this size the solve
   broke. Fixed in planner/estimator.py: standardised features, float64, a
   ridge relative to the number of rows, and `check_fit`, which refuses a
   fit worse than predicting the mean instead of returning it. A test in
   tests/test_planner_arms.py reproduces the failure and fails on the old
   code. The whole test was rerun on the fixed estimator
   (`bench/capability_routing_results_fixed_estimator.json`); both runs are
   reported.

