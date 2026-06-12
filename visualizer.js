/**
 * @file visualizer.js
 * @description AuEvo JoulEvol - Advanced Atmospheric WebGL Engine
 */

console.log('⚡ [AUJOULE] Initializing Atmospheric 3D Mobile Core...');

// --- 1. VIEWPORT & CORE ARCHITECTURE ---
const scene = new THREE.Scene();

// Inject Deep Cosmic Void Space Fluid Fog Calculations
scene.fog = new THREE.FogExp2(0x000002, 0.015);

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000.0);
camera.position.set(0.0, 0.0, 55.0);

const renderer = new THREE.WebGLRenderer({
    canvas: document.querySelector('#bg'),
    alpha: false,
    preserveDrawingBuffer: true,
    antialias: true
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2.0));
renderer.setClearColor(0x000002, 1.0);

// Telemetry Logic Vectors
let touchVector = { x: 0.0, y: 0.0 };
let lastTouchVector = { x: 0.0, y: 0.0 };
let touchVelocity = 0.0;
let targetVelocity = 0.0;
let isInteracting = false;
let pulseInteraction = 0.0;
let dynamicFactor = 0.18;
let colorAccumulator = 0.5;

// --- 2. ADVANCED INTERACTIVE VECTOR TRACKER ---
function handleInteractionMove(clientX, clientY) {
    lastTouchVector.x = touchVector.x;
    lastTouchVector.y = touchVector.y;

    touchVector.x = (clientX / window.innerWidth) * 2.0 - 1.0;
    touchVector.y = -(clientY / window.innerHeight) * 2.0 + 1.0;

    const dx = touchVector.x - lastTouchVector.x;
    const dy = touchVector.y - lastTouchVector.y;
    targetVelocity = Math.min(Math.sqrt(dx * dx + dy * dy) * 12.0, 3.5);

    isInteracting = true;
}

window.addEventListener('mousemove', (e) => handleInteractionMove(e.clientX, e.clientY));
window.addEventListener('touchmove', (e) => {
    if (e.touches.length > 0) handleInteractionMove(e.touches[0].clientX, e.touches[0].clientY);
}, { passive: true });

window.addEventListener('touchstart', (e) => {
    pulseInteraction = 2.0; 
    if (e.touches.length > 0) handleInteractionMove(e.touches[0].clientX, e.touches[0].clientY);
}, { passive: true });

window.addEventListener('touchend', () => { isInteracting = false; targetVelocity = 0.0; });

// --- 3. DYNAMIC PARALLAX STARFIELD ---
const starGeometry = new THREE.BufferGeometry();
const starCount = 1400;
const positions = new Float32Array(starCount * 3);

for (let i = 0; i < starCount * 3; i += 3) {
    positions[i] = (Math.random() - 0.5) * 400.0;
    positions[i + 1] = (Math.random() - 0.5) * 400.0;
    positions[i + 2] = (Math.random() - 0.5) * 300.0;
}
starGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
const starMaterial = new THREE.PointsMaterial({ color: 0xffffff, size: 0.5, transparent: true, opacity: 0.4 });
const starfield = new THREE.Points(starGeometry, starMaterial);
scene.add(starfield);

// --- 4. GEOMETRY INFRASTRUCTURE ARCHITECTURE ---
// High density 48x48 mesh enables smooth, magical fluid wave deforming
const geometry = new THREE.SphereGeometry(14.0, 48, 48);

// Retain a backup copy of original base vertex coordinates for relative calculations
const baseVertices = geometry.attributes.position.clone();

const mirrorMaterial = new THREE.MeshBasicMaterial({
    color: 0xffaa00,
    transparent: true,
    opacity: 0.75,
    wireframe: true,
    side: THREE.DoubleSide
});
const mirrorSphere = new THREE.Mesh(geometry, mirrorMaterial);
mirrorSphere.position.set(0.0, 0.0, 0.0); // Centered to match the clean layout grid look
scene.add(mirrorSphere);

// --- 5. AUDIO SYNC PERMISSION HANDSHAKE ---
let audioContext, analyser, dataArray;
const micButton = document.getElementById('micButton');
const micStatusEl = document.getElementById('micStatus');
const awarenessDisplayEl = document.getElementById('awarenessDisplay');
const stateDisplayEl = document.getElementById('stateDisplay');

let micStream = null;

if (micButton) {
    micButton.addEventListener('click', async () => {
        try {
            if (!audioContext) {
                const AudioContextClass = window.AudioContext || window.webkitAudioContext;
                audioContext = new AudioContextClass();
            }
            if (audioContext.state === 'suspended') await audioContext.resume();

            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                if (micStatusEl) { micStatusEl.innerText = "UNAVAILABLE"; micStatusEl.style.color = "#ff5e00"; }
                return;
            }

            micStream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true,
                    channelCount: 1
                },
                video: false
            });

            if (micStatusEl) { micStatusEl.innerText = "CONNECTED"; micStatusEl.style.color = "#00ffaa"; }
            if (awarenessDisplayEl) awarenessDisplayEl.innerText = "INTEGRATED";
            if (stateDisplayEl) stateDisplayEl.innerText = "ACTIVE";

            micButton.innerText = "MIRROR ACTIVE";
            micButton.style.borderColor = "#00ffaa";
            micButton.style.color = "#00ffaa";

            if (document.getElementById('recordButton')) {
                document.getElementById('recordButton').disabled = false;
            }

            const source = audioContext.createMediaStreamSource(micStream);
            analyser = audioContext.createAnalyser();
            analyser.fftSize = 256;
            analyser.smoothingTimeConstant = 0.85;
            dataArray = new Uint8Array(analyser.frequencyBinCount);
            source.connect(analyser);
        } catch (err) {
            if (micStatusEl) { micStatusEl.innerText = "BLOCKED"; micStatusEl.style.color = "#ff5e00"; }
            if (awarenessDisplayEl) awarenessDisplayEl.innerText = "PERMISSION";
            if (stateDisplayEl) stateDisplayEl.innerText = "WAITING";
            console.warn('Mic activation failed:', err);
        }
    });
}

function processVocalTelemetry() {
    let totalVolume = 0.0;
    let normalizedVol = 0.0;

    if (analyser && dataArray) {
        analyser.getByteFrequencyData(dataArray);
        for (let i = 0; i < dataArray.length; i++) { totalVolume += dataArray[i]; }
        normalizedVol = totalVolume / (dataArray.length * 255.0);
        dynamicFactor = THREE.MathUtils.lerp(dynamicFactor, normalizedVol * 6.0 + 0.15, 0.2);
    } else {
        dynamicFactor = THREE.MathUtils.lerp(dynamicFactor, 0.18, 0.05);
    }

    colorAccumulator = (colorAccumulator + 0.0015 + (normalizedVol * 0.01) + (touchVelocity * 0.004)) % 1.0;
    mirrorMaterial.color.setHSL(colorAccumulator, 0.95, 0.55);
    mirrorMaterial.opacity = isInteracting ? 0.85 : 0.65 + (normalizedVol * 0.3);

    const spectralOrb = document.getElementById('spectralOrb');
    const pulsePercent = Math.min(100, Math.round((normalizedVol + touchVelocity * 0.25) * 100));

    if (spectralOrb) {
        let glowColor = 'rgba(57,255,20,0.35)';
        let glowStrength = 0.35;
        if (pulsePercent > 70) {
            glowColor = 'rgba(139,0,255,0.45)';
            glowStrength = 0.6;
        } else if (pulsePercent > 35) {
            glowColor = 'rgba(255,94,0,0.35)';
            glowStrength = 0.45;
        }

        spectralOrb.style.transform = `scale(${1 + pulsePercent / 180})`;
        spectralOrb.style.boxShadow = `0 0 ${18 + pulsePercent * 0.35}px ${glowColor}, 0 0 ${28 + pulsePercent * 0.6}px rgba(255,255,255,0.08)`;
        spectralOrb.style.background = `radial-gradient(circle at 30% 30%, rgba(255,255,255,0.95), rgba(57,255,20,${0.18 + glowStrength}) 35%, rgba(255,94,0,${0.08 + glowStrength * 0.2}) 70%, rgba(0,0,0,0) 100%)`;
    }

    if (document.getElementById('hueDisplay')) document.getElementById('hueDisplay').innerText = `${Math.round(colorAccumulator * 360.0)}°`;
    if (document.getElementById('resDisplay')) document.getElementById('resDisplay').innerText = (dynamicFactor + touchVelocity).toFixed(3);
    
    const rootEl = document.getElementById('rootDisplay');
    if (rootEl) {
        const rootCalculation = Math.floor((dynamicFactor + touchVelocity) * 10.0) % 9 || 9;
        rootEl.innerText = rootCalculation === 3 || rootCalculation === 6 || rootCalculation === 9 ? `${rootCalculation} ★` : rootCalculation;
    }
}

// --- 5.8. PREDICTIVE EMOTIONAL TRACKING LEDGER ---
// Pulls your historic entries out of the device storage registry
let evoHistory = JSON.parse(localStorage.getItem('AuEvo_Genetic_Ledger')) || {
    totalSeals: 0,
    averageHue: 230,
    accumulatedResonance: 0.18,
    lastStampAt: null,
    moodLogs: { high_energy: 0, grounded: 0, processing: 0 }
};

// Sovereign Dictionary of Resonance System Advice Tables
const sovereignAdviceMatrix = {
    high_energy: [
        "⚠️ SCALING SURGE: Your frequency is spiking into elevated ranges. Ground your current matrix channels via steady, extended screen hold contact.",
        "⚡ COMPLETION RESONANCE: Key 9 energetic threshold achieved. A perfect window for creative output generation or immediate vault archiving."
    ],
    grounded: [
        "💎 EQUILIBRIUM STABLE: Deep, centered root frequencies detected. Your current matrix shows low variance—excellent state for analytical processing.",
        "🌌 VOID HARMONY: Your physical touch vectors match your telemetry breath coordinates flawlessly. The signature matrix is running at maximum efficiency."
    ],
    processing: [
        "🌀 EVOLUTION RECONFIGURING: Your profile indicates an intermediary transition pattern. Continue voice projection loops to clarify the root signature.",
        "🛡️ SECURITY HOLD: Introspective vibration metrics active. Allow the twisting wireframe lattice to re-center baseline dimensions automatically."
    ]
};

// --- 5.9. SOVEREIGN MATRIX IMAGE CAPTURE & ANALYTICS SYSTEM ---
const recordButton = document.getElementById('recordButton');
if (recordButton) {
    recordButton.innerText = "GENERATE SOUL SEAL";
    recordButton.disabled = false;
    recordButton.addEventListener('click', () => {
        renderer.render(scene, camera);
        const dataUrl = document.querySelector('#bg').toDataURL('image/png');
        const stampTag = new Date().toISOString().replace(/[:.]/g, '-');
        
        const currentHue = Math.round(colorAccumulator * 360.0);
        const currentRes = parseFloat(document.getElementById('resDisplay')?.innerText || '0.18');
        const currentRoot = document.getElementById('rootDisplay')?.innerText || '-';
        
        // ─── RUN NATIVE MOOD INFERENCE FACTORING ───
        let activeVibe = "processing";
        if (currentRes > 1.2) {
            activeVibe = "high_energy";
            evoHistory.moodLogs.high_energy += 1;
        } else if (currentRes < 0.7 && isInteracting) {
            activeVibe = "grounded";
            evoHistory.moodLogs.grounded += 1;
        } else {
            evoHistory.moodLogs.processing += 1;
        }
        
        // ─── PREDICTIVE TREND ANALYSIS ───
        // Calculate the dominant overall mood in your history to generate custom advice
        const totalLogs = evoHistory.moodLogs.high_energy + evoHistory.moodLogs.grounded + evoHistory.moodLogs.processing;
        let predictionAlert = "Mirror memory state initializing.";
        
        if (totalLogs >= 3) {
            const maxMood = Object.keys(evoHistory.moodLogs).reduce((a, b) => evoHistory.moodLogs[a] > evoHistory.moodLogs[b] ? a : b);
            const selectedPhrases = sovereignAdviceMatrix[maxMood];
            predictionAlert = `🔮 PREDICTIVE PATTERN [Dominant: ${maxMood.toUpperCase()}]: ${selectedPhrases[Math.floor(Math.random() * selectedPhrases.length)]}`;
        } else {
            // Early fallback advice while collecting initial telemetry points
            const currentPhrases = sovereignAdviceMatrix[activeVibe];
            predictionAlert = `✨ SEED ANALYSIS [Current State: ${activeVibe.toUpperCase()}]: ${currentPhrases[0]}`;
        }

        // Update local ledger file properties
        evoHistory.totalSeals += 1;
        evoHistory.averageHue = Math.round((evoHistory.averageHue + currentHue) / 2);
        evoHistory.accumulatedResonance = (evoHistory.accumulatedResonance + currentRes) / 2.0;
        evoHistory.lastStampAt = new Date().toLocaleString();

        localStorage.setItem('AuEvo_Genetic_Ledger', JSON.stringify(evoHistory));

        // Update UI Panel Display text fields instantly
        if (document.getElementById('vibeDisplay')) {
            document.getElementById('vibeDisplay').innerText = activeVibe.toUpperCase();
        }
        if (document.getElementById('stampDisplay')) {
            document.getElementById('stampDisplay').innerText = `STAMP ${evoHistory.totalSeals}`;
        }
        if (document.getElementById('adviceDisplay')) {
            document.getElementById('adviceDisplay').innerText = `${predictionAlert} • Saved ${evoHistory.lastStampAt}`;
        }
        const lvlEl = document.getElementById('levelDisplay');
        if (lvlEl) lvlEl.innerText = 55 + evoHistory.totalSeals;

        // Check if the user is on a mobile device
        const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

        if (isMobile) {
            // Convert dataURL to a real system blob file object to preserve your custom file names on phones
            fetch(dataUrl)
                .then(res => res.blob())
                .then(blob => {
                    const customFilename = `AuEvo_Seal_Gen${evoHistory.totalSeals}_Vibe_${activeVibe}_${stampTag}.png`;
                    const file = new File([blob], customFilename, { type: 'image/png' });
                    
                    // Fire the phone's native sharing dashboard panel if supported
                    if (navigator.canShare && navigator.canShare({ files: [file] })) {
                        navigator.share({
                            files: [file],
                            title: `AuEvo Soul Seal Gen ${evoHistory.totalSeals}`,
                            text: `Sovereign Matrix Record - Level ${55 + evoHistory.totalSeals}`
                        }).catch(err => {
                            // Quick location replacement fallback if share panel is closed out
                            window.location.href = dataUrl;
                        });
                    } else {
                        // Fallback option for legacy mobile browser environments
                        window.location.href = dataUrl;
                    }
                });
        } else {
            // Force browser image download pipeline assets (Standard seamless download for PC)
            const downloadLink = document.createElement('a');
            downloadLink.download = `AuEvo_Seal_Gen${evoHistory.totalSeals}_Vibe_${activeVibe}_${stampTag}.png`;
            downloadLink.href = dataUrl;
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
        }
        
        // Button UI Confirmation states
        const originalText = recordButton.innerText;
        recordButton.innerText = `GEN ${evoHistory.totalSeals} RECORDED`;
        recordButton.style.borderColor = "#00ffaa";
        recordButton.style.color = "#00ffaa";
        
        
        setTimeout(() => {
            recordButton.innerText = originalText;
            recordButton.style.borderColor = "#ffaa00";
            recordButton.style.color = "#ffaa00";
        }, 2500);
    });
}

// --- 6. ANIMATION MATRIX ENGINE ENGINE (ADVANCED RESONANT WARP) ---
function animate() {
    requestAnimationFrame(animate);
    
    touchVelocity = THREE.MathUtils.lerp(touchVelocity, targetVelocity, 0.08);
    targetVelocity *= 0.94;

    processVocalTelemetry();

    const time = Date.now() * 0.001;
    
    // Core Handshake Equation Variables (Calculated 9Hz Offset Link)
    const frequencyOffset9Hz = 9.0;

    // --- MAGICAL FLUID VERTEX WAVE ENGINE ---
    const positionAttribute = geometry.attributes.position;
    
    for (let i = 0; i < positionAttribute.count; i++) {
        // Fetch baseline unaltered coordinate vectors
        const bx = baseVertices.getX(i);
        const by = baseVertices.getY(i);
        const bz = baseVertices.getZ(i);

        // Generate dynamic multi-wave ripples across the shape body
        // Links your 9Hz value directly into the sine-wave telemetry math loop
        const waveX = Math.sin(by * 0.25 + time * 3.0 + (frequencyOffset9Hz * 0.1)) * (0.4 + touchVelocity * 0.8);
        const waveY = Math.cos(bx * 0.25 + time * 2.5) * (0.3 + dynamicFactor * 0.5);
        const waveZ = Math.sin(bz * 0.30 + time * 4.0) * (0.4 + touchVelocity * 0.8);

        // Apply interactive spatial magnetism pulling vertices softly toward finger interactions
        const distToTouchX = bx - (touchVector.x * 15.0);
        const distToTouchY = by - (touchVector.y * 15.0);
        const magnetPull = Math.sin(time + i) * (touchVelocity * 0.15);

        // Commit newly computed atmospheric calculations back to the vertex item index arrays
        positionAttribute.setXYZ(
            i, 
            bx + waveX + (distToTouchX * magnetPull), 
            by + waveY + (distToTouchY * magnetPull), 
            bz + waveZ
        );
    }
    positionAttribute.needsUpdate = true; // Tells Three.js to re-compile the mesh architecture canvas natively
    geometry.computeVertexNormals();

    // Parallax Spatial Camera Track
    camera.position.x += (touchVector.x * 7.0 - camera.position.x) * 0.04;
    camera.position.y += (touchVector.y * 7.0 - camera.position.y) * 0.04;
    camera.lookAt(0.0, 0.0, 0.0);

    // Apply global base dimensions to frame the vertical pillar proportions
    const finalScale = 1.0 + (analyser ? dynamicFactor * 0.05 : 0.0);
    mirrorSphere.scale.set(1.0 * finalScale, 1.0 * finalScale, 1.0 * finalScale);

    // Continuous Toroidal Twisting Spins
    mirrorSphere.rotation.y += 0.003 + (touchVelocity * 0.02);
    mirrorSphere.rotation.z = (Math.sin(time * 0.4) * 0.04) + (touchVector.x * 0.1);

    // Coordinate parallax calculations across background star vectors
    if (starfield) {
        starfield.rotation.y += 0.0001;
        starfield.position.x = THREE.MathUtils.lerp(starfield.position.x, touchVector.x * -2.0, 0.05);
        starfield.position.y = THREE.MathUtils.lerp(starfield.position.y, touchVector.y * -2.0, 0.05);
    }

    renderer.render(scene, camera);
}
animate();

// --- RESIZE LIFECYCLE ---
function resizeRenderer() {
    const width = window.visualViewport ? window.visualViewport.width : window.innerWidth;
    const height = window.visualViewport ? window.visualViewport.height : window.innerHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height, false);
}
window.addEventListener('resize', resizeRenderer);
if (window.visualViewport) window.visualViewport.addEventListener('resize', resizeRenderer);