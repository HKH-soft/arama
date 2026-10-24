import wave
import math
import struct
import random

SR = 44100

def save_wav(filename, samples, sample_rate=SR):
    with wave.open(filename, 'w') as f:
        f.setnchannels(1)
        f.setsampwidth(2)
        f.setframerate(sample_rate)
        max_val = max(0.001, max(abs(s) for s in samples))
        data = [int((s / max_val) * 31500) for s in samples]
        f.writeframes(struct.pack('<' + 'h' * len(data), *data))
    print(f"Generated: {filename} ({len(samples)/sample_rate:.1f}s)")

# 1. Deep Sleep 432Hz Drone with Delta Binaural (18s seamless loop)
def gen_deep_sleep_432hz():
    duration = 18.0
    n = int(duration * SR)
    samples = [0.0] * n
    f0 = 432.0 / 4.0 # 108 Hz warm fundamental
    delta_beat = 2.5 # Delta wave pulse (deep sleep)
    for i in range(n):
        t = i / SR
        # Fundamental warm bass
        w1 = math.sin(2 * math.pi * f0 * t)
        # 432 Hz gentle harmonic
        w2 = math.sin(2 * math.pi * 432.0 * t) * 0.25
        # 216 Hz sub-harmonic
        w3 = math.sin(2 * math.pi * 216.0 * t) * 0.45
        # Delta modulation
        mod = (math.sin(2 * math.pi * delta_beat * t) + 1.2) / 2.2
        # Soft shimmer
        shimmer = math.sin(2 * math.pi * 0.1 * t) * 0.15
        s = (w1 * 0.6 + w2 + w3) * mod * (1.0 + shimmer)
        samples[i] = s
    return samples

# 2. Rain on Window (20s continuous gentle rain with soft drops)
def gen_rain_window():
    duration = 20.0
    n = int(duration * SR)
    # Pink noise base
    pink = [0.0] * n
    b0, b1, b2, b3, b4, b5, b6 = 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0
    for i in range(n):
        white = random.uniform(-1.0, 1.0)
        b0 = 0.99886 * b0 + white * 0.0555179
        b1 = 0.99332 * b1 + white * 0.0750759
        b2 = 0.96900 * b2 + white * 0.1538520
        b3 = 0.86650 * b3 + white * 0.3104856
        b4 = 0.55000 * b4 + white * 0.5329522
        b5 = -0.7616 * b5 - white * 0.0168980
        pink[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.08
        b6 = white * 0.115926
    
    # Soft raindrop taps on glass
    num_drops = int(duration * 28)
    for _ in range(num_drops):
        start = random.randint(0, n - int(0.08 * SR))
        drop_freq = random.uniform(800, 1600)
        drop_len = int(random.uniform(0.015, 0.05) * SR)
        for j in range(drop_len):
            t = j / SR
            env = math.exp(-t * 80.0)
            pink[start + j] += math.sin(2 * math.pi * drop_freq * t) * env * random.uniform(0.05, 0.15)
    return pink

# 3. Fireplace in Cabin (16s crackling wood fire)
def gen_fireplace_cabin():
    duration = 16.0
    n = int(duration * SR)
    # Brown noise rumble for warm embers
    brown = [0.0] * n
    last = 0.0
    for i in range(n):
        white = random.uniform(-1.0, 1.0)
        last = (last + (0.018 * white)) / 1.018
        brown[i] = last * 2.8
    
    # Wood pops and snaps
    num_cracks = int(duration * 6)
    for _ in range(num_cracks):
        start = random.randint(0, n - int(0.1 * SR))
        freq = random.uniform(1200, 3200)
        dur = int(random.uniform(0.005, 0.04) * SR)
        for j in range(dur):
            t = j / SR
            env = math.exp(-t * 120.0)
            brown[start + j] += math.sin(2 * math.pi * freq * t) * env * random.uniform(0.3, 0.8)
    return brown

# 4. Deep Ocean Waves (20s rhythmic swell and retreat)
def gen_ocean_waves_deep():
    duration = 20.0
    n = int(duration * SR)
    samples = [0.0] * n
    # Pink noise base
    b0, b1, b2 = 0.0, 0.0, 0.0
    for i in range(n):
        white = random.uniform(-1.0, 1.0)
        b0 = 0.997 * b0 + white * 0.05
        b1 = 0.985 * b1 + white * 0.1
        b2 = 0.950 * b2 + white * 0.2
        samples[i] = (b0 + b1 + b2) * 0.12
    
    # 2 ocean swell cycles over 20s
    for i in range(n):
        t = i / SR
        # wave rhythm (period ~ 10 seconds)
        wave_cycle = (math.sin(2 * math.pi * (1.0 / 10.0) * t - math.pi / 2) + 1.0) / 2.0
        # low pass filter envelope
        samples[i] *= (0.2 + 0.8 * (wave_cycle ** 1.8))
        # Add deep low-frequency rumble
        samples[i] += math.sin(2 * math.pi * 55.0 * t) * 0.04 * wave_cycle
    return samples

# 5. Forest Birds & Stream (18s water babble and occasional bird chirps)
def gen_forest_stream():
    duration = 18.0
    n = int(duration * SR)
    # Stream water: white noise bandpassed/modulated
    samples = [0.0] * n
    last = 0.0
    for i in range(n):
        white = random.uniform(-1.0, 1.0)
        last = (last + (0.04 * white)) / 1.04
        t = i / SR
        water_mod = 1.0 + 0.2 * math.sin(2 * math.pi * 0.8 * t) + 0.15 * math.sin(2 * math.pi * 1.7 * t)
        samples[i] = last * 1.5 * water_mod
    
    # Soft bird chirps at gentle intervals
    chirp_times = [2.2, 5.8, 9.5, 13.1, 15.6]
    for ct in chirp_times:
        start = int(ct * SR)
        base_f = random.uniform(2400, 3200)
        length = int(0.25 * SR)
        for j in range(length):
            if start + j >= n: break
            t = j / SR
            f = base_f + 600 * math.sin(2 * math.pi * 12 * t)
            env = math.sin(math.pi * (j / length))
            samples[start + j] += math.sin(2 * math.pi * f * t) * env * 0.12
    return samples

# 6. Tibetan Singing Bowl 528Hz (16s resonant chime with singing overtones)
def gen_tibetan_bowl():
    duration = 16.0
    n = int(duration * SR)
    samples = [0.0] * n
    f1 = 528.0 # Solfeggio 528 Hz (Miracle tone / transformation)
    f2 = 528.0 * 2.76 # overtone
    f3 = 528.0 * 5.4 # shimmering high harmonic
    for i in range(n):
        t = i / SR
        # strike attack & slow acoustic decay
        strike = math.exp(-t * 1.2) * 0.35
        body = math.exp(-t * 0.14) # long ringing sustain
        # gentle beating frequency (singing bowl modulation)
        beat = (math.sin(2 * math.pi * 1.8 * t) + 1.0) / 2.0
        s = math.sin(2 * math.pi * f1 * t) * (body * 0.7 + strike)
        s += math.sin(2 * math.pi * (f1 + 1.8) * t) * body * 0.35 * beat
        s += math.sin(2 * math.pi * f2 * t) * math.exp(-t * 0.25) * 0.2
        s += math.sin(2 * math.pi * f3 * t) * math.exp(-t * 0.5) * 0.08
        samples[i] = s
    return samples

# 7. Body Scan Zen Pad (16s soothing harmonic chord)
def gen_body_scan_zen():
    duration = 16.0
    n = int(duration * SR)
    samples = [0.0] * n
    # Major triad warm chord: D3 (146.83 Hz), F#3 (185.0 Hz), A3 (220.0 Hz)
    freqs = [146.83, 185.0, 220.0, 293.66]
    for i in range(n):
        t = i / SR
        # Gentle swell and breathe envelope
        env = (math.sin(2 * math.pi * (1.0 / 8.0) * t - math.pi / 2) + 1.0) / 2.0
        val = 0.0
        for fi, f in enumerate(freqs):
            val += math.sin(2 * math.pi * f * t + fi * 0.5) * (0.35 / (fi + 1))
        # Warm sub bass
        val += math.sin(2 * math.pi * 73.41 * t) * 0.4
        samples[i] = val * (0.6 + 0.4 * env)
    return samples

# 8. Box Breathing Guide (16s 4-4-4-4 rhythm)
def gen_box_breathing():
    duration = 16.0 # 4s inhale, 4s hold, 4s exhale, 4s hold
    n = int(duration * SR)
    samples = [0.0] * n
    for i in range(n):
        t = i / SR
        phase = t % 16.0
        if phase < 4.0:
            # Inhale: rising pitch 220 -> 330 Hz
            p = phase / 4.0
            f = 220.0 + p * 110.0
            amp = 0.2 + p * 0.5
        elif phase < 8.0:
            # Hold: steady 330 Hz gentle vibration
            p = (phase - 4.0) / 4.0
            f = 330.0
            amp = 0.7 - p * 0.1
        elif phase < 12.0:
            # Exhale: falling pitch 330 -> 220 Hz
            p = (phase - 8.0) / 4.0
            f = 330.0 - p * 110.0
            amp = 0.6 - p * 0.4
        else:
            # Hold empty: very calm 220 Hz whisper
            f = 220.0
            amp = 0.2
        s = math.sin(2 * math.pi * f * t) * amp
        # Soft chime at 0s, 4s, 8s, 12s transitions
        cycle_t = phase % 4.0
        if cycle_t < 0.8:
            chime = math.sin(2 * math.pi * 880.0 * cycle_t) * math.exp(-cycle_t * 6.0) * 0.25
            s += chime
        samples[i] = s
    return samples

# 9. Hypnotic Night Train (16s soothing rhythmic railway track)
def gen_night_train():
    duration = 16.0
    n = int(duration * SR)
    samples = [0.0] * n
    # Brown noise rumble base
    last = 0.0
    for i in range(n):
        white = random.uniform(-1.0, 1.0)
        last = (last + (0.015 * white)) / 1.015
        samples[i] = last * 2.2
    
    # "Da-dak, da-dak" train rhythm every 1.2 seconds
    beat_interval = 1.2
    num_beats = int(duration / beat_interval)
    for b in range(num_beats):
        t0 = b * beat_interval
        # First click
        idx1 = int(t0 * SR)
        # Second click 0.18s later
        idx2 = int((t0 + 0.18) * SR)
        for offset in (idx1, idx2):
            length = int(0.06 * SR)
            for j in range(length):
                if offset + j >= n: break
                t = j / SR
                click = math.sin(2 * math.pi * 320.0 * t) * math.exp(-t * 50.0) * 0.4
                samples[offset + j] += click
    return samples

# 10. Brown Noise Focus (16s filtered warm deep brown noise)
def gen_brown_noise_focus():
    duration = 16.0
    n = int(duration * SR)
    samples = [0.0] * n
    last = 0.0
    for i in range(n):
        white = random.uniform(-1.0, 1.0)
        last = (last + (0.012 * white)) / 1.012
        # Very gentle slow modulation
        t = i / SR
        mod = 1.0 + 0.05 * math.sin(2 * math.pi * 0.15 * t)
        samples[i] = last * 3.8 * mod
    return samples

# 11. Morning Sun 10Hz Alpha (16s gentle acoustic awakening)
def gen_morning_sun_alpha():
    duration = 16.0
    n = int(duration * SR)
    samples = [0.0] * n
    f_carrier = 320.0
    alpha_freq = 10.0 # 10Hz alpha brainwave for relaxed alertness
    for i in range(n):
        t = i / SR
        # 10Hz alpha amplitude modulation
        alpha_mod = (math.sin(2 * math.pi * alpha_freq * t) + 1.0) / 2.0
        # Warm golden chord
        s1 = math.sin(2 * math.pi * f_carrier * t) * 0.4
        s2 = math.sin(2 * math.pi * (f_carrier * 1.25) * t) * 0.3 # major third
        s3 = math.sin(2 * math.pi * (f_carrier * 1.5) * t) * 0.3 # fifth
        samples[i] = (s1 + s2 + s3) * (0.6 + 0.4 * alpha_mod)
    return samples

# 12. Jacobson Progressive Muscle Relaxation (16s calming acoustic flow)
def gen_jacobson():
    duration = 16.0
    n = int(duration * SR)
    samples = [0.0] * n
    for i in range(n):
        t = i / SR
        # Calm cyclical flow
        env = (math.sin(2 * math.pi * (1.0 / 12.0) * t) + 1.0) / 2.0
        # Soft low tone (G2: 98Hz)
        s = math.sin(2 * math.pi * 98.0 * t) * 0.5
        # Soft warm harmonic (D3: 147Hz)
        s += math.sin(2 * math.pi * 147.0 * t) * 0.35
        # Breath-like pink noise undercurrent
        white = random.uniform(-0.1, 0.1)
        samples[i] = (s * (0.7 + 0.3 * env)) + white * 0.05
    return samples

def main():
    tracks = [
        ('public/audio/deep-sleep-432hz.wav', gen_deep_sleep_432hz),
        ('public/audio/rain-window.wav', gen_rain_window),
        ('public/audio/fireplace-cabin.wav', gen_fireplace_cabin),
        ('public/audio/ocean-waves-deep.wav', gen_ocean_waves_deep),
        ('public/audio/forest-birds-stream.wav', gen_forest_stream),
        ('public/audio/tibetan-singing-bowl.wav', gen_tibetan_bowl),
        ('public/audio/body-scan-zen.wav', gen_body_scan_zen),
        ('public/audio/box-breathing-guide.wav', gen_box_breathing),
        ('public/audio/night-train.wav', gen_night_train),
        ('public/audio/brown-noise-focus.wav', gen_brown_noise_focus),
        ('public/audio/morning-sun-alpha.wav', gen_morning_sun_alpha),
        ('public/audio/jacobson-relaxation.wav', gen_jacobson),
    ]
    for path, func in tracks:
        samples = func()
        save_wav(path, samples)
    print("All 12 rich meditation audio files generated successfully!")

if __name__ == '__main__':
    main()
