#!/usr/bin/env python3
"""Summarise results/runs.csv for #008 and draw results/chart.png."""
import os
import pandas as pd
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt

HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
df = pd.read_csv(os.path.join(HERE, "results", "runs.csv"))
order = ["cap256", "cap2000", "default", "promptcap256"]
df = df[df.cond.isin(order)]
seen = pd.read_csv(os.path.join(HERE, "results", "tool_output_seen.csv"))
df = df.merge(seen[["cond", "task", "rep", "tool_output_chars"]], on=["cond", "task", "rep"], how="left")
labels = {"cap256": "config 256\n(very low)", "cap2000": "config 2,000\n(medium)", "default": "config unset\n(default)",
          "promptcap256": "prompt rule\n(<=256 per call)"}

g = df.groupby("cond")
summ = pd.DataFrame({
    "runs": g.size(),
    "passes": g.passed.sum(),
    "pass_rate": g.passed.mean(),
    "total_tokens_mean": g.total_tokens.mean().round(0),
    "total_tokens_sd": g.total_tokens.std().round(0),
    "cached_mean": g.cached_input_tokens.mean().round(0),
    "uncached_mean": g.uncached_input_tokens.mean().round(0),
    "output_mean": g.output_tokens.mean().round(0),
    "cache_share_mean": g.cache_share.mean().round(3),
    "model_calls_mean": g.model_calls.mean().round(2),
    "tool_calls_mean": g.tool_calls.mean().round(2),
    "tool_output_chars_seen_mean": g.tool_output_chars.mean().round(0),
    "cost_total_usd": g.est_cost_usd.sum().round(4),
    "cost_mean_usd": g.est_cost_usd.mean().round(4),
    "cost_sd_usd": g.est_cost_usd.std().round(4),
}).reindex(order)
summ["cost_per_success_usd"] = (summ.cost_total_usd / summ.passes).round(4)
summ.to_csv(os.path.join(HERE, "results", "summary.csv"))
per_task = df.pivot_table(index="task", columns="cond", values="est_cost_usd", aggfunc="mean").reindex(columns=order).round(4)
per_task.to_csv(os.path.join(HERE, "results", "per_task_cost.csv"))
print(summ.to_string())
print()
print(per_task.to_string())

fig, axes = plt.subplots(1, 4, figsize=(17, 4.8))
x = range(len(order))
for ax, col, title, scale in [
    (axes[0], "est_cost_usd", "Est. API cost per run (US cents)", 100),
    (axes[1], "total_tokens", "Total tokens per run (thousands)", 1e-3),
    (axes[2], "model_calls", "Model calls per run", 1),
    (axes[3], "tool_output_chars", "Tool output the model saw (K chars)", 1e-3),
]:
    means = [df[df.cond == c][col].mean() * scale for c in order]
    ax.bar(x, means, color=["#c44e52", "#dd8452", "#4c72b0", "#55a868"], alpha=0.55, width=0.6)
    for i, c in enumerate(order):
        vals = df[df.cond == c][col] * scale
        ax.scatter([i + (j - len(vals) / 2) * 0.05 for j in range(len(vals))], vals, color="black", s=14, zorder=3)
    ax.set_xticks(list(x))
    ax.set_xticklabels([labels[c] for c in order], fontsize=8)
    ax.set_title(title, fontsize=11)
    ax.grid(axis="y", alpha=0.3)
fig.suptitle("Codex 0.162.1 (gpt-6.1-sol), 3 noisy-log tasks x 3 reps per arm. Bars = mean, dots = individual runs", fontsize=11)
fig.tight_layout()
fig.savefig(os.path.join(HERE, "results", "chart.png"), dpi=130)
print("wrote chart")
