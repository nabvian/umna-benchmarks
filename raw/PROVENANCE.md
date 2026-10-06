# Provenance

**Version:** 0.1.0

The UMNA source is kept private for now. Each result file below was
produced by, and first committed with, a GPG-signed commit of that
source (key `C32D7C81EDB93736`, author Koushik Das). The commit hashes and
file hashes let anyone check, once the source is released or shown to a
reviewer, that these files came from that code at that time.

A file first committed in a commit was produced by the code as it stood
when the test ran. Where a later commit fixed the code (the invalid and
superseded runs in results/INDEX.md), the earlier file was produced
before the fix.

## Source commits

| Commit | Date | Signature | Subject |
|---|---|---|---|
| `31bbe87b032c60bcc2eb8aa1d60205ec34ed6ade` | 2026-09-29T17:00:20Z | good | fix: drift gate refuses to decide on fewer rows than its power needs |
| `2784767d207bd5a5fa3e9397e8216c215b989d4a` | 2026-09-29T14:41:35Z | good | bench: same-coverage comparison and multi-seed reruns |
| `25dfbcb96fc8572dd795cbf7b4996ff0c9ca264d` | 2026-09-29T13:53:54Z | good | bench: finer-step slow-harm test, one label per candidate |
| `073cc8240f81333286bc05b9d919b4f7785b5a30` | 2026-09-29T13:47:22Z | good | bench: slow-harm test of CCE's origin budget |
| `c463bc8ea74592d3665b99c5134d1a30c4ff4a92` | 2026-09-29T13:43:06Z | good | bench: real-data, capability-routing and frozen-Core drift tests |
| `453b4b3ad4f18e46f3cf665639d4dc5f0081c401` | 2026-09-29T13:42:11Z | good | fix: estimator fit, paired drift rounds, and what the trace records |
| `7142c27e548dd203336a4f844361feae35a8effc` | 2026-09-29T08:14:28Z | good | fix: make NICE-R, calibration and CCE do what the design says |

## Preregistrations (SHA-256; each result records the hash it ran under)

| File | SHA-256 |
|---|---|
| CAPABILITY_ROUTING_DEVIATIONS.md | `8a7a93de29790618a644c31debc516dddd2063fa0353f19d82e55cefdc55727e` |
| CAPABILITY_ROUTING_PREREGISTRATION.md | `e7700b9db43b4681dd030f143024dc6a55ac3aa0bded2932a3ebfd0279b531a6` |
| COMPOSITION_PREREGISTRATION.md | `9f6d646772581f6bfb26cd532609c672eacf15c6e7fac2e99d0461004a38993e` |
| DRIFT_DEVIATIONS.md | `691e1d2a077c9e5fd86b43ac7b7aafc28a36bbf33bc7626f4129bf6ae6d11ee1` |
| DRIFT_PREREGISTRATION.md | `3f9752d649c83ea30486c2478e93a23d146010702603d82666dff55f830d9222` |
| GATE_POWER_DEVIATIONS.md | `fa197314a91ba26433be433c128174263c831d2f899e54347ea297564f31416b` |
| GATE_POWER_PREREGISTRATION.md | `9940bb8a3ef830be933c41cf5ffd318359f378c5b48ea8cbb6dffebe8d9f1986` |
| MATCHED_COVERAGE_DEVIATIONS.md | `de7f8bd7de222af643338f08116d488547778cb0a97a9e7c5261c12c56399d20` |
| MATCHED_COVERAGE_PREREGISTRATION.md | `c3897f89f9e219643978dd699922af38e305ef6262542faa7744c93f6461151d` |
| MULTISEED_DEVIATIONS.md | `1df7e838c3f36e6946d5442f6b300a9881d0749f150eead8c2f8477f7bc19e2f` |
| MULTISEED_PREREGISTRATION.md | `fd8c1ef926d249d383664c982fe7ab26a7b548231d79dd975fcd8fa72e486516` |
| REALDATA2_DEVIATIONS.md | `b995353f840fd7de523166db02001960f659cae1b0644d799b78e4c156480208` |
| REALDATA2_PREREGISTRATION.md | `b40ad1084ece4e65f3537033d2c6c5edf710024cc24ff7cdaa2439c4ce03310d` |
| REALDATA_DEVIATIONS.md | `a5df2a59f648033aa5b1b6acf7191d1d68f960ccf9c1f0dde86e0799edce7391` |
| REALDATA_PREREGISTRATION.md | `8537bfc45f2c936056e38570677829c567ab78a84f7893ba009eba0561646dfc` |
| SLOW_HARM_DEVIATIONS.md | `f60d4ca6d20e043667d5078a17a9bf092192ee04a260ad1d3b172874d28b28bc` |
| SLOW_HARM_FINE_DEVIATIONS.md | `b6125ae722e19d56694f7e7d352e6073931cf868662232d23b5bf8cbea7d9d57` |
| SLOW_HARM_FINE_PREREGISTRATION.md | `736d2afabae9193e65384dec88ac5fe5f4f3de44f168255b48794a0a5ae022b8` |
| SLOW_HARM_PREREGISTRATION.md | `4b35be82cbf9f25f32ad00e78d66d31e227295684e58d82be4700a78fdf0479f` |

## Result files

| File | SHA-256 | Preregistration it ran under | First committed in |
|---|---|---|---|
| capability_routing_results.json | `eda75887a6718fe78be87f7100c52b0964434d5ce7afdd525d5f5435a1931510` | `e7700b9db43b4681` | `c463bc8ea745` |
| capability_routing_results_fixed_estimator.json | `56e24672256d1a75d77fa29f8de609261d434d706725d46681b58aae06f11052` | `e7700b9db43b4681` | `c463bc8ea745` |
| composition_results.json | `b56104ce2f13ae516eb66222886beafad165d1b67c61dd9efcb2793cb08bd934` | `9f6d646772581f6b` | `c463bc8ea745` |
| composition_results_after_audit_fixes.json | `065788d0e756d2eef1d9f447a34676bdb24a1d2cd06de3b18df2d62538439575` | `9f6d646772581f6b` | `c463bc8ea745` |
| drift_frozen_core_results.json | `ac78fef2e22b98eaa5b7a45ec9d1c13805054c5c3e7464db92f26a3840711fb8` | `3f9752d649c83ea3` | `c463bc8ea745` |
| gate_power/c2_seed0.json | `2d78cb674632982240c5fe796ff333bfface0a207ef5115496c41343a7132041` | `b40ad1084ece4e65` | `31bbe87b032c` |
| gate_power/c2_seed1.json | `388a23762e7e5a50dc69c77ed85e3f19c988a039fa9358ca6a906ecb83f345eb` | `b40ad1084ece4e65` | `31bbe87b032c` |
| gate_power/c2_seed2.json | `89868e2b8134c6c9b75e25f4782daaa4a94cc802e8cc48e1f1619e12759dc71b` | `b40ad1084ece4e65` | `31bbe87b032c` |
| gate_power/c2_seed3.json | `720e48267e06775aab018e1cd6209da59b4abc273b04983cae135721be89c0b2` | `b40ad1084ece4e65` | `31bbe87b032c` |
| gate_power/c2_seed4.json | `f199b3894fd32439110a2ffd6f4d0d5d3f1c78d8341bd4dae64b94a00498dfea` | `b40ad1084ece4e65` | `31bbe87b032c` |
| gate_power/c2_seed5.json | `6174e1f45c06b919108f112ee6e93ae8d8f1788702b393880b85b90a499b9386` | `b40ad1084ece4e65` | `31bbe87b032c` |
| gate_power/drift_rows_seed0.json | `3acebd37206a4f532431f8130e1bfd392bf84e9709e534f6ae98938124b6f795` | `` | `31bbe87b032c` |
| gate_power/drift_rows_seed1.json | `c27a34109023428752449ef2e2ec7937f4cdce8de59599ad5d386ee993d3564d` | `` | `31bbe87b032c` |
| gate_power/drift_rows_seed2.json | `5a3053715d1ea7185b312a81a3815409beacd13499f48e22e961ba45d6688ebf` | `` | `31bbe87b032c` |
| gate_power/drift_rows_seed3.json | `ba3d0b55516c66fc0bb24da40820e9f988b4677a5660ed502d9c46ca6d590888` | `` | `31bbe87b032c` |
| gate_power/drift_rows_seed4.json | `dfe3f3e72430de6eddf68a0d4e254e65f3011a3b5d2ec7a0c4f308313b7db022` | `` | `31bbe87b032c` |
| gate_power/drift_rows_seed5.json | `52e39704dcdd68fa38abeeb44470ea8fb3ca37f4236c1d9a40c1053e0da2133c` | `` | `31bbe87b032c` |
| gate_power/drift_seed0.json | `21b427747bb4fb24bc67f9d42cfcd75a9d6a872f5b3c990177b6fef25752e9fa` | `3f9752d649c83ea3` | `31bbe87b032c` |
| gate_power/drift_seed1.json | `6e92ad2b21ff4a755c37effdee8a6da5f78323614a84c4adf2be13e7243c54e0` | `3f9752d649c83ea3` | `31bbe87b032c` |
| gate_power/drift_seed2.json | `d55906263c2e73e66f31dd210f1338ea7875f74bf48a4601a1992918a6efff50` | `3f9752d649c83ea3` | `31bbe87b032c` |
| gate_power/drift_seed3.json | `bbc222cb7282c7f9dc2145ef42d6cb372d8692bd54ac97afd15aaa7685cb62ab` | `3f9752d649c83ea3` | `31bbe87b032c` |
| gate_power/drift_seed4.json | `c06bbb10432f8927314cf7123cd9db6869813b96e2bba07950388307c91d847f` | `3f9752d649c83ea3` | `31bbe87b032c` |
| gate_power/drift_seed5.json | `176b5cefc1ee9d009d9ae5c42c6b7d418ff3d4dba631e87683c427456f3eabf6` | `3f9752d649c83ea3` | `31bbe87b032c` |
| gate_power/slow_harm_fine_seed0.json | `11db77373a0f88690e5b8d1c049d2529634d0ccf89980f0b18f6ac4e0e35bebe` | `736d2afabae9193e` | `31bbe87b032c` |
| gate_power/slow_harm_fine_seed1.json | `75b34b59e3203578f108f604f0332798e77b86e0eed64d6fb27dd7b07c1fcc45` | `736d2afabae9193e` | `31bbe87b032c` |
| gate_power/slow_harm_fine_seed2.json | `f041582f117f5a69cc716447d62f5a7c9c4e4b850525034db81be05359638146` | `736d2afabae9193e` | `31bbe87b032c` |
| gate_power/slow_harm_fine_seed3.json | `054748b2c89146002d32f9481d9b6e28210ae552b8fb9c42a067da1e71543707` | `736d2afabae9193e` | `31bbe87b032c` |
| gate_power/slow_harm_fine_seed4.json | `214de0297d7d6c16c8b50413d13dd4d4c940a44116893a5b94373d8b75db1b68` | `736d2afabae9193e` | `31bbe87b032c` |
| gate_power/slow_harm_fine_seed5.json | `095babb9641384ccc79672fe8cc3f001c7e76be2ae6316c99b670b8eb6093057` | `736d2afabae9193e` | `31bbe87b032c` |
| gate_power_results.json | `283e51cf06731d84e9a8c2bdd9ed619be84f94540f7ec6001ed3fe237b749a99` | `9940bb8a3ef830be` | `31bbe87b032c` |
| matched_coverage_results.json | `0b0a25ad497a0b4b4492b4c15b4e43f67cd5f7e30d3df6e356a4f9eea022f037` | `c3897f89f9e21964` | `2784767d207b` |
| multiseed/c2_seed1.json | `7d95e904747f73f6c22c273e944080146259cbf6c7c812604e1dfbb12d7700a9` | `b40ad1084ece4e65` | `2784767d207b` |
| multiseed/c2_seed2.json | `b77fcf6559d271a2d9ae098c4be51de10887012ce9451ea071a07ad7690d300c` | `b40ad1084ece4e65` | `2784767d207b` |
| multiseed/c2_seed3.json | `fbe8f94f28a04fe65d98304e752168779dc27353eebef153ab22198d17db5327` | `b40ad1084ece4e65` | `2784767d207b` |
| multiseed/c2_seed4.json | `5bb002fe64db542bf54a62d2a31f0604923eb6ac16e0343c59c67b41de9e5a7e` | `b40ad1084ece4e65` | `2784767d207b` |
| multiseed/c2_seed5.json | `4e74f32567fd9de9d2e12452452ba0074d66062c2386412d01861e8f0586a2f7` | `b40ad1084ece4e65` | `2784767d207b` |
| multiseed/capability_routing_seed1.json | `0f153335da098f9fe2a29ea9df7e9a2304e295b03c48077368bd9d09bd128908` | `e7700b9db43b4681` | `2784767d207b` |
| multiseed/capability_routing_seed2.json | `116bf5a65b37f8fb67802850bd0ca7731e681f73c41dd0495874774d6b2066b4` | `e7700b9db43b4681` | `2784767d207b` |
| multiseed/capability_routing_seed3.json | `af83795bcd891a970d4518a9e321f32f5f9c09645712ced1ecc017765d497d90` | `e7700b9db43b4681` | `2784767d207b` |
| multiseed/capability_routing_seed4.json | `22387218071fdcd48fe48996b858bb91487fbc28c4bff719d29f67ed5e3ccc37` | `e7700b9db43b4681` | `2784767d207b` |
| multiseed/capability_routing_seed5.json | `00812bfb985afc5a2f25c842cdc350f065bc13b14f84969d349c43675f329523` | `e7700b9db43b4681` | `2784767d207b` |
| multiseed/drift_rows_seed0.json | `3acebd37206a4f532431f8130e1bfd392bf84e9709e534f6ae98938124b6f795` | `` | `2784767d207b` |
| multiseed/drift_rows_seed1.json | `c6ee7f9cbca1e4ffefcfd57a9a4b59ef3c1bd5e8d1e5666cd81036266a8ca048` | `` | `2784767d207b` |
| multiseed/drift_rows_seed2.json | `5a3053715d1ea7185b312a81a3815409beacd13499f48e22e961ba45d6688ebf` | `` | `2784767d207b` |
| multiseed/drift_rows_seed3.json | `882c2311a909c4239b9a53afcef4d42d80f478784e62516fd25d6e08eb58d1b2` | `` | `2784767d207b` |
| multiseed/drift_rows_seed4.json | `2b67080291891fdd162949bc1411d63ba00f04fd3be294f6c68cc515800ee17f` | `` | `2784767d207b` |
| multiseed/drift_rows_seed5.json | `52e39704dcdd68fa38abeeb44470ea8fb3ca37f4236c1d9a40c1053e0da2133c` | `` | `2784767d207b` |
| multiseed/drift_seed0.json | `293b57f5327fae080d334ee680185cb1b0b2b19714defaeecb114a46874dbabd` | `3f9752d649c83ea3` | `2784767d207b` |
| multiseed/drift_seed1.json | `31c42b871a0f08c4062e0fc8a0b9e797de06ab6c89697f8344ca4c2dec13ed1f` | `3f9752d649c83ea3` | `2784767d207b` |
| multiseed/drift_seed2.json | `2a8717c56160323b286c580b4f0dd1f1790c1761ea9f19823e095648676a264c` | `3f9752d649c83ea3` | `2784767d207b` |
| multiseed/drift_seed3.json | `67c9b98a1d3b90749a39b7c2ccc1f82e969057e2c7a0284f6ff2968d50abd170` | `3f9752d649c83ea3` | `2784767d207b` |
| multiseed/drift_seed4.json | `00720d2102d9180833b2841d4c83317016bf348d485d0ca3997fe18aefae81ab` | `3f9752d649c83ea3` | `2784767d207b` |
| multiseed/drift_seed5.json | `21723ef2385001bfca8bb9dd8dce2111607c55374f9492e257f34bf110a66221` | `3f9752d649c83ea3` | `2784767d207b` |
| multiseed/n2_seed1.json | `1cfc90a3f70a613b5d5bec3d712bd415d6f949a4b011d343a215b70041665c45` | `b40ad1084ece4e65` | `2784767d207b` |
| multiseed/n2_seed2.json | `8b01a83f4b9451bfe0a788c5d4ca5cfdefa05a0d60b5f9efcd95260480ca12de` | `b40ad1084ece4e65` | `2784767d207b` |
| multiseed/n2_seed3.json | `4c84354a8a4efb20f9856d1a958e8ca537933c451c605ce62f4f9f42b9789232` | `b40ad1084ece4e65` | `2784767d207b` |
| multiseed/n2_seed4.json | `c13f85e3aacfc6d9421f5097cc642f129dee1049f7967f32b65ac234ef58a616` | `b40ad1084ece4e65` | `2784767d207b` |
| multiseed/n2_seed5.json | `98854c517af89541803820ec2ccbacd289c2c76be7ed001d541fd296343c3a85` | `b40ad1084ece4e65` | `2784767d207b` |
| multiseed/slow_harm_fine_seed1.json | `eb17191b7653c926106050c35aa5c01a87874b42777f9c6bec231acab0fef484` | `736d2afabae9193e` | `2784767d207b` |
| multiseed/slow_harm_fine_seed2.json | `0d1489346601a1d025fdcd8f266930a5453440fe9ddb4d0a19d0b82f77d93e78` | `736d2afabae9193e` | `2784767d207b` |
| multiseed/slow_harm_fine_seed3.json | `578219ecb0a684d351364202341db986a207f108edca7ad30e7abea21122891e` | `736d2afabae9193e` | `2784767d207b` |
| multiseed/slow_harm_fine_seed4.json | `83512a11dea67fd2bfde13fe9bc81cbb84798cb3096afff09b0124e60d97b8bd` | `736d2afabae9193e` | `2784767d207b` |
| multiseed/slow_harm_fine_seed5.json | `bf7b7620e2056496fe6abd16d3f14fc837d181cbed8fbd2fdf2e4abd54d831e1` | `736d2afabae9193e` | `2784767d207b` |
| multiseed_results.json | `4bca1474f8f49e827340e82e40ca69a66700a848ad8b24b7c9f1dc95e767ee1d` | `fd8c1ef926d249d3` | `2784767d207b` |
| realdata2_cce_results.json | `b21c71c484203d7d550c5299c1ec1becf5a5c48bc0f7aa0284ce013ba7ea1dea` | `b40ad1084ece4e65` | `c463bc8ea745` |
| realdata2_nicer_results.json | `a272711044b0955c4befda7aae81ba556dc9a36f687e99a567a5c791c888edc0` | `b40ad1084ece4e65` | `c463bc8ea745` |
| realdata_cce_results.json | `5ebb2d5a12f715026d45ebdf91b6de649b6af02fffce5f10653b13c60ce19b93` | `8537bfc45f2c9360` | `c463bc8ea745` |
| realdata_cce_results_after_fixes.json | `a754aa4467039d15fe65d7a7b49b9013e266de83919f28ee70b12673102cb788` | `8537bfc45f2c9360` | `c463bc8ea745` |
| realdata_harm_pilot.json | `43c6145bba5ec522e9aa0f9815fd411069f0839c9bd4468e759f5971d393e325` | `` | `c463bc8ea745` |
| realdata_nicer_results.json | `ecee23d374927838af8bf5fadbce22c3bad5799f257784c8917e1824d053f050` | `8537bfc45f2c9360` | `c463bc8ea745` |
| realdata_transparency_results.json | `1dd4e6c7ceb4d65fc12b7f91078152f1c37584582bc190c6ac8a0c299fc5def1` | `8537bfc45f2c9360` | `c463bc8ea745` |
| realdata_transparency_results_after_fixes.json | `e8376697252aa509bd794481837eca4fb1d0901411b259641f5e13c241af7fbd` | `8537bfc45f2c9360` | `c463bc8ea745` |
| realdata_transparency_retargeted.json | `7ab25447b6f951c34db1c733146a23a40be9626eebb781313e6ab4d1b4ce450b` | `8537bfc45f2c9360` | `c463bc8ea745` |
| slow_harm_fine_results.json | `549b1805b27404789dd3195c114b325e78141d2c0f57d6bfdad121b8573b2054` | `736d2afabae9193e` | `25dfbcb96fc8` |
| slow_harm_results.json | `b4909bb4033dc056317d592b578d73894118f04aa5294b701245c552f517378e` | `4b35be82cbf9f25f` | `073cc8240f81` |
