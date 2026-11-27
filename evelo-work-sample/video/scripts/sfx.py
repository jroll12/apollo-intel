"""Synthesize a small, license-free SFX kit (48 kHz mono WAV) into audio/sfx/.
whoosh: band-passed noise sweep for camera moves; riser: rising filtered noise + tone;
impact: soft low thump for number reveals; tick: tiny click for the dot counter;
shimmer: airy high sparkle for the end card.
usage: python3 -I scripts/sfx.py
"""
import os
import numpy as np
import soundfile as sf
from scipy.signal import butter, sosfilt

SR = 48000
OUT = os.path.join(os.path.dirname(__file__), "..", "audio", "sfx")
os.makedirs(OUT, exist_ok=True)
rng = np.random.default_rng(7)

def env(n, a, r):
    e = np.ones(n)
    ai, ri = int(a * SR), int(r * SR)
    e[:ai] = np.linspace(0, 1, ai) ** 2
    e[-ri:] *= np.linspace(1, 0, ri) ** 2
    return e

def sweep_noise(dur, f0, f1, q=1.2):
    n = int(dur * SR); x = rng.standard_normal(n)
    out = np.zeros(n); blk = 512
    for i in range(0, n, blk):
        f = f0 * (f1 / f0) ** (i / n)
        lo, hi = max(40, f / q), min(SR / 2 - 100, f * q)
        sos = butter(2, [lo, hi], btype="band", fs=SR, output="sos")
        out[i:i + blk] = sosfilt(sos, x[i:i + blk])
    return out

def norm(x, peak=0.7):
    return x / (np.max(np.abs(x)) + 1e-9) * peak

def save(name, x):
    sf.write(os.path.join(OUT, name + ".wav"), norm(x).astype(np.float32), SR)

# whoosh: 0.9 s sweep up then down
w = sweep_noise(0.9, 300, 3200) * env(int(0.9 * SR), 0.35, 0.5)
save("whoosh", w)

# riser: 1.6 s
n = int(1.6 * SR); t = np.arange(n) / SR
r = sweep_noise(1.6, 200, 6000) * np.linspace(0, 1, n) ** 2
r += 0.25 * np.sin(2 * np.pi * (110 + 220 * t ** 2) * t) * np.linspace(0, 1, n) ** 3
save("riser", r * env(n, 0.05, 0.08))

# impact: 1.2 s low thump
n = int(1.2 * SR); t = np.arange(n) / SR
f = 70 * np.exp(-t * 3) + 38
thump = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 4.5)
click = sosfilt(butter(2, 2500, btype="low", fs=SR, output="sos"), rng.standard_normal(n)) * np.exp(-t * 60) * 0.4
save("impact", thump + click)

# tick: 40 ms
n = int(0.04 * SR); t = np.arange(n) / SR
tick = np.sin(2 * np.pi * 2400 * t) * np.exp(-t * 180) + 0.3 * rng.standard_normal(n) * np.exp(-t * 400)
save("tick", tick)

# shimmer: 2 s airy high sparkle
n = int(2.0 * SR); t = np.arange(n) / SR
sh = sum(np.sin(2 * np.pi * f * t + rng.uniform(0, 6)) * np.exp(-t * (1.2 + k * 0.4)) for k, f in enumerate([1760, 2217, 2637, 3520]))
sh += sosfilt(butter(2, 6000, btype="high", fs=SR, output="sos"), rng.standard_normal(n)) * np.exp(-t * 2.5) * 0.3
save("shimmer", sh * env(n, 0.02, 1.0))
print("sfx:", sorted(os.listdir(OUT)))
