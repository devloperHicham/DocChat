/**
 * The backend streams one {"t":"..."} JSON object per line.
 * Joins every complete token; a half-received last line is ignored until more data arrives.
 */
export function parseNdjsonTokens(raw: string): string {
    let text = '';
    for (const line of raw.split('\n')) {
        if (!line.trim()) {
            continue;
        }
        try {
            const token = (JSON.parse(line) as { t?: unknown }).t;
            if (typeof token === 'string') {
                text += token;
            }
        } catch {
            // incomplete line
        }
    }
    return text;
}