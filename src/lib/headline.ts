/**
 * Splits a hero headline into the lines the entrance animation reveals one after another. Explicit line breaks
 * (Enter in the editor) win; otherwise a longer headline is broken at the space nearest its middle, which turns
 * "You meet every deadline except your own." into "You meet every deadline" / "except your own."
 */
export function splitHeadline(headline: string): string[] {
  const explicit = headline.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  if (explicit.length > 1) return explicit;

  const text = explicit[0] ?? '';
  const words = text.split(/\s+/);
  if (text.length < 24 || words.length < 4) return text ? [text] : [];

  const middle = text.length / 2;
  let best = 0;
  let bestDistance = Infinity;
  let position = 0;
  for (let i = 0; i < words.length - 1; i++) {
    position += words[i].length;
    const distance = Math.abs(position - middle);
    if (distance < bestDistance) {
      bestDistance = distance;
      best = i;
    }
    position += 1; // the space
  }
  return [words.slice(0, best + 1).join(' '), words.slice(best + 1).join(' ')];
}
