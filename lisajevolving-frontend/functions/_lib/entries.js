export async function parseEntry(request) {
    const input = await request.json();
    const title = typeof input.title === "string" ? input.title.trim() : "";
    const body = typeof input.body === "string" ? input.body.trim() : "";
    const category = typeof input.category === "string" ? input.category.trim() : "";
    const mood = typeof input.mood === "string" ? input.mood.trim() : "";
    const status = input.status;

    if (!title || title.length > 160) return { error: "Add a title of 1 to 160 characters." };
    if (!body || body.length > 50000) return { error: "Add writing of 1 to 50,000 characters." };
    if (category.length > 60 || mood.length > 60) return { error: "Category and feeling must be 60 characters or fewer." };
    if (status !== "draft" && status !== "published") return { error: "Choose draft or published status." };
    return { value: { title, body, category: category || "Journal", mood, status } };
}