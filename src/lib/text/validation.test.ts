import { describe, expect, it } from 'vitest';
import { normalize } from './normalize.ts';
import { validate } from './validation.ts';

const SPECIAL = ['♀', '♂', '２', '：', 'Ｚ'];

describe('validate', () => {
  it('returns ValidatedInput for pure katakana', () => {
    const n = normalize('ピカチュウ');
    expect(validate(n, SPECIAL)).toBe('ピカチュウ');
  });

  it('returns ValidatedInput for katakana + allowed special char', () => {
    const n = normalize('ニドラン♀');
    expect(validate(n, SPECIAL)).toBe('ニドラン♀');
  });

  it('returns ValidatedInput for fullwidth special char', () => {
    const n = normalize('ポリゴン２');
    expect(validate(n, SPECIAL)).toBe('ポリゴン２');
  });

  it('returns null for disallowed char', () => {
    const n = normalize('ピカチュウ!') as ReturnType<typeof normalize>;
    expect(validate(n, SPECIAL)).toBeNull();
  });

  it('returns null for empty string', () => {
    const n = normalize('');
    expect(validate(n, SPECIAL)).toBeNull();
  });

  it('returns null for hiragana (not normalized)', () => {
    const n = 'ぴかちゅう' as ReturnType<typeof normalize>;
    expect(validate(n, SPECIAL)).toBeNull();
  });
});
