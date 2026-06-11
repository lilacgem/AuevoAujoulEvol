/**
 * @file visualizer.js
 * @description AuEvo JoulEvol - Fully Synthesized Resonant Physics Matrix Engine
 */

console.log('⚡ [INTEGRATION] Fusing audio frequency matrices and geometric gravity vectors...');

// Core Space Configuration
const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x000002, 0.015);

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000.0);
camera.position.set(0.0, 0.0, 56.0);

const renderer = new THREE.WebGLRenderer({
    canvas: document.querySelector('#bg'),
    alpha: false,
    preserveDrawingBuffer: true,
    antialias: true
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2.0));
renderer.setClearColor(0x000002, 1.0);

// Interaction Vectors
let touchVector = { x: 0.0, y: 0.0 }, lastTouchVector = { x: 0.0, y: 0.0 };
let touchVelocity = 0.0, targetVelocity = 0.0, isInteracting = false;
let dynamicFactor = 0.18, colorAccumulator = 0.5, totalValueGained = 0;
let particles = [];

function getViewportState() {
    const isLandscape = window.innerWidth >= window.innerHeight;
    return {
        isLandscape,
        aspect: window.innerWidth / window.innerHeight,
        scaleBias: isLandscape ? 1.0 : 1.04,
        cameraDistance: isLandscape ? 52.0 : 56.0,
        fogDensity: isLandscape ? 0.015 : 0.018
    };
}

function handleInteractionMove(clientX, clientY) {
    lastTouchVector.x = touchVector.x; lastTouchVector.y = touchVector.y;
    const viewport = getViewportState();
    touchVector.x = (clientX / window.innerWidth) * 2.0 - 1.0;
    touchVector.y = -(clientY / window.innerHeight) * 2.0 + 1.0;
    const movement = Math.sqrt(Math.pow(touchVector.x - lastTouchVector.x, 2) + Math.pow(touchVector.y - lastTouchVector.y, 2));
    targetVelocity = Math.min(movement * (viewport.isLandscape ? 14.0 : 12.5), 4.2);
    isInteracting = true;
}

window.addEventListener('mousemove', (e) => handleInteractionMove(e.clientX, e.clientY));
window.addEventListener('touchmove', (e) => { if (e.touches.length > 0) handleInteractionMove(e.touches[0].clientX, e.touches[0].clientY); }, { passive: true });
window.addEventListener('touchstart', (e) => { if (e.touches.length > 0) handleInteractionMove(e.touches[0].clientX, e.touches[0].clientY); }, { passive: true });
window.addEventListener('touchend', () => { isInteracting = false; targetVelocity = 0.0; });

// Parallax Space Dust Layer
const starGeometry = new THREE.BufferGeometry();
const starCount = 1400;
const positions = new Float32Array(starCount * 3);
for (let i = 0; i < starCount * 3; i += 3) {
    positions[i] = (Math.random() - 0.5) * 400.0;
    positions[i + 1] = (Math.random() - 0.5) * 400.0;
    positions[i + 2] = (Math.random() - 0.5) * 300.0;
}
starGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
const starfield = new THREE.Points(starGeometry, new THREE.PointsMaterial({ color: 0xffffff, size: 0.5, transparent: true, opacity: 0.4 }));
scene.add(starfield);

// High-Density Core Geometric Sphere Layer (larger, more active resonance form)
const geometry = new THREE.SphereGeometry(7.2, 40, 40);
const baseVertices = geometry.attributes.position.clone();
const mirrorMaterial = new THREE.MeshBasicMaterial({ color: 0x8b00ff, transparent: true, opacity: 0.68, wireframe: true, side: THREE.DoubleSide });
const mirrorSphere = new THREE.Mesh(geometry, mirrorMaterial);
scene.add(mirrorSphere);

const haloGeometry = new THREE.SphereGeometry(8.6, 32, 32);
const haloMaterial = new THREE.MeshBasicMaterial({ color: 0xff5e00, transparent: true, opacity: 0.18, wireframe: true, side: THREE.DoubleSide });
const haloSphere = new THREE.Mesh(haloGeometry, haloMaterial);
haloSphere.rotation.x = 0.6;
haloSphere.rotation.y = 0.35;
scene.add(haloSphere);

const auraGeometry = new THREE.SphereGeometry(6.0, 32, 32);
const auraMaterial = new THREE.MeshBasicMaterial({ color: 0x39ff14, transparent: true, opacity: 0.22, wireframe: true, side: THREE.DoubleSide });
const auraSphere = new THREE.Mesh(auraGeometry, auraMaterial);
scene.add(auraSphere);

// Audio Synthesis Integration Pipelines
let audioContext, analyser, dataArray;
const micButton = document.getElementById('micButton');
const recordButton = document.getElementById('recordButton');

function captureSealSnapshot() {
    try {
        if (!renderer?.domElement) return null;

        const imageDataUrl = renderer.domElement.toDataURL('image/png');
        const archive = JSON.parse(localStorage.getItem('AuEvo_Seal_Archive') || '[]');
        const memory = JSON.parse(localStorage.getItem('AuEvo_Genetic_Ledger') || '{}');

        const sealRecord = {
            id: Date.now(),
            totalSeals: (memory.totalSeals || 0) + 1,
            level: 58 + (memory.totalSeals || 0) + 1,
            resonance: (dynamicFactor + touchVelocity).toFixed(3),
            hue: `${Math.round(colorAccumulator * 360.0)}°`,
            timestamp: new Date().toISOString(),
            image: imageDataUrl,
            memoryNote: 'Evolving seal snapshot captured from live resonance.'
        };

        archive.unshift(sealRecord);
        localStorage.setItem('AuEvo_Seal_Archive', JSON.stringify(archive.slice(0, 25)));

        const nextMemory = {
            ...memory,
            totalSeals: sealRecord.totalSeals,
            lastSealId: sealRecord.id,
            lastSealAt: sealRecord.timestamp,
            lastLevel: sealRecord.level,
            lastResonance: sealRecord.resonance,
            memoryDepth: (memory.memoryDepth || 0) + 1,
            evolving: true
        };
        localStorage.setItem('AuEvo_Genetic_Ledger', JSON.stringify(nextMemory));

        const link = document.createElement('a');
        link.href = imageDataUrl;
        link.download = `auevo-seal-${sealRecord.id}.png`;
        link.click();

        return sealRecord;
    } catch (error) {
        console.error('Capture failed:', error);
        return null;
    }
}

if (micButton) {
    micButton.addEventListener('click', async () => {
        if (!audioContext) audioContext = new (window.AudioContext || window.webkitAudioContext)();
        if (audioContext.state === 'suspended') await audioContext.resume();

        if (navigator.mediaDevices?.getUserMedia) {
            navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
                const micStatus = document.getElementById('micStatus');
                const awarenessDisplay = document.getElementById('awarenessDisplay');
                const vibeDisplay = document.getElementById('vibeDisplay');

                if (micStatus) {
                    micStatus.innerText = "CONNECTED";
                    micStatus.style.color = "#39ff14";
                    micStatus.classList.remove('processing-text');
                }
                if (awarenessDisplay) awarenessDisplay.innerText = "INTEGRATED";
                if (vibeDisplay) vibeDisplay.innerText = "ACTIVE";
                
                micButton.innerText = "MIRROR ACTIVE";
                micButton.style.borderColor = "#39ff14";
                micButton.style.color = "#39ff14";
                if (recordButton) recordButton.disabled = false;

                const source = audioContext.createMediaStreamSource(stream);
                analyser = audioContext.createAnalyser();
                analyser.fftSize = 256;
                dataArray = new Uint8Array(analyser.frequencyBinCount);
                source.connect(analyser);

                // Initialize Version 1's Vacuum Data Node Loop upon synchronization hook
                setInterval(generateStarNode, 1000);
            });
        }
    });
}

function generateStarNode() {
    const angle = Math.random() * Math.PI * 2;
    const distance = 35 + Math.random() * 10;
    const particle = new THREE.Mesh(new THREE.SphereGeometry(0.2, 4, 4), new THREE.MeshBasicMaterial({ color: 0xd4af37 }));
    particle.position.set(Math.cos(angle) * distance, Math.sin(angle) * distance, (Math.random() - 0.5) * 10);
    scene.add(particle);
    particles.push(particle);
}

function processVocalTelemetry() {
    let totalVolume = 0.0, normalizedVol = 0.0;

    if (analyser && dataArray) {
        analyser.getByteFrequencyData(dataArray);
        for (let i = 0; i < dataArray.length; i++) totalVolume += dataArray[i];
        normalizedVol = totalVolume / (dataArray.length * 255.0);
        dynamicFactor = THREE.MathUtils.lerp(dynamicFactor, normalizedVol * 6.0 + 0.15, 0.2);
    } else {
        dynamicFactor = THREE.MathUtils.lerp(dynamicFactor, 0.18, 0.05);
    }

    // Full-spectrum resonance mapping across touch, voice, and audio energy.
    colorAccumulator = (colorAccumulator + 0.0015 + (normalizedVol * 0.012) + (touchVelocity * 0.003)) % 1.0;
    const spectrumShift = (colorAccumulator + normalizedVol * 0.18 + touchVelocity * 0.08 + (isInteracting ? 0.03 : 0.0)) % 1.0;
    mirrorMaterial.color.setHSL(spectrumShift, 0.92, 0.56);

    const hueDisplay = document.getElementById('hueDisplay');
    const resDisplay = document.getElementById('resDisplay');
    const rootDisplay = document.getElementById('rootDisplay');

    if (hueDisplay) hueDisplay.innerText = `${Math.round(colorAccumulator * 360.0)}°`;
    if (resDisplay) resDisplay.innerText = (dynamicFactor + touchVelocity).toFixed(3);

    const rootCalculation = Math.floor((dynamicFactor + touchVelocity) * 10.0) % 9 || 9;
    if (rootDisplay) rootDisplay.innerText = rootCalculation === 3 || rootCalculation === 6 || rootCalculation === 9 ? `${rootCalculation} ★` : rootCalculation;
}

// Vector algebra trailing incoming node particles down the data gravity pipeline
if (recordButton) {
    recordButton.addEventListener('click', () => {
        const sealRecord = captureSealSnapshot();
        if (sealRecord) {
            const levelDisplay = document.getElementById('levelDisplay');
            const statusBox = document.getElementById('vacuum-status');
            if (levelDisplay) levelDisplay.innerText = sealRecord.level;
            if (statusBox) statusBox.innerText = `> SEAL CAPTURED AND STORED IN MEMORY (${sealRecord.totalSeals})`;
            recordButton.innerText = `GEN ${sealRecord.totalSeals} SEALED`;
            recordButton.style.borderColor = '#39ff14';
            recordButton.style.color = '#39ff14';
            setTimeout(() => {
                recordButton.innerText = 'GENERATE SOUL SEAL';
                recordButton.style.borderColor = 'var(--matrix-orange)';
                recordButton.style.color = 'var(--matrix-orange)';
            }, 1800);
        }
    });
}

function updateStarParticles() {
    for (let i = particles.length - 1; i >= 0; i--) {
        let p = particles[i];
        p.position.x -= (p.position.x) * 0.04;
        p.position.y -= (p.position.y) * 0.04;
        p.position.z -= (p.position.z) * 0.04;

        if (p.position.length() < 6.0) {
            scene.remove(p);
            particles.splice(i, 1);
            
            // Trigger structural mass modifications on impact, but cap the growth to prevent runaway scaling.
            totalValueGained = Math.min(totalValueGained + 25, 200);
            const statusBox = document.getElementById('vacuum-status');
            const vibeDisplay = document.getElementById('vibeDisplay');

            if (totalValueGained > 200) {
                mirrorMaterial.color.setHex(0x39ff14); // Lock emerald green
                if (statusBox) statusBox.innerText = `> RECLAIMED VALUE SECURED TO SOVEREIGN VAULT`;
                if (statusBox) statusBox.style.color = "#39ff14";
                if (vibeDisplay) vibeDisplay.innerText = "CONNECTED";
            } else if (totalValueGained > 75) {
                mirrorMaterial.color.setHex(0xff5e00); // Lock orange
                if (statusBox) statusBox.innerText = `> PORTAL LEDGER STABILIZING HARMONIC FLOW`;
                if (statusBox) statusBox.style.color = "#ff5e00";
            }
        }
    }
}

// Render Loops
function animate() {
    requestAnimationFrame(animate);
    const viewport = getViewportState();
    touchVelocity = THREE.MathUtils.lerp(touchVelocity, targetVelocity, 0.08);
    targetVelocity *= 0.94;

    processVocalTelemetry();
    updateStarParticles();

    const time = Date.now() * 0.001;
    const positionAttribute = geometry.attributes.position;
    
    // Magical multi-wave deforming math calculations mapping frequency shifts
    for (let i = 0; i < positionAttribute.count; i++) {
        const bx = baseVertices.getX(i), by = baseVertices.getY(i), bz = baseVertices.getZ(i);
        const waveX = Math.sin(by * 0.20 + time * 4.2) * (0.75 + touchVelocity * 1.25);
        const waveY = Math.cos(bx * 0.20 + time * 3.2) * (0.60 + dynamicFactor * 1.10);
        const waveZ = Math.sin((bx + by) * 0.16 + time * 2.6) * (0.35 + touchVelocity * 0.45);
        positionAttribute.setXYZ(i, bx + waveX, by + waveY, bz + waveZ);
    }
    positionAttribute.needsUpdate = true;
    geometry.computeVertexNormals();

    camera.position.x += (touchVector.x * 6.5 - camera.position.x) * 0.05;
    camera.position.y += (touchVector.y * 6.5 - camera.position.y) * 0.05;
    camera.lookAt(0.0, 0.0, 0.0);

    const basePulse = 1.15 + (dynamicFactor * 0.18) + (touchVelocity * 0.12);
    const finalScale = Math.min(basePulse + (totalValueGained * 0.0012), 2.35) * viewport.scaleBias;
    mirrorSphere.scale.set(finalScale, finalScale, finalScale);
    mirrorSphere.rotation.y += 0.008 + (touchVelocity * 0.02);
    mirrorSphere.rotation.x += 0.003 + (dynamicFactor * 0.006);

    haloSphere.scale.set((1.08 + dynamicFactor * 0.12 + touchVelocity * 0.08) * viewport.scaleBias, (1.08 + dynamicFactor * 0.12 + touchVelocity * 0.08) * viewport.scaleBias, (1.08 + dynamicFactor * 0.12 + touchVelocity * 0.08) * viewport.scaleBias);
    haloSphere.rotation.y += 0.0025 + touchVelocity * 0.005;
    haloSphere.rotation.x += 0.0015 + dynamicFactor * 0.003;

    auraSphere.scale.set((0.92 + dynamicFactor * 0.10 + touchVelocity * 0.06) * viewport.scaleBias, (0.92 + dynamicFactor * 0.10 + touchVelocity * 0.06) * viewport.scaleBias, (0.92 + dynamicFactor * 0.10 + touchVelocity * 0.06) * viewport.scaleBias);
    auraSphere.rotation.y -= 0.003 + dynamicFactor * 0.004;
    auraSphere.rotation.x += 0.002 + touchVelocity * 0.004;

    if (starfield) {
        starfield.rotation.y += 0.0001;
        starfield.position.x = THREE.MathUtils.lerp(starfield.position.x, touchVector.x * -2.0, 0.05);
    }
    renderer.render(scene, camera);
}
animate();

function resizeRenderer() {
    const viewport = getViewportState();
    scene.fog = new THREE.FogExp2(0x000002, viewport.fogDensity);
    camera.aspect = viewport.aspect;
    camera.fov = viewport.isLandscape ? 56 : 64;
    camera.position.z = viewport.cameraDistance;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2.0));
}
window.addEventListener('resize', resizeRenderer);
window.addEventListener('orientationchange', resizeRenderer);
resizeRenderer();