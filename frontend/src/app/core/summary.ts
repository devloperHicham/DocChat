export interface ParsedSummary {
    readonly intro: string;
    readonly points: readonly string[];
}

const BULLET = /^(?:[-*•]|\d+[.)])\s+(.*)$/;

export function parseSummary(raw: string): ParsedSummary {
    const intro: string[] = [];
    const points: string[] = [];

    for (const line of raw.replace(/\*\*/g, '').split('\n')) {
        const text = line.trim();
        if (!text) {
            continue;
        }
        const bullet = BULLET.exec(text);
        if (bullet) {
            points.push(bullet[1].trim());
        } else if (!text.endsWith(':')) {
            intro.push(text); // lines like "Here are the key points:" are dropped
        }
    }
    return { intro: intro.join(' '), points };
}