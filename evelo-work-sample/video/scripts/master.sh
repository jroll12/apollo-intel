#!/usr/bin/env bash
# Render every cut, then master: loudness to -14 LUFS / -1 dBTP (two-pass loudnorm),
# H.264 High, yuv420p, +faststart, size-targeted to <= 15 MB. Also writes SRT captions.
#   bash scripts/master.sh            # all cuts
#   bash scripts/master.sh Reel       # one composition
set -euo pipefail
cd "$(dirname "$0")/.."
mkdir -p out

declare -A NAME=( [Reel]=reel-s14-9x16 [Reel-4x5]=reel-s14-4x5 [Reel-short]=reel-s14-short-9x16 )
COMPS=("${@:-Reel Reel-4x5 Reel-short}")
[ $# -eq 0 ] && COMPS=(Reel Reel-4x5 Reel-short)

for comp in "${COMPS[@]}"; do
  name=${NAME[$comp]}
  echo "== $comp -> out/$name.mp4"
  npx remotion render "$comp" "out/raw-$name.mp4" --log=error
  # pass 1: measure
  stats=$(ffmpeg -hide_banner -nostats -i "out/raw-$name.mp4" -af loudnorm=I=-14:TP=-1.2:LRA=9:print_format=json -f null - 2>&1 | sed -n '/^{/,/^}/p')
  mi=$(echo "$stats" | python3 -c 'import json,sys;d=json.load(sys.stdin);print(d["input_i"])')
  mtp=$(echo "$stats" | python3 -c 'import json,sys;d=json.load(sys.stdin);print(d["input_tp"])')
  mlra=$(echo "$stats" | python3 -c 'import json,sys;d=json.load(sys.stdin);print(d["input_lra"])')
  mth=$(echo "$stats" | python3 -c 'import json,sys;d=json.load(sys.stdin);print(d["input_thresh"])')
  off=$(echo "$stats" | python3 -c 'import json,sys;d=json.load(sys.stdin);print(d["target_offset"])')
  af="loudnorm=I=-14:TP=-1.2:LRA=9:measured_I=$mi:measured_TP=$mtp:measured_LRA=$mlra:measured_thresh=$mth:offset=$off:linear=true,aresample=48000"
  for crf in 21 23 25 27; do
    ffmpeg -v error -y -i "out/raw-$name.mp4" -c:v libx264 -preset slow -crf $crf -profile:v high -pix_fmt yuv420p -r 30 \
      -af "$af" -c:a aac -b:a 160k -movflags +faststart "out/$name.mp4"
    size=$(stat -c %s "out/$name.mp4")
    echo "   crf $crf -> $((size / 1024 / 1024)) MB"
    [ "$size" -le $((15 * 1024 * 1024)) ] && break
  done
done

# SRT captions from the timeline (full cut)
python3 -I - <<'PY'
import json
t = json.load(open("data/timeline.json"))
def ts(s):
    ms = int(round(s * 1000)); h, ms = divmod(ms, 3600000); m, ms = divmod(ms, 60000); sec, ms = divmod(ms, 1000)
    return f"{h:02}:{m:02}:{sec:02},{ms:03}"
ps = t["phrases"]; out = []
for i, p in enumerate(ps):
    end = min(p["end"] + 0.4, ps[i + 1]["start"] - 0.02) if i + 1 < len(ps) else p["end"] + 0.8
    out.append(f"{i+1}\n{ts(p['start'])} --> {ts(end)}\n{p['text']}\n")
open("out/reel-s14.srt", "w").write("\n".join(out))
print("   wrote out/reel-s14.srt")
PY
