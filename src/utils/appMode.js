export function getAppMode() {
    const host = window.location.hostname;

    if (host.startsWith("pro.")) return "pro";
    if (host.startsWith("app.")) return "app";

    // fallback
    return "pro";
}

export function getLocalModeOverride() {
    if (window.location.hostname !== "localhost") return null;

    const params = new URLSearchParams(window.location.search);
    return params.get("mode"); // "pro" | "app"
}
