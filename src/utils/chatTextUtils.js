// Remove ALL markdown / formatting symbols aggressively
export function cleanAIText(text) {
    return text
        // Remove headings ####
        .replace(/#{1,6}\s*/g, "")

        // Remove bold/italic markers **
        .replace(/\*\*/g, "")

        // Remove single asterisks *
        .replace(/\*/g, "")

        // Remove horizontal rules ---
        .replace(/-{2,}/g, "")

        // Remove inline code `
        .replace(/`+/g, "")

        // Remove numbered lists like "1. ", "2. "
        .replace(/\b\d+\.\s+/g, "")

        // Remove extra spaces & line breaks
        .replace(/\s+/g, " ")

        .trim();
}

// Split into chat bubbles with 3–5 sentences each
export function chunkIntoMessages(text, min = 3, max = 5) {
    const sentences = text
        .split(/(?<=[.!?])\s+/)
        .filter(Boolean);

    const chunks = [];
    let i = 0;

    while (i < sentences.length) {
        const size = Math.min(
            max,
            Math.max(min, sentences.length - i)
        );
        chunks.push(sentences.slice(i, i + size).join(" "));
        i += size;
    }

    return chunks;
}
