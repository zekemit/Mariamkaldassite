/** Typographic apostrophes for copy that was written with straight ones (testimonials, FAQ). */
export function typo(text: string): string {
  return text.replace(/(?<=\w)'/g, '’');
}

const WORDS = ['no', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve'];

/** "seven" for 7, "14" for 14: small counts read better as words in running copy. */
export function countWord(n: number): string {
  return Number.isInteger(n) && n >= 0 && n < WORDS.length ? WORDS[n] : String(n);
}
