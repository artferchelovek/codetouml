export type Token = {
  type: "keyword" | "identifier" | "symbol";
  value: string;
  start: number;
};

const keywords = new Set([
  "class",
  "public",
  "private",
  "protected",
  "void",
  "readonly",
]);
const symbols = new Set(["{", "}", "(", ")", ";", ","]);

export const tokenize = (text: string): Token[] => {
  const tokens: Token[] = [];
  let i = 0;

  while (i < text.length) {
    const char = text[i];

    if (/\s/.test(char)) {
      i++;
      continue;
    }

    if (/[a-zA-Z_]/.test(char)) {
      const start = i;

      while (i < text.length && /[a-zA-Z0-9_]/.test(text[i])) {
        i++;
      }

      const value = text.slice(start, i);
      tokens.push({
        type: keywords.has(value) ? "keyword" : "identifier",
        value,
        start,
      });
      continue;
    }

    if (symbols.has(char)) {
      tokens.push({ type: "symbol", value: char, start: i });
      i++;
      continue;
    }

    throw new Error(`Неизвестный символ "${char}" в позиции ${i}`);
  }

  return tokens;
};
