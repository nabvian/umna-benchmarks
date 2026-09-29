# Index of raw results

Every file a test wrote is here, including runs later found invalid and
runs superseded by a fix. Nothing is edited after it is written.

| File | Run | Status | RESULTS.md section |
|---|---|---|---|
| composition_results.json | Composition benchmark, preregistered | Superseded by the audit fixes | 1 |
| composition_results_after_audit_fixes.json | Same benchmark after the eight audit fixes | Current | 1 |
| realdata_nicer_results.json | Real data phase 1, experiment N | Valid, except Bioresponse: its estimator had failed silently, so its eta tuning is unreliable | 2 |
| realdata_cce_results.json | Real data phase 1, experiment C | Superseded: found two CCE bugs | 2 |
| realdata_cce_results_after_fixes.json | Experiment C after the four fixes | Current | 2 |
| realdata_transparency_results.json | Real data phase 1, experiment T | Superseded: trace lacked fingerprint, reason, latency | 2 |
| realdata_transparency_results_after_fixes.json | Experiment T after the four fixes | Current | 2 |
| realdata_transparency_retargeted.json | Experiment T with F3 and F9 moved to the served Wing | Exploratory, not preregistered | 2 |
| realdata_harm_pilot.json | Harm pilot on the development dataset | Pilot, chose the phase 2 harm | 3 |
| realdata2_nicer_results.json | Real data phase 2, experiment N2 | Current | 3 |
| realdata2_cce_results.json | Real data phase 2, experiment C2 | Current | 3 |
| capability_routing_results.json | Capability routing, preregistered | Invalid: the estimator failed silently on tasks 2 to 4 | 4 |
| capability_routing_results_fixed_estimator.json | Capability routing, rerun on the fixed estimator | Current | 4 |
| drift_frozen_core_results.json | Drift on the frozen Core, preregistered | Current | 5 |
| slow_harm_results.json | Slow-harm test of CCE, preregistered | Current | 6 |
| slow_harm_fine_results.json | Finer-step slow-harm test, one label per step, preregistered | Current | 7 |
| multiseed/<test>_seed<s>.json | Multi-seed reruns, replicates 1 to 5 (and the drift test's seed 0 rerun) | Current | 9 |
| multiseed/drift_rows_seed<s>.json | Per-row audit data of the drift test, seeds 0 to 5 | Current | 8 |
| multiseed_results.json | Multi-seed summary and replication rule | Current | 9 |
| matched_coverage_results.json | Same-coverage comparison | Current | 8 |
| gate_power/<test>_seed<s>.json | C2, finer-step slow harm and drift, seeds 0 to 5, with the gate's power-based minimum | Current | 10 |
| gate_power_results.json | Gate minimum rows summary | Current | 10 |

The C2, drift and slow-harm files in sections 3, 5, 6, 7 and 9 were
produced before the gate enforced its minimum rows (section 10);
`gate_power/` holds the reruns of those tests with it.
