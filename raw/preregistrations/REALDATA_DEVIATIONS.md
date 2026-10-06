# Real-data test phase: deviations from the preregistration

**Version:** 0.1.0

The preregistration, docs/REALDATA_PREREGISTRATION.md, is hashed
(SHA-256 `8537bfc45f2c936056e38570677829c567ab78a84f7893ba009eba0561646dfc`,
2026-09-29T08:48:40Z) and is not edited. Changes made after that point are
listed here, with when they were made relative to the results.

1. **CCE kept a rejected candidate's round as its reference.** Found while
   writing Experiment C, after Experiment N had run and before any
   Experiment C code ran. `CCEPromotionPipeline.record_round` wrote the
   candidate's round into the drift gate, and a rejection left it there,
   so the next candidate was compared with the rejected version instead
   of the one still serving. Fixed in runtime/cce.py: the rounds belong to
   the candidate until a decision, and a rejection restores the gate's
   earlier state. Two tests in tests/test_cce.py; the first fails on the
   old code. The Experiment C `cce` arm runs on the fixed code.

2. **The drift gate refused NumPy arrays.** Found on the first Experiment C
   run, which stopped before any gate decision. `_as_rows` accepted only
   Python sequences, so a 1-D array of per-row outcomes raised. Fixed in
   runtime/drift.py: a 1-D array is a round; a 2-D array is still refused.
   One test in tests/test_drift.py.

3. **The transparency diagnoser mislabelled an unseen Wing as a wrong
   version.** Found in the first Experiment T results, so this change was
   made after seeing them. The rule "a (Wing, version) pair not in the
   healthy profile is a wrong version" also fired when a route used a
   Wing never seen in healthy traffic: under F4 route_change it named
   `noise` as a wrong version. The rule now requires the Wing to have been
   seen with another version; an unseen Wing falls through to the
   route-change rule. F1's result does not depend on the change. F4 has no
   preregistered threshold. Both runs are reported.

4. **Faults on a Wing the planner never serves cannot be tested.** F3 and
   F9 act on view_2, and the production planner never put view_2 in a
   served graph on this dataset, so neither fault manifested. PT5 and PT6
   are reported as not testable instead of as failed.

5. **Four fixes after the preregistered runs, and reruns.** The runs above
   exposed gaps; they were fixed after all three experiments had run:
   a calibrator fingerprint and an admission reason on the admission
   record and trace, per-Wing latency in the trace, and a paired drift
   test for rounds on the same rows. Experiments C and T were rerun into
   separate files (`*_after_fixes.json`); the preregistered result files
   are unchanged. The Experiment C `cce` arm passes the gate row ids. The
   Experiment T diagnoser gained three rules that read the new trace
   fields; the conventional-log rules are unchanged. A further run with
   `--retarget` moves F3 and F9 onto the most-served view; it is
   exploratory and outside the preregistration.

6. **Phase 1's development estimator was broken.** Found later, during the
   capability-routing test, by refitting every estimator from the earlier
   runs with the old code: Bioresponse's had a residual of 0.317 against a
   target spread of 0.285, worse than predicting the mean. eta = 0.1 was
   chosen on it, so the phase 1 tuning is unreliable; the held-out
   estimators were sound. Phase 2 replaced that tuning with the
   per-dataset rule, on sound estimators. The estimator fix (see
   docs/CAPABILITY_ROUTING_DEVIATIONS.md) leaves the S5 numbers unchanged
   except the gates arm in the third decimal.

