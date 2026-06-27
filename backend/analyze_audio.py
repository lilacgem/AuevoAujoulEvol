import librosa
import numpy as np
import json

filename = "nameofthegame.m4a"
print(f"Loading {filename}...")

y, sr = librosa.load(filename)
tempo, beat_frames = librosa.beat.beat_track(y=y, sr=sr)
beat_times = librosa.frames_to_time(beat_frames, sr=sr)

# This is the new part that saves the data!
data = {
    "tempo": float(tempo),
    "beats": beat_times.tolist(),
}

with open('audio_data.json', 'w') as f:
    json.dump(data, f)

print(f"DONE! Saved {len(beat_times)} beats to audio_data.json")