/** Headline accents: copy marks one phrase with *asterisks* (AccentText). */

/** A run of headline text; `accent` runs render in the serif italic. */
export interface TextRun {
  text: string;
  accent: boolean;
}

/**
 * Splits "Software engineer building *AI products end to end*." into plain and accent
 * runs. Asterisks toggle the accent; an unmatched trailing asterisk is literal.
 */
export function splitAccent(input: string): TextRun[] {
  const parts = input.split("*");
  if (parts.length % 2 === 0) {
    // Odd number of asterisks: treat the last one as a literal character.
    const last = parts.pop() ?? "";
    parts[parts.length - 1] += `*${last}`;
  }
  return parts
    .map((text, i) => ({ text, accent: i % 2 === 1 }))
    .filter((run) => run.text.length > 0);
}
