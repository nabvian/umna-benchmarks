// UMNA results site. Every number comes from data/summary.json, which
// site/build.py extracts from results/; prose is quoted from the README,
// WHAT_IS_UMNA.md and RESULTS.md.
const $ = (s, root = document) => root.querySelector(s);
const SVG = "http://www.w3.org/2000/svg";
const esc = (v) => String(v).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
const f3 = (v) => (v == null ? "—" : Number(v).toFixed(3));
const pct = (v, d = 1) => (v == null ? "—" : `${(v * 100).toFixed(d)}%`);
const COLORS = { s1: "var(--series-1)", s2: "var(--series-2)", s3: "var(--series-3)", s4: "var(--series-4)" };

function el(name, attrs = {}, parent) {
  const node = document.createElementNS(SVG, name);
  for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, v);
  if (parent) parent.appendChild(node);
  return node;
}
function text(parent, x, y, content, attrs = {}) { const t = el("text", { x, y, ...attrs }, parent); t.textContent = content; return t; }
function table(container, columns, rows) {
  const head = columns.map((c) => `<th class="${c.num ? "num" : ""}">${esc(c.label)}</th>`).join("");
  const body = rows.map((r) => `<tr>${columns.map((c) => `<td class="${c.num ? "num" : ""}">${c.html ? c.html(r) : esc(c.value(r))}</td>`).join("")}</tr>`).join("");
  container.innerHTML = `<div class="table-scroll"><table><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table></div>`;
}
const chartWidth = (c) => Math.max(280, Math.round(c.clientWidth || 720));
function responsive(container, draw) {
  draw();
  let last = container.clientWidth;
  new ResizeObserver(() => { if (Math.abs(container.clientWidth - last) > 4) { last = container.clientWidth; draw(); } }).observe(container);
}
function tooltip(container) {
  const tip = document.createElement("div");
  tip.className = "tooltip"; tip.hidden = true; container.appendChild(tip);
  return {
    show(html, event) {
      const box = container.getBoundingClientRect();
      tip.innerHTML = html; tip.hidden = false;
      const x = event.clientX - box.left, y = event.clientY - box.top;
      tip.style.left = `${Math.min(Math.max(0, x + 12), box.width - tip.offsetWidth)}px`;
      tip.style.top = `${Math.max(0, y - tip.offsetHeight - 12)}px`;
    },
    hide() { tip.hidden = true; },
  };
}

// ---------- line chart with crosshair ----------
function lineChart(container, { series, yDomain, yFormat = f3, xLabel, refs = [], xTickCount = 6, height, xFormat = (x) => x, step = false }) {
  container.innerHTML = "";
  const width = chartWidth(container), compact = width < 520;
  const h = height ?? (compact ? 230 : 300);
  const m = { top: 14, right: compact ? 16 : 28, bottom: 38, left: 52 };
  const svg = el("svg", { viewBox: `0 0 ${width} ${h}`, role: "img", "aria-label": series.map((s) => s.label).join(" vs ") }, container);
  const xs = series.flatMap((s) => s.points.map((p) => p[0]));
  const x0 = Math.min(...xs), x1 = Math.max(...xs);
  const [y0, y1] = yDomain;
  const x = (v) => m.left + ((v - x0) / (x1 - x0 || 1)) * (width - m.left - m.right);
  const y = (v) => m.top + (1 - (v - y0) / (y1 - y0)) * (h - m.top - m.bottom);
  for (let i = 0; i <= 4; i += 1) {
    const v = y0 + ((y1 - y0) * i) / 4;
    el("line", { class: "gridline", x1: m.left, x2: width - m.right, y1: y(v), y2: y(v) }, svg);
    text(svg, m.left - 8, y(v) + 4, yFormat(v), { "text-anchor": "end" });
  }
  const ticks = Math.min(xTickCount, x1 - x0 + 1);
  for (let i = 0; i < ticks; i += 1) {
    const v = Math.round(x0 + ((x1 - x0) * i) / Math.max(1, ticks - 1));
    text(svg, x(v), h - 18, xFormat(v), { "text-anchor": "middle" });
  }
  if (xLabel) text(svg, (m.left + width - m.right) / 2, h - 2, xLabel, { "text-anchor": "middle" });
  for (const ref of refs) {
    el("line", { class: "ref", x1: m.left, x2: width - m.right, y1: y(ref.y), y2: y(ref.y) }, svg);
    if (ref.label) text(svg, width - m.right, y(ref.y) - 5, ref.label, { "text-anchor": "end" });
  }
  for (const s of series) {
    let d = "";
    s.points.forEach(([px, py], i) => {
      if (i === 0) d += `M${x(px).toFixed(1)},${y(py).toFixed(1)}`;
      else if (step) d += `H${x(px).toFixed(1)}V${y(py).toFixed(1)}`;
      else d += `L${x(px).toFixed(1)},${y(py).toFixed(1)}`;
    });
    el("path", { d, fill: "none", stroke: s.color, "stroke-width": 2, "stroke-linejoin": "round", "stroke-dasharray": s.dash ?? "none" }, svg);
    if (s.markers) for (const [px, py] of s.points) el("circle", { cx: x(px), cy: y(py), r: 4, fill: s.color, stroke: "var(--surface-1)", "stroke-width": 2 }, svg);
  }
  const cross = el("line", { class: "ref", y1: m.top, y2: h - m.bottom, visibility: "hidden" }, svg);
  const tip = tooltip(container);
  const overlay = el("rect", { x: m.left, y: m.top, width: width - m.left - m.right, height: h - m.top - m.bottom, fill: "transparent" }, svg);
  overlay.addEventListener("pointermove", (event) => {
    const box = svg.getBoundingClientRect();
    const sx = ((event.clientX - box.left) / box.width) * width;
    const xv = x0 + ((sx - m.left) / (width - m.left - m.right)) * (x1 - x0);
    const rows = series.map((s) => {
      let best = s.points[0];
      for (const p of s.points) if (Math.abs(p[0] - xv) < Math.abs(best[0] - xv)) best = p;
      return { s, p: best };
    });
    const px = rows[0].p[0];
    cross.setAttribute("x1", x(px)); cross.setAttribute("x2", x(px)); cross.setAttribute("visibility", "visible");
    tip.show(`<b>${esc(xFormat(px))}</b>${rows.map((r) => `<br><span class="k">${esc(r.s.label)}</span> ${yFormat(r.p[1])}`).join("")}`, event);
  });
  overlay.addEventListener("pointerleave", () => { tip.hide(); cross.setAttribute("visibility", "hidden"); });
}

// ---------- horizontal bars ----------
function barChart(container, rows, { max, format, color = COLORS.s1, label = (r) => r.label, labelWidth }) {
  container.innerHTML = "";
  const width = chartWidth(container), compact = width < 560;
  const lw = labelWidth ?? (compact ? 150 : 320), rowH = 34, h = rows.length * rowH + 28;
  const svg = el("svg", { viewBox: `0 0 ${width} ${h}`, role: "img" }, container);
  const plot = width - lw - 56;
  const x = (v) => lw + (v / max) * plot;
  for (let t = 0; t <= max; t += 1) {
    el("line", { class: "gridline", x1: x(t), x2: x(t), y1: 0, y2: h - 24 }, svg);
    text(svg, x(t), h - 8, t, { "text-anchor": "middle" });
  }
  const tip = tooltip(container);
  rows.forEach((r, i) => {
    const y = i * rowH + 6, w = Math.max(2, (r.value / max) * plot);
    const name = label(r);
    text(svg, lw - 10, y + 15, compact && name.length > 22 ? `${name.slice(0, 21)}…` : name, { "text-anchor": "end", class: "strong" });
    el("path", { d: `M${lw},${y} H${lw + w - 4} Q${lw + w},${y} ${lw + w},${y + 4} V${y + 16} Q${lw + w},${y + 20} ${lw + w - 4},${y + 20} H${lw} Z`, fill: r.color ?? color }, svg);
    text(svg, lw + w + 8, y + 15, format(r));
    const hit = el("rect", { x: 0, y: y - 6, width, height: rowH, fill: "transparent" }, svg);
    hit.addEventListener("pointermove", (e) => tip.show(r.tip ?? `<b>${esc(name)}</b><br>${esc(format(r))}`, e));
    hit.addEventListener("pointerleave", () => tip.hide());
  });
}

// ---------- interval plot ----------
function intervalChart(container, rows) {
  container.innerHTML = "";
  const width = chartWidth(container), compact = width < 520;
  const lw = compact ? 120 : 170, rowH = 56, h = rows.length * rowH + 40, m = { right: 20 };
  const svg = el("svg", { viewBox: `0 0 ${width} ${h}`, role: "img", "aria-label": "Shared network minus UMNA with 95% intervals" }, container);
  const lo = -0.16, hi = 0.04;
  const x = (v) => lw + ((v - lo) / (hi - lo)) * (width - lw - m.right);
  for (const t of [-0.15, -0.1, -0.05, 0]) {
    el("line", { class: t === 0 ? "ref" : "gridline", x1: x(t), x2: x(t), y1: 4, y2: h - 30 }, svg);
    text(svg, x(t), h - 14, t === 0 ? "0" : t.toFixed(2), { "text-anchor": "middle" });
  }
  text(svg, x(-0.155), h - 0, "← UMNA more accurate", {});
  const tip = tooltip(container);
  rows.forEach((r, i) => {
    const cy = i * rowH + 26;
    text(svg, lw - 12, cy + 4, r.label, { "text-anchor": "end", class: "strong" });
    el("line", { x1: x(r.low), x2: x(r.high), y1: cy, y2: cy, stroke: COLORS.s1, "stroke-width": 2 }, svg);
    for (const v of [r.low, r.high]) el("line", { x1: x(v), x2: x(v), y1: cy - 6, y2: cy + 6, stroke: COLORS.s1, "stroke-width": 2 }, svg);
    el("circle", { cx: x(r.mean), cy, r: 6, fill: COLORS.s1, stroke: "var(--surface-1)", "stroke-width": 2 }, svg);
    text(svg, x(r.mean), cy - 12, r.mean.toFixed(3), { "text-anchor": "middle" });
    const hit = el("rect", { x: lw, y: cy - 20, width: width - lw, height: 40, fill: "transparent" }, svg);
    hit.addEventListener("pointermove", (e) => tip.show(`<b>${esc(r.label)}</b><br><span class="k">mean</span> ${r.mean.toFixed(3)}<br><span class="k">95% interval</span> [${r.low.toFixed(3)}, ${r.high.toFixed(3)}]`, e));
    hit.addEventListener("pointerleave", () => tip.hide());
  });
}

// ---------- grouped vertical bars ----------
function groupedBars(container, cells, arms) {
  container.innerHTML = "";
  const width = chartWidth(container), compact = width < 640;
  const h = compact ? 260 : 300, m = { top: 14, right: 10, bottom: 46, left: 44 };
  const svg = el("svg", { viewBox: `0 0 ${width} ${h}`, role: "img", "aria-label": "Net correct rate by task and budget" }, container);
  const y = (v) => m.top + (1 - v) * (h - m.top - m.bottom);
  for (const t of [0, 0.25, 0.5, 0.75, 1]) {
    el("line", { class: "gridline", x1: m.left, x2: width - m.right, y1: y(t), y2: y(t) }, svg);
    text(svg, m.left - 8, y(t) + 4, t.toFixed(2), { "text-anchor": "end" });
  }
  const groupW = (width - m.left - m.right) / cells.length, barW = Math.max(4, (groupW - 12) / arms.length - 2);
  const tip = tooltip(container);
  cells.forEach((c, gi) => {
    const gx = m.left + gi * groupW + 6;
    arms.forEach((a, ai) => {
      const v = Math.max(0, c[a.key]), bx = gx + ai * (barW + 2);
      el("path", { d: `M${bx},${y(0)} V${y(v) + 3} Q${bx},${y(v)} ${bx + 3},${y(v)} H${bx + barW - 3} Q${bx + barW},${y(v)} ${bx + barW},${y(v) + 3} V${y(0)} Z`, fill: a.color }, svg);
      const hit = el("rect", { x: bx - 1, y: m.top, width: barW + 2, height: h - m.top - m.bottom, fill: "transparent" }, svg);
      hit.addEventListener("pointermove", (e) => tip.show(`<b>${esc(c.task)} · ${esc(c.budget)} budget</b><br><span class="k">${esc(a.label)}</span> ${c[a.key].toFixed(3)}`, e));
      hit.addEventListener("pointerleave", () => tip.hide());
    });
    text(svg, gx + (groupW - 12) / 2, h - 26, compact ? c.task.replace("task ", "T") : c.task, { "text-anchor": "middle", class: "strong" });
    text(svg, gx + (groupW - 12) / 2, h - 10, c.budget, { "text-anchor": "middle" });
  });
}

function segmented(container, options, onChange) {
  container.innerHTML = options.map((o, i) => `<button type="button" role="tab" aria-selected="${i === 0}" data-v="${esc(o)}">${esc(o)}</button>`).join("");
  container.addEventListener("click", (e) => {
    const b = e.target.closest("button"); if (!b) return;
    container.querySelectorAll("button").forEach((x) => x.setAttribute("aria-selected", String(x === b)));
    onChange(b.dataset.v);
  });
}

// ---------- static content (quoted from the repository's documents) ----------
const ARCH = {
  request: ["A request", "Anything the system is asked to answer. The planner decides what serves it; nothing in the request names a Wing."],
  planner: ["Planner · NICE-R", "Decides for each request which Wings to run and whether to combine them. It scores each candidate set by estimated utility minus cost (compute, latency, memory and a per-Wing charge set per deployment by a stated rule) under hard limits, and it is not given any table saying which Wing serves which task."],
  admission: ["Admission", "A set of Wings may answer only through a calibration class fitted for that exact set, Core version, hardware and fusion rule. Calibration is split conformal, so its confidence holds on data it was not fitted on. A set without a class runs in shadow only: it collects evidence but never answers a user."],
  execution: ["Execution", "Runs the chosen Wings through the frozen Core, fuses their outputs, and writes a trace: which Wings and versions ran, the calibrator's fingerprint, why the answer was admitted, and how long each part took. A trace can be replayed."],
  trace: ["Answer + trace", "Every answer carries a record of what produced it and why it was allowed, so an operator can localise a fault: in testing, wrong-version, hardware and fusion faults were found from the trace every time and from a conventional log never."],
  registry: ["Registry", "Holds the installed Wings and what the host itself measured about them: compute, latency, memory, reliability. It does not trust what a Wing claims about itself."],
  core: ["Frozen Core and Wings", "The Core is a shared network, trained once and then frozen; its parameters are hash-pinned and nothing writes to them. Wings are small modules with declared input and output types, each trained through the frozen Core for one job, versioned and owned separately, so one team's update cannot touch another team's Wing."],
  cce: ["CCE · Conservative Capability Extension", "Decides whether a new version or Wing may go live. The candidate runs in shadow first, and is promoted only if, on the same evaluation rows, the lower confidence bound of its change is within a step tolerance ε of the version serving now and within a total budget E of the very first version. Too few rows to tell, and the gate does not decide. A rejected candidate never demotes the version already serving."],
  interrupts: ["Safety interrupts", "Pre-authorised Wings that can add a guard, force an escalation, or force the system to decline. They never silently replace the answer."],
};

const CLAIMS = [
  { id: "HC", what: "NICE-R routes by capability, without being told which Wing serves which task", status: ["Supported", "good"], detail: "Replicated on 4 of 5 further seeds. Right task's Wings on every row of every seed; never lost to a normal gating router." },
  { id: "H3", what: "CCE blocks harmful updates", status: ["Supported", "good"], detail: "Replicated on 5 of 5 further seeds. None of 75 poisoned versions promoted." },
  { id: "H3-slow", what: "The cumulative budget stops slow erosion that every step passes", status: ["Supported", "good"], detail: "On all six seeds once the gate's minimum rows are enforced; a gate too small for the budget now refuses every update instead." },
  { id: "HD", what: "Adding capabilities leaves the Core and old Wings unchanged, and old tasks do not forget", status: ["Supported", "good"], detail: "Replicated on 4 of 5 further seeds (UMNA's side on all 5). At the same coverage UMNA is about 1 point more accurate when a task is learned, and about 11 points ahead on old tasks after six." },
  { id: "H1", what: "NICE-R beats simpler planners on real data", status: ["Does not replicate", "bad"], detail: "Met its bar on the first seed only; over six seeds 40 wins, 23 losses against greedy." },
  { id: "H2", what: "Combining Wings finds useful pairs", status: ["Weak", "warn"], detail: "Helped on one real dataset of seven." },
  { id: "H6", what: "The trace localises operational faults a conventional log misses", status: ["Supported", "neutral"], detail: "Largely by construction; the gaps it exposed were fixed." },
];

const TESTS = [
  { n: 1, title: "Composition benchmark (synthetic)", q: "On a task family built so two Wings are complementary, does NICE-R find the pair?", outcome: ["H2 not supported for NICE-R", "bad"], body: "The pair is real: under log-odds fusion it is right 91.8% of the time against 72% for its better half. Greedy, beam, density and exhaustive search find it. NICE-R did not: at its per-Wing cost it answered with one Wing. The first run predates a code audit; both it and the rerun are kept.", prereg: ["COMPOSITION_PREREGISTRATION.md"], files: ["composition_results.json", "composition_results_after_audit_fixes.json"] },
  { n: 2, title: "Real data, phase 1", q: "Seven OpenML CC18 datasets: planners (N), CCE under real updates (C), and the trace under injected faults (T).", outcome: ["Mixed; four fixes made", "warn"], body: "N: its per-Wing cost, tuned on Bioresponse, made NICE-R answer with one Wing on every held-out row (H1 partly supported). C: labels flipped up to 45% never reached the served system — fusion kept it between 0.913 and 0.923 while the updated Wing fell from 0.907 to 0.652; CCE caught the drift but refused two of three harmless retrains, and two gate defects were fixed. T: wrong version, hardware and fusion mismatches were localised from the trace every time and from the log never. After four fixes the corrupted calibrator was localised 20 of 20 times.", prereg: ["REALDATA_PREREGISTRATION.md", "REALDATA_DEVIATIONS.md"], files: ["realdata_nicer_results.json", "realdata_cce_results.json", "realdata_cce_results_after_fixes.json", "realdata_transparency_results.json", "realdata_transparency_results_after_fixes.json", "realdata_transparency_retargeted.json"] },
  { n: 3, title: "Real data, phase 2", q: "With the per-Wing cost set by a rule, does NICE-R beat greedy (N2), and does CCE stop a harm that reaches the served system (C2)?", outcome: ["H3 supported; H1 on this seed only", "good"], body: "N2: 8 wins, 2 losses in 14 cells on this seed (it does not replicate, §9); combining Wings helped on one dataset. C2: on all three qualifying datasets CCE promoted none of 15 harmful versions; with no gate the served accuracy fell to 0.070, 0.528 and 0.430. The step test alone caught every harmful version here.", prereg: ["REALDATA2_PREREGISTRATION.md", "REALDATA2_DEVIATIONS.md"], files: ["realdata_harm_pilot.json", "realdata2_nicer_results.json", "realdata2_cce_results.json"] },
  { n: 4, title: "Capability routing", q: "Four tasks, three Wings each, plus distractors; NICE-R is not told the mapping. Does it route correctly and beat a gating router?", outcome: ["HC supported (after an invalid run)", "good"], body: "The preregistered run is invalid: the utility estimator failed silently, so every estimator-based planner routed blind. It is kept. After the fix, NICE-R served its task's Wings on every row; 7 wins, 0 losses against a top-1 gate and 8, 0 against a top-2 gate.", prereg: ["CAPABILITY_ROUTING_PREREGISTRATION.md", "CAPABILITY_ROUTING_DEVIATIONS.md"], files: ["capability_routing_results.json", "capability_routing_results_fixed_estimator.json"] },
  { n: 5, title: "Drift on the frozen Core", q: "Six tasks added one at a time: does anything old change, and does a fine-tuned shared network forget?", outcome: ["HD supported", "good"], body: "The Core's hash never changed and every old Wing's outputs stayed bit-identical. Old tasks' served answers still moved because the planner started using new Wings (one task's accuracy fell 0.017); CCE kept every old task within E. The shared network forgot: its first task fell from 0.963 to 0.743.", prereg: ["DRIFT_PREREGISTRATION.md", "DRIFT_DEVIATIONS.md"], files: ["drift_frozen_core_results.json"] },
  { n: 6, title: "Slow harm, one percent per step", q: "Thirty versions, each with one more percent of the poisoned region: is the cumulative budget needed?", outcome: ["Budget needed on 1 of 3", "good"], body: "On qsar-biodeg the step test alone let the Wing fall from 0.817 to 0.616; CCE held it at 0.821. On the other two the step test stopped the erosion by itself.", prereg: ["SLOW_HARM_PREREGISTRATION.md", "SLOW_HARM_DEVIATIONS.md"], files: ["slow_harm_results.json"] },
  { n: 7, title: "Slow harm, one label per step", q: "Each version inverts one more training label. Does the budget stop erosion that every step passes?", outcome: ["Supported on 2 datasets", "good"], body: "On spambase the step test alone passed all 552 versions and let accuracy fall from 0.907 to 0.683; CCE held at 0.863. On qsar-biodeg, the same pattern. An origin check on point estimates, without bounds, served eroded versions on two datasets.", prereg: ["SLOW_HARM_FINE_PREREGISTRATION.md", "SLOW_HARM_FINE_DEVIATIONS.md"], files: ["slow_harm_fine_results.json"] },
  { n: 8, title: "Accuracy at the same coverage", q: "UMNA declines 5–12% of rows; scored on the same share of rows, how does it compare with a shared network?", outcome: ["UMNA more accurate", "good"], body: "Shared minus UMNA over six seeds: −0.009 when a task is first learned, −0.106 on old tasks after six, −0.003 (no difference detected) on the newest task. This compares UMNA as built with the simplest fine-tuning baseline; it does not show that freezing a Core is free in general.", prereg: ["MATCHED_COVERAGE_PREREGISTRATION.md", "MATCHED_COVERAGE_DEVIATIONS.md"], files: ["matched_coverage_results.json"] },
  { n: 9, title: "Multi-seed reruns", q: "Five further seeds for each supported claim; a claim replicates only if its verdict holds on all five.", outcome: ["H3 replicates; H1 does not", "warn"], body: "H3: 5 of 5, 0 of 75 poisoned versions promoted. HC: 4 of 5 (one cell added another task's Wing). HD: 4 of 5 (UMNA's side held on all 5). H1: 0 of 5. Slow harm, one label per step: 2 of 5, failing on qsar-biodeg with 369 gate rows — fixed in §10.", prereg: ["MULTISEED_PREREGISTRATION.md", "MULTISEED_DEVIATIONS.md"], files: ["multiseed_results.json"] },
  { n: 10, title: "The gate's minimum rows", q: "If the gate refuses to decide on fewer rows than its power needs, does the budget hold everywhere?", outcome: ["Fix supported", "good"], body: "Rerun on six seeds: no eroded version served anywhere. qsar-biodeg needs 424 to 568 gate rows and has 369, so it now refuses every update; spambase and banknote decide exactly as before. Not addressed: the audit rows that define \"eroded\" are a finite sample, and every version in a series is a new look at the same origin.", prereg: ["GATE_POWER_PREREGISTRATION.md", "GATE_POWER_DEVIATIONS.md"], files: ["gate_power_results.json"] },
];

// ---------- render ----------
const [summary, provenance] = await Promise.all([fetch("data/summary.json").then((r) => r.json()), fetch("data/provenance.json").then((r) => r.json())]);

// Hero stats
{
  const p = summary.poisoned, old = summary.matched_coverage.find((r) => r.label.startsWith("Old"));
  const stats = [
    [`${p.replicate_poisoned_promoted} of ${p.replicate_poisoned_offered}`, "poisoned versions promoted across five replicate seeds"],
    [summary.drift.core_unchanged && summary.drift.max_wing_output_change === 0 ? "0 bits" : "changed", "changed in the Core or any old Wing as six tasks were added"],
    [`${Math.round(-old.mean * 100)} pts`, "more accurate than a fine-tuned shared network on old tasks, at the same coverage"],
    [`${provenance.preregistrations.length + provenance.results.length}`, `files hashed: ${provenance.preregistrations.length} preregistrations, ${provenance.results.length} result files`],
  ];
  $("#hero-stats").innerHTML = stats.map(([v, l]) => `<div class="stat"><strong>${esc(v)}</strong><span>${esc(l)}</span></div>`).join("");
}

// Architecture explorer
{
  const detail = $("#arch-detail");
  const select = (key) => {
    document.querySelectorAll(".arch-node").forEach((n) => n.setAttribute("aria-pressed", String(n.dataset.node === key)));
    const [title, body] = ARCH[key];
    detail.innerHTML = `<h3>${esc(title)}</h3><p>${esc(body)}</p>`;
  };
  document.querySelectorAll(".arch-node").forEach((n) => n.addEventListener("click", () => select(n.dataset.node)));
  select("planner");
}

// Claims
$("#claims-list").innerHTML = CLAIMS.map((c) => `<article class="claim"><header><code>${esc(c.id)}</code><span class="pill ${c.status[1]}">${esc(c.status[0])}</span></header><p class="what">${esc(c.what)}</p><p>${esc(c.detail)}</p></article>`).join("");
{
  const rows = summary.multiseed.map((r) => ({ label: r.label, value: r.supported, rule: r.rule }));
  responsive($("#chart-multiseed"), () => barChart($("#chart-multiseed"), rows, { max: 5, format: (r) => `${r.value} of 5 · ${r.rule}` }));
  table($("#table-multiseed"), [{ label: "claim", value: (r) => r.label }, { label: "supported on", num: true, value: (r) => `${r.value} of 5` }, { label: "result", value: (r) => r.rule }], rows);
}

// Harmful updates (C2)
{
  const data = summary.harmful_updates, names = Object.keys(data);
  const draw = (name) => {
    const d = data[name];
    const xs = d.arms.cce.map((_, i) => i);
    const labels = ["origin", ...d.candidates];
    const series = [
      { label: "no gate", color: COLORS.s2, points: d.arms.no_gate.map((v, i) => [xs[i], v]) },
      { label: "CCE", color: COLORS.s1, points: d.arms.cce.map((v, i) => [xs[i], v]) },
    ];
    responsive($("#chart-harm"), () => lineChart($("#chart-harm"), { series, yDomain: [0, 1], step: true, xLabel: "candidate offered", xTickCount: labels.length, xFormat: (i) => (i === 0 ? "origin" : `c${i}`) }));
    $("#harm-callout").textContent = `${name}: with no gate, ${d.harmful_promoted.no_gate} of ${d.harmful_offered} harmful versions went live and served accuracy fell to ${f3(d.worst.no_gate)}. CCE promoted ${d.harmful_promoted.cce}, and never served below ${f3(d.worst.cce)} (origin ${f3(d.origin)}).`;
    table($("#table-harm"), [{ label: "candidate", value: (r) => r.c }, { label: "candidate accuracy", num: true, value: (r) => f3(r.acc) }, { label: "served · no gate", num: true, value: (r) => f3(r.ng) }, { label: "served · CCE", num: true, value: (r) => f3(r.cce) }],
      labels.map((c, i) => ({ c, acc: i === 0 ? d.origin : d.candidate_accuracy[i - 1], ng: d.arms.no_gate[i], cce: d.arms.cce[i] })));
  };
  segmented($("#seg-harm"), names, draw); draw(names[0]);
}

// Slow erosion
{
  const data = summary.slow_harm_fine, names = Object.keys(data);
  const draw = (name) => {
    const d = data[name];
    const pts = (arr) => arr.map((v, i) => [i, v]);
    const series = [
      { label: "no gate", color: COLORS.s2, points: pts(d.arms.no_gate) },
      { label: "step test only", color: COLORS.s3, points: pts(d.arms.cce_step_only) },
      { label: "CCE", color: COLORS.s1, points: pts(d.arms.cce) },
    ];
    const minimum = Math.min(...d.arms.no_gate, d.origin - d.budget) - 0.03;
    responsive($("#chart-slow"), () => lineChart($("#chart-slow"), { series, yDomain: [Math.floor(minimum * 20) / 20, Math.ceil((d.origin + 0.02) * 20) / 20], step: true, xLabel: "version offered", refs: [{ y: d.origin - d.budget, label: `origin − E (${f3(d.origin - d.budget)})` }] }));
    const worstStep = Math.min(...d.arms.cce_step_only), worstCce = Math.min(...d.arms.cce);
    $("#slow-callout").textContent = `${name}: ${d.candidates} versions offered. The step test alone let served accuracy fall from ${f3(d.origin)} to ${f3(worstStep)}; CCE never served below ${f3(worstCce)}, inside the budget (E = ${d.budget}). With no gate every version is served too, so its line lies under the step-only one.`;
    const every = Math.max(1, Math.floor(d.arms.cce.length / 40));
    table($("#table-slow"), [{ label: "version", num: true, value: (r) => r.i }, { label: "no gate", num: true, value: (r) => f3(r.a) }, { label: "step only", num: true, value: (r) => f3(r.b) }, { label: "CCE", num: true, value: (r) => f3(r.c) }],
      d.arms.cce.map((c, i) => ({ i, a: d.arms.no_gate[i], b: d.arms.cce_step_only[i], c })).filter((r) => r.i % every === 0 || r.i === d.arms.cce.length - 1));
  };
  segmented($("#seg-slow"), names, draw); draw(names[0]);
}

// Drift
{
  const d = summary.drift, t1u = d.umna.task_1, t1s = d.shared.task_1;
  responsive($("#chart-drift"), () => lineChart($("#chart-drift"), { series: [{ label: "UMNA", color: COLORS.s1, points: t1u, markers: true }, { label: "shared network", color: COLORS.s2, points: t1s, markers: true }], yDomain: [0.6, 1], xLabel: "tasks added", xFormat: (v) => `${v}`, height: 250 }));
  table($("#table-drift"), [{ label: "task", value: (r) => r.task }, ...[1, 2, 3, 4, 5, 6].map((s) => ({ label: `stage ${s}`, num: true, value: (r) => r[s] ?? "" }))],
    Object.keys(d.umna).flatMap((task) => [
      { task: `${task.replace("_", " ")} · UMNA`, ...Object.fromEntries(d.umna[task].map(([s, v]) => [s, f3(v)])) },
      { task: `${task.replace("_", " ")} · shared`, ...Object.fromEntries(d.shared[task].map(([s, v]) => [s, f3(v)])) },
    ]));
}

// Matched coverage
responsive($("#chart-coverage"), () => intervalChart($("#chart-coverage"), summary.matched_coverage));
table($("#table-coverage"), [{ label: "when", value: (r) => r.label }, { label: "mean", num: true, value: (r) => f3(r.mean) }, { label: "95% interval", num: true, value: (r) => `[${f3(r.low)}, ${f3(r.high)}]` }, { label: "six seeds", value: (r) => r.values.map((v) => v.toFixed(3)).join(", ") }], summary.matched_coverage);

// Routing
{
  const r = summary.routing;
  const arms = [{ key: "nice_r", label: "NICE-R", color: COLORS.s1 }, { key: "gate_top1", label: "gate top-1", color: COLORS.s2 }, { key: "gate_top2", label: "gate top-2", color: COLORS.s3 }, { key: "greedy", label: "greedy", color: COLORS.s4 }];
  responsive($("#chart-routing"), () => groupedBars($("#chart-routing"), r.cells, arms));
  $("#routing-callout").textContent = `NICE-R served its own task's Wings on every row. Against a top-1 gating router: ${r.vs_top1.wins} wins, ${r.vs_top1.losses} losses; against top-2: ${r.vs_top2.wins} wins, ${r.vs_top2.losses} losses. It matches greedy, which uses the same estimator.`;
  table($("#table-routing"), [{ label: "task", value: (c) => c.task }, { label: "budget", value: (c) => c.budget }, ...arms.map((a) => ({ label: a.label, num: true, value: (c) => f3(c[a.key]) }))], r.cells);
}

// ---------- calculators ----------
// Inverse standard normal CDF (Acklam's rational approximation, |error| < 1.2e-9).
function zInv(p) {
  const a = [-39.69683028665376, 220.9460984245205, -275.9285104469687, 138.357751867269, -30.66479806614716, 2.506628277459239];
  const b = [-54.47609879822406, 161.5858368580409, -155.6989798598866, 66.80131188771972, -13.28068155288572];
  const c = [-0.007784894002430293, -0.3223964580411365, -2.400758277161838, -2.549732539343734, 4.374664141464968, 2.938163982698783];
  const d = [0.007784695709041462, 0.3224671290700398, 2.445134137142996, 3.754408661907416];
  const lo = 0.02425;
  if (p < lo) { const q = Math.sqrt(-2 * Math.log(p)); return (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) / ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1); }
  if (p > 1 - lo) return -zInv(1 - p);
  const q = p - 0.5, r = q * q;
  return (((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q / (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1);
}

{
  const form = $("#calc-rows");
  const presets = Object.entries(summary.gate_power.datasets);
  const originGate = { spambase: 0.9111801242236025, "banknote-authentication": 0.9916666666666667, "qsar-biodeg": 0.8644986449864499 };
  $("#presets").innerHTML = presets.map(([name, d]) => `<button type="button" data-name="${esc(name)}">${esc(name)} · ${d.gate_rows} rows</button>`).join("");
  $("#presets").addEventListener("click", (e) => {
    const b = e.target.closest("button"); if (!b) return;
    const name = b.dataset.name;
    form.p.value = originGate[name]; form.n.value = summary.gate_power.datasets[name].gate_rows; form.e.value = 0.05; form.alpha.value = "0.10"; form.power.value = "0.80"; form.floor.value = 50;
    update();
  });
  const update = () => {
    const p = Number(form.p.value), n = Math.max(2, Number(form.n.value) || 2), E = Number(form.e.value);
    const alpha = Number(form.alpha.value), power = Number(form.power.value), floor = Math.max(0, Number(form.floor.value) || 0);
    form.p_out.value = p.toFixed(4); form.e_out.value = E.toFixed(3);
    const variance = p * (1 - p) * (n / (n - 1));
    const raw = ((zInv(1 - alpha) + zInv(power)) * Math.sqrt(2 * variance) / E) ** 2;
    const minimum = Math.max(floor, Math.ceil(raw));
    const decides = n >= minimum;
    const out = $("#rows-result");
    out.className = `result ${decides ? "ok" : "no"}`;
    out.innerHTML = `<span class="big">${minimum.toLocaleString()} rows needed</span>${decides ? `The gate can decide: ${n.toLocaleString()} rows available.` : `The gate refuses to decide: only ${n.toLocaleString()} rows, so nothing is promoted.`}<br><span class="muted">raw ${raw.toFixed(2)}${raw < floor ? `, lifted to the floor of ${floor}` : ""} · var ${variance.toFixed(4)}</span>`;
  };
  form.addEventListener("input", update); update();
}

{
  const form = $("#calc-erosion");
  const update = () => {
    const delta = Number(form.d.value), eps = Number(form.eps.value), E = Number(form.E.value), versions = Number(form.v.value);
    form.d_out.value = delta.toFixed(3); form.eps_out.value = eps.toFixed(3); form.E_out.value = E.toFixed(2); form.v_out.value = versions;
    const origin = 0.9;
    const simulate = (useBudget) => {
      let serving = origin, rejectedAt = null; const path = [[0, origin]];
      for (let k = 1; k <= versions; k += 1) {
        const candidate = serving - delta; // each version is a little worse than the one serving
        const stepOk = serving - candidate <= eps;
        const budgetOk = !useBudget || origin - candidate <= E;
        if (stepOk && budgetOk) serving = candidate; else if (rejectedAt == null) rejectedAt = k;
        path.push([k, serving]);
      }
      return { path, final: serving, rejectedAt };
    };
    const stepOnly = simulate(false), cce = simulate(true);
    const lowest = Math.min(stepOnly.final, origin - E) - 0.02;
    lineChart($("#chart-toy"), { series: [{ label: "step test only", color: COLORS.s3, points: stepOnly.path }, { label: "CCE", color: COLORS.s1, points: cce.path }], yDomain: [Math.max(0, Math.floor(lowest * 50) / 50), 0.92], step: true, xLabel: "version offered", refs: [{ y: origin - E, label: "origin − E" }], height: 220 });
    $("#toy-result").innerHTML = delta > eps
      ? `Each step loses ${delta.toFixed(3)}, more than ε = ${eps.toFixed(3)}: the step test refuses the first candidate, so both rules hold at the origin.`
      : `The step test alone passes every one of ${versions} versions and ends at <b>${stepOnly.final.toFixed(3)}</b> (−${(origin - stepOnly.final).toFixed(3)}). CCE stops at version ${cce.rejectedAt ?? "—"} and holds <b>${cce.final.toFixed(3)}</b>, inside the budget.`;
  };
  form.addEventListener("input", update);
  responsive($("#chart-toy"), update);
}

// ---------- timeline ----------
{
  const status = Object.fromEntries(summary.index.map((r) => [r.file, r.status]));
  const statusClass = (s = "") => (/^current/i.test(s) ? "current" : /superseded/i.test(s) ? "superseded" : /invalid/i.test(s) ? "invalid" : "other");
  const shortStatus = (s = "") => (/^current/i.test(s) ? "current" : /superseded/i.test(s) ? "superseded" : /invalid/i.test(s) ? "invalid" : /pilot/i.test(s) ? "pilot" : /exploratory/i.test(s) ? "exploratory" : /valid/i.test(s) ? "valid" : "file");
  const preHash = Object.fromEntries(provenance.preregistrations.map((p) => [p.file, p.sha256]));
  $("#timeline").innerHTML = TESTS.map((t) => `<details class="test"><summary><span class="num">${t.n}</span><span class="title">${esc(t.title)}<span class="q">${esc(t.q)}</span></span><span class="pill ${t.outcome[1]}">${esc(t.outcome[0])}</span></summary><div class="body"><p>${esc(t.body)}</p>
    <div class="files">${t.prereg.map((f) => `<a class="file-chip" href="raw/preregistrations/${esc(f)}" title="SHA-256 ${esc(preHash[f] ?? "")}">📄 ${esc(f)} <small class="other">${esc((preHash[f] ?? "").slice(0, 8))}</small></a>`).join("")}</div>
    <div class="files">${t.files.map((f) => `<a class="file-chip" href="raw/results/${esc(f)}" title="${esc(status[f] ?? "")}">{ } ${esc(f)} <small class="${statusClass(status[f])}">${esc(shortStatus(status[f]))}</small></a>`).join("")}</div></div></details>`).join("");
}

// ---------- provenance ----------
$("#provenance-copy").innerHTML = `The UMNA source is private for now. Each result file was produced by, and first committed with, a GPG-signed commit of that source (key <code>${esc(provenance.gpg_key)}</code>, author Koushik Das). Once the source is released or shown to a reviewer, the commit and file hashes show these files came from that code at that time.`;
table($("#commits-table"), [{ label: "commit", html: (c) => `<span class="hash">${esc(c.commit.slice(0, 12))}</span>` }, { label: "date (UTC)", value: (c) => c.date.replace("T", " ").replace("Z", "") }, { label: "signature", html: (c) => `<span class="pill ${c.signature === "good" ? "good" : "bad"}">${esc(c.signature)}</span>` }, { label: "subject", value: (c) => c.subject }], provenance.commits);

// ---------- verification ----------
async function sha256Hex(buffer) {
  const digest = await crypto.subtle.digest("SHA-256", buffer);
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
}
async function verify(includeResults) {
  const buttons = [$("#verify-quick"), $("#verify-all")];
  buttons.forEach((b) => { b.disabled = true; });
  const items = [
    ...provenance.preregistrations.map((p) => ({ kind: "preregistration", file: p.file, path: `raw/preregistrations/${p.file}`, expected: p.sha256 })),
    ...(includeResults ? provenance.results.map((r) => ({ kind: "result", file: r.file, path: `raw/results/${r.file}`, expected: r.sha256, prereg: r.preregistration })) : []),
  ];
  const bar = $("#verify-progress"), fill = bar.firstElementChild, statusEl = $("#verify-status");
  bar.hidden = false; fill.style.width = "0";
  const rows = [];
  let done = 0, ok = 0;
  const render = () => table($("#verify-table"), [
    { label: "file", value: (r) => r.file }, { label: "type", value: (r) => r.kind },
    { label: "SHA-256 (computed)", html: (r) => `<span class="hash">${esc(r.actual ? `${r.actual.slice(0, 16)}…` : "")}</span>` },
    { label: "matches PROVENANCE.md", html: (r) => (r.error ? `<span class="bad-mark">✗ ${esc(r.error)}</span>` : r.match ? `<span class="ok-mark">✓</span>` : `<span class="bad-mark">✗</span>`) },
    { label: "recorded preregistration", html: (r) => (r.kind !== "result" ? "" : !r.prereg ? `<span class="muted">none recorded</span>` : r.preregMatch ? `<span class="ok-mark">✓ ${esc(r.prereg)}</span>` : `<span class="bad-mark">✗</span>`) },
  ], rows);
  const queue = [...items];
  const worker = async () => {
    while (queue.length) {
      const item = queue.shift();
      const row = { ...item };
      try {
        const response = await fetch(item.path, { cache: "no-store" });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const buffer = await response.arrayBuffer();
        row.actual = await sha256Hex(buffer);
        row.match = row.actual === item.expected;
        if (item.kind === "result" && item.prereg) {
          const recorded = JSON.parse(new TextDecoder().decode(buffer)).preregistration_sha256 ?? "";
          row.preregMatch = recorded.startsWith(item.prereg) && provenance.preregistrations.some((p) => p.sha256 === recorded);
        }
      } catch (error) { row.error = error.message; }
      rows.push(row); done += 1;
      if (row.match && (row.kind !== "result" || !row.prereg || row.preregMatch)) ok += 1;
      fill.style.width = `${(100 * done) / items.length}%`;
      statusEl.textContent = `${done} of ${items.length} checked`;
    }
  };
  await Promise.all([worker(), worker(), worker(), worker()]);
  rows.sort((a, b) => (a.kind === b.kind ? a.file.localeCompare(b.file) : a.kind === "preregistration" ? -1 : 1));
  render();
  statusEl.innerHTML = ok === items.length ? `<span class="ok-mark">✓ All ${items.length} files match their published SHA-256${includeResults ? ", and every result's recorded preregistration hash matches" : ""}.</span>` : `<span class="bad-mark">${items.length - ok} of ${items.length} did not match.</span>`;
  buttons.forEach((b) => { b.disabled = false; });
}
$("#verify-quick").addEventListener("click", () => verify(false));
$("#verify-all").addEventListener("click", () => verify(true));
