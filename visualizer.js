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

// ─── GEOMETRY 1: FLOATING INNER CYLINDER ───
// Slightly smaller and positioned outside the main globe so the two forms read as separate, yet they still move together.
const cylinderGeo = new THREE.CylinderGeometry(6.2, 6.2, 18.0, 32, 32, true);
const baseCylinderVertices = cylinderGeo.attributes.position.clone();
const cylinderMaterial = new THREE.MeshBasicMaterial({ color: 0x8b00ff, transparent: true, opacity: 0.70, wireframe: true, side: THREE.DoubleSide });
const cylinderMesh = new THREE.Mesh(cylinderGeo, cylinderMaterial);
cylinderMesh.position.set(0.0, 0.0, 6.0);
scene.add(cylinderMesh);

// ─── GEOMETRY 2: MASTER OUTER OVAL GLOBE ───
const ovalGeo = new THREE.SphereGeometry(15.0, 48, 48);
const baseOvalVertices = ovalGeo.attributes.position.clone();
const ovalMaterial = new THREE.MeshBasicMaterial({ color: 0xffaa00, transparent: true, opacity: 0.35, wireframe: true, side: THREE.DoubleSide });
const ovalMesh = new THREE.Mesh(ovalGeo, ovalMaterial);
scene.add(ovalMesh);

let audioContext, analyser, dataArray;
const micButton = document.getElementById('micButton');

if (micButton) {
    micButton.addEventListener('click', async () => {
        if (!audioContext) audioContext = new (window.AudioContext || window.webkitAudioContext)();
        if (audioContext.state === 'suspended') await audioContext.resume();

        if (navigator.mediaDevices?.getUserMedia) {
            navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
                document.getElementById('awarenessDisplay').innerText = "INTEGRATED";
                document.getElementById('vibeDisplay').innerText = "ACTIVE";
                
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

    document.getElementById('hueDisplay').innerText = `${Math.round(colorAccumulator * 360.0)}°`;
    document.getElementById('resDisplay').innerText = (dynamicFactor + touchVelocity).toFixed(3);
    
    const rootCalculation = Math.floor((dynamicFactor + touchVelocity) * 10.0) % 9 || 9;
    document.getElementById('rootDisplay').innerText = rootCalculation === 3 || rootCalculation === 6 || rootCalculation === 9 ? `${rootCalculation} ★` : rootCalculation;
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
            
            if (totalValueGained > 200) {
                cylinderMaterial.color.setHex(0x39ff14);
                statusBox.innerText = `> RECLAIMED VALUE SECURED TO SOVEREIGN VAULT`;
                statusBox.style.color = "#39ff14";
                document.getElementById('vibeDisplay').innerText = "CONNECTED";
            } else if (totalValueGained > 75) {
                cylinderMaterial.color.setHex(0xff5e00);
                statusBox.innerText = `> PORTAL LEDGER STABILIZING HARMONIC FLOW`;
                statusBox.style.color = "#ff5e00";
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
            document.getElementById('levelDisplay').innerText = sealRecord.level;
            document.getElementById('vacuum-status').innerText = `> SOUL SEAL GENERATED AND SAVED (${sealRecord.totalSeals})`;
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
        const waveX = Math.sin(by * 0.20 + time * 2.5) * (0.5 + dynamicFactor * 0.8);
        const waveY = Math.cos(bx * 0.20 + time * 2.0) * (0.4 + dynamicFactor * 0.6);
        ovalPositions.setXYZ(i, bx + waveX, by + waveY, bz);
    }
    ovalPositions.needsUpdate = true;
    ovalGeo.computeVertexNormals();

    // ─── INNER CYLINDER TWIST ENGINE ───
    const cylPositions = cylinderGeo.attributes.position;
    for (let i = 0; i < cylPositions.count; i++) {
        const bx = baseCylinderVertices.getX(i), by = baseCylinderVertices.getY(i), bz = baseCylinderVertices.getZ(i);
        const waveX = Math.sin(by * 0.35 + time * 4.0) * (0.3 + touchVelocity * 0.6);
        cylPositions.setXYZ(i, bx + waveX, by, bz);
    }
    cylPositions.needsUpdate = true;
    cylinderGeo.computeVertexNormals();

    camera.position.x += (touchVector.x * 5.0 - camera.position.x) * 0.04;
    camera.position.y += (touchVector.y * 5.0 - camera.position.y) * 0.04;
    camera.lookAt(0.0, 0.0, 0.0);

    const pulse = 1.0 + 0.08 * Math.sin(time * 1.4);
    const cylScale = 1.0 + (totalValueGained * 0.001) + 0.04;
    cylinderMesh.scale.set(cylScale * pulse, cylScale * pulse, cylScale * pulse);
    cylinderMesh.position.x = Math.sin(time * 0.45) * 6.0;
    cylinderMesh.position.y = Math.cos(time * 0.35) * 4.0;
    cylinderMesh.position.z = 6.0 + Math.sin(time * 0.8) * 1.6;
    cylinderMesh.rotation.x = Math.sin(time * 0.25) * 0.12;
    cylinderMesh.rotation.z = Math.cos(time * 0.30) * 0.10;
    
    const ovalScale = 1.0 + (dynamicFactor * 0.05);
    // Maintained vertical stretch matrix settings
    ovalMesh.scale.set(0.85 * ovalScale, 1.85 * ovalScale, 0.85 * ovalScale);

    cylinderMesh.rotation.y += 0.004 + (touchVelocity * 0.01);
    ovalMesh.rotation.y -= 0.0012;

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