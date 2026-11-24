// FAQ answers are stored as one plain-text field so Mariam can edit them in a normal text box:
//   - a blank line starts a new paragraph
//   - lines that start with "- " become a bulleted list
//   - {{email}}  {{phone}}  {{book}}  {{contact}} turn into live links
// Everything else is plain text (React escapes it), so there is no HTML to get wrong or to inject.

export type FaqBlock = { p: string } | { ul: string[] };

export const ANSWER_TOKENS = ['{{email}}', '{{phone}}', '{{book}}', '{{contact}}'] as const;

const BULLET = /^\s*-\s+(.*\S)\s*$/;

export function parseAnswer(answer: string): FaqBlock[] {
  const blocks: FaqBlock[] = [];
  let paragraph: string[] = [];
  let list: string[] = [];

  const flushParagraph = () => {
    if (paragraph.length) blocks.push({ p: paragraph.join(' ') });
    paragraph = [];
  };
  const flushList = () => {
    if (list.length) blocks.push({ ul: list });
    list = [];
  };

  for (const rawLine of answer.replace(/\r\n?/g, '\n').split('\n')) {
    const line = rawLine.trim();
    const bullet = BULLET.exec(rawLine);
    if (line === '') {
      flushParagraph();
      flushList();
    } else if (bullet) {
      flushParagraph();
      list.push(bullet[1]);
    } else {
      flushList();
      paragraph.push(line);
    }
  }
  flushParagraph();
  flushList();
  return blocks;
}

export function serializeAnswer(blocks: readonly FaqBlock[]): string {
  return blocks.map((block) => ('p' in block ? block.p : block.ul.map((item) => `- ${item}`).join('\n'))).join('\n\n');
}

/** Tokens in the text that this site does not know, so the editor can warn about typos like {{emial}}. */
export function unknownTokens(text: string): string[] {
  const known = new Set<string>(ANSWER_TOKENS);
  return [...new Set(text.match(/\{\{[^}]*\}\}/g) ?? [])].filter((token) => !known.has(token));
}
