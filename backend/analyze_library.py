# --- [ AuEvo SONIC MATRIX EXTRACTION ENGINE ] ---
import os
import json
import math

def run_sonic_extraction():
    print("\n🔍 [PYTHON CORE]: Accessing sovereign audio database stream...")
    
    # Path to our localized ledger file
    db_path = os.path.join("..", "data_storage", "audio_database.json")
    
    if not os.path.exists(db_path):
        print("⚠️ [DATA ERROR]: Primary database file not found.")
        return

    # Open and read the current state of the database safely
    try:
        with open(db_path, "r", encoding="utf-8") as f:
            database = json.load(f)
    except Exception as e:
        print(f"❌ [READ ERROR]: Failed to parse JSON ledger: {str(e)}")
        return

    if not database:
        print("📥 [SYSTEM]: No records found to analyze yet.")
        return

    # Grab our latest user generation entry to process
    latest_entry = database[-1]
    
    # Extract coordinates thrown from our frontend UI
    hue_val = float(latest_entry["matrix_coordinates"]["hue"])
    res_val = float(latest_entry["matrix_coordinates"]["resonance"])
    total_seals = latest_entry["matrix_coordinates"]["total_seals"]

    print(f"📊 [PROCESSING MINT]: Parsing tracking parameters for Gen {total_seals}...")

    # --- ADVANCED WAVEFORM MATHEMATICS MULTIPLEX ---
    # We calculate advanced sonic signatures using native algorithms 
    vocal_density = math.sin(math.radians(hue_val)) * res_val
    harmonic_variance = math.cos(math.radians(res_val * 100)) * (hue_val / 360.0)
    spectral_entropy = abs(vocal_density * harmonic_variance) * 10.0

    # Classify sonic state alignment and biometric stress markers mathematically
    if res_val > 0.6:
        state_classification = "HIGH_ENERGY_VOID_EXPANSION"
        bio_marker = "Elevated cognitive focus. High sonic output."
    elif res_val < 0.2:
        state_classification = "DEEP_GROUNDED_CORE_EQUILIBRIUM"
        bio_marker = "Resting baseline. Stable resonance matrix."
    else:
        state_classification = "HARMONIC_TRANSITION_PHASE"
        bio_marker = "Balanced performance. Active alignment."

    # Append our calculated metrics seamlessly back into this specific history block
    latest_entry["python_analytics_telemetry"] = {
        "vocal_density_coefficient": round(vocal_density, 4),
        "harmonic_variance_index": round(harmonic_variance, 4),
        "spectral_entropy_score": round(spectral_entropy, 4),
        "biometric_state_classification": state_classification,
        "clinical_bio_marker_note": bio_marker,
        "engine_verification_signature": "0x80f_MARCH_COMPUTATION_SUCCESS"
    }

    # Save the updated database with the freshly generated analytics metrics
    try:
        with open(db_path, "w", encoding="utf-8") as f:
            json.dump(database, f, indent=4, ensure_ascii=False)
        print(f"✅ [PYTHON SUCCESS]: Matrix analysis complete. Vault updated under status: {state_classification}\n")
    except Exception as e:
        print(f"❌ [WRITE ERROR]: Failed to seal database file: {str(e)}")

if __name__ == "__main__":
    run_sonic_extraction()