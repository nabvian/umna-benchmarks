# Results site (GitHub Pages)

**Live: https://nabvian.github.io/umna-benchmarks/**

A static site over this repository's records. It does not run UMNA; every
number is read from `results/` when the site is built.

- Hypothesis, architecture explorer and the claims scoreboard (from README.md
  and WHAT_IS_UMNA.md).
- Charts drawn from the raw result files: harmful updates (C2), slow erosion,
  drift on the frozen Core, accuracy at the same coverage, capability routing,
  and multi-seed replication.
- Two calculators: the gate's minimum rows, which reproduces the recorded
  minimums exactly (293, 50, 424 at α = 0.10, power 0.80), and a toy model of
  the step test against the cumulative budget, labelled as a toy.
- All ten tests with their preregistrations and raw files, and each file's
  status from `results/INDEX.md`.
- **Verify**: downloads the published files and recomputes every SHA-256 in
  the browser against PROVENANCE.md, plus the preregistration hash recorded
  inside each result file.

```bash
python3 site/build.py                         # standard library only
cd _site && python3 -m http.server 8000       # http://localhost:8000
```

`.github/workflows/pages.yml` rebuilds and publishes to the `gh-pages` branch
on every push to `main` that touches the records or `site/`.
