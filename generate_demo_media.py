#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Gerador de mídia de demonstração do Soundify.

Cria, de forma 100% procedural (sem samples nem músicas de terceiros):
  - faixas de áudio MP3 sintetizadas -> autoria própria, livres de direitos autorais;
  - capas de álbum e imagens de artista em SVG;
  - opcionalmente, o script SQL de carga inicial (--sql), para que a duração
    cadastrada no banco seja sempre igual à duração real dos arquivos.

Requisitos: Python 3.9+, numpy e ffmpeg (com libmp3lame) disponíveis no PATH.

Uso, a partir da raiz do repositório:
    python tools/generate_demo_media.py
    python tools/generate_demo_media.py --sql backend/src/main/resources/db/migration/V2__seed_demo_data.sql

Os arquivos gerados já estão versionados no repositório; este script só é
necessário se você quiser alterar o catálogo de demonstração.
"""
from __future__ import annotations

import argparse
import math
import shutil
import subprocess
import sys
import tempfile
import wave
from functools import lru_cache
from pathlib import Path

import numpy as np

SR = 44100
ROOT = Path(__file__).resolve().parent.parent
DEFAULT_OUT = ROOT / "backend" / "src" / "main" / "resources" / "static" / "media"

# ---------------------------------------------------------------------------
# Catálogo de demonstração (tudo fictício)
# ---------------------------------------------------------------------------

ARTISTS = [
    dict(slug="neon-harbor", name="Neon Harbor", featured=True, colors=("#ff3d9a", "#3a1fa8"),
         bio="Dupla fictícia de synthwave: arpejos analógicos, baixos pulsantes e bateria eletrônica."),
    dict(slug="lua-cinza", name="Lua Cinza", featured=True, colors=("#5b6b8c", "#1c2233"),
         bio="Projeto fictício de lo-fi com piano elétrico, chuva e chiado de vinil."),
    dict(slug="quartz-trio", name="Quartz Trio", featured=True, colors=("#f2c14e", "#10304f"),
         bio="Trio fictício de jazz: baixo caminhante, piano e escovinhas em andamento swingado."),
    dict(slug="atlas-pulse", name="Atlas Pulse", featured=True, colors=("#35e0d0", "#243b9e"),
         bio="Produtor fictício de música eletrônica dançante, com graves que respiram."),
    dict(slug="vento-sul", name="Vento Sul", featured=False, colors=("#f4a259", "#2f5d50"),
         bio="Cantautor fictício de violão de aço, estrada de terra e fim de tarde."),
    dict(slug="elias-kern", name="Elias Kern", featured=False, colors=("#d9d4c5", "#2b2b3a"),
         bio="Pianista fictício de noturnos curtos e valsas românticas."),
    dict(slug="distorcao-livre", name="Distorção Livre", featured=False, colors=("#ffd23f", "#b5179e"),
         bio="Banda fictícia de rock de garagem: guitarras sujas e bateria sem frescura."),
    dict(slug="aurora-drift", name="Aurora Drift", featured=True, colors=("#7be0ad", "#1b2a4e"),
         bio="Projeto fictício de ambient: camadas lentas de sintetizador e sinos distantes."),
]

# days_ago controla a ordem de "adicionadas recentemente".
ALBUMS = [
    dict(slug="midnight-grid", artist="neon-harbor", title="Midnight Grid", year=2024, featured=True,
         motif="synthwave", colors=("#ff3d9a", "#2a1470"), days_ago=2),
    dict(slug="chuva-de-domingo", artist="lua-cinza", title="Chuva de Domingo", year=2023, featured=True,
         motif="lofi", colors=("#44527a", "#151a2b"), days_ago=5),
    dict(slug="blue-hour-sessions", artist="quartz-trio", title="Blue Hour Sessions", year=2022, featured=True,
         motif="jazz", colors=("#1c4a7a", "#0b1a2e"), days_ago=9),
    dict(slug="orbital", artist="atlas-pulse", title="Orbital", year=2025, featured=True,
         motif="electronic", colors=("#2ad1c0", "#1a2a8a"), days_ago=1),
    dict(slug="estrada-de-terra", artist="vento-sul", title="Estrada de Terra", year=2021, featured=False,
         motif="acoustic", colors=("#f4a259", "#2f5d50"), days_ago=14),
    dict(slug="noturnos-curtos", artist="elias-kern", title="Noturnos Curtos", year=2020, featured=False,
         motif="classical", colors=("#6a6a86", "#1d1d2b"), days_ago=20),
    dict(slug="garagem-77", artist="distorcao-livre", title="Garagem 77", year=2024, featured=True,
         motif="rock", colors=("#b5179e", "#3a0a40"), days_ago=3),
    dict(slug="horizonte-lento", artist="aurora-drift", title="Horizonte Lento", year=2023, featured=True,
         motif="ambient", colors=("#4fc9a0", "#16264a"), days_ago=6),
]

# key = nota MIDI da tônica; prog = (semitons a partir da tônica, qualidade do acorde) por compasso.
TRACKS = [
    dict(slug="neon-drive", album="midnight-grid", n=1, title="Neon Drive", genre="Synthwave", style="synthwave",
         bpm=118, bars=8, key=57, seed=11, scale="minor_pent", arp=[0, 1, 2, 3, 2, 1, 2, 3],
         prog=[(0, "min"), (-4, "maj"), (3, "maj"), (-2, "maj")]),
    dict(slug="chrome-skyline", album="midnight-grid", n=2, title="Chrome Skyline", genre="Synthwave", style="synthwave",
         bpm=104, bars=8, key=52, seed=12, scale="minor_pent", arp=[0, 2, 1, 3, 2, 3, 1, 2],
         prog=[(0, "min7"), (-2, "maj"), (-4, "maj7"), (-2, "maj")]),
    dict(slug="last-arcade", album="midnight-grid", n=3, title="Last Arcade", genre="Synthwave", style="synthwave",
         bpm=126, bars=8, key=50, seed=13, scale="minor_pent", arp=[0, 1, 2, 1, 3, 2, 1, 2],
         prog=[(0, "min"), (3, "maj"), (-2, "maj"), (-4, "maj")]),

    dict(slug="cafe-com-vinil", album="chuva-de-domingo", n=1, title="Café com Vinil", genre="Lo-fi", style="lofi",
         bpm=78, bars=6, key=48, seed=21, scale="major_pent",
         prog=[(2, "min7"), (-5, "dom7"), (0, "maj7"), (-3, "min7")]),
    dict(slug="janela-aberta", album="chuva-de-domingo", n=2, title="Janela Aberta", genre="Lo-fi", style="lofi",
         bpm=84, bars=6, key=53, seed=22, scale="major_pent",
         prog=[(0, "maj7"), (-1, "min7"), (-3, "min7"), (-5, "maj7")]),
    dict(slug="sono-leve", album="chuva-de-domingo", n=3, title="Sono Leve", genre="Lo-fi", style="lofi",
         bpm=70, bars=5, key=45, seed=23, scale="minor_pent",
         prog=[(0, "min7"), (-4, "maj7"), (3, "maj7"), (-2, "dom7")]),

    dict(slug="blue-hour", album="blue-hour-sessions", n=1, title="Blue Hour", genre="Jazz", style="jazz",
         bpm=112, bars=8, key=48, seed=31, scale="blues",
         prog=[(2, "min7"), (-5, "dom7"), (0, "maj7"), (-3, "dom7")]),
    dict(slug="walking-home", album="blue-hour-sessions", n=2, title="Walking Home", genre="Jazz", style="jazz",
         bpm=126, bars=8, key=55, seed=32, scale="major_pent",
         prog=[(0, "maj7"), (-3, "min7"), (2, "min7"), (-5, "dom7")]),
    dict(slug="fumaca-e-veludo", album="blue-hour-sessions", n=3, title="Fumaça e Veludo", genre="Jazz", style="jazz",
         bpm=76, bars=6, key=53, seed=33, scale="blues",
         prog=[(0, "maj7"), (-3, "min7"), (2, "min7"), (-5, "dom7")]),

    dict(slug="orbital", album="orbital", n=1, title="Orbital", genre="Eletrônica", style="electronic",
         bpm=126, bars=8, key=45, seed=41, scale="minor_pent",
         prog=[(0, "min"), (0, "min"), (-4, "maj"), (-2, "maj")]),
    dict(slug="gravity-well", album="orbital", n=2, title="Gravity Well", genre="Eletrônica", style="electronic",
         bpm=132, bars=8, key=43, seed=42, scale="minor_pent",
         bass=[1, 0, 1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 0, 1, 1],
         prog=[(0, "min"), (-2, "maj"), (3, "maj"), (-5, "maj")]),

    dict(slug="poeira-do-caminho", album="estrada-de-terra", n=1, title="Poeira do Caminho", genre="Acústico",
         style="acoustic", bpm=96, bars=8, key=55, seed=51, scale="major_pent",
         prog=[(0, "maj"), (5, "maj"), (-3, "min"), (-5, "maj")]),
    dict(slug="sol-na-serra", album="estrada-de-terra", n=2, title="Sol na Serra", genre="Acústico",
         style="acoustic", bpm=88, bars=6, key=50, seed=52, scale="major_pent",
         prog=[(0, "maj"), (-5, "maj"), (-3, "min"), (-7, "maj")]),

    dict(slug="preludio-em-la", album="noturnos-curtos", n=1, title="Prelúdio em Lá", genre="Clássica",
         style="classical", bpm=76, bars=6, key=57, seed=61, scale="minor",
         prog=[(0, "min"), (5, "min"), (-5, "dom7"), (0, "min")]),
    dict(slug="valsa-das-horas", album="noturnos-curtos", n=2, title="Valsa das Horas", genre="Clássica",
         style="classical", bpm=132, bars=12, key=60, seed=62, scale="major", waltz=True,
         prog=[(0, "maj"), (-5, "maj"), (5, "maj"), (0, "maj")]),

    dict(slug="volume-maximo", album="garagem-77", n=1, title="Volume Máximo", genre="Rock", style="rock",
         bpm=144, bars=10, key=40, seed=71, scale="minor_pent",
         prog=[(0, "pow"), (0, "pow"), (3, "pow"), (5, "pow")]),
    dict(slug="rua-sem-saida", album="garagem-77", n=2, title="Rua Sem Saída", genre="Rock", style="rock",
         bpm=122, bars=8, key=45, seed=72, scale="minor_pent",
         prog=[(0, "pow"), (-2, "pow"), (-4, "pow"), (-2, "pow")]),

    dict(slug="mare-alta", album="horizonte-lento", n=1, title="Maré Alta", genre="Ambient", style="ambient",
         bpm=60, bars=5, key=53, seed=81, scale="major_pent",
         prog=[(0, "maj7"), (4, "min7"), (-5, "maj7"), (-3, "min7")]),
    dict(slug="nebulosa", album="horizonte-lento", n=2, title="Nebulosa", genre="Ambient", style="ambient",
         bpm=52, bars=4, key=50, seed=82, scale="major_pent",
         prog=[(0, "sus2"), (-2, "maj7"), (3, "maj7"), (-5, "sus2")]),
]

CHORDS = {
    "maj": [0, 4, 7], "min": [0, 3, 7], "maj7": [0, 4, 7, 11], "min7": [0, 3, 7, 10],
    "dom7": [0, 4, 7, 10], "sus2": [0, 2, 7], "pow": [0, 7, 12],
}
SCALES = {
    "minor_pent": [0, 3, 5, 7, 10], "major_pent": [0, 2, 4, 7, 9], "blues": [0, 3, 5, 6, 7, 10],
    "minor": [0, 2, 3, 5, 7, 8, 10], "major": [0, 2, 4, 5, 7, 9, 11],
}


def beats_per_bar(cfg) -> int:
    return 3 if cfg.get("waltz") else 4


def track_duration(cfg) -> int:
    """Duração inteira em segundos (inclui o 'rabo' de reverberação)."""
    bar_len = 60.0 / cfg["bpm"] * beats_per_bar(cfg)
    return math.ceil(cfg["bars"] * bar_len + 0.6)


# ---------------------------------------------------------------------------
# Síntese básica
# ---------------------------------------------------------------------------

def hz(midi):
    return 440.0 * 2.0 ** ((midi - 69) / 12.0)


def chord_notes(root, quality):
    return [root + i for i in CHORDS[quality]]


def fit(note, lo, hi):
    """Leva a nota para dentro da faixa [lo, hi] mudando de oitava."""
    while note > hi:
        note -= 12
    while note < lo:
        note += 12
    return note


def tvec(n):
    return np.arange(n) / SR


def lp(x, k):
    """Passa-baixas simples (média móvel)."""
    return x if k <= 1 else np.convolve(x, np.ones(k) / k, mode="same")


def adsr(n, a, d, s, r):
    a_n, d_n, r_n = int(a * SR), int(d * SR), int(r * SR)
    total = a_n + d_n + r_n
    if total > n:  # nota curta: comprime os estágios
        k = n / total
        a_n, d_n, r_n = int(a_n * k), int(d_n * k), int(r_n * k)
    sus_n = max(0, n - a_n - d_n - r_n)
    parts = [np.linspace(0, 1, a_n, endpoint=False), np.linspace(1, s, d_n, endpoint=False),
             np.full(sus_n, s), np.linspace(s, 0, r_n)]
    env = np.concatenate([p for p in parts if len(p)]) if n > 0 else np.zeros(0)
    if len(env) < n:
        env = np.pad(env, (0, n - len(env)))
    return env[:n]


@lru_cache(maxsize=512)
def osc(freq, n, kind="saw", detune=0.0, kmax=24):
    """Oscilador com limitação de banda (soma de harmônicos até Nyquist)."""
    f = freq * 2.0 ** (detune / 1200.0)
    ph = 2.0 * np.pi * f * tvec(n)
    if kind == "sine":
        return np.sin(ph)
    top = max(1, min(kmax, int((SR / 2 - 500) / f)))
    ks = np.arange(1, top + 1)
    if kind == "saw":
        sel, w, scale = ks, 1.0 / ks, 2.0 / np.pi
    elif kind == "square":
        sel = ks[ks % 2 == 1]
        w, scale = 1.0 / sel, 4.0 / np.pi
    else:  # triângulo
        sel = ks[ks % 2 == 1]
        w, scale = ((-1.0) ** ((sel - 1) // 2)) / sel ** 2, 8.0 / np.pi ** 2
    return (w[:, None] * np.sin(sel[:, None] * ph[None, :])).sum(axis=0) * scale


@lru_cache(maxsize=512)
def pluck(freq, n, decay=4.0, bright=1.0):
    """Corda dedilhada / piano: harmônicos que decaem mais rápido quanto mais agudos."""
    t = tvec(n)
    top = max(1, min(16, int((SR / 2 - 500) / freq)))
    out = np.zeros(n)
    for k in range(1, top + 1):
        fk = freq * k * (1 + 0.0003 * k * k)
        out += (1.0 / k ** 1.15) * np.exp(-t * decay * (1 + 0.55 * bright * (k - 1))) * np.sin(2 * np.pi * fk * t)
    return out * (1 - np.exp(-t * 600))


@lru_cache(maxsize=512)
def epiano(freq, n, decay=2.6):
    t = tvec(n)
    s = (np.sin(2 * np.pi * freq * t) * np.exp(-t * decay)
         + 0.35 * np.sin(2 * np.pi * freq * 2 * t) * np.exp(-t * decay * 1.8)
         + 0.12 * np.sin(2 * np.pi * freq * 4.01 * t) * np.exp(-t * decay * 3.2))
    return s * (1 - np.exp(-t * 500))


def bell(freq, n):
    t = tvec(n)
    return (pluck(freq, n, 1.1, 0.3) + 0.35 * np.sin(2 * np.pi * freq * 2.76 * t) * np.exp(-t * 2.4))


# Percussão (ruído com envelopes)

def kick(n_sec=0.28, f0=52, f1=130):
    n = int(n_sec * SR)
    t = tvec(n)
    freq = f0 + (f1 - f0) * np.exp(-t * 28)
    return np.sin(2 * np.pi * np.cumsum(freq) / SR) * np.exp(-t * 10)


def snare(rng, n_sec=0.2):
    n = int(n_sec * SR)
    t = tvec(n)
    return 0.8 * rng.standard_normal(n) * np.exp(-t * 22) + 0.5 * np.sin(2 * np.pi * 190 * t) * np.exp(-t * 28)


def hat(rng, n_sec=0.06, decay=70):
    n = int(n_sec * SR)
    return np.diff(rng.standard_normal(n), prepend=0.0) * np.exp(-tvec(n) * decay) * 0.5


def clap(rng, n_sec=0.2):
    n = int(n_sec * SR)
    t = tvec(n)
    env = np.exp(-t * 22) * 0.4
    for off in (0.0, 0.011, 0.023):
        s = int(off * SR)
        env[s:] += np.exp(-t[: n - s] * 55)
    return np.diff(rng.standard_normal(n), prepend=0.0) * env * 0.45


def crash(rng, n_sec=1.4):
    n = int(n_sec * SR)
    return np.diff(rng.standard_normal(n), prepend=0.0) * np.exp(-tvec(n) * 3.2) * 0.6


def ride(rng, n_sec=0.5):
    n = int(n_sec * SR)
    t = tvec(n)
    noise = np.diff(np.diff(rng.standard_normal(n), prepend=0.0), prepend=0.0)
    tone = sum(a * np.sin(2 * np.pi * f * t) for f, a in ((3100, .5), (4300, .4), (5900, .3), (7300, .25)))
    return (noise * 0.25 + tone * 0.3) * np.exp(-t * 11) * (1 - np.exp(-t * 900))


# Efeitos

def echo(x, delay, fb=0.4, taps=4, level=0.35):
    out = x.copy()
    d = int(delay * SR)
    for i in range(1, taps + 1):
        s = d * i
        if s >= len(x):
            break
        out[s:] += x[: len(x) - s] * level * fb ** (i - 1)
    return out


def room(x, level=0.22):
    out = x.copy()
    for d, g in ((0.029, 0.55), (0.047, 0.45), (0.071, 0.36), (0.103, 0.28), (0.151, 0.2)):
        s = int(d * SR)
        out[s:] += lp(x[: len(x) - s], 6) * level * g
    return out


def finish(x, fade_out=0.4):
    """Remove DC, normaliza, aplica saturação suave e fades."""
    x = x - np.mean(x)
    x = x / (np.max(np.abs(x)) + 1e-9)
    x = np.tanh(1.5 * x) / np.tanh(1.5) * 0.8
    n_in, n_out = int(0.012 * SR), int(fade_out * SR)
    x[:n_in] *= np.linspace(0, 1, n_in)
    x[-n_out:] *= np.linspace(1, 0, n_out)
    return x


class Mix:
    """Linha do tempo em compassos/tempos com camadas de música, bateria e 'pump' (sidechain)."""

    def __init__(self, bpm, bars, bpb=4):
        self.bars, self.bpb = bars, bpb
        self.beat = 60.0 / bpm
        self.bar_len = self.beat * bpb
        self.dur = math.ceil(bars * self.bar_len + 0.6)
        self.n = self.dur * SR
        self.music = np.zeros(self.n)
        self.drums = np.zeros(self.n)
        self.duck = np.ones(self.n)

    def t(self, bar, beat=0.0):
        return int(round((bar * self.bpb + beat) * self.beat * SR))

    @staticmethod
    def _put(buf, start, sig, gain):
        if start < 0 or start >= len(buf):
            return
        end = min(len(buf), start + len(sig))
        buf[start:end] += gain * sig[: end - start]

    def add(self, start, sig, gain=1.0):
        self._put(self.music, start, sig, gain)

    def hit(self, start, sig, gain=1.0):
        self._put(self.drums, start, sig, gain)

    def pump(self, start, depth=0.6, tail=0.22):
        if start >= self.n:
            return
        end = min(self.n, start + int(tail * SR))
        self.duck[start:end] *= 1 - depth * np.exp(-tvec(end - start) * 9)

    def render(self, fx=None):
        music = fx(self.music) if fx else self.music
        return music * self.duck + self.drums


def melody(m, rng, voice, bars, scale, base, rhythm=(1.0, 0.5, 0.5, 1.0, 2.0), gain=0.1, rest_p=0.2):
    """Melodia por passeio aleatório (determinístico pela semente) sobre uma escala."""
    idx = len(scale) // 2
    for bar in bars:
        pos = 0.0
        while pos < m.bpb - 1e-6:
            dur = min(float(rng.choice(rhythm)), m.bpb - pos)
            if rng.random() > rest_p:
                idx = int(np.clip(idx + int(rng.choice([-2, -1, -1, 0, 1, 1, 2])), 0, len(scale) * 2 - 1))
                note = base + scale[idx % len(scale)] + 12 * (idx // len(scale))
                m.add(m.t(bar, pos), voice(hz(note), max(64, int(dur * m.beat * SR * 0.95))), gain)
            pos += dur


# ---------------------------------------------------------------------------
# Estilos
# ---------------------------------------------------------------------------

def style_synthwave(m, c, rng):
    key, prog, beat = c["key"], c["prog"], m.beat
    kick_s, snare_s, hat_s = kick(), snare(rng), hat(rng)
    arp = c.get("arp", [0, 1, 2, 3, 2, 1, 2, 3])
    n_pad = int((m.bar_len + 0.5) * SR)
    env_pad = adsr(n_pad, 0.3, 0.3, 0.65, 0.45)
    nb, na = int(beat * 0.46 * SR), int(beat * 0.23 * SR)
    env_b, env_a = adsr(nb, 0.004, 0.08, 0.55, 0.05), adsr(na, 0.003, 0.05, 0.4, 0.04)
    for bar in range(m.bars):
        off, q = prog[bar % len(prog)]
        root = key + off
        notes = chord_notes(root, q)
        for nt in notes:
            pad = osc(hz(nt), n_pad, "saw", 7, 10) + osc(hz(nt), n_pad, "saw", -7, 10)
            m.add(m.t(bar), lp(pad, 16) * env_pad, 0.045)
        for i in range(8):
            m.add(m.t(bar, i * 0.5), lp(osc(hz(fit(root, 33, 45)), nb, "saw", 0, 12), 6) * env_b, 0.20)
        for i in range(16):
            nt = notes[arp[i % len(arp)] % len(notes)] + 12 + (12 if i % 8 >= 4 else 0)
            m.add(m.t(bar, i * 0.25), osc(hz(nt), na, "square", 0, 10) * env_a, 0.055)
        for b in (0, 2):
            m.hit(m.t(bar, b), kick_s, 0.55)
            m.pump(m.t(bar, b), 0.35)
        if bar % 2:
            m.hit(m.t(bar, 3.5), kick_s, 0.4)
        for b in (1, 3):
            m.hit(m.t(bar, b), snare_s, 0.38)
        for i in range(8):
            m.hit(m.t(bar, i * 0.5), hat_s, 0.25 if i % 2 else 0.16)

    def lead(f, n):
        return lp(osc(f, n, "saw", 0, 12) + 0.6 * osc(f, n, "square", 9, 12), 3) * adsr(n, 0.01, 0.12, 0.7, 0.1)

    melody(m, rng, lead, range(m.bars // 2, m.bars), SCALES[c["scale"]], key + 24, gain=0.07)
    return m.render(lambda x: echo(x, beat * 0.75, 0.45, 3, 0.25))


def style_lofi(m, c, rng):
    key, prog, beat = c["key"], c["prog"], m.beat
    kick_s, snare_s, hat_s = kick(0.3, 48, 95), snare(rng, 0.14), hat(rng, 0.045, 90)
    sw = 0.12  # balanço nas colcheias
    n_ch = int(beat * 2.4 * SR)
    for bar in range(m.bars):
        off, q = prog[bar % len(prog)]
        root = key + off
        notes = chord_notes(root, q)
        for pos, g in ((0.0, 0.085), (1.5 + sw, 0.06)):
            for k, nt in enumerate(notes):
                m.add(m.t(bar, pos) + int(k * 0.012 * SR), epiano(hz(nt), n_ch, 2.2), g)
        for pos, ln in ((0.0, 1.2), (2.5 + sw, 1.0)):
            n = int(beat * ln * SR)
            m.add(m.t(bar, pos), osc(hz(fit(root, 33, 45)), n, "sine") * adsr(n, 0.01, 0.2, 0.6, 0.15), 0.28)
        m.hit(m.t(bar, 0), kick_s, 0.5)
        m.hit(m.t(bar, 2.5 + sw), kick_s, 0.4)
        for b in (1, 3):
            m.hit(m.t(bar, b), snare_s, 0.3)
        for i in range(8):
            m.hit(m.t(bar, i * 0.5 + (sw if i % 2 else 0)), hat_s, 0.18 if i % 2 else 0.12)
    melody(m, rng, lambda f, n: epiano(f, n, 3.0), range(2, m.bars), SCALES[c["scale"]], key + 12,
           rhythm=(1.0, 1.5, 0.5, 2.0), gain=0.10, rest_p=0.4)
    out = lp(m.render(lambda x: lp(echo(x, beat * 0.75, 0.5, 3, 0.3), 5)), 3)
    peak = np.max(np.abs(out))
    clicks = (rng.random(len(out)) > 0.9993) * rng.uniform(-1, 1, len(out)) * 0.06 * peak  # crepitar de vinil
    hiss = lp(rng.standard_normal(len(out)), 3) * 0.01 * peak
    return out + clicks + hiss


def style_jazz(m, c, rng):
    key, prog, beat = c["key"], c["prog"], m.beat
    sw = 0.17  # swing
    ride_s, hat_s = ride(rng), hat(rng, 0.05, 80)
    n_bass, n_comp = int(beat * 0.92 * SR), int(beat * 1.1 * SR)
    env_bass = adsr(n_bass, 0.006, 0.12, 0.65, 0.08)
    for bar in range(m.bars):
        off, q = prog[bar % len(prog)]
        root = key + off
        notes = chord_notes(root, q)
        nxt = key + prog[(bar + 1) % len(prog)][0]
        line = [root, notes[1], notes[2], nxt + (1 if nxt < root else -1)]  # baixo caminhante
        for b, nt in enumerate(line):
            low = fit(nt, 36, 50)
            sig = (osc(hz(low), n_bass, "tri", 0, 10) + 0.6 * pluck(hz(low), n_bass, 3.2, 0.5)) * env_bass
            m.add(m.t(bar, b), sig, 0.2)
        for pos in (0.5 + sw, 2.5 + sw):
            for k, nt in enumerate(notes):
                m.add(m.t(bar, pos) + int(k * 0.006 * SR), pluck(hz(nt + 12), n_comp, 3.4, 0.9), 0.055)
        for pos, g in ((0, .11), (1, .10), (1.5 + sw, .07), (2, .11), (3, .10), (3.5 + sw, .07)):
            m.hit(m.t(bar, pos), ride_s, g)
        for b in (1, 3):
            m.hit(m.t(bar, b), hat_s, 0.09)
    melody(m, rng, lambda f, n: pluck(f, n, 2.0, 0.8) * 1.4, range(2, m.bars), SCALES[c["scale"]], key + 12,
           rhythm=(1.0, 0.5, 0.5, 1.5, 2.0), gain=0.10, rest_p=0.3)
    return m.render(lambda x: room(x, 0.25))


def style_electronic(m, c, rng):
    key, prog, beat = c["key"], c["prog"], m.beat
    kick_s, clap_s = kick(0.26, 50, 140), clap(rng)
    hat_c, hat_o = hat(rng, 0.045, 90), hat(rng, 0.16, 28)
    bass_pat = c.get("bass", [1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 1, 0, 0])
    nb, ns = int(beat * 0.2 * SR), int(beat * 0.35 * SR)
    env_b, env_s = adsr(nb, 0.002, 0.08, 0.25, 0.03), adsr(ns, 0.004, 0.1, 0.3, 0.12)
    for bar in range(m.bars):
        off, q = prog[bar % len(prog)]
        root = key + off
        notes = chord_notes(root, q)
        for b in range(4):
            m.hit(m.t(bar, b), kick_s, 0.6)
            m.pump(m.t(bar, b), 0.7)
            m.hit(m.t(bar, b + 0.5), hat_o, 0.16)
        for b in (1, 3):
            m.hit(m.t(bar, b), clap_s, 0.35)
        for i in range(16):
            m.hit(m.t(bar, i * 0.25), hat_c, 0.07 if i % 2 else 0.1)
        if bar >= 1:
            for i, on in enumerate(bass_pat):
                if on:
                    m.add(m.t(bar, i * 0.25), lp(osc(hz(fit(root, 33, 45)), nb, "saw", 0, 14), 10) * env_b, 0.3)
        if bar >= 2:
            for pos in (0.5, 1.5, 2.75):
                for nt in notes:
                    stab = osc(hz(nt + 12), ns, "saw", 8, 10) + osc(hz(nt + 12), ns, "saw", -8, 10)
                    m.add(m.t(bar, pos), stab * env_s, 0.03)
    n = int(m.bar_len * SR)  # efeito "riser" no último compasso
    riser = np.diff(lp(rng.standard_normal(n), 3), prepend=0.0) * np.linspace(0, 1, n) ** 2.2
    m.add(m.t(m.bars - 1), riser, 0.35)
    melody(m, rng, lambda f, n_: lp(osc(f, n_, "square", 0, 10), 3) * adsr(n_, 0.005, 0.1, 0.5, 0.08),
           range(m.bars // 2, m.bars), SCALES[c["scale"]], key + 24, gain=0.05, rest_p=0.25)
    return m.render(lambda x: echo(x, beat * 0.75, 0.4, 3, 0.2))


def style_acoustic(m, c, rng):
    key, prog, beat = c["key"], c["prog"], m.beat
    shaker = hat(rng, 0.07, 45)
    strums = [(0, 'd', 1.0), (1, 'd', 0.7), (1.5, 'u', 0.8), (2.5, 'u', 0.8), (3, 'd', 0.8), (3.5, 'u', 0.7)]
    n_s, n_b = int(beat * 2.2 * SR), int(beat * 2.0 * SR)
    for bar in range(m.bars):
        off, q = prog[bar % len(prog)]
        root = key + off
        third = 3 if "min" in q else 4
        voicing = [root - 12, root - 5, root, root + third, root + 7, root + 12]
        for pos, direction, g in strums:
            order = voicing if direction == 'd' else voicing[::-1]
            for k, nt in enumerate(order):
                m.add(m.t(bar, pos) + int(k * 0.011 * SR), pluck(hz(nt), n_s, 2.8, 0.9), 0.07 * g)
        for pos, nt in ((0, root - 24), (2, root - 17)):
            m.add(m.t(bar, pos), pluck(hz(fit(nt, 33, 48)), n_b, 3.0, 0.5), 0.2)
        for i in range(8):
            m.hit(m.t(bar, i * 0.5), shaker, 0.07 if i % 2 else 0.04)
    melody(m, rng, lambda f, n: pluck(f, n, 2.2, 0.9), range(2, m.bars), SCALES[c["scale"]], key + 12,
           gain=0.09, rest_p=0.25)
    return m.render(lambda x: room(x, 0.22))


def style_classical(m, c, rng):
    key, prog, beat = c["key"], c["prog"], m.beat
    waltz = m.bpb == 3
    order = [0, 2, 1, 2, 0, 2, 1, 2]  # baixo de Alberti
    for bar in range(m.bars):
        off, q = prog[bar % len(prog)]
        root = key + off
        notes = chord_notes(root, q)[:3]
        if waltz:
            m.add(m.t(bar, 0), pluck(hz(root - 12), int(beat * 2.8 * SR), 2.0, 0.7), 0.16)
            for b in (1, 2):
                for k, nt in enumerate(notes):
                    m.add(m.t(bar, b) + int(k * 0.004 * SR), pluck(hz(nt), int(beat * 1.6 * SR), 3.2, 0.8), 0.06)
        else:
            for i, o in enumerate(order):
                nt = notes[o] - (12 if o == 0 else 0)
                m.add(m.t(bar, i * 0.5), pluck(hz(nt), int(beat * 1.2 * SR), 3.4, 0.8), 0.085)
    melody(m, rng, lambda f, n: pluck(f, n, 2.0, 0.7), range(1, m.bars), SCALES[c["scale"]], key + 12,
           rhythm=(1.0, 1.0, 2.0, 0.5, 0.5), gain=0.16, rest_p=0.1)
    return m.render(lambda x: room(x, 0.35))


def style_rock(m, c, rng):
    key, prog, beat = c["key"], c["prog"], m.beat
    kick_s, snare_s, hat_s, crash_s = kick(0.22, 55, 110), snare(rng, 0.2), hat(rng, 0.05, 80), crash(rng)
    nc, nl, nb = int(beat * 0.45 * SR), int(beat * 2.0 * SR), int(beat * 0.48 * SR)
    env_c, env_l, env_b = adsr(nc, 0.003, 0.05, 0.6, 0.04), adsr(nl, 0.003, 0.2, 0.5, 0.25), adsr(nb, 0.003, 0.07, 0.6, 0.05)

    def chug(f, n):  # guitarra distorcida: quinta + oitava
        return np.tanh(3.0 * (osc(f, n, "saw", 0, 14) + 0.8 * osc(f * 1.5, n, "saw", 0, 10) + 0.4 * osc(f * 2, n, "saw", 0, 8)))

    for bar in range(m.bars):
        off, q = prog[bar % len(prog)]
        root = key + off
        f = hz(root)
        for i in range(8):
            m.add(m.t(bar, i * 0.5), chug(f, nc) * env_c, 0.07)
            m.add(m.t(bar, i * 0.5), lp(osc(hz(fit(root, 33, 45)), nb, "saw", 0, 12), 6) * env_b, 0.17)
        m.add(m.t(bar, 0), chug(f, nl) * env_l, 0.05)
        for b in (0, 2):
            m.hit(m.t(bar, b), kick_s, 0.6)
        if bar % 2:
            m.hit(m.t(bar, 2.5), kick_s, 0.45)
        for b in (1, 3):
            m.hit(m.t(bar, b), snare_s, 0.45)
        for i in range(8):
            m.hit(m.t(bar, i * 0.5), hat_s, 0.22 if i % 2 else 0.3)
        if bar % 4 == 0:
            m.hit(m.t(bar, 0), crash_s, 0.4)
        if bar == m.bars - 1:  # virada de bateria
            for i in range(8):
                m.hit(m.t(bar, 2 + i * 0.25), snare_s, 0.3)
    melody(m, rng, lambda f, n: np.tanh(2.0 * osc(f, n, "saw", 0, 12)) * adsr(n, 0.01, 0.1, 0.7, 0.08),
           range(m.bars // 2, m.bars), SCALES[c["scale"]], key + 24, gain=0.05, rest_p=0.25)
    return m.render(lambda x: room(x, 0.12))


def style_ambient(m, c, rng):
    key, prog, beat = c["key"], c["prog"], m.beat
    n_pad = int((m.bar_len + 2.2) * SR)
    env = adsr(n_pad, 1.4, 0.5, 0.75, 1.8)
    for bar in range(m.bars):
        off, q = prog[bar % len(prog)]
        root = key + off
        for nt in chord_notes(root, q):
            sig = sum(osc(hz(nt), n_pad, "saw", d, 8) for d in (-9, 0, 9))
            m.add(m.t(bar), lp(sig, 40) * env, 0.03)
        m.add(m.t(bar), osc(hz(fit(root, 33, 45)), n_pad, "sine") * env, 0.12)
    for _ in range(7):  # sinos esparsos
        bar, pos = int(rng.integers(0, m.bars)), float(rng.choice([0, 1, 2, 3]))
        nt = key + 24 + int(rng.choice(SCALES[c["scale"]])) + 12 * int(rng.integers(0, 2))
        m.add(m.t(bar, pos), bell(hz(nt), int(2.5 * SR)), 0.07)
    wash = lp(rng.standard_normal(m.n), 120) * (0.6 + 0.4 * np.sin(2 * np.pi * 0.11 * tvec(m.n)))
    m.add(0, wash, 0.6)
    return m.render(lambda x: room(echo(x, beat * 1.5, 0.55, 4, 0.35), 0.3))


STYLES = {
    "synthwave": style_synthwave, "lofi": style_lofi, "jazz": style_jazz, "electronic": style_electronic,
    "acoustic": style_acoustic, "classical": style_classical, "rock": style_rock, "ambient": style_ambient,
}


def render_track(cfg):
    m = Mix(cfg["bpm"], cfg["bars"], beats_per_bar(cfg))
    rng = np.random.default_rng(cfg["seed"])
    out = finish(STYLES[cfg["style"]](m, cfg, rng))
    for fn in (osc, pluck, epiano):
        fn.cache_clear()
    return out


def encode_mp3(samples, path, meta):
    pcm = (np.clip(samples, -1, 1) * 32767).astype("<i2")
    with tempfile.TemporaryDirectory() as tmp:
        wav = Path(tmp) / "faixa.wav"
        with wave.open(str(wav), "wb") as w:
            w.setnchannels(1)
            w.setsampwidth(2)
            w.setframerate(SR)
            w.writeframes(pcm.tobytes())
        cmd = ["ffmpeg", "-y", "-loglevel", "error", "-i", str(wav), "-map_metadata", "-1",
               "-codec:a", "libmp3lame", "-q:a", "5", "-ac", "1"]
        for k, v in meta.items():
            cmd += ["-metadata", f"{k}={v}"]
        subprocess.run(cmd + [str(path)], check=True)


# ---------------------------------------------------------------------------
# Capas e imagens de artista (SVG)
# ---------------------------------------------------------------------------

def svg(body, c1, c2, defs=""):
    return (
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" width="600" height="600">'
        f'<defs><linearGradient id="bg" x1="0" y1="0" x2="0.4" y2="1"><stop offset="0" stop-color="{c1}"/>'
        f'<stop offset="1" stop-color="{c2}"/></linearGradient>{defs}</defs>'
        f'<rect width="600" height="600" fill="url(#bg)"/>{body}</svg>\n'
    )


def cover_svg(motif, c1, c2, seed):
    rng = np.random.default_rng(seed)
    if motif == "synthwave":
        defs = '<linearGradient id="sun" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffe45e"/><stop offset="1" stop-color="#ff3d9a"/></linearGradient>'
        body = '<circle cx="300" cy="300" r="150" fill="url(#sun)"/>'
        body += "".join(f'<rect x="130" y="{300 + i * 24}" width="340" height="{3 + i * 3}" fill="{c2}"/>' for i in range(6))
        body += f'<rect y="400" width="600" height="200" fill="{c2}"/>'
        body += "".join(f'<line x1="300" y1="400" x2="{x}" y2="600" stroke="#ff7ad9" stroke-opacity=".55" stroke-width="2"/>' for x in range(-400, 1000, 100))
        body += "".join(f'<line x1="0" y1="{y}" x2="600" y2="{y}" stroke="#ff7ad9" stroke-opacity=".55" stroke-width="2"/>' for y in (418, 442, 474, 516, 570))
        return svg(body, c1, c2, defs)
    if motif == "lofi":
        body = '<circle cx="450" cy="150" r="70" fill="#f7e7b4"/>' + f'<circle cx="480" cy="130" r="62" fill="{c1}"/>'
        body += "".join(
            f'<line x1="{x}" y1="{y}" x2="{x - 10}" y2="{y + 46}" stroke="#fff" stroke-opacity=".14" stroke-width="2"/>'
            for x, y in zip(rng.integers(0, 600, 46), rng.integers(0, 520, 46)))
        x = 0
        while x < 600:
            w, h = int(rng.integers(50, 95)), int(rng.integers(120, 300))
            body += f'<rect x="{x}" y="{600 - h}" width="{w}" height="{h}" fill="#0c0f1a"/>'
            for _ in range(int(rng.integers(1, 5))):
                body += f'<rect x="{x + int(rng.integers(8, max(9, w - 18)))}" y="{600 - h + int(rng.integers(10, h - 20))}" width="9" height="12" fill="#f7d774" fill-opacity=".85"/>'
            x += w + 6
        return svg(body, c1, c2)
    if motif == "jazz":
        body = "".join(f'<circle cx="430" cy="430" r="{r}" fill="none" stroke="#f2c14e" stroke-opacity="{0.55 - r / 900:.2f}" stroke-width="4"/>' for r in range(70, 480, 48))
        body += '<circle cx="430" cy="430" r="46" fill="#f2c14e"/>'
        body += "".join(f'<rect x="{40 + i * 26}" y="70" width="12" height="{60 + (i % 3) * 30}" rx="6" fill="#f2c14e" fill-opacity=".8"/>' for i in range(6))
        return svg(body, c1, c2)
    if motif == "electronic":
        body = "".join(f'<ellipse cx="300" cy="300" rx="250" ry="{ry}" transform="rotate({a} 300 300)" fill="none" stroke="#fff" stroke-opacity=".6" stroke-width="3"/>' for a, ry in ((-28, 92), (32, 120), (90, 70)))
        body += '<circle cx="300" cy="300" r="82" fill="#06122e"/><circle cx="276" cy="276" r="26" fill="#fff" fill-opacity=".25"/>'
        body += "".join(f'<circle cx="{x}" cy="{y}" r="{r}" fill="#fff" fill-opacity=".8"/>' for x, y, r in zip(rng.integers(20, 580, 24), rng.integers(20, 580, 24), rng.integers(1, 4, 24)))
        return svg(body, c1, c2)
    if motif == "acoustic":
        body = '<circle cx="420" cy="190" r="74" fill="#ffd27a"/>'
        body += f'<path d="M0 390 Q150 300 300 370 T600 340 V600 H0Z" fill="{c2}" fill-opacity=".55"/>'
        body += f'<path d="M0 450 Q170 370 330 440 T600 420 V600 H0Z" fill="{c2}" fill-opacity=".8"/>'
        body += f'<path d="M0 520 Q200 460 360 510 T600 500 V600 H0Z" fill="{c2}"/>'
        return svg(body, c1, c2)
    if motif == "classical":
        body = '<circle cx="300" cy="190" r="96" fill="#f3efe2" fill-opacity=".9"/>'
        body += "".join(f'<rect x="{i * 50 + 2}" y="360" width="46" height="240" rx="4" fill="#f3efe2"/>' for i in range(12))
        body += "".join(f'<rect x="{i * 50 + 34}" y="360" width="30" height="140" rx="3" fill="#111119"/>' for i in (0, 1, 3, 4, 5, 7, 8, 10))
        return svg(body, c1, c2)
    if motif == "rock":
        body = '<polygon points="0,380 600,170 600,290 0,500" fill="#0d0d12"/><polygon points="0,500 600,290 600,330 0,540" fill="#ffd23f"/>'
        body += '<polygon points="330,50 190,330 290,330 240,560 430,250 330,250" fill="#ffd23f" stroke="#0d0d12" stroke-width="10" stroke-linejoin="round"/>'
        return svg(body, c1, c2)
    # ambient
    defs = '<filter id="blur" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="46"/></filter>'
    body = "".join(f'<circle cx="{int(x)}" cy="{int(y)}" r="{int(r)}" fill="{col}" fill-opacity=".7" filter="url(#blur)"/>'
                   for x, y, r, col in zip(rng.integers(80, 520, 6), rng.integers(80, 520, 6), rng.integers(70, 160, 6),
                                           ["#9bf6d2", "#6c8cff", "#c8b6ff", "#4fc9a0", "#9bf6d2", "#a0c4ff"]))
    body += '<line x1="40" y1="470" x2="560" y2="470" stroke="#fff" stroke-opacity=".5" stroke-width="2"/>'
    return svg(body, c1, c2, defs)


def artist_svg(name, c1, c2):
    initials = "".join(w[0] for w in name.split()[:2]).upper()
    body = '<circle cx="300" cy="300" r="250" fill="none" stroke="#fff" stroke-opacity=".25" stroke-width="3"/>'
    body += (f'<text x="300" y="360" font-size="210" font-weight="800" text-anchor="middle" fill="#fff" fill-opacity=".92" '
             f'font-family="Segoe UI, Helvetica, Arial, sans-serif">{initials}</text>')
    return svg(body, c1, c2)


# ---------------------------------------------------------------------------
# Seed SQL
# ---------------------------------------------------------------------------

def q(text):
    return "'" + str(text).replace("\\", "\\\\").replace("'", "''") + "'"


def bool_sql(value):
    return "TRUE" if value else "FALSE"


def write_sql(path):
    artist_id = {a["slug"]: i for i, a in enumerate(ARTISTS, 1)}
    album_id = {a["slug"]: i for i, a in enumerate(ALBUMS, 1)}
    album_by_slug = {a["slug"]: a for a in ALBUMS}
    lines = [
        "-- Dados de demonstração (FICTÍCIOS) do Soundify.",
        "-- Gerado por tools/generate_demo_media.py: artistas, álbuns e faixas são inventados e os",
        "-- áudios (MP3) foram sintetizados de forma procedural, sem direitos autorais de terceiros.",
        "",
        "INSERT INTO artists (id, name, bio, image_url, featured, created_at) VALUES",
    ]
    rows = []
    for a in ARTISTS:
        rows.append(f"({artist_id[a['slug']]}, {q(a['name'])}, {q(a['bio'])}, {q('/media/artists/' + a['slug'] + '.svg')}, "
                    f"{bool_sql(a['featured'])}, DATE_SUB(UTC_TIMESTAMP(6), INTERVAL 40 DAY))")
    lines += [",\n".join(rows) + ";", "", "INSERT INTO albums (id, title, artist_id, cover_url, release_year, featured, created_at) VALUES"]
    rows = []
    for a in ALBUMS:
        rows.append(f"({album_id[a['slug']]}, {q(a['title'])}, {artist_id[a['artist']]}, {q('/media/covers/' + a['slug'] + '.svg')}, "
                    f"{a['year']}, {bool_sql(a['featured'])}, DATE_SUB(UTC_TIMESTAMP(6), INTERVAL {a['days_ago']} DAY))")
    lines += [",\n".join(rows) + ";", "",
              "INSERT INTO tracks (id, title, artist_id, album_id, track_number, duration_seconds, genre, cover_url, audio_url, created_at) VALUES"]
    rows = []
    for i, t in enumerate(TRACKS, 1):
        alb = album_by_slug[t["album"]]
        hours = alb["days_ago"] * 24 + (4 - t["n"])
        rows.append(f"({i}, {q(t['title'])}, {artist_id[alb['artist']]}, {album_id[alb['slug']]}, {t['n']}, {track_duration(t)}, "
                    f"{q(t['genre'])}, {q('/media/covers/' + alb['slug'] + '.svg')}, {q('/media/audio/' + t['slug'] + '.mp3')}, "
                    f"DATE_SUB(UTC_TIMESTAMP(6), INTERVAL {hours} HOUR))")
    lines += [",\n".join(rows) + ";", ""]
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text("\n".join(lines), encoding="utf-8")


# ---------------------------------------------------------------------------

def main():
    parser = argparse.ArgumentParser(description="Gera mídia de demonstração do Soundify.")
    parser.add_argument("--out", type=Path, default=DEFAULT_OUT, help="pasta base de saída (padrão: static/media do backend)")
    parser.add_argument("--sql", type=Path, help="gera também o script SQL de carga inicial neste caminho")
    parser.add_argument("--skip-audio", action="store_true", help="não regera os MP3 (útil para ajustar só capas/SQL)")
    args = parser.parse_args()

    if not args.skip_audio and shutil.which("ffmpeg") is None:
        sys.exit("ffmpeg não encontrado no PATH (necessário para codificar MP3).")

    for sub in ("audio", "covers", "artists"):
        (args.out / sub).mkdir(parents=True, exist_ok=True)

    for i, a in enumerate(ALBUMS):
        (args.out / "covers" / f"{a['slug']}.svg").write_text(cover_svg(a["motif"], *a["colors"], seed=100 + i), encoding="utf-8")
    for a in ARTISTS:
        (args.out / "artists" / f"{a['slug']}.svg").write_text(artist_svg(a["name"], *a["colors"]), encoding="utf-8")
    print(f"capas e imagens de artista: {len(ALBUMS)} + {len(ARTISTS)}")

    if not args.skip_audio:
        album_by_slug = {a["slug"]: a for a in ALBUMS}
        artist_by_slug = {a["slug"]: a for a in ARTISTS}
        for t in TRACKS:
            alb = album_by_slug[t["album"]]
            samples = render_track(t)
            assert len(samples) == track_duration(t) * SR
            target = args.out / "audio" / f"{t['slug']}.mp3"
            encode_mp3(samples, target, {"title": t["title"], "artist": artist_by_slug[alb["artist"]]["name"],
                                         "album": alb["title"], "genre": t["genre"], "track": t["n"],
                                         "comment": "Faixa de demonstração sintetizada (Soundify)"})
            print(f"{t['slug']:<20} {track_duration(t):>3}s  {target.stat().st_size / 1024:6.0f} KB")

    if args.sql:
        write_sql(args.sql)
        print(f"seed SQL: {args.sql}")


if __name__ == "__main__":
    main()
