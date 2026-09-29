# What UMNA is

**Version:** 0.1.0 | **Author:** Koushik Das | **Status:** a hypothesis under test

UMNA (Unified Modular Neural Architecture) is an idea about how to build
AI systems that can keep learning new things without quietly breaking
the things they already do. This page says what the idea is, how I
propose to build it, where the evidence stands, and why the code is not
public yet.

## The problem

Most systems get new abilities by retraining or fine-tuning one shared
set of weights. That works, but every update touches everything. A
change made to improve one task can make another task worse, and often
nobody notices until it matters. Mixture-of-experts models split the
work across experts, but the router that picks them is itself learned
and has no notion of what each expert is for. And when a system gives an
answer, it is usually hard to say which parts produced it, and whether
the update that went in last week was allowed to change it.

I want a system where adding a capability cannot damage an existing one,
where the parts that answer a request are chosen for what they can do,
where every update has to prove it did no harm before it goes live, and
where every answer can be traced back to what produced it.

## The hypothesis

A system built from a frozen shared core and small, separately trained
capability modules, with a planner that picks modules by expected value
against cost, a calibrated gate on every answer, and a statistical gate
on every update, will:

1. add new capabilities without changing any existing one;
2. send each request to the modules that can actually serve it, without
   being told which module belongs to which task;
3. keep the accuracy of every protected capability within a declared
   budget over any sequence of updates, including slow ones where each
   step looks harmless;
4. decline to answer rather than answer without calibrated support; and
5. record, for every answer, what produced it and why it was allowed.

Each of these is broken into claims that can fail. They are tested one
at a time, with the design and the decision rule written down and
hashed before each test runs. RESULTS.md has every test so far,
including the ones that failed.

## Proposed architecture

This is the general shape. It does not depend on one data type or one
model size.

```
             request
                |
                v
  +-------------------------+      +----------------------+
  | Planner (NICE-R)        |<-----| Registry             |
  | which Wings, combined   |      | Wings, versions,     |
  | or alone, value vs cost |      | measured cost        |
  +-------------------------+      +----------------------+
                |                             ^
                v                             |
  +-------------------------+      +----------------------+
  | Admission               |      | CCE promotion gate   |
  | calibrated for this     |      | new versions shadow, |
  | set of Wings? else      |      | then must pass drift |
  | decline or escalate     |      | budgets to go live   |
  +-------------------------+      +----------------------+
                |                             ^
                v                             |
  +-------------------------+                 |
  | Execution               |---- shadow -----+
  | Wings run through the   |
  | frozen Core, fused      |
  +-------------------------+
                |
                v
       answer + trace
```

**The Core** is a shared network, trained once and then frozen. Its
parameters are hash-pinned and nothing ever writes to them. Gradients
may pass through it while a Wing trains; writes may not. A deployment
runs on one Core version, and a new Core is a planned migration, not an
update.

**Wings** are the capabilities. Each is a small module with a declared
input and output type, trained through the frozen Core for one job. An
input adapter lets a Wing bring a new kind of data (text, images,
tables) to the same Core. Each Wing is versioned and owned separately,
so one team's update cannot touch another team's Wing.

**The registry** holds the installed Wings and what the host itself
measured about them: compute, latency, memory, reliability. It does not
trust what a Wing claims about itself.

**The planner, NICE-R,** decides for each request which Wings to run and
whether to combine them. It scores each candidate set by estimated
utility minus cost, under hard limits on compute, latency and memory,
and it is not given any table saying which Wing serves which task. The
cost weights are set per deployment, by a stated rule, not tuned to a
result.

**Admission** allows a set of Wings to answer only through a calibration
class fitted for that exact set, Core version, hardware and fusion rule.
The calibration is split conformal, so the confidence it reports holds
up on data it was not fitted on. A set without a class runs in shadow
only: it collects evidence but never answers a user.

**Execution** runs the chosen Wings, fuses their outputs, and writes a
trace: which Wings and versions ran, the calibrator's fingerprint, why
the answer was admitted, and how long each part took. A trace can be
replayed.

**CCE (Conservative Capability Extension)** decides whether a new
version or a new Wing may go live. The candidate runs in shadow first.
It is promoted only if, on the same evaluation rows, the lower
confidence bound of its change is within a small step tolerance of the
version serving now, and within a total budget of the very first
version. The second test is what stops slow erosion that passes every
single step. If the evaluation set is too small to tell "lost nothing"
from "lost the whole budget", the gate does not decide and nothing is
promoted. A rejected candidate never demotes the version already
serving. Capabilities can be protected at different tiers, with stricter
error control for the ones that matter most.

**Safety interrupts** are pre-authorised Wings that can add a guard,
force an escalation, or force the system to decline. They never silently
replace the answer.

## Where the evidence stands

As of version 0.1.0, on public tabular and multi-view data, with every
test preregistered:

- New capabilities left the Core and every old Wing bit-identical, and
  old tasks did not forget, where a fine-tuned shared network did.
  Scored on the same share of answered rows, UMNA was also slightly more
  accurate.
- The planner found the right capability on every request without being
  told the mapping, and beat a normal learned router.
- The promotion gate never let a poisoned update through in any rerun
  (two harmless-looking retrains that were slightly worse did get past
  it), and with enough evaluation rows it stopped slow erosion that
  passed every step.
- Two things did not hold up. The planner's advantage over simpler
  planners did not replicate across seeds, and combining Wings helped on
  only one dataset. Both claims are open.

This is early evidence on small models and simple data. It is not proof.

## Why the code is not open yet

Because UMNA is still a hypothesis. If I release the code now, people
may build on claims that have not been shown to hold, and the
interfaces are still changing from one day to the next. I would rather
publish the evidence first, in a form anyone can check, and release
the code when the claims have earned it.

So for now this repository has the results, the preregistrations, the
raw output, and a provenance file that ties every result to a signed
commit of the private source. When the code is released, anyone can
check that these results came from it.

When the core claims are proven, meaning they hold up in preregistered
tests that replicate, on more than one kind of data, and survive outside
review, the whole project will be released as open source under the GNU
Affero General Public License v3.0 (AGPL-3.0), on an open-core model.
Until then, the results and this page are shared under CC BY 4.0.
