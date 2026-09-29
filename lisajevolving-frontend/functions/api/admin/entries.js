import { requireOwner } from "../../_lib/access.js";
import { parseEntry } from "../../_lib/entries.js";
import { errorResponse, jsonResponse } from "../../_lib/http.js";

export async function onRequestGet({ request, env }) {
    const auth = await requireOwner(request, env);
    if (auth.response) return auth.response;
    try {
        const result = await env.DB.prepare(
            "SELECT id, title, body, category, mood, status, created_at, updated_at, published_at FROM journal_entries ORDER BY updated_at DESC"
        ).all();
        return jsonResponse({ entries: result.results || [] });
    } catch (error) {
        return errorResponse("The editor could not load entries.", 503);
    }
}

export async function onRequestPost({ request, env }) {
    const auth = await requireOwner(request, env);
    if (auth.response) return auth.response;
    let parsed;
    try {
        parsed = await parseEntry(request);
    } catch (error) {
        return errorResponse("Send a valid journal entry.");
    }
    if (parsed.error) return errorResponse(parsed.error);

    const now = new Date().toISOString();
    const id = crypto.randomUUID();
    const { title, body, category, mood, status } = parsed.value;
    try {
        await env.DB.prepare(
            "INSERT INTO journal_entries (id, title, body, category, mood, status, created_at, updated_at, published_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)"
        ).bind(id, title, body, category, mood, status, now, now, status === "published" ? now : null).run();
        return jsonResponse({ id, saved: true }, 201);
    } catch (error) {
        return errorResponse("The entry could not be saved.", 503);
    }
}