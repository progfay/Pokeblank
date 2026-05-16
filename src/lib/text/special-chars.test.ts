import { describe, expect, it } from 'vitest';
import { isSpecialChar } from './special-chars.ts';

describe('isSpecialChar', () => {
  it('returns false for katakana', () => {
    expect(isSpecialChar('ア')).toBe(false);
    expect(isSpecialChar('ン')).toBe(false);
    expect(isSpecialChar('ュ')).toBe(false);
  });

  it('returns false for hiragana', () => {
    expect(isSpecialChar('あ')).toBe(false);
    expect(isSpecialChar('ぁ')).toBe(false);
  });

  it('returns true for symbols', () => {
    expect(isSpecialChar('♀')).toBe(true);
    expect(isSpecialChar('♂')).toBe(true);
  });

  it('returns true for fullwidth digits', () => {
    expect(isSpecialChar('２')).toBe(true);
  });

  it('returns true for fullwidth colon', () => {
    expect(isSpecialChar('：')).toBe(true);
  });

  it('returns true for fullwidth letters', () => {
    expect(isSpecialChar('Ｚ')).toBe(true);
  });
});
