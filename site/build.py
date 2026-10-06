"""Build the UMNA results site into ``_site/``.

    python3 site/build.py

Standard library only. Copies the static page, publishes the raw result files,
preregistrations and provenance under ``raw/`` (so visitors can download them
and re-hash them in the browser), parses PROVENANCE.md into ``data/provenance.json``,
and extracts every chart's numbers from ``results/`` into ``data/summary.json``.
Nothing on the page is typed in by hand except prose quoted from the README.
"""
from __future__ import annotations

import json
import re
import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SITE = ROOT / "site"
OUT = ROOT / "_site"
BUDGET_E = 0.05  # cumulative budget, preregistered (SLOW_HARM_FINE / DRIFT / GATE_POWER)


def load(name: str) -> dict:
    return json.loads((ROOT / "results" / name).read_text())


def served_path(decisions: list[dict], origin: float) -> list[float]:
    """Audit accuracy of the version being served after each offered candidate."""
    served, current = [origin], origin
    for decision in decisions:
        if decision["promoted"]:
            current = decision["audit_accuracy"]
        served.append(current)
    return served


def slow_harm_fine() -> dict:
    data = load("slow_harm_fine_results.json")["datasets"]
    out = {}
    for name in ("spambase", "qsar-biodeg"):
        entry = data[name]
        origin = entry["origin_audit_accuracy"]
        out[name] = {
            "origin": origin, "epsilon": entry["epsilon"], "budget": BUDGET_E, "candidates": entry["candidates"],
            "arms": {arm: [round(v, 4) for v in served_path(entry["arms"][arm]["decisions"], origin)]
                     for arm in ("no_gate", "cce_step_only", "cce")},
            "final": {arm: entry["arms"][arm].get("final_audit_accuracy") for arm in ("no_gate", "cce_step_only", "cce")},
        }
    return out


def harmful_updates() -> dict:
    data = load("realdata2_cce_results.json")["datasets"]
    out = {}
    for name, entry in data.items():
        if not entry.get("qualifies"):
            continue
        candidates = [d["candidate"] for d in entry["arms"]["cce"]["decisions"]]
        out[name] = {
            "origin": entry["origin_audit_accuracy"], "epsilon": entry["epsilon"], "candidates": candidates,
            "candidate_accuracy": [entry["audit_accuracy"][c] for c in candidates],
            "arms": {arm: [round(v, 4) for v in served_path(entry["arms"][arm]["decisions"], entry["origin_audit_accuracy"])]
                     for arm in ("no_gate", "cce")},
            "worst": {arm: entry["arms"][arm]["worst_served_audit_accuracy"] for arm in ("no_gate", "cce")},
            "harmful_promoted": {arm: entry["arms"][arm]["harmful_promoted"] for arm in ("no_gate", "cce")},
            "harmful_offered": entry["arms"]["cce"]["harmful_offered"],
        }
    return out


def poisoned_promotions() -> dict:
    """Across seed 0 and the five replicate seeds: poisoned vs clean promotions under CCE."""
    files = ["realdata2_cce_results.json"] + [f"multiseed/c2_seed{s}.json" for s in range(1, 6)]
    poisoned_offered = poisoned_promoted = 0
    clean_slightly_worse_promoted = []
    for seed, name in enumerate(files):
        for dataset, entry in load(name)["datasets"].items():
            if not entry.get("qualifies"):
                continue
            for decision in entry["arms"]["cce"]["decisions"]:
                poisoned = "poisoned" in decision["candidate"]
                if poisoned and seed > 0:
                    poisoned_offered += 1
                    poisoned_promoted += int(decision["promoted"])
                if decision["promoted"] and decision.get("harmful") and not poisoned:
                    clean_slightly_worse_promoted.append({"seed": seed, "dataset": dataset, "candidate": decision["candidate"]})
    return {"replicate_poisoned_offered": poisoned_offered, "replicate_poisoned_promoted": poisoned_promoted,
            "clean_slightly_worse_promoted": clean_slightly_worse_promoted}


def drift() -> dict:
    data = load("drift_frozen_core_results.json")
    stages = data["stages"]
    tasks = list(stages[-1]["tasks"]["no_cce"])
    umna = {t: [[s["stage"], s["tasks"]["no_cce"][t]["audit_served_accuracy"]] for s in stages if t in s["tasks"]["no_cce"]] for t in tasks}
    shared = {t: [[s["stage"], s["shared"][t]["audit_accuracy"]] for s in stages if t in s["shared"]] for t in tasks}
    return {"umna": umna, "shared": shared,
            "core_unchanged": all(s["core_sha256_unchanged"] for s in stages),
            "max_wing_output_change": max(s["max_wing_output_change"] for s in stages),
            "verdict": data["verdict"]}


def matched_coverage() -> list[dict]:
    verdict = load("matched_coverage_results.json")["verdict"]
    picks = [("Q1 first learning, at UMNA's coverage (shared minus UMNA)", "A task first learned"),
             ("Q2 old tasks after six, at UMNA's coverage", "Old tasks after six"),
             ("Q3 task 6 after six, at UMNA's coverage", "Newest task after six")]
    return [{"label": label, "mean": verdict[key]["mean"], "low": verdict[key]["low"], "high": verdict[key]["high"],
             "values": verdict[key]["values"]} for key, label in picks]


def routing() -> dict:
    data = load("capability_routing_results_fixed_estimator.json")
    arms = ["nice_r", "gate_top1", "gate_top2", "greedy"]
    cells = []
    for task, entry in data["base"].items():
        for budget, row in entry["cells"].items():
            cells.append({"task": task.replace("_", " "), "budget": budget,
                          **{arm: row[arm]["net_correct_rate"] for arm in arms}})
    v = data["verdict"]
    return {"arms": arms, "cells": cells,
            "vs_top1": v["PR3 nice_r vs gate_top1"], "vs_top2": v["PR3 nice_r vs gate_top2 (reported)"],
            "finds_own_wings": v["PR1 nice_r finds its task's Wings"]}


def gate_power() -> dict:
    data = load("gate_power_results.json")
    rows = {}
    for seed, entry in data["seeds"].items():
        for name, row in entry["slow_harm"].items():
            rows.setdefault(name, {"gate_rows": row["gate_rows"], "minimum": []})["minimum"].append([int(seed), row["minimum"]])
    return {"datasets": rows, "verdict": data["verdict"]}


def multiseed() -> list[dict]:
    data = load("multiseed_results.json")["tests"]
    names = {"c2": "H3 · harmful updates blocked", "capability_routing": "HC · capability routing",
             "drift": "HD · no forgetting on the frozen Core", "n2": "H1 · NICE-R beats greedy",
             "slow_harm_fine": "H3-slow · slow erosion (before the gate minimum)"}
    return [{"test": key, "label": names[key], "supported": row["supported"], "rule": row["rule"]} for key, row in data.items()]


def provenance() -> dict:
    text = (ROOT / "PROVENANCE.md").read_text()
    commits = re.findall(r"^\| `([0-9a-f]{40})` \| ([^|]+?) \| ([^|]+?) \| ([^|]+?) \|$", text, re.M)
    files = re.findall(r"^\| ([^|]+?) \| `([0-9a-f]{64})` \|(?: `([0-9a-f]*)` \| `([0-9a-f]*)` \|)?", text, re.M)
    key = re.search(r"key `([0-9A-F]+)`", text)
    return {
        "gpg_key": key.group(1) if key else None,
        "commits": [{"commit": c, "date": d.strip(), "signature": s.strip(), "subject": subj.strip()} for c, d, s, subj in commits],
        "preregistrations": [{"file": f, "sha256": h} for f, h, _, _ in files if f.endswith(".md")],
        "results": [{"file": f, "sha256": h, "preregistration": p, "commit": c} for f, h, p, c in files if f.endswith(".json")],
    }


def index_status() -> list[dict]:
    rows = re.findall(r"^\| ([^|]+?\.json) \| ([^|]+?) \| ([^|]+?) \| ([^|]+?) \|$", (ROOT / "results" / "INDEX.md").read_text(), re.M)
    return [{"file": f.strip(), "run": r.strip(), "status": s.strip(), "section": sec.strip()} for f, r, s, sec in rows]


def main() -> None:
    if OUT.exists():
        shutil.rmtree(OUT)
    shutil.copytree(SITE / "static", OUT)
    (OUT / ".nojekyll").touch()
    raw = OUT / "raw"
    shutil.copytree(ROOT / "results", raw / "results")
    shutil.copytree(ROOT / "preregistrations", raw / "preregistrations")
    for name in ("PROVENANCE.md", "RESULTS.md", "WHAT_IS_UMNA.md", "README.md", "LICENSE"):
        shutil.copy2(ROOT / name, raw / name)

    (OUT / "data").mkdir()
    summary = {
        "multiseed": multiseed(), "slow_harm_fine": slow_harm_fine(), "harmful_updates": harmful_updates(),
        "poisoned": poisoned_promotions(), "drift": drift(), "matched_coverage": matched_coverage(),
        "routing": routing(), "gate_power": gate_power(), "index": index_status(),
    }
    (OUT / "data" / "summary.json").write_text(json.dumps(summary, separators=(",", ":")))
    (OUT / "data" / "provenance.json").write_text(json.dumps(provenance(), indent=1))
    files = sum(1 for p in OUT.rglob("*") if p.is_file())
    print(f"built {OUT.relative_to(ROOT)}/ ({files} files)")


if __name__ == "__main__":
    main()
