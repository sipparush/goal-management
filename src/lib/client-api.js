export async function requestJson(url, options = {}) {
    const hasFormDataBody = typeof FormData !== "undefined" && options.body instanceof FormData;

    const response = await fetch(url, {
        ...options,
        credentials: "include",
        headers: hasFormDataBody
            ? {
                ...(options.headers || {}),
            }
            : {
                "Content-Type": "application/json",
                ...(options.headers || {}),
            },
        cache: "no-store",
    });

    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
        throw new Error(payload.error || "Request failed");
    }

    return payload;
}
