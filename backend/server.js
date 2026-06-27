// --- [ LLC BACKEND RECEIVER MATRIX ] ---
// LLC IDENTITY: AuEvoAujouleVol LLC
const http = require('http');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const PORT = 3000;
const DATA_FILE_PATH = path.join(__dirname, '..', 'data_storage', 'audio_database.json');

const server = http.createServer((req, res) => {
    // Enable Cross-Origin Resource Sharing (CORS) so your frontend can talk to it locally
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle the browser's pre-flight handshake safety check
    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    // --- 3. THE INPUT PATHWAY: Catching the Crystallized Soul Seal Payload ---
    if (req.method === 'POST' && req.url === '/api/seal/crystallize') {
        let body = '';

        // Collect incoming data stream chunks natively
        req.on('data', chunk => { body += chunk.toString(); });
        
        req.on('end', () => {
            try {
                const secureSoulPayload = JSON.parse(body);
                console.log(`\n⚡ [AuEvo RECEIVER]: Intercepted signature from ${secureSoulPayload.identity_metadata.sovereign_id}`);

                // Read existing database file or start a fresh array if it doesn't exist yet
                let existingDatabase = [];
                if (fs.existsSync(DATA_FILE_PATH)) {
                    const rawData = fs.readFileSync(DATA_FILE_PATH, 'utf8');
                    existingDatabase = rawData ? JSON.parse(rawData) : [];
                }

                // Add the fresh crystallized payload to your system database array
                existingDatabase.push({
                    ...secureSoulPayload,
                    server_vault_timestamp: new Date().toISOString(),
                    status: "IMMUTABLY_VAULTED"
                });

                // Write the updated file back to your /data_storage folder natively
                fs.writeFileSync(DATA_FILE_PATH, JSON.stringify(existingDatabase, null, 4), 'utf8');
                console.log(`💾 [SUCCESS]: Soul Seal archived in audio_database.json`);

                // --- 6. THE VOID TRACKING SYSTEM: Automatic Python Analysis Trigger ---
                // If an audio source file is ready to be analyzed, run your March Python script
                console.log("🤖 [AUTOMATION]: Initializing Librosa scanning pipeline...");
exec('"C:\\Users\\Lisaj\\AppData\\Local\\Programs\\Python\\Python314\\python.exe" analyze_library.py', (error, stdout, stderr) => {                    if (error) {
                        console.error(`⚠️ [Python Pipeline Error]: ${error.message}`);
                        return;
                    }
                    if (stderr) console.warn(`[Python Diagnostic]: ${stderr}`);
                    console.log(`📊 [Python Engine Output]:\n${stdout}`);
                });

                // --- 9. THE EQUAL RESPONSE: Handshaking back to the UI screen ---
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ 
                    status: "Sovereign Signature Locked Natively",
                    seal_generation: secureSoulPayload.matrix_coordinates.total_seals
                }));

            } catch (err) {
                console.error("❌ [CRITICAL SYSTEM ERROR]: Failed to process data stream:", err);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: "System Pipeline Malfunction" }));
            }
        });
    } else {
        // Fallback for unauthorized pathways
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: "Pathway Not Found in Matrix" }));
    }
});

server.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(`🔑 [AuEvo SOVEREIGN ENGINE]: ACTIVE AND ON PORT ${PORT}`);
    console.log(`=======================================================`);
});