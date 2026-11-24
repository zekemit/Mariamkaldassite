import { describe, expect, it } from 'vitest';
import { splitHeadline } from '@/lib/headline';
import { countWord } from '@/lib/typo';

describe('splitHeadline', () => {
  it('breaks the default headline into the two lines the design was built around', () => {
    expect(splitHeadline('You meet every deadline except your own.')).toEqual(['You meet every deadline', 'except your own.']);
  });

  it('honours explicit line breaks from the editor', () => {
    expect(splitHeadline('One line\nSecond line')).toEqual(['One line', 'Second line']);
    expect(splitHeadline('A\r\n\r\nB\nC')).toEqual(['A', 'B', 'C']);
  });

  it('keeps short headlines on one line and tolerates empty input', () => {
    expect(splitHeadline('Begin again.')).toEqual(['Begin again.']);
    expect(splitHeadline('   ')).toEqual([]);
  });

  it('always rejoins to the original words', () => {
    const text = 'Your next chapter starts with one honest conversation about what you want';
    expect(splitHeadline(text).join(' ')).toBe(text);
  });
});

describe('countWord', () => {
  it('writes small counts as words and larger ones as numerals', () => {
    expect(countWord(7)).toBe('seven');
    expect(countWord(12)).toBe('twelve');
    expect(countWord(13)).toBe('13');
    expect(countWord(0)).toBe('no');
  });
});
