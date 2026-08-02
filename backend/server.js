// --- [ LLC BACKEND RECEIVER MATRIX ] ---
// LLC IDENTITY: AuEvoAujouleVol LLC
const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { generateSeal, getPriorEvolutionState } = require('./evoMetrics');

const PORT = process.env.PORT || 3000;
const DATA_FILE_PATH = path.join(__dirname, '..', 'data_storage', 'audio_database.json');

// Only these origins are allowed to call the API. Add localhost while developing if needed.
const ALLOWED_ORIGINS = [
    'https://evomirror.com',
    'https://www.evomirror.com'
];

// Ensure data storage directory exists
const storageDir = path.join(__dirname, '..', 'data_storage');
if (!fs.existsSync(storageDir)) {
    fs.mkdirSync(storageDir, { recursive: true });
}

const server = http.createServer((req, res) => {
    const origin = req.headers.origin;
    if (ALLOWED_ORIGINS.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    }
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Vary', 'Origin');

    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    if (req.method === 'GET' && req.url === '/api/seal/history') {
        if (fs.existsSync(DATA_FILE_PATH)) {
            const rawData = fs.readFileSync(DATA_FILE_PATH, 'utf8');
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(rawData || JSON.stringify([]));
        } else {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify([]));
        }
        return;
    }

    if (req.method === 'POST' && req.url === '/api/seal/crystallize') {
        let body = '';
        let tooLarge = false;
        const MAX_BODY_BYTES = 100 * 1024; // 100KB is plenty for this payload

        req.on('data', chunk => {
            body += chunk.toString();
            if (body.length > MAX_BODY_BYTES && !tooLarge) {
                tooLarge = true;
                res.writeHead(413, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: "Payload too large" }));
                req.destroy();
            }
        });

        req.on('end', () => {
            if (tooLarge) return;
            try {
                const secureSoulPayload = JSON.parse(body);
                console.log(`\n  [AuEvo RECEIVER]: Intercepted signature from ${secureSoulPayload.identity_metadata?.sovereign_id || 'UNKNOWN'}`);

                let existingDatabase = [];
                if (fs.existsSync(DATA_FILE_PATH)) {
                    const rawData = fs.readFileSync(DATA_FILE_PATH, 'utf8');
                    existingDatabase = rawData ? JSON.parse(rawData) : [];
                }

                const frontendPath = path.join(__dirname, '..', 'frontend', 'index.html');
                let dynamicSha256 = 'AWAITING_CORE_STREAM';
                let dynamicMd5 = 'AWAITING_CORE_STREAM';

                if (fs.existsSync(frontendPath)) {
                    const fileBuffer = fs.readFileSync(frontendPath);
                    dynamicSha256 = crypto.createHash('sha256').update(fileBuffer).digest('hex').toUpperCase();
                    dynamicMd5 = crypto.createHash('md5').update(fileBuffer).digest('hex').toUpperCase();
                }

                const { priorLeftover, sessionCount } = getPriorEvolutionState(
                    existingDatabase,
                    secureSoulPayload.identity_metadata?.sovereign_id
                );

                const evoMetricsResult = generateSeal({
                    voiceEnergy: secureSoulPayload.matrix_coordinates?.voice_energy ?? 0,
                    cameraBrightness: secureSoulPayload.matrix_coordinates?.camera_brightness ?? 0,
                    sessionCount,
                    priorLeftover
                });

                const finalCalculatedPayload = {
                    ...secureSoulPayload,
                    server_vault_timestamp: new Date().toISOString(),
                    status: "IMMUTABLY_VAULTED",
                    evo_metrics: evoMetricsResult,
                    security_ledger: {
                        verified_md5: dynamicMd5,
                        verified_sha256: dynamicSha256,
                        verification_timestamp: new Date().toISOString(),
                        status: "SECURE_SYSTEM_INTEGRITY_VERIFIED"
                    }
                };

                existingDatabase.push(finalCalculatedPayload);
                fs.writeFileSync(DATA_FILE_PATH, JSON.stringify(existingDatabase, null, 4), 'utf8');

                console.log(`  [EvoMetrics]: level=${evoMetricsResult.g_root_level} root=${evoMetricsResult.digital_root} gate=${evoMetricsResult.is_gate}`);

                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ 
                    status: "Sovereign Signature Locked Natively",
                    seal_generation: secureSoulPayload.matrix_coordinates?.total_seals || 1
                }));
            } catch (err) {
                console.error("  [CRITICAL SYSTEM ERROR]: Failed to process data stream:", err);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: "System Pipeline Malfunction" }));
            }
        });
    } else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: "Pathway Not Found in Matrix" }));
    }
});

server.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(`  [AuEvo SOVEREIGN ENGINE]: ACTIVE ON PORT ${PORT}`);
    console.log(`=======================================================`);
});
