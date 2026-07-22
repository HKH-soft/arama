import wave
import math
import struct
import random

def generate_noise(duration, sample_rate, noise_type='white'):
    samples = []
    for _ in range(int(duration * sample_rate)):
        samples.append(random.uniform(-1.0, 1.0))
    if noise_type == 'brown':
        last = 0.0
        for i in range(len(samples)):
            last = (last + (0.02 * samples[i])) / 1.02
            samples[i] = last * 3.5
    elif noise_type == 'pink':
        last = 0.0
        for i in range(len(samples)):
            last = last * 0.9 + samples[i] * 0.1
            samples[i] = last * 2.0
    return samples

def save_wav(filename, samples, sample_rate=44100):
    with wave.open(filename, 'w') as f:
        f.setnchannels(1)
        f.setsampwidth(2)
        f.setframerate(sample_rate)
        max_val = max(0.01, max([abs(s) for s in samples]))
        data = [int((s / max_val) * 32767) for s in samples]
        f.writeframes(struct.pack('<' + 'h' * len(data), *data))

SR = 44100

forest = generate_noise(8, SR, 'brown')
for _ in range(5):
    t_start = random.uniform(0, 4)
    freq = random.uniform(2000, 4000)
    for i in range(int(0.2 * SR)):
        idx = int(t_start * SR) + i
        if idx < len(forest):
            forest[idx] += math.sin(i * freq * 2 * math.pi / SR) * 0.1 * math.exp(-i/(SR*0.05))
save_wav('public/audio/forest-ambience.wav', forest)

bell = []
for i in range(int(10 * SR)):
    t = i / SR
    env = math.exp(-t * 0.5)
    s = math.sin(t * 400 * 2 * math.pi) * env
    s += math.sin(t * 800 * 2 * math.pi) * env * 0.3
    bell.append(s)
save_wav('public/audio/bell-vibrant.wav', bell)

ocean = generate_noise(15, SR, 'pink')
for i in range(len(ocean)):
    t = i / SR
    mod = (math.sin(t * 0.15 * 2 * math.pi) + 1.0) / 2.0
    ocean[i] *= (mod + 0.2)
save_wav('public/audio/ocean-calm.wav', ocean)

breath = generate_noise(12, SR, 'pink')
for i in range(len(breath)):
    t = i / SR
    mod = math.sin(t * 0.1 * 2 * math.pi)
    breath[i] *= max(0, mod) * 0.5
save_wav('public/audio/breath-guide.wav', breath)

night = generate_noise(8, SR, 'brown')
save_wav('public/audio/night-safe.wav', night)

step = []
for i in range(int(4 * SR)):
    t = i / SR
    env = math.exp(-t * 3.0)
    s = math.sin(t * 800 * 2 * math.pi) * env
    step.append(s)
save_wav('public/audio/step-pause.wav', step)
print("Audio generated successfully!")
