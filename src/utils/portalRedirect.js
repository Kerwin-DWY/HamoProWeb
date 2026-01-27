export function getPortalUrl(portal) {
    const isLocalhost =
        window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1";

    if (isLocalhost) {
        return portal === "pro"
            ? "http://localhost:5174/pro"
            : "http://localhost:5174/app";
    }

    // production
    return portal === "pro"
        ? "https://pro.qualemind.com"
        : "https://app.qualemind.com";
}
