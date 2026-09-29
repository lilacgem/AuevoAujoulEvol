export function jsonResponse(data, status = 200) {
    return new Response(JSON.stringify(data), {
        status,
        headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" }
    });
}

export function errorResponse(message, status = 400) {
    return jsonResponse({ error: message }, status);
}