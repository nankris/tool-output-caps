# I tried to make Codex cheaper by capping tool output. The setting did nothing.

*Draft. Tech in General experiment #008. Numbers are from 30 headless Codex runs on 2026-10-14.*

There's a claim going around about coding agents: cut the tool output the agent sees, and the bill can go *up*. One study cut 38.4% of tool output and cost rose 6.8%, because the agent took more turns to find what it lost. I wanted to check that on Codex CLI, which has a config key for exactly this: `tool_output_token_limit`.

## The setup

I built three small JavaScript bugs with loud tests. Each `test.js` prints 400–500 lines (about 4K tokens), and the failing lines sit in the middle of the output, which is the part truncation cuts first. Codex (CLI 0.162.1, model gpt-6.1-sol, ChatGPT Plus login) had to make the test pass without touching it. Every run started from a fresh copy.

I ran each task twice at three settings: `tool_output_token_limit=256`, `=2000`, and unset. That's 18 runs.

## What happened

All 18 runs passed. Cost and tokens barely moved:

| Setting | Pass | Avg tokens | Est. cost per success |
|---|---|---|---|
| 256 | 6/6 | 76.3K | $0.031 |
| 2,000 | 6/6 | 77.1K | $0.037 |
| unset | 6/6 | 78.9K | $0.034 |

The spread *inside* one setting (one 256 run cost 1.9¢, another 5.2¢) was bigger than the gap between settings.

So I opened the session logs to see what the model actually received. In all three settings it got 19–22K characters of tool output per run, so the config key wasn't truncating anything. Codex now runs shell commands through a code-mode `exec` tool, and the model picks its own `max_output_tokens` on every call (3,000–6,000 in these runs). That per-call number decides what gets cut, not the config key.

## So I forced a real cap

I added one line to the prompt: "every exec_command call must set max_output_tokens to 256 or less." The model followed it on every call.

| | Tool output the model saw | Model calls | Est. cost per success | Pass |
|---|---|---|---|---|
| No cap | 19.7K chars | 4.0 | $0.034 | 6/6 |
| Prompt cap 256 | 5.0K chars | 4.7 | $0.026 | 6/6 |

Tool output fell 75%. The model needed about 0.7 more calls per run, because it switched to `grep` and `tail` on the log instead of reading it all. Overall, cost per success fell about 25%. On these tasks, **the cap didn't backfire. It saved money.**

## Why the cost barely depends on the log

About 85% of every run's input tokens were cache reads, which cost $0.10 per million against $2 for fresh input. A Codex run here is roughly 66K cached tokens (cheap) plus about 10K new tokens and a few hundred output tokens (where the money goes). Cutting a 4K-token log is a real share of the *new* tokens, so it shows up in the bill. It's not a disaster when the model needs one more call, because that call is mostly cached.

## Caveats, honestly

- Six runs per setting and three tiny bugs. A long debugging session where the important line really is buried could behave differently. That's still where the "backfire" story might hold.
- I couldn't test the config key without code mode. Turning code mode off in this build breaks every tool call.
- The dollar figures are estimates at the public API price ($2 / $0.10 / $10 per million input / cached / output tokens for gpt-6.1-sol). On ChatGPT Plus you don't pay per token. Each of these runs used about 1% of the 5-hour usage window.
- A few runs hit temporary 429 rate limits that Codex retried on its own.

## Takeaway

On Codex 0.162.1, `tool_output_token_limit` didn't change what the model saw in my runs, so don't expect it to save you anything. If you want smaller tool output, tell the model in the prompt or in AGENTS.md to cap each call or grep for what it needs. On small tasks that saved about a quarter of the cost and broke nothing.

*Code, raw logs and the full table: repo `008-codex-tool-output-caps`.*
