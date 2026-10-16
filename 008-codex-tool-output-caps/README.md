# #008 Tool-output caps that backfire (Codex CLI)

**Question.** If you cap how much tool output Codex keeps (`tool_output_token_limit`), do you save money, or does the agent just take more turns and cost more (the cited result: cutting 38.4% of tool output raised cost 6.8%)?

**Short answer (this build, these tasks).** In Codex CLI 0.162.1 the `tool_output_token_limit` config key had **no measurable effect on what the model saw**. The model sees 19–22K characters of tool output per run whether the key is 256, 2,000 or unset. Codex now runs shell commands through a code-mode `exec` tool, and the model sets its own `max_output_tokens` on every call (usually 3,000–6,000). That per-call value decides the truncation, not the config key. When I forced a real cap through the prompt ("every exec_command call must set max_output_tokens to 256 or less"), tool output fell 74%, all 9 runs still passed, and the estimated cost per success fell 24%. **Nothing backfired at n = 9 per arm** (3 tasks × 3 reps). Tasks this small can't rule out a backfire on bigger ones.

## Setup

- Codex CLI `codex-cli 0.162.1`, model `gpt-6.1-sol`, default reasoning effort (the catalog default is `low`), signed in with ChatGPT Plus. Headless: `codex exec --json --skip-git-repo-check --dangerously-bypass-approvals-and-sandbox -C <fresh tmp copy>`.
- Tasks: three "noisy log" fixtures I built for this (`scripts/harness/fixtures/N01_median`, `N02_duration`, `N03_csv`). Each `test.js` prints 420–500 lines (about 16–17 KB, ~4K tokens). The failing cases sit in the *middle* of the output, which is where head/tail truncation cuts. Bugs: even-length median, `s` units ignored in a duration parser, CSV split that breaks on quoted commas.
- Pass = `node test.js` exits 0 in the run's copy, and `test.js` is unchanged (checked by hash).
- Arms (3 reps × 3 tasks = 9 runs each; rep 3 added later in a separate sequential batch):
  - `cap256`: `-c tool_output_token_limit=256`
  - `cap2000`: `-c tool_output_token_limit=2000`
  - `default`: key unset
  - `promptcap256` (added after the first three showed no effect): key unset, prompt adds "Hard rule: every exec_command call must set max_output_tokens to 256 or less."
- Prompt: ``Make `node test.js` pass by fixing the code. Do not edit test.js.``
- Cost estimate: gpt-6.1-sol public API list price: $2.00/M uncached input, $0.10/M cached input, $10.00/M output (https://developers.openai.com/api/docs/models/gpt-6.1-sol, checked 2026-10-14). **This is an estimate.** ChatGPT Plus usage is not billed per token.
- Key name check: `tool_output_token_limit` is in the official config reference ("Token budget for storing individual tool/function outputs in history", https://developers.openai.com/codex/config-reference), and `--strict-config` accepts it in 0.162.1.

## Exact commands

```bash
source /workspace/tools/setup.sh
# one run (what the driver does for each line of scripts/jobs.txt / jobs_promptcap.txt)
python3 scripts/harness/run_one.py --exp . --cond cap256 --task scripts/harness/fixtures/N01_median --rep 1 \
  --cfg tool_output_token_limit=256 --timeout 600
# all runs, 2-3 in parallel
scripts/harness/driver.sh scripts/jobs.txt 3 results/driver.log
scripts/harness/driver.sh scripts/jobs_promptcap.txt 2 results/driver_promptcap.log
# rep 3 for all four arms, one at a time
scripts/harness/driver.sh scripts/jobs_rep3.txt 1 results/driver_rep3.log
# tool output the model saw, from the local session rollouts (columns then renamed into results/tool_output_seen.csv)
python3 scripts/tool_output_seen.py results/runs.csv /tmp/seen.csv
# analysis
/workspace/tools/mlenv/bin/python scripts/analyze.py
```

`run_one.py` copies the fixture to a fresh temp dir, runs `codex exec --json`, and saves the raw event stream to `results/raw/<cond>__<task>__r<rep>.jsonl`. It reads token usage from the `turn.completed` event and turn/tool counts from the local session rollout, runs the check, and appends one row to `results/runs.csv`. `results/tool_output_seen.csv` holds the size of the tool output actually fed back to the model, taken from the session rollouts.

## Results (36 runs, 2026-10-14: reps 1–2 14:03–14:20 UTC, rep 3 15:08–15:21 UTC / 19:33–20:51 IST)

| Arm | Runs | Pass | Total tokens (mean ± sd) | Cached input | Uncached input | Output | Model calls | Tool output seen | Est. cost / success |
|---|---|---|---|---|---|---|---|---|---|
| config 256 | 9 | 9/9 | 76.4K ± 0.5K | 66.8K | 9.1K | 478 | 5.11 | 22.0K chars | $0.0297 (sd $0.0102) |
| config 2,000 | 9 | 9/9 | 77.1K ± 10.7K | 64.6K | 12.1K | 432 | 4.33 | 19.4K chars | $0.0350 (sd $0.0098) |
| unset (default) | 9 | 9/9 | 81.0K ± 6.2K | 68.2K | 12.3K | 442 | 4.11 | 19.7K chars | $0.0359 (sd $0.0071) |
| prompt rule ≤256/call | 9 | 9/9 | 73.8K ± 7.1K | 65.6K | 7.7K | 534 | 4.78 | 5.1K chars | $0.0273 (sd $0.0040) |

Per task, mean est. cost (USD):

| Task | cap256 | cap2000 | default | promptcap256 |
|---|---|---|---|---|
| N01_median | 0.0302 | 0.0304 | 0.0331 | 0.0302 |
| N02_duration | 0.0275 | 0.0332 | 0.0365 | 0.0244 |
| N03_csv | 0.0313 | 0.0414 | 0.0382 | 0.0272 |

Chart: `results/chart.png` (cost, total tokens, model calls, and tool output seen per arm; dots are individual runs).

### What the numbers say
1. **The config key didn't bite.** Tool output seen per run was 19.4–22.0K chars in all three config arms. In every run the model asked for 3,000–16,000 output tokens per call, and that request, not the config, set the truncation. The cost spread between the config arms ($0.030–$0.036) is smaller than the run-to-run spread inside one arm (sd up to $0.010). Treat it as noise.
2. **One weak signal, still there after rep 3:** the config-256 arm averaged 5.11 model calls against 4.11 for the default arm (8 of 9 default runs used exactly 4; 8 of 9 config-256 runs used 5). That's the direction the "backfire" theory predicts. But the tool output seen didn't shrink, so I can't explain it with truncation, and with n = 9 it could still be chance. It did not raise cost: config-256 was the second-cheapest arm.
3. **A real cap (the prompt rule) cut tool output 74%** (19.7K → 5.1K chars). It cut uncached input 38% (12.3K → 7.7K), added about 0.7 model calls per run, and lowered est. cost per success 24% ($0.0359 → $0.0273). All 9 runs passed. Rep 3 alone showed the same direction ($0.0391 → $0.0304). The model coped by running `grep`/`tail` on the log instead of reading all of it.
4. About 84–89% of input tokens were cache reads in every arm, so a run's cost is driven by the ~10K uncached tokens and the output, not by the 66K cached ones.

## Caveats
- Small n (9 runs per arm, 3 tasks). The tasks are tiny one-file bug fixes that the model solves in 4–6 calls. A long, log-heavy debugging session could behave differently.
- I can't prove `tool_output_token_limit` is a no-op everywhere. It may apply to tool types that weren't used here (MCP tools, or the non-code-mode shell, which can't be turned on in this build: `features.code_mode_host=false` makes every tool call fail with "code-mode host is disabled", see the `probe_nocodemode_cap256` row in `runs.csv`).
- 6 of the 37 runs (incl. the probe) hit transient 429/503 "Reconnecting…" retries that Codex recovered from on its own. The retries add a little latency and maybe some tokens.
- Another Codex experiment (not this one) was running on the same account at the same time, so the rate-limit percentages in `runs.csv` reflect both.
- Default reasoning effort; reasoning tokens were reported as 0 in every run.
- `$` figures are estimates at API list price. On Plus you pay a flat subscription, and these runs used about 1% of the 5-hour window each.

## Files
- `scripts/harness/`: `run_one.py` (single run + metrics), `driver.sh` (parallel job runner), `backfill.py`, fixtures
- `scripts/jobs.txt`, `scripts/jobs_promptcap.txt`: the exact run list
- `scripts/jobs_rep3.txt`: the rep-3 run list
- `scripts/tool_output_seen.py`: tool-output size, truncation notices and requested `max_output_tokens` per run, from the session rollouts
- `scripts/analyze.py`: summary tables + chart
- `results/runs.csv`: one row per run; `results/summary.csv`, `results/per_task_cost.csv`, `results/tool_output_seen.csv`
- `results/raw/*.jsonl`: raw `codex exec --json` streams (stderr in `*.stderr`, MCP auth noise filtered)
