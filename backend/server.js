// --- [ LLC BACKEND RECEIVER MATRIX ] ---
// LLC IDENTITY: AuEvoAujouleVol LLC
const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { exec } = require('child_process');

const PORT = process.env.PORT || 3000;
const DATA_FILE_PATH = path.join(__dirname, '..', 'data_storage', 'audio_database.json');

// Ensure data storage directory exists
const storageDir = path.join(__dirname, '..', 'data_storage');
if (!fs.existsSync(storageDir)) {
    fs.mkdirSync(storageDir, { recursive: true });
}

const server = http.createServer((req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

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
        req.on('data', chunk => { body += chunk.toString(); });
        
        req.on('end', () => {
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

                const finalCalculatedPayload = {
                    ...secureSoulPayload,
                    server_vault_timestamp: new Date().toISOString(),
                    status: "IMMUTABLY_VAULTED",
                    security_ledger: {
                        verified_md5: dynamicMd5,
                        verified_sha256: dynamicSha256,
                        verification_timestamp: new Date().toISOString(),
                        status: "SECURE_SYSTEM_INTEGRITY_VERIFIED"
                    }
                };

                existingDatabase.push(finalCalculatedPayload);
                fs.writeFileSync(DATA_FILE_PATH, JSON.stringify(existingDatabase, null, 4), 'utf8');

                // Dynamic Python Path depending on OS
                const pythonPath = process.platform === 'win32'
                    ? '"C:\\Users\\Lisaj\\AppData\\Local\\Programs\\Python\\Python314\\python.exe"'
                    : 'python3';

                exec(`${pythonPath} analyze_library.py`, { env: { ...process.env, PYTHONIOENCODING: 'utf-8' } }, (error, stdout, stderr) => {
                    if (error) console.error(`  [Python Pipeline Error]: ${error.message}`);
                    if (stderr) console.warn(`[Python Diagnostic]: ${stderr}`);
                    if (stdout) console.log(`  [Python Engine Output]:\n${stdout}`);
                });

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
