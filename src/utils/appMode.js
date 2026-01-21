export function getAppMode() {
    const host = window.location.hostname;

    if (host.startsWith("pro.")) return "pro";
    if (host.startsWith("app.")) return "app";

    // fallback
    return "pro";
}
