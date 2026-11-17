"""Word timings from assets/narration.wav -> timings.json (replaces the draft estimate).
Needs: pip install faster-whisper, and huggingface.co reachable for the model download.
Run:   python3 -I scripts/whisper-timings.py
Words are taken from assets/script.json (exact copy) and matched to Whisper words by position
after alignment, so captions never inherit ASR spelling. Fails loudly on a poor match."""
import json, re, subprocess, sys, difflib, pathlib
from faster_whisper import WhisperModel

root = pathlib.Path(__file__).resolve().parent.parent
wav = root / "assets/narration.wav"
script = json.loads((root / "assets/script.json").read_text())
dur = float(subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(wav)]))

def norm(w):
    w = w.lower().replace(",", "").replace("-", "")
    return re.sub(r"[^a-z0-9$]", "", w)

segs, _ = WhisperModel("base.en", device="cpu", compute_type="int8").transcribe(
    str(wav), word_timestamps=True, vad_filter=True, language="en")
asr = [(w.word.strip(), w.start, w.end) for s in segs for w in s.words]
# Whisper may write "3-1-7" as "317" or "three one seven": expand digits to single chars on both sides
def toks(words): return [c for w in words for c in ([*norm(w)] if norm(w).isdigit() else [norm(w)])]

ref = [(s["id"], w) for s in script["scenes"] for w in s["narration"].split()]
ref_t, ref_owner = [], []
for i, (_, w) in enumerate(ref):
    for t in toks([w]): ref_t.append(t); ref_owner.append(i)
asr_t, asr_owner = [], []
for i, (w, _, _) in enumerate(asr):
    for t in toks([w]): asr_t.append(t); asr_owner.append(i)

sm = difflib.SequenceMatcher(a=ref_t, b=asr_t, autojunk=False)
ratio = sm.ratio()
hit = {}
for a, b, n in sm.get_matching_blocks():
    for k in range(n):
        ri, ai = ref_owner[a + k], asr_owner[b + k]
        s, e = asr[ai][1], asr[ai][2]
        lo, hi = hit.get(ri, (s, e)); hit[ri] = (min(lo, s), max(hi, e))
if ratio < 0.85: sys.exit(f"alignment too weak ({ratio:.2f}); check the recording matches the script")

words = []
for i, (sid, w) in enumerate(ref):
    if i in hit: s, e = hit[i]
    else:  # unmatched: interpolate between neighbours
        prev = next((hit[j][1] for j in range(i - 1, -1, -1) if j in hit), 0.0)
        nxt = next((hit[j][0] for j in range(i + 1, len(ref)) if j in hit), dur)
        s, e = prev, max(prev + 0.05, min(nxt, prev + 0.4))
    words.append({"id": f"w{i}", "text": w, "start": round(s, 3), "end": round(e, 3), "scene": sid})

scenes = []
for k, s in enumerate(script["scenes"]):
    first = [w for w in words if w["scene"] == s["id"]]
    for edge in (first[0]["text"], first[-1]["text"]):
        idx = next(i for i, w in enumerate(words) if w is first[0 if edge == first[0]["text"] else -1])
        if idx not in hit: sys.exit(f"scene {s['id']}: edge word '{edge}' not found in audio")
    scenes.append({"id": s["id"], "start": 0.0 if k == 0 else round(max(0, first[0]["start"] - 0.25), 3)})
for k, s in enumerate(scenes): s["end"] = scenes[k + 1]["start"] if k + 1 < len(scenes) else round(dur, 3)
(root / "timings.json").write_text(json.dumps({"source": "whisper base.en", "alignment": round(ratio, 3),
    "duration": round(dur, 3), "scenes": scenes, "words": words}, indent=2))
print(f"timings: {dur:.2f}s, alignment {ratio:.2f}, {sum(i in hit for i in range(len(ref)))}/{len(ref)} words matched")
