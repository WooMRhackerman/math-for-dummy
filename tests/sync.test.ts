import { describe, it, expect } from 'vitest';
import { utf8ToBase64, base64ToUtf8 } from '../src/services/github-sync';

describe('GitHub Sync UTF-8 Base64 Engine', () => {
  it('should roundtrip plain ASCII text', () => {
    const input = 'Hello World 123!';
    const encoded = utf8ToBase64(input);
    const decoded = base64ToUtf8(encoded);
    expect(decoded).toBe(input);
  });

  it('should roundtrip Korean Hangul characters without corruption', () => {
    const koreanText = '초등학교 5학년 1학기: 약수와 배수, 최대공약수, 최소공배수 개념 정리';
    const encoded = utf8ToBase64(koreanText);
    const decoded = base64ToUtf8(encoded);
    expect(decoded).toBe(koreanText);
  });

  it('should roundtrip complex LaTeX math and KaTeX formulas with Hangul', () => {
    const mathPayload = JSON.stringify({
      title: '피타고라스 정리와 원의 넓이',
      formula: '$$A = \\pi r^2, \\quad a^2 + b^2 = c^2$$',
      koreanUnits: '$5\\text{ cm}^2$ 넓이 계산'
    });
    const encoded = utf8ToBase64(mathPayload);
    const decoded = base64ToUtf8(encoded);
    expect(decoded).toBe(mathPayload);
    expect(JSON.parse(decoded)).toEqual(JSON.parse(mathPayload));
  });

  it('should handle multiline and whitespace in base64 strings', () => {
    const input = '줄바꿈 테스트\n두 번째 줄\n세 번째 줄: $\\frac{1}{2}$';
    const encoded = utf8ToBase64(input);
    // Simulate GitHub API formatting with newlines
    const formattedWithNewlines = encoded.slice(0, 10) + '\n' + encoded.slice(10);
    const decoded = base64ToUtf8(formattedWithNewlines);
    expect(decoded).toBe(input);
  });
});
