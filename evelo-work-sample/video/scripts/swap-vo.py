"""Swap in Jarret's real voice: pick the best take, clean it, re-time the whole reel.

usage: python3 -I scripts/swap-vo.py <recording.m4a|mp3|wav> [take_index]
Then:  bash scripts/master.sh && bun scripts/check.ts out/*.mp4

Steps
1. Decode to 48 kHz mono WAV.
2. Split into takes at pauses of 1.6 s or longer; keep segments 25-55 s long (full reads).
3. Clean each take: rumble filter, gentle noise reduction, de-ess, compression, -16 LUFS.
4. Align each take against the script (scripts/align.py); pick the take that anchors the
   most clause breaks (ties go to the LAST take, usually the most relaxed read).
5. Write public/audio/vo.mp3 and rebuild data/timeline.json from that take.
"""
import json, os, subprocess, sys
import numpy as np
import soundfile as sf

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
src = sys.argv[1]
force = int(sys.argv[2]) if len(sys.argv) > 2 else None
work = os.path.join(ROOT, "audio", "raw")
os.makedirs(work, exist_ok=True)

def run(cmd):
    subprocess.run(cmd, check=True, cwd=ROOT)

full = os.path.join(work, "jarret-full.wav")
run(["ffmpeg", "-v", "error", "-y", "-i", src, "-ac", "1", "-ar", "48000", full])
y, sr = sf.read(full)
hop = int(sr * 0.01)
rms = np.array([np.sqrt(np.mean(y[i:i + hop] ** 2) + 1e-12) for i in range(0, len(y) - hop, hop)])
db = 20 * np.log10(rms)
thr = max(np.percentile(db, 95) - 35, np.percentile(db, 10) + 6)
voiced = db > thr

# takes = voiced regions separated by >= 1.6 s of silence
takes, start, quiet = [], None, 0
for k, v in enumerate(voiced):
    if v:
        if start is None:
            start = k
        quiet = 0
    elif start is not None:
        quiet += 1
        if quiet * 0.01 >= 1.6:
            takes.append((start, k - quiet + 1)); start = None; quiet = 0
if start is not None:
    takes.append((start, len(voiced)))
takes = [(a * 0.01, b * 0.01) for a, b in takes]
full_reads = [(a, b) for a, b in takes if 25 <= b - a <= 55]
print(f"found {len(takes)} voiced regions, {len(full_reads)} full-length takes: {[(round(a,1), round(b,1)) for a,b in full_reads]}")
if not full_reads:
    # a single read with long pauses inside it: treat the whole recording as one take
    full_reads = [(takes[0][0], takes[-1][1])]

chain = "highpass=f=80,lowpass=f=13000,afftdn=nf=-28,deesser=i=0.35,acompressor=threshold=-21dB:ratio=3:attack=8:release=160:makeup=3,loudnorm=I=-16:TP=-2:LRA=7,aresample=48000"
results = []
for i, (a, b) in enumerate(full_reads):
    out = os.path.join(work, f"take{i}.wav")
    run(["ffmpeg", "-v", "error", "-y", "-ss", f"{max(0, a - 0.15):.2f}", "-to", f"{b + 0.35:.2f}", "-i", full, "-af", chain, out])
    al = os.path.join(ROOT, "data", f"align-take{i}.json")
    subprocess.run(["python3", "-I", "scripts/align.py", out, "audio/music.mp3", "data/s14.json", al], check=True, cwd=ROOT, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    d = json.load(open(al))
    score = d["vo"]["anchorsUsed"] / max(1, d["vo"]["breaks"])
    results.append((score, i, out, al, d["vo"]["speechEnd"]))
    print(f"take {i}: {b - a:.1f}s, anchored {d['vo']['anchorsUsed']}/{d['vo']['breaks']} breaks, speech ends {d['vo']['speechEnd']:.2f}s")

if force is not None:
    best = next(r for r in results if r[1] == force)
else:
    best = max(results, key=lambda r: (round(r[0], 2), r[1]))
_, i, wav, al, _ = best
print(f"using take {i}")
os.makedirs(os.path.join(ROOT, "public", "audio"), exist_ok=True)
run(["ffmpeg", "-v", "error", "-y", "-i", wav, "-c:a", "libmp3lame", "-b:a", "192k", "public/audio/vo.mp3"])
run(["cp", al, "data/align-final.json"])
run(["bun", "scripts/timeline.ts", "data/align-final.json"])
