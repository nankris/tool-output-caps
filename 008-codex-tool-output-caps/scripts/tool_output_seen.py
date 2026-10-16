#!/usr/bin/env python3
"""Per-run extras from the local Codex session rollout: tool output chars fed back to the model,
max_output_tokens the model requested per exec call, and compaction records.
Usage: rollout_extra.py RUNS_CSV OUT_CSV"""
import csv, glob, json, os, re, sys
SESS = os.path.expanduser("~/.codex/sessions")
def roll(tid):
    h = glob.glob(os.path.join(SESS, "**", f"*{tid}*.jsonl"), recursive=True)
    return max(h, key=os.path.getmtime) if h else None
rows = list(csv.DictReader(open(sys.argv[1])))
out = []
for r in rows:
    p = roll(r["thread_id"]) if r["thread_id"] else None
    chars = calls = comp = 0; mots = []; trunc_marks = 0
    if p:
        for line in open(p):
            try: d = json.loads(line)
            except Exception: continue
            pl = d.get("payload") or {}
            if d.get("type") == "compacted": comp += 1
            if not isinstance(pl, dict): continue
            t = pl.get("type")
            if t in ("function_call_output", "custom_tool_call_output"):
                o = pl.get("output"); o = o if isinstance(o, str) else json.dumps(o)
                chars += len(o); calls += 1
                trunc_marks += len(re.findall(r"truncated output", o, re.I))
            if t in ("function_call", "custom_tool_call"):
                a = pl.get("arguments") or pl.get("input") or ""
                mots += [int(x) for x in re.findall(r"max_output_tokens\W{1,4}(\d+)", a if isinstance(a, str) else json.dumps(a))]
    out.append(dict(cond=r["cond"], task=r["task"], rep=r["rep"], thread_id=r["thread_id"], rollout_found=int(bool(p)),
                    tool_outputs=calls, tool_output_chars=chars, truncation_markers=trunc_marks,
                    max_output_tokens_requested=";".join(map(str, mots)), compacted_records=comp))
w = csv.DictWriter(open(sys.argv[2], "w", newline=""), fieldnames=list(out[0]))
w.writeheader(); w.writerows(out)
for o in out: print(o)
