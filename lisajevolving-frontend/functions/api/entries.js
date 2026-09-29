import { errorResponse, jsonResponse } from "../_lib/http.js";

export async function onRequestGet({ env }) {
    try {
        const result = await env.DB.prepare(
            "SELECT id, title, body, category, mood, created_at, updated_at, published_at FROM journal_entries WHERE status = 'published' ORDER BY published_at DESC, created_at DESC"
        ).all();
        return jsonResponse({ entries: result.results || [] });
    } catch (error) {
        return errorResponse("The journal archive is temporarily unavailable.", 503);
    }
}