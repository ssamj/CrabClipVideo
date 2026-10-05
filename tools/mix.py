"""合成背景音乐和音效，和配音混成成片音轨，封装进视频。

用法：python tools/mix.py [项目目录]
输入：timeline.json、sfx_events.json、audio/*.wav、out/video.mp4；
      script.json 里可选 "music": {"bpm": 104, "chords": [[低音, [三和弦]], ...],
        "drums": true（加轻鼓，节奏更跳）, "drums_span": [开始, 结束]（鼓只在这段里响）,
        "pad": [开始, 结束]（这段加一层柔和的和弦铺底）, "mutes": [[开始, 结束], ...]（音乐在这些时段停掉，做笑点）,
        "gain": [[时间, 倍数], ...]（音乐音量包络，中间线性插值，比如前奏轻、高潮响）,
        "keep_dynamics": true（只对无配音的片子：两遍 loudnorm 线性整体调音量，不把轻重压平）,
        "bgm_file": "music/xxx.wav"（用现成的音乐文件当背景音乐，比如 工具/acestep_gen.py 生成的；上面的和弦、鼓等就不用了）,
        "sfx_gain": {"whoosh": 2.0}（某类音效单独调音量）,
        "duck": {"db": 5, "kinds": ["whoosh"]}（这些音效响起时音乐让出几 dB，现成音乐编制满时用）}
      没有配音（timeline 里 lines 为空）时只混音乐和音效。
输出：out/bgm.wav、out/sfx.wav、out/<目录名>.mp4
"""

import json
import subprocess
import sys
import wave
from pathlib import Path

import numpy as np

SR = 48000
D = Path(sys.argv[1]).resolve() if len(sys.argv)>1 else Path(__file__).resolve().parents[1]
TL = json.loads((D / "timeline.json").read_text(encoding="utf-8"))
CFG = json.loads((D / "script.json").read_text(encoding="utf-8")).get("music", {})
DUR = TL["duration"]
N = int(DUR * SR)


def midi(m):
    return 440.0 * 2 ** ((m - 69) / 12)


def tt(length):
    return np.arange(int(length * SR)) / SR


def kalimba(f, length=1.6, vel=1.0):
    t = tt(length)
    y = np.sin(2 * np.pi * f * t) * np.exp(-3.2 * t)
    y += 0.22 * np.sin(2 * np.pi * 5.8 * f * t) * np.exp(-14 * t)
    y += 0.12 * np.sin(2 * np.pi * 2 * f * t) * np.exp(-28 * t)
    return vel * np.clip(t / 0.003, 0, 1) * y


def glock(f, length=1.2, vel=1.0):
    t = tt(length)
    y = np.sin(2 * np.pi * f * t) * np.exp(-4 * t) + 0.3 * np.sin(2 * np.pi * 2.76 * f * t) * np.exp(-11 * t)
    return vel * np.clip(t / 0.002, 0, 1) * y


def bass(f, length=1.2, vel=1.0):
    t = tt(length)
    y = (np.sin(2 * np.pi * f * t) + 0.3 * np.sin(2 * np.pi * 2 * f * t)) * np.exp(-2.2 * t)
    return vel * np.clip(t / 0.01, 0, 1) * y


def sweep(f0, f1, length, decay, vel=1.0, harmonics=(1.0,), vibrato=0.0):
    t = tt(length)
    f = f0 * (f1 / f0) ** (t / length) * (1 + vibrato * np.sin(2 * np.pi * 6 * t))
    ph = 2 * np.pi * np.cumsum(f) / SR
    y = sum(a * np.sin((k + 1) * ph) for k, a in enumerate(harmonics))
    return vel * np.clip(t / 0.004, 0, 1) * y * np.exp(-decay * t)


def pad(freqs, length, vel=1.0):
    """慢起慢收的和弦铺底：每个音两根略微失谐的正弦加一点八度。"""
    t = tt(length)
    y = sum(np.sin(2 * np.pi * f * t) + 0.6 * np.sin(2 * np.pi * f * 1.004 * t + 1.3) + 0.18 * np.sin(2 * np.pi * 2 * f * t) for f in freqs)
    env = np.clip(t / 0.45, 0, 1) * np.clip((length - t) / 0.7, 0, 1)
    return vel * env * y / len(freqs)


def whoosh(length=0.45, vel=1.0):
    n = np.random.default_rng(3).standard_normal(int(length * SR))
    out, hop, win = np.zeros_like(n), 1024, np.hanning(2048)
    for i, s in enumerate(range(0, len(n) - 2048, hop)):
        fc = 300 * (2500 / 300) ** (s / len(n))
        spec = np.fft.rfft(n[s : s + 2048] * win)
        fr = np.fft.rfftfreq(2048, 1 / SR)
        spec *= np.exp(-(((fr - fc) / (fc * 0.5)) ** 2))
        out[s : s + 2048] += np.fft.irfft(spec)
    env = np.sin(np.pi * np.linspace(0, 1, len(out))) ** 1.5
    return vel * out * env / (np.abs(out).max() + 1e-9)


def noise(length, seed=0):
    return np.random.default_rng(seed).standard_normal(int(length * SR))


def lowpass(x, fc):
    a = np.exp(-2 * np.pi * fc / SR)
    y = np.zeros_like(x)
    acc = 0.0
    for i, v in enumerate(x):
        acc = (1 - a) * v + a * acc
        y[i] = acc
    return y


def kick(vel=1.0):
    t = tt(0.32)
    f = 50 + 90 * np.exp(-t * 28)
    return vel * np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 9)


def clap(vel=1.0, seed=0):
    n = noise(0.16, seed)
    n = n - lowpass(n, 900)
    t = tt(0.16)
    return vel * 0.5 * n * np.exp(-t * 26)


def hat(vel=1.0, seed=0):
    n = noise(0.05, seed)
    n = np.diff(n, prepend=0)
    return vel * 0.25 * n * np.exp(-tt(0.05) * 90)


def add(buf, sig, at, pan=0.0):
    i = int(at * SR)
    if i >= len(buf):
        return
    sig = sig[: len(buf) - i]
    buf[i : i + len(sig), 0] += sig * np.sqrt((1 - pan) / 2)
    buf[i : i + len(sig), 1] += sig * np.sqrt((1 + pan) / 2)


# ---------- 背景音乐：拇指琴分解和弦 ----------
bgm = np.zeros((N, 2))
BEAT = 60 / CFG.get("bpm", 104)
CHORDS = CFG.get("chords", [[48, [60, 64, 67]], [45, [57, 60, 64]], [41, [57, 60, 65]], [43, [55, 59, 62]]])
PATTERN = [0, 1, 2, 3, 2, 1, 3, 2]
end_at = DUR - 1.6
t, bar = 0.0, 0
while t < end_at:
    root, tri = CHORDS[bar % len(CHORDS)]
    notes = tri + [tri[0] + 12]
    add(bgm, bass(midi(root), 1.4, 0.55), t)
    add(bgm, bass(midi(root), 1.0, 0.35), t + 2 * BEAT)
    for k, idx in enumerate(PATTERN):
        at = t + k * BEAT / 2
        if at >= end_at:
            break
        add(bgm, kalimba(midi(notes[idx] + 12), 1.4, 0.32 if k % 2 else 0.42), at, pan=0.35 if k % 2 else -0.25)
        n = np.random.default_rng(bar * 8 + k).standard_normal(int(0.05 * SR))
        n = np.diff(n, prepend=0) * np.exp(-np.arange(len(n)) / (0.012 * SR))
        add(bgm, 0.05 * n, at + BEAT / 4, pan=0.5)
    PAD = CFG.get("pad")
    if PAD and PAD[0] - 0.01 <= t < PAD[1]:
        add(bgm, pad([midi(m) for m in tri + [root + 12]], min(4 * BEAT + 0.6, PAD[1] - t + 0.6), 0.22), t)
    if CFG.get("drums"):
        DS = CFG.get("drums_span", [0, DUR])
        for k in range(8):
            at = t + k * BEAT / 2
            if at >= end_at:
                break
            if not (DS[0] - 0.01 <= at < DS[1]):
                continue
            if k % 2 == 0:
                add(bgm, hat(0.9, bar * 8 + k), at, pan=0.3)
            else:
                add(bgm, hat(0.5, bar * 8 + k), at, pan=0.3)
            if k in (0, 5):
                add(bgm, kick(0.8), at)
            if k in (2, 6):
                add(bgm, clap(0.55, bar * 8 + k), at, pan=-0.1)
    t += 4 * BEAT
    bar += 1
root, tri = CHORDS[0]
for j, m in enumerate(tri + [tri[0] + 12, tri[1] + 12]):
    add(bgm, kalimba(midi(m + 12), 2.0, 0.4), end_at + 0.05 * j, pan=-0.3 + 0.15 * j)
add(bgm, bass(midi(root), 2.0, 0.6), end_at)
if CFG.get("bgm_file"):  # 用现成的音乐文件代替合成的拇指琴
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", str(D / CFG["bgm_file"]), "-f", "f32le", "-ac", "2", "-ar", str(SR), "-"],
                         capture_output=True, check=True).stdout
    x = np.frombuffer(raw, dtype="<f4").reshape(-1, 2).astype(float)
    bgm = np.zeros((N, 2))
    bgm[: min(N, len(x))] = x[:N]
fade = np.ones(N)
fade[: int(0.03 * SR)] = np.linspace(0, 1, int(0.03 * SR))
FO = 1.5 if CFG.get("bgm_file") else 0.5  # 现成音乐不一定正好在片尾收住，淡出长一点
fade[-int(FO * SR) :] = np.linspace(1, 0, int(FO * SR))
for a, b in CFG.get("mutes", []):  # 音乐停掉的时段，两头 40ms 淡出淡入
    i0, i1, r = int(a * SR), int(b * SR), int(0.04 * SR)
    fade[max(0, i0 - r) : i0] *= np.linspace(1, 0, len(fade[max(0, i0 - r) : i0]))
    fade[i0:i1] = 0
    fade[i1 : i1 + r] *= np.linspace(0, 1, len(fade[i1 : i1 + r]))
bgm *= fade[:, None]
if CFG.get("gain"):
    GK = CFG["gain"]
    bgm *= np.interp(np.arange(N) / SR, [k[0] for k in GK], [k[1] for k in GK])[:, None]

# ---------- 音效 ----------
sfx = np.zeros((N, 2))
PENTA = [84, 86, 88, 91, 93, 96]
SCALE = [72, 74, 76, 77, 79, 81, 83, 84]
EV = [e for e in json.loads((D / "sfx_events.json").read_text(encoding="utf-8")) if e["kind"] != "voice"]
SG = CFG.get("sfx_gain", {})


def put(buf, sig, at, pan=0.0):  # 同 add，乘上这类音效自己的音量倍数（和这一下自己的 g）
    add(buf, sig * SG.get(k, 1.0) * e.get("g", 1.0), at, pan)


for e in EV:
    k, at, i = e["kind"], e["t"], e.get("i", 0)
    if k == "paper":
        d = 0.22
        n = noise(d, int(at * 1000))
        n = lowpass(n, 7200) - lowpass(n, 1300)
        env = np.sin(np.pi * np.arange(len(n)) / len(n)) ** 1.7
        put(sfx, n * env * 0.32, at, pan=((at * 1.7) % 1.4) - 0.7)
    elif k == "drawer":
        put(sfx, whoosh(0.45, 0.32), at)
        put(sfx, sweep(160, 90, 0.17, 13, 0.4), at + 0.27)
    elif k == "tap":
        put(sfx, sweep(1100, 440, 0.06, 35, 0.35), at)
    elif k == "creak":
        put(sfx, sweep(180, 330, 0.85, 1.4, 0.18, harmonics=(1, 0.4, 0.2), vibrato=0.08), at)
    elif k == "ratchet":
        for j in range(13):
            put(sfx, sweep(900, 450, 0.023, 95, 0.25), at + j * 0.07)
    elif k == "pop":
        put(sfx, sweep(420, 980, 0.09, 30, 0.6), at)
    elif k == "shimmer":
        for j, m in enumerate([79, 84, 88]):
            put(sfx, glock(midi(m), 1.0, 0.35), at + 0.07 * j, pan=-0.4)
    elif k == "note":
        put(sfx, glock(midi(SCALE[i % len(SCALE)] + 12), 0.9, 0.4), at, pan=0.3)
    elif k == "bubble":
        put(sfx, sweep(300, 1300, 0.05, 50, 0.28), at, pan=((i * 0.37) % 1.4) - 0.7)
    elif k == "boing":
        put(sfx, sweep(820, 240, 0.45, 5, 0.65, vibrato=0.06), at)
    elif k == "blip":
        put(sfx, glock(midi(PENTA[i % len(PENTA)]), 0.35, 0.22), at, pan=((i * 0.53) % 1.6) - 0.8)
    elif k == "rise":
        for j, m in enumerate([72, 76, 79, 84, 88, 91, 96]):
            put(sfx, glock(midi(m), 1.4, 0.3), at + 0.06 * j, pan=-0.6 + 0.2 * j)
    elif k == "whoosh":
        put(sfx, whoosh(0.45, 0.5), at)
    elif k == "sleepy":  # 下行的「哇哇」，表示犯困
        put(sfx, sweep(440, 330, 0.35, 2, 0.35, harmonics=(1, 0.5, 0.3), vibrato=0.03), at)
        put(sfx, sweep(330, 220, 0.6, 2, 0.35, harmonics=(1, 0.5, 0.3), vibrato=0.03), at + 0.35)
    elif k == "chord":
        for m in [77, 81, 84, 89]:
            put(sfx, glock(midi(m), 1.6, 0.28), at)
    elif k == "ding":  # 收到消息的「叮」
        put(sfx, glock(midi(93), 0.8, 0.45), at, pan=-0.2)
        put(sfx, glock(midi(100), 0.6, 0.25), at + 0.07, pan=-0.2)
    elif k == "tick":  # 滑杆刻度
        put(sfx, sweep(2400 + 180 * (i % 5), 1800, 0.018, 120, 0.22), at, pan=0.2)
    elif k == "click":
        put(sfx, sweep(1600, 900, 0.03, 90, 0.5), at)
        put(sfx, 0.15 * noise(0.01, i) * np.exp(-tt(0.01) * 300), at)
    elif k == "error":  # 报错蜂鸣
        for j in range(2):
            put(sfx, sweep(185, 180, 0.16, 3, 0.35, harmonics=(1, 0.5, 0.33, 0.25, 0.2)), at + 0.2 * j)
    elif k == "twang":  # 橡皮筋弹回
        put(sfx, sweep(330, 110, 0.7, 4, 0.6, harmonics=(1, 0.4, 0.2), vibrato=0.12), at)
    elif k == "thud":
        put(sfx, sweep(120, 45, 0.3, 10, 0.9), at)
        put(sfx, lowpass(noise(0.12, 5), 400) * np.exp(-tt(0.12) * 30) * 2.0, at)
    elif k == "scratch":  # 唱片急停
        t0 = tt(0.3)
        f = 900 * np.exp(-t0 * 6) + 120
        put(sfx, 0.4 * np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t0 * 4) + 0.15 * noise(0.3, 9) * np.exp(-t0 * 8), at)
    elif k == "step":
        put(sfx, sweep(380 + 40 * (i % 3), 620, 0.045, 60, 0.18), at, pan=((i * 0.41) % 1.2) - 0.6)
    elif k == "strain":  # 使劲拽，颤音
        put(sfx, sweep(210, 260, 1.2, 0.8, 0.22, harmonics=(1, 0.6, 0.3), vibrato=0.05), at)
    elif k == "splash":
        n = noise(0.35, 11)
        n = n - lowpass(n, 700)
        put(sfx, 0.6 * n * np.exp(-tt(0.35) * 9), at)
        for j in range(4):
            put(sfx, sweep(500 + 150 * j, 1400, 0.05, 50, 0.2), at + 0.03 * j, pan=0.3 * (j - 1.5))
    elif k == "buzz":  # 蜜蜂嗡嗡，e["d"] 秒
        d = e.get("d", 0.6)
        t0 = tt(d)
        f = 210 * (1 + 0.04 * np.sin(2 * np.pi * 7 * t0))
        ph = 2 * np.pi * np.cumsum(f) / SR
        y = sum(np.sin(h * ph) / h for h in range(1, 8))
        env = np.clip(t0 / 0.08, 0, 1) * np.clip((d - t0) / 0.1, 0, 1) * (0.7 + 0.3 * np.sin(2 * np.pi * 13 * t0))
        put(sfx, 0.12 * y * env, at, pan=0.4)
    elif k == "thunder":
        t0 = tt(2.2)
        n = lowpass(noise(2.2, 21), 180) * 6
        env = np.clip(t0 / 0.03, 0, 1) * np.exp(-t0 * 1.6) * (1 + 0.5 * np.sin(2 * np.pi * 3 * t0))
        put(sfx, 0.9 * n * env, at)
        hp = noise(0.08, 22)
        put(sfx, 0.4 * (hp - lowpass(hp, 1500)) * np.exp(-tt(0.08) * 40), at)
    elif k == "rain":  # 雨声铺底，e["d"] 秒
        d = e.get("d", 2.0)
        n = noise(d, 31)
        n = lowpass(n, 3500) - lowpass(n, 500)
        t0 = tt(d)
        put(sfx, 0.35 * n * np.clip(t0 / 0.3, 0, 1) * np.clip((d - t0) / 0.4, 0, 1), at, pan=-0.1)
    elif k == "knock":  # 拍西瓜的「咚」
        t0 = tt(0.25)
        y = np.sin(2 * np.pi * np.cumsum(170 - 40 * t0) / SR) * np.exp(-t0 * 16) + 0.35 * np.sin(2 * np.pi * 410 * t0) * np.exp(-t0 * 30)
        put(sfx, 0.9 * y, at)
    elif k == "crack":
        for j in range(6):
            c = noise(0.012, 40 + j)
            put(sfx, 0.35 * (c - lowpass(c, 2000)) * np.exp(-tt(0.012) * 200), at + 0.045 * j + 0.01 * (j % 2), pan=0.2 * (j % 3 - 1))
    elif k == "boom":
        put(sfx, kick(1.4), at)
        put(sfx, 0.7 * lowpass(noise(0.6, 50), 900) * 4 * np.exp(-tt(0.6) * 6), at)
        put(sfx, sweep(900, 200, 0.2, 12, 0.4), at)
    elif k == "idea":
        for j, m in enumerate([84, 91]):
            put(sfx, glock(midi(m), 0.8, 0.35), at + 0.08 * j)
    # ---- 小螃蟹修 bug 加的 ----
    elif k == "key":  # 键盘敲字
        c = noise(0.03, 60 + i)
        put(sfx, 0.25 * (c - lowpass(c, 2500)) * np.exp(-tt(0.03) * 160), at, pan=0.15 * ((i % 5) - 2) / 2)
        put(sfx, sweep(1100 + 90 * (i % 4), 700, 0.02, 120, 0.12), at)
    elif k == "enter":  # 回车，重一点
        c = noise(0.06, 70)
        put(sfx, 0.4 * (c - lowpass(c, 1500)) * np.exp(-tt(0.06) * 70), at)
        put(sfx, sweep(420, 260, 0.06, 40, 0.4), at)
    elif k == "hop":  # 起跳「咻」往上
        put(sfx, sweep(260, 900, 0.18, 8, 0.4, harmonics=(1, 0.3)), at)
    elif k == "slap":  # 啪
        c = noise(0.08, 80)
        put(sfx, 0.7 * (c - lowpass(c, 900)) * np.exp(-tt(0.08) * 50), at)
        put(sfx, sweep(200, 90, 0.08, 30, 0.5), at)
    elif k == "scribble":  # 铅笔沙沙
        d = e.get("d", 1.0)
        n = noise(d, 90)
        n = lowpass(n, 5000) - lowpass(n, 1800)
        env = (0.5 + 0.5 * np.sign(np.sin(2 * np.pi * 7 * tt(d)))) * np.clip(tt(d) / 0.05, 0, 1)
        put(sfx, 0.35 * n * env, at, pan=0.3)
    elif k == "slide":  # 抽屉拉开
        n = noise(0.3, 95)
        n = lowpass(n, 1200) - lowpass(n, 200)
        put(sfx, 0.9 * n * np.clip(tt(0.3) / 0.03, 0, 1) * np.exp(-tt(0.3) * 6), at)
        put(sfx, sweep(160, 120, 0.1, 20, 0.5), at + 0.25)
    elif k == "scurry":  # 小虫子跑，一串细碎的脚步
        d = e.get("d", 0.5)
        for j in range(int(d / 0.045)):
            put(sfx, sweep(1500 + 300 * (j % 3), 2200, 0.015, 150, 0.12), at + j * 0.045, pan=0.3)
    elif k == "clank":  # 金属「铛」
        for f_, a_ in [(620, 0.5), (1570, 0.3), (2710, 0.18)]:
            put(sfx, sweep(f_, f_ * 0.99, 0.5, 9, a_), at)
        c = noise(0.02, 100 + i)
        put(sfx, 0.3 * c * np.exp(-tt(0.02) * 200), at)
    elif k == "bad":  # 测试失败的低音「嘟」
        put(sfx, sweep(260, 200, 0.14, 12, 0.35, harmonics=(1, 0.5, 0.3)), at, pan=-0.2 + 0.04 * i)
    elif k == "tiptoe":  # 踮脚走
        d = e.get("d", 0.4)
        for j in range(int(d / 0.09)):
            put(sfx, sweep(900 + 200 * (j % 2), 1300, 0.03, 90, 0.18), at + j * 0.09)
    elif k == "squish":  # 滚筒刷漆，湿哒哒
        d = e.get("d", 0.7)
        n = noise(d, 110)
        n = lowpass(n, 900)
        env = (0.6 + 0.4 * np.sin(2 * np.pi * 9 * tt(d))) * np.clip(tt(d) / 0.05, 0, 1) * np.clip((d - tt(d)) / 0.1, 0, 1)
        put(sfx, 1.8 * n * env, at)
    elif k == "clapx":  # 拍手
        put(sfx, 1.2 * clap(1.0, 3), at)
        put(sfx, 0.8 * clap(0.8, 4), at + 0.012)
    elif k == "scrub":  # 刷洗 + 冒泡
        d = e.get("d", 1.5)
        n = noise(d, 120)
        n = lowpass(n, 4000) - lowpass(n, 1000)
        env = (0.5 + 0.5 * np.abs(np.sin(2 * np.pi * 6 * tt(d)))) * np.clip(tt(d) / 0.05, 0, 1) * np.clip((d - tt(d)) / 0.2, 0, 1)
        put(sfx, 0.35 * n * env, at, pan=-0.2)
        for j in range(int(d / 0.16)):
            put(sfx, sweep(500 + 120 * (j % 4), 1500, 0.05, 50, 0.16), at + j * 0.16 + 0.05, pan=0.3 * ((j % 3) - 1))
    elif k == "alarm":  # 两声警报
        for j in range(3):
            put(sfx, sweep(880, 880, 0.14, 2, 0.28, harmonics=(1, 0.3)), at + j * 0.3)
            put(sfx, sweep(660, 660, 0.14, 2, 0.28, harmonics=(1, 0.3)), at + j * 0.3 + 0.15)
    elif k == "hiss":  # 液压泄气
        n = noise(0.6, 130)
        n = n - lowpass(n, 2500)
        put(sfx, 0.5 * n * np.clip(tt(0.6) / 0.02, 0, 1) * np.exp(-tt(0.6) * 4), at)
    elif k == "dizzy":  # 晕乎乎的鸟叫
        for j in range(4):
            put(sfx, sweep(1800, 2600, 0.12, 10, 0.16, vibrato=0.05), at + j * 0.18, pan=0.5 * (1 if j % 2 else -1))
    elif k == "popper":  # 拉炮
        put(sfx, kick(0.9), at)
        c = noise(0.25, 140)
        put(sfx, 0.6 * (c - lowpass(c, 1200)) * np.exp(-tt(0.25) * 14), at)
        for j in range(8):
            put(sfx, sweep(1200 + 250 * j, 2600, 0.04, 60, 0.1), at + 0.05 + j * 0.03, pan=0.2 * ((j % 5) - 2))
    elif k == "noteup":  # 一路往上的音阶
        UP = [72, 74, 76, 79, 81, 84, 86, 88, 91, 93, 96, 98]
        put(sfx, glock(midi(UP[i % len(UP)]), 0.7, 0.36), at, pan=-0.5 + i * 0.09)
    elif k == "dingdong":  # 客服电话的「叮——咚」
        put(sfx, glock(midi(88), 1.2, 0.5), at, pan=0.1)
        put(sfx, glock(midi(84), 1.6, 0.5), at + 0.32, pan=0.1)
    elif k == "snore":  # 打呼：吸气呼噜 + 呼气哨
        d = e.get("d", 1.0)
        n = lowpass(noise(d * 0.55, 150), 400) * 3
        t0 = tt(d * 0.55)
        put(sfx, 0.5 * n * (0.5 + 0.5 * np.sin(2 * np.pi * 28 * t0)) * np.sin(np.pi * t0 / (d * 0.55)), at)
        put(sfx, sweep(1400, 900, d * 0.4, 1.5, 0.08), at + d * 0.58)


if CFG.get("duck"):  # 这些音效响起时音乐让出几 dB（现成音乐编制满，不让的话转场的嗖声会被盖住）
    DK = CFG["duck"]
    lo, T = 10 ** (-DK.get("db", 5) / 20), np.arange(N) / SR
    env = np.ones(N)
    for e in EV:
        if e["kind"] in DK.get("kinds", ["whoosh"]):
            t = e["t"]
            env = np.minimum(env, np.interp(T, [t - 0.08, t - 0.01, t + 0.4, t + 0.75], [1, lo, lo, 1]))
    bgm *= env[:, None]


def write(path, x):
    x = np.clip(x, -1, 1)
    with wave.open(str(path), "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes((x * 32767).astype("<i2").tobytes())


out = D / "out"
write(out / "bgm.wav", bgm / (np.abs(bgm).max() + 1e-9) * 0.8)
write(out / "sfx.wav", sfx / (np.abs(sfx).max() + 1e-9) * 0.8)

# ---------- 混音 + 封装 ----------
cmd = ["ffmpeg", "-y", "-loglevel", "error", "-i", str(out / "video.mp4"), "-i", str(out / "bgm.wav"), "-i", str(out / "sfx.wav")]
chains, labels = [], []
if not TL["lines"]:  # 没有配音：只有音乐和音效
    chains = [
        f"[1]volume={CFG.get('bgm_volume', 0.30)}[bg]",
        f"[2]volume={CFG.get('sfx_volume', 0.32)}[fx]",
        "[bg][fx]amix=inputs=2:normalize=0,loudnorm=I=-16:TP=-1.5:LRA=11,aresample=48000[a]",
    ]
for i, ln in enumerate(TL["lines"]):
    cmd += ["-i", str(D / ln["file"])]
    ms = int(round(ln["start"] * 1000))
    chains.append(f"[{3 + i}]aresample={SR},aformat=channel_layouts=stereo,adelay={ms}|{ms}[v{i}]")
    labels.append(f"[v{i}]")
chains += [] if not TL["lines"] else [
    f"{''.join(labels)}amix=inputs={len(labels)}:normalize=0,apad=whole_dur={DUR}[voice]",
    "[voice]asplit[vo][vsc]",
    f"[1]volume={CFG.get('bgm_volume', 0.30)}[bg]",
    "[bg][vsc]sidechaincompress=threshold=0.02:ratio=5:attack=15:release=350[bgd]",
    f"[2]volume={CFG.get('sfx_volume', 0.32)}[fx]",
    "[vo][bgd][fx]amix=inputs=3:normalize=0,loudnorm=I=-16:TP=-1.5:LRA=11,aresample=48000[a]",
]
if not TL["lines"] and CFG.get("keep_dynamics"):
    # 单遍 loudnorm 会像自动增益一样把前奏和高潮拉平；先量一遍响度，再按量出来的值整体线性调
    pre = ";".join(chains).replace("loudnorm=I=-16:TP=-1.5:LRA=11,aresample=48000[a]", "loudnorm=I=-16:TP=-1.5:LRA=20:print_format=json[a]")
    r = subprocess.run(["ffmpeg", "-hide_banner", "-i", str(out / "bgm.wav"), "-i", str(out / "bgm.wav"), "-i", str(out / "sfx.wav"),
                        "-filter_complex", pre, "-map", "[a]", "-f", "null", "-"], capture_output=True, text=True, check=True)
    m = json.JSONDecoder().raw_decode(r.stderr[r.stderr.rindex("{"):])[0]
    # loudnorm 的 linear 模式在峰值超限时会偷偷退回动态模式，所以自己整体加增益，再用限幅器压住峰值
    chains[-1] = chains[-1].replace("loudnorm=I=-16:TP=-1.5:LRA=11", f"volume={-16 - float(m['input_i']):.2f}dB,alimiter=limit=0.84:level=false")
final = out / "小螃蟹剪国庆相册_精简版.mp4"
cmd += [
    "-filter_complex", ";".join(chains), "-map", "0:v", "-map", "[a]",
    "-c:v", "copy", "-c:a", "aac", "-b:a", "192k", "-t", str(DUR), "-movflags", "+faststart", str(final),
]
subprocess.run(cmd, check=True)
print(final)
