import { parseNdjsonTokens } from './ndjson';

describe('parseNdjsonTokens', () => {
  it('joins the tokens of complete lines', () => {
    expect(parseNdjsonTokens('{"t":"Hel"}\n{"t":"lo"}\n')).toBe('Hello');
  });

  it('ignores a half-received last line', () => {
    expect(parseNdjsonTokens('{"t":"Hel"}\n{"t":')).toBe('Hel');
  });

  it('ignores blank lines and objects without a text token', () => {
    expect(parseNdjsonTokens('\n{"x":1}\n{"t":"ok"}\n')).toBe('ok');
  });

  it('keeps Arabic and French text intact', () => {
    expect(parseNdjsonTokens('{"t":"مرحبا "}\n{"t":"é"}\n')).toBe('مرحبا é');
  });

  it('returns an empty string for empty input', () => {
    expect(parseNdjsonTokens('')).toBe('');
  });
});