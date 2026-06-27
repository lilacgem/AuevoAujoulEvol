import librosa
import json
import os
import datetime
import numpy as np

# --- [ LLC IDENTITY ] ---
LLC_NAME = "AuEvoAujouleVol LLC"
OWNER_ADDRESS = "0x80f"
FILES = ["nameofthegame.mp4", "aujoulevol.mp4"] 
OUTPUT = "audio_database.json"

print(f"--- [ {LLC_NAME}: INITIALIZING SCAN ] ---")

results = []

for file in FILES:
    if os.path.exists(file):
        print(f"Extracting DNA from: {file}...")
        try:
            # 1. Load the High-Fidelity WAV
            y, sr = librosa.load(file)
            
            # 2. Extract the Heartbeat (BPM) - Adjusted for Librosa 0.10+
            onset_env = librosa.onset.onset_strength(y=y, sr=sr)
            tempo = librosa.beat.tempo(onset_envelope=onset_env, sr=sr)
            
            # Convert the array to a single float number
            final_bpm = float(tempo[0]) if isinstance(tempo, (np.ndarray, list)) else float(tempo)
            
            # 3. Extract Energy (RMS) for the Visualizer
            rms = librosa.feature.rms(y=y)
            avg_energy = float(np.mean(rms))

            # 4. Package for the Website
            results.append({
                "source": file,
                "bpm": round(final_bpm, 2),
                "energy": round(avg_energy, 4),
                "timestamp": datetime.datetime.now().isoformat(),
                "identity_check": OWNER_ADDRESS,
                "status": "VERIFIED_ASSET"
            })
            print(f"DONE: {file} analyzed at {round(final_bpm, 2)} BPM.")
            
        except Exception as e:
            print(f"Detailed Error on {file}: {e}")
    else:
        print(f"ERROR: {file} is missing from the folder.")

# Save the unified database
with open(OUTPUT, 'w') as f:
    json.dump(results, f, indent=4)

print(f"--- [ SUCCESS: {OUTPUT} SEALED ] ---")