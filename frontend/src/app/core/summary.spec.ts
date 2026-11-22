import { parseSummary } from './summary';

describe('parseSummary', () => {
    it('splits the intro from the bullet points and drops the lead-in line', () => {
        const raw = 'This document is a course.\n\nHere are the key points:\n\n* First point\n- Second point\n1. Third point';

        expect(parseSummary(raw)).toEqual({
            intro: 'This document is a course.',
            points: ['First point', 'Second point', 'Third point'],
        });
    });

    it('removes bold markers', () => {
        expect(parseSummary('* **Key**: value').points).toEqual(['Key: value']);
    });

    it('returns only an intro when there are no bullets', () => {
        expect(parseSummary('Just a sentence.')).toEqual({ intro: 'Just a sentence.', points: [] });
    });

    it('handles empty text', () => {
        expect(parseSummary('')).toEqual({ intro: '', points: [] });
    });
});