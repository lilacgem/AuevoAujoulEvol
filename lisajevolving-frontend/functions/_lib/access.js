import { errorResponse } from "./http.js";

let cachedKeys;
let cachedUntil = 0;

function decodeBase64Url(value) {
    const padded = value.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(value.length / 4) * 4, "=");
    return Uint8Array.from(atob(padded), character => character.charCodeAt(0));
}

function decodeJson(value) {
    return JSON.parse(new TextDecoder().decode(decodeBase64Url(value)));
}

async function accessKeys(teamDomain, refresh = false) {
    if (!refresh && cachedKeys && cachedUntil > Date.now()) return cachedKeys;
    const response = await fetch(`https://${teamDomain}/cdn-cgi/access/certs`);
    if (!response.ok) throw new Error("Access signing keys are unavailable.");
    const data = await response.json();
    cachedKeys = data.keys || [];
    cachedUntil = Date.now() + 10 * 60 * 1000;
    return cachedKeys;
}

async function verifiedClaims(token, teamDomain, audience) {
    const parts = token.split(".");
    if (parts.length !== 3) throw new Error("Invalid identity token.");
    const header = decodeJson(parts[0]);
    const claims = decodeJson(parts[1]);
    if (header.alg !== "RS256" || !header.kid) throw new Error("Unsupported identity token.");

    let keySet = await accessKeys(teamDomain);
    let jwk = keySet.find(key => key.kid === header.kid);
    if (!jwk) {
        keySet = await accessKeys(teamDomain, true);
        jwk = keySet.find(key => key.kid === header.kid);
    }
    if (!jwk) throw new Error("Unknown identity signing key.");

    const publicKey = await crypto.subtle.importKey(
        "jwk", jwk, { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" }, false, ["verify"]
    );
    const validSignature = await crypto.subtle.verify(
        "RSASSA-PKCS1-v1_5",
        publicKey,
        decodeBase64Url(parts[2]),
        new TextEncoder().encode(`${parts[0]}.${parts[1]}`)
    );
    const audiences = Array.isArray(claims.aud) ? claims.aud : [claims.aud];
    const now = Math.floor(Date.now() / 1000);
    if (!validSignature || claims.iss !== `https://${teamDomain}` || !audiences.includes(audience) ||
        typeof claims.exp !== "number" || claims.exp <= now ||
        (typeof claims.nbf === "number" && claims.nbf > now)) {
        throw new Error("Identity token is invalid or expired.");
    }
    return claims;
}

export async function requireOwner(request, env) {
    const teamDomain = (env.ACCESS_TEAM_DOMAIN || "").replace(/^https?:\/\//, "").replace(/\/$/, "");
    const audience = env.ACCESS_AUD;
    const ownerEmail = (env.OWNER_EMAIL || "").trim().toLowerCase();
    if (!teamDomain || !audience || !ownerEmail) {
        return { response: errorResponse("Editor access is not configured.", 503) };
    }

    const token = request.headers.get("cf-access-jwt-assertion");
    if (!token) return { response: errorResponse("Sign in through the owner portal.", 401) };
    try {
        const claims = await verifiedClaims(token, teamDomain, audience);
        if (String(claims.email || "").trim().toLowerCase() !== ownerEmail) {
            return { response: errorResponse("This account is not allowed to edit the journal.", 403) };
        }
        return { email: ownerEmail };
    } catch (error) {
        return { response: errorResponse("Your owner session could not be verified. Sign in again.", 401) };
    }
}