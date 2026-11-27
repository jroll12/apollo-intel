"""Align the known S14 script to a voiceover recording without a speech model.

Method: detect voiced segments (energy), expand script tokens to spoken syllables, anchor
clause boundaries (, . ? :) to the silences nearest their expected time, then interpolate
word times between anchors. Also extracts the music beat grid.

usage: python3 -I scripts/align.py <vo.wav|mp3> <music.mp3> <script.json> <out.json>
"""
import json, re, sys
import numpy as np
import librosa

vo_path, music_path, script_path, out_path = sys.argv[1:5]
script = json.load(open(script_path))["body"]

# ---------- tokens and syllables ----------
ONES = "zero one two three four five six seven eight nine".split()

def syl_word(w: str) -> int:
    w = w.lower()
    w = re.sub(r"[^a-z]", "", w)
    if not w:
        return 0
    groups = re.findall(r"[aeiouy]+", w)
    n = len(groups)
    if w.endswith("e") and not w.endswith(("le", "ee")) and n > 1:
        n -= 1
    return max(1, n)

def spoken(tok: str) -> str:
    t = tok.strip(",.?:;")
    if re.fullmatch(r"\$445,000", t):
        return "four hundred forty five thousand dollars"
    if re.fullmatch(r"6\.3%", t):
        return "six point three percent"
    if re.fullmatch(r"\d{3}-\d{3}-\d{4}", t):
        return " ".join(ONES[int(c)] for c in t if c.isdigit())
    return t

tokens = script.split()
words = []
for i, tok in enumerate(tokens):
    syl = sum(syl_word(w) for w in spoken(tok).split())
    brk = None
    if tok.endswith((".", "?")):
        brk = "sentence"
    elif tok.endswith((",", ":", ";")):
        brk = "clause"
    words.append({"i": i, "text": tok, "syl": syl, "break": brk})
cum = np.cumsum([0] + [w["syl"] for w in words])
total_syl = cum[-1]

# ---------- voiced segments ----------
y, sr = librosa.load(vo_path, sr=16000, mono=True)
hop = 160  # 10 ms
rms = librosa.feature.rms(y=y, frame_length=640, hop_length=hop)[0]
db = 20 * np.log10(rms + 1e-9)
thr = max(np.percentile(db, 95) - 32, np.percentile(db, 10) + 6)
voiced = db > thr
# close tiny gaps (<120 ms) and drop tiny blips (<60 ms)
def runs(mask):
    out, start = [], None
    for k, v in enumerate(mask):
        if v and start is None:
            start = k
        if not v and start is not None:
            out.append([start, k]); start = None
    if start is not None:
        out.append([start, len(mask)])
    return out
segs = runs(voiced)
merged = []
for s in segs:
    if merged and (s[0] - merged[-1][1]) * hop / sr < 0.12:
        merged[-1][1] = s[1]
    else:
        merged.append(s)
segs = [[a * hop / sr, b * hop / sr] for a, b in merged if (b - a) * hop / sr >= 0.06]
speech_start, speech_end = segs[0][0], segs[-1][1]
silences = [(segs[k][1], segs[k + 1][0]) for k in range(len(segs) - 1) if segs[k + 1][0] - segs[k][1] >= 0.16]

# ---------- anchor clause breaks to silences ----------
voiced_total = sum(b - a for a, b in segs)
def voiced_time_to_clock(vt):
    acc = 0.0
    for a, b in segs:
        if acc + (b - a) >= vt:
            return a + (vt - acc)
        acc += b - a
    return segs[-1][1]

breaks = [(k, w) for k, w in enumerate(words) if w["break"]][:-1]  # last word is the end
anchors = [(0, speech_start)]
used = set()
for k, w in breaks:
    expected = voiced_time_to_clock(cum[k + 1] / total_syl * voiced_total)
    window = 0.9 if w["break"] == "sentence" else 0.6
    cands = [(abs((s0 + s1) / 2 - expected), j) for j, (s0, s1) in enumerate(silences) if j not in used and abs((s0 + s1) / 2 - expected) < window]
    if cands:
        _, j = min(cands)
        if anchors and silences[j][0] <= anchors[-1][1]:
            continue
        used.add(j)
        anchors.append((k + 1, silences[j][0]))  # word k ends at silence start
        anchors.append((k + 1.5, silences[j][1]))  # next word starts at silence end
anchors.append((len(words), speech_end))

# piecewise interpolate word start/end by syllable position between anchors
def syl_pos(idx):  # idx may be k or k+1.5 marker
    return cum[int(idx)]
pts = []
for idx, t in anchors:
    pts.append((syl_pos(idx) + (0.0001 if idx % 1 else 0), t))
pts.sort()
xs = np.array([p[0] for p in pts]); ts = np.array([p[1] for p in pts])
for k, w in enumerate(words):
    w["start"] = round(float(np.interp(cum[k] + 0.0002, xs, ts)), 3)
    w["end"] = round(float(np.interp(cum[k + 1], xs, ts)), 3)

# ---------- caption phrases: break at punctuation, max 4 words ----------
phrases, cur = [], []
for w in words:
    cur.append(w)
    if w["break"] or len(cur) >= 4:
        phrases.append({"text": " ".join(x["text"] for x in cur), "start": cur[0]["start"], "end": cur[-1]["end"]})
        cur = []
if cur:
    phrases.append({"text": " ".join(x["text"] for x in cur), "start": cur[0]["start"], "end": cur[-1]["end"]})

# ---------- music beats ----------
m, msr = librosa.load(music_path, sr=22050, mono=True)
tempo, beat_frames = librosa.beat.beat_track(y=m, sr=msr)
beats = [round(float(t), 3) for t in librosa.frames_to_time(beat_frames, sr=msr)]
onset_env = librosa.onset.onset_strength(y=m, sr=msr)
rms_m = librosa.feature.rms(y=m)[0]

out = {
    "vo": {"file": vo_path, "duration": round(len(y) / sr, 3), "speechStart": round(speech_start, 3), "speechEnd": round(speech_end, 3), "segments": [[round(a, 3), round(b, 3)] for a, b in segs], "silences": [[round(a, 3), round(b, 3)] for a, b in silences], "anchorsUsed": len(used), "breaks": len(breaks)},
    "words": words,
    "phrases": phrases,
    "music": {"file": music_path, "tempo": round(float(np.atleast_1d(tempo)[0]), 2), "beats": beats, "duration": round(len(m) / msr, 3)},
}
json.dump(out, open(out_path, "w"), indent=1)
print(f"speech {speech_start:.2f}-{speech_end:.2f}s, {len(segs)} segments, {len(silences)} silences, anchored {len(used)}/{len(breaks)} breaks")
print(f"music tempo {out['music']['tempo']} bpm, {len(beats)} beats, first {beats[:4]}")
for p in phrases:
    print(f"  {p['start']:6.2f}-{p['end']:6.2f}  {p['text']}")
