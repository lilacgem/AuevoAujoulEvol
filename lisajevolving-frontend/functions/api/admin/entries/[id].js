import { requireOwner } from "../../../_lib/access.js";
import { parseEntry } from "../../../_lib/entries.js";
import { errorResponse, jsonResponse } from "../../../_lib/http.js";

export async function onRequestPut({ request, env, params }) {
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
    const { title, body, category, mood, status } = parsed.value;
    try {
        const result = await env.DB.prepare(
            "UPDATE journal_entries SET title = ?, body = ?, category = ?, mood = ?, status = ?, updated_at = ?, published_at = CASE WHEN ? = 'published' THEN COALESCE(published_at, ?) ELSE NULL END WHERE id = ?"
        ).bind(title, body, category, mood, status, now, status, now, params.id).run();
        if (!result.meta.changes) return errorResponse("That entry no longer exists.", 404);
        return jsonResponse({ id: params.id, saved: true });
    } catch (error) {
        return errorResponse("The entry could not be saved.", 503);
    }
}

export async function onRequestDelete({ request, env, params }) {
    const auth = await requireOwner(request, env);
    if (auth.response) return auth.response;
    try {
        const result = await env.DB.prepare("DELETE FROM journal_entries WHERE id = ?").bind(params.id).run();
        if (!result.meta.changes) return errorResponse("That entry no longer exists.", 404);
        return jsonResponse({ id: params.id, deleted: true });
    } catch (error) {
        return errorResponse("The entry could not be deleted.", 503);
    }
}