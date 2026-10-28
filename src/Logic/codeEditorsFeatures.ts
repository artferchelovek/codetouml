import type { KeyboardEvent } from "react";

const bracketPairs = [
  { open: "{", close: "}" },
  { open: "[", close: "]" },
  { open: "(", close: ")" },
];

export const setTabulation = (
  event: KeyboardEvent<HTMLTextAreaElement>,
  setCode: (code: string) => void,
) => {
  if (event.key !== "Tab") return;

  event.preventDefault();

  const textarea = event.currentTarget as HTMLTextAreaElement;

  textarea.setRangeText(
    "    ",
    textarea.selectionStart,
    textarea.selectionEnd,
    "end",
  );

  setCode(textarea.value);
};

export const setEnterBetweenBraces = (
  event: KeyboardEvent<HTMLTextAreaElement>,
  setCode: (code: string) => void,
) => {
  if (event.key !== "Enter") return;

  const textarea = event.currentTarget as HTMLTextAreaElement;
  const { value, selectionStart: pos, selectionEnd } = textarea;

  const isBetweenBrackets = bracketPairs.some(
    ({ open, close }) => value[pos - 1] === open && value[pos] === close,
  );

  if (pos !== selectionEnd || !isBetweenBrackets) return;

  event.preventDefault();

  const lineStart = value.lastIndexOf("\n", pos - 1) + 1;
  const indent = value.slice(lineStart).match(/^[ \t]*/)?.[0] ?? "";
  const tab = "    ";

  const inserted = `\n${indent}${tab}\n${indent}`;
  const newCursor = pos + 1 + indent.length + tab.length;

  textarea.setRangeText(inserted, pos, pos, "end");
  setCode(textarea.value);

  requestAnimationFrame(() => {
    textarea.setSelectionRange(newCursor, newCursor);
  });
};

export const skipClosingBracket = (
  event: KeyboardEvent<HTMLTextAreaElement>,
) => {
  const isClosingBracket = bracketPairs.some(
    ({ close }) => close === event.key,
  );
  if (!isClosingBracket) return;

  const textarea = event.currentTarget as HTMLTextAreaElement;
  const pos = textarea.selectionStart;

  if (pos !== textarea.selectionEnd || textarea.value[pos] !== event.key)
    return;

  event.preventDefault();
  textarea.setSelectionRange(pos + 1, pos + 1);
};

export const insertBracketPair = (
  event: KeyboardEvent<HTMLTextAreaElement>,
  setCode: (code: string) => void,
) => {
  const pair = bracketPairs.find(({ open }) => open === event.key);
  if (!pair || event.ctrlKey || event.metaKey || event.altKey) return;

  const textarea = event.currentTarget as HTMLTextAreaElement;
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;

  if (start !== end) return;

  event.preventDefault();

  textarea.setRangeText(pair.open + pair.close, start, end, "end");
  setCode(textarea.value);

  requestAnimationFrame(() => {
    textarea.setSelectionRange(start + 1, start + 1);
  });
};

export const setAutoIndent = (
  event: KeyboardEvent<HTMLTextAreaElement>,
  setCode: (code: string) => void,
) => {
  if (event.key !== "Enter" || event.defaultPrevented) return;

  const textarea = event.currentTarget;
  const pos = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const value = textarea.value;

  const lineStart = value.lastIndexOf("\n", pos - 1) + 1;
  const textBeforeCursor = value.slice(lineStart, pos);

  const indent = textBeforeCursor.match(/^[ \t]*/)?.[0] ?? "";

  const extraIndent = textBeforeCursor.trimEnd().endsWith("{") ? "    " : "";

  event.preventDefault();

  const inserted = `\n${indent}${extraIndent}`;
  textarea.setRangeText(inserted, pos, end, "end");
  setCode(textarea.value);

  const newCursor = pos + inserted.length;
  requestAnimationFrame(() => {
    textarea.setSelectionRange(newCursor, newCursor);
  });
};
