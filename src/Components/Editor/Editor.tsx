import styles from "./Editor.module.css";
import { useEffect, useRef, useState } from "react";
import {
  insertBracketPair,
  setAutoIndent,
  setEnterBetweenBraces,
  setTabulation,
  skipClosingBracket,
} from "../../Logic/codeEditorsFeatures.ts";
import { tokenize } from "../../Logic/tokenize.ts";
import { Parser } from "../../Logic/parse.ts";
import type { ParseResult } from "../../types/parseResult.ts";

interface EditorProps {
  onParse: (result: ParseResult | null) => void;
}

export default function Editor({ onParse }: EditorProps) {
  const [code, setCode] = useState<string>("class User {\n\n}");
  const numbersRef = useRef<HTMLDivElement>(null);

  const lineCount = code.split("\n").length;

  useEffect(() => {
    try {
      const tokens = tokenize(code);
      const result = new Parser(tokens).parse();
      onParse(result);
    } catch {
      // onParse(null);
    }
  }, [code, onParse]);

  return (
    <div className={styles.editorContainer}>
      <div ref={numbersRef} aria-hidden="true">
        {Array.from({ length: lineCount }, (_, i) => i + 1).map((_, i) => (
          <div key={i}>{i + 1}</div>
        ))}
      </div>
      <textarea
        className={styles.code}
        value={code}
        onChange={(e) => setCode(e.target.value)}
        onScroll={(event) => {
          if (numbersRef.current) {
            numbersRef.current.scrollTop = event.currentTarget.scrollTop;
          }
        }}
        onKeyDown={(event) => {
          setTabulation(event, setCode);
          setEnterBetweenBraces(event, setCode);
          insertBracketPair(event, setCode);
          skipClosingBracket(event);
          setAutoIndent(event, setCode);
        }}
        wrap="off"
        spellCheck={false}
      ></textarea>
    </div>
  );
}
