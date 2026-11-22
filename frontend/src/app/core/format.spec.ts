import { formatFileSize } from './format';

describe('formatFileSize', () => {
    it('formats bytes, kilobytes and megabytes', () => {
        expect(formatFileSize(512)).toBe('512 B');
        expect(formatFileSize(2048)).toBe('2 KB');
        expect(formatFileSize(1.5 * 1024 * 1024)).toBe('1.5 MB');
    });
});