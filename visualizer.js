/**
 * @file visualizer.js
 * @description AuEvo JoulEvol - Realaligned Concentric Geometry Engine
 */

console.log('⚡ [REALIGNMENT] Expanding core cylinder boundaries and clearing dashboard footprints...');

const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x000002, 0.015);

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000.0);
camera.position.set(0.0, 0.0, 55.0);

const renderer = new THREE.WebGLRenderer({
    canvas: document.querySelector('#bg'),
    alpha: true,                 /* CRITICAL FLIP: Changes canvas from solid black to fully transparent */
    preserveDrawingBuffer: true,
    antialias: true
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2.0));
renderer.setClearColor(0x000002, 0.0); /* Set clear alpha to 0.0 so web layout backgrounds are visible */

let touchVector = { x: 0.0, y: 0.0 }, lastTouchVector = { x: 0.0, y: 0.0 };
let touchVelocity = 0.0, targetVelocity = 0.0, isInteracting = false;
let dynamicFactor = 0.18, colorAccumulator = 0.5, totalValueGained = 0;
let particles = [];

function handleInteractionMove(clientX, clientY) {
    lastTouchVector.x = touchVector.x; lastTouchVector.y = touchVector.y;
    touchVector.x = (clientX / window.innerWidth) * 2.0 - 1.0;
    touchVector.y = -(clientY / window.innerHeight) * 2.0 + 1.0;
    targetVelocity = Math.min(Math.sqrt(Math.pow(touchVector.x - lastTouchVector.x, 2) + Math.pow(touchVector.y - lastTouchVector.y, 2)) * 12.0, 3.5);
    isInteracting = true;
}

window.addEventListener('mousemove', (e) => handleInteractionMove(e.clientX, e.clientY));
window.addEventListener('touchmove', (e) => { if (e.touches.length > 0) handleInteractionMove(e.touches[0].clientX, e.touches[0].clientY); }, { passive: true });
window.addEventListener('touchstart', (e) => { if (e.touches.length > 0) handleInteractionMove(e.touches[0].clientX, e.touches[0].clientY); }, { passive: true });
window.addEventListener('touchend', () => { isInteracting = false; targetVelocity = 0.0; });

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

// ─── GEOMETRY 1: MASTER OUTER OVAL GLOBE ───
const ovalGeo = new THREE.SphereGeometry(15.0, 48, 48);
const baseOvalVertices = ovalGeo.attributes.position.clone();
const ovalMaterial = new THREE.MeshBasicMaterial({ color: 0xffaa00, transparent: true, opacity: 0.35, wireframe: true, side: THREE.DoubleSide });
const ovalMesh = new THREE.Mesh(ovalGeo, ovalMaterial);
scene.add(ovalMesh);
window.__AUEVO_DEBUG__ = { scene, ovalMesh, camera, renderer };

let audioContext, analyser, dataArray;
const micButton = document.getElementById('micButton');

if (micButton) {
    micButton.addEventListener('click', async () => {
        if (!audioContext) audioContext = new (window.AudioContext || window.webkitAudioContext)();
        if (audioContext.state === 'suspended') await audioContext.resume();

        if (navigator.mediaDevices?.getUserMedia) {
            navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
                const awarenessDisplay = document.getElementById('awarenessDisplay');
                const vibeDisplay = document.getElementById('vibeDisplay');

                if (awarenessDisplay) awarenessDisplay.innerText = "INTEGRATED";
                if (vibeDisplay) vibeDisplay.innerText = "ACTIVE";

                micButton.innerText = "MIRROR ACTIVE";
                micButton.style.borderColor = "#39ff14";
                micButton.style.color = "#39ff14";
                document.getElementById('recordButton').disabled = false;

                const source = audioContext.createMediaStreamSource(stream);
                analyser = audioContext.createAnalyser();
                analyser.fftSize = 256;
                dataArray = new Uint8Array(analyser.frequencyBinCount);
                source.connect(analyser);

                setInterval(generateStarNode, 1000);
            });
        }
    });
}

function generateStarNode() {
    const angle = Math.random() * Math.PI * 2;
    const distance = 40 + Math.random() * 10;
    const particle = new THREE.Mesh(new THREE.SphereGeometry(0.25, 4, 4), new THREE.MeshBasicMaterial({ color: 0xd4af37 }));
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

    colorAccumulator = (colorAccumulator + 0.001 + (normalizedVol * 0.01) + (touchVelocity * 0.002)) % 1.0;
    if (!analyser) ovalMaterial.color.setHSL(colorAccumulator, 0.95, 0.55);

    const hueDisplay = document.getElementById('hueDisplay');
    const resDisplay = document.getElementById('resDisplay');
    const rootDisplay = document.getElementById('rootDisplay');

    if (hueDisplay) hueDisplay.innerText = `${Math.round(colorAccumulator * 360.0)}°`;
    if (resDisplay) resDisplay.innerText = (dynamicFactor + touchVelocity).toFixed(3);

    const rootCalculation = Math.floor((dynamicFactor + touchVelocity) * 10.0) % 9 || 9;
    if (rootDisplay) {
        rootDisplay.innerText = rootCalculation === 3 || rootCalculation === 6 || rootCalculation === 9 ? `${rootCalculation} ★` : rootCalculation;
    }
}

function updateStarParticles() {
    for (let i = particles.length - 1; i >= 0; i--) {
        let p = particles[i];
        p.position.x -= (p.position.x) * 0.04;
        p.position.y -= (p.position.y) * 0.04;
        p.position.z -= (p.position.z) * 0.04;

        if (p.position.length() < 10.0) {
            scene.remove(p);
            particles.splice(i, 1);
            
            totalValueGained += 25;
            const statusBox = document.getElementById('vacuum-status');
            const vibeDisplay = document.getElementById('vibeDisplay');

            if (totalValueGained > 200) {
                cylinderMaterial.color.setHex(0x39ff14);
                if (statusBox) statusBox.innerText = `> RECLAIMED VALUE SECURED TO SOVEREIGN VAULT`;
                if (statusBox) statusBox.style.color = "#39ff14";
                if (vibeDisplay) vibeDisplay.innerText = "CONNECTED";
            } else if (totalValueGained > 75) {
                cylinderMaterial.color.setHex(0xff5e00);
                if (statusBox) statusBox.innerText = `> PORTAL LEDGER STABILIZING HARMONIC FLOW`;
                if (statusBox) statusBox.style.color = "#ff5e00";
            }
        }
    }
}

let evoHistory = JSON.parse(localStorage.getItem('AuEvo_Genetic_Ledger')) || { totalSeals: 0 };
const recordButton = document.getElementById('recordButton');

function captureSealImage() {
    try {
        const imageDataUrl = renderer.domElement.toDataURL('image/png');
        const archive = JSON.parse(localStorage.getItem('AuEvo_Seal_Archive') || '[]');
        const sealRecord = {
            id: Date.now(),
            totalSeals: evoHistory.totalSeals + 1,
            level: 58 + evoHistory.totalSeals + 1,
            timestamp: new Date().toISOString(),
            image: imageDataUrl
        };

        archive.unshift(sealRecord);
        localStorage.setItem('AuEvo_Seal_Archive', JSON.stringify(archive.slice(0, 25)));

        const link = document.createElement('a');
        link.href = imageDataUrl;
        link.download = `auevo-soul-seal-${sealRecord.id}.png`;
        link.click();

        return sealRecord;
    } catch (error) {
        console.error('Seal generation failed:', error);
        return null;
    }
}

if (recordButton) {
    recordButton.addEventListener('click', () => {
        const sealRecord = captureSealImage();

        if (sealRecord) {
            evoHistory.totalSeals = sealRecord.totalSeals;
            localStorage.setItem('AuEvo_Genetic_Ledger', JSON.stringify(evoHistory));
            const levelDisplay = document.getElementById('levelDisplay');
            const statusBox = document.getElementById('vacuum-status');
            if (levelDisplay) levelDisplay.innerText = sealRecord.level;
            if (statusBox) statusBox.innerText = `> SOUL SEAL GENERATED AND SAVED (${sealRecord.totalSeals})`;
        }

        const originalText = recordButton.innerText;
        recordButton.innerText = `GEN ${evoHistory.totalSeals} SEALED`;
        recordButton.style.borderColor = '#39ff14';
        recordButton.style.color = '#39ff14';
        setTimeout(() => {
            recordButton.innerText = originalText;
            recordButton.style.borderColor = 'var(--matrix-orange)';
            recordButton.style.color = 'var(--matrix-orange)';
        }, 2000);
    });
}

function animate() {
    requestAnimationFrame(animate);
    touchVelocity = THREE.MathUtils.lerp(touchVelocity, targetVelocity, 0.08);
    targetVelocity *= 0.94;

    processVocalTelemetry();
    updateStarParticles();

    const time = Date.now() * 0.001;

    // ─── OUTER OVAL GLOBE DEFORM ENGINE ───
    const ovalPositions = ovalGeo.attributes.position;
    for (let i = 0; i < ovalPositions.count; i++) {
        const bx = baseOvalVertices.getX(i), by = baseOvalVertices.getY(i), bz = baseOvalVertices.getZ(i);
        const waveX = Math.sin(by * 0.18 + time * 1.4 + touchVector.x * 2.0) * (0.4 + dynamicFactor * 1.2);
        const waveY = Math.cos(bx * 0.18 + time * 1.1 + touchVector.y * 2.0) * (0.35 + dynamicFactor * 1.0);
        ovalPositions.setXYZ(i, bx + waveX, by + waveY, bz);
    }
    ovalPositions.needsUpdate = true;
    ovalGeo.computeVertexNormals();

    camera.position.x += (touchVector.x * 5.0 - camera.position.x) * 0.04;
    camera.position.y += (touchVector.y * 5.0 - camera.position.y) * 0.04;
    camera.lookAt(0.0, 0.0, 0.0);

    const pulse = 1.0 + 0.015 * Math.max(0.0, dynamicFactor);
    const largeScale = 1.9 + (totalValueGained * 0.0005);

    const ovalScale = 1.0 + (dynamicFactor * 0.04) + (touchVelocity * 0.02);
    ovalMesh.scale.set(0.75 * ovalScale * largeScale * pulse, 1.45 * ovalScale * largeScale * pulse, 0.75 * ovalScale * largeScale * pulse);
    ovalMesh.position.z = -18.0 + touchVector.y * 1.2 + Math.sin(time * 0.35) * 0.5;

    ovalMesh.rotation.y = touchVector.x * 0.25 + Math.sin(time * 0.2) * 0.02;
    ovalMesh.rotation.x = touchVector.y * 0.18 + Math.cos(time * 0.18) * 0.02;

    if (starfield) {
        starfield.rotation.y += 0.0001;
        starfield.position.x = THREE.MathUtils.lerp(starfield.position.x, touchVector.x * -2.0, 0.05);
    }
    renderer.render(scene, camera);
}
animate();

function resizeRenderer() {
    camera.aspect = window.innerWidth / window.innerHeight; camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}
window.addEventListener('resize', resizeRenderer);