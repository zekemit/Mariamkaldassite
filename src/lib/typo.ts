/** Typographic apostrophes for copy that was written with straight ones (testimonials, FAQ). */
export function typo(text: string): string {
  return text.replace(/(?<=\w)'/g, '’');
}
