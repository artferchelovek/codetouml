import styles from "./MainPage.module.css";
import Editor from "../../Components/Editor/Editor.tsx";
import { useState } from "react";
import type { ParseResult } from "../../types/parseResult.ts";

export default function MainPage() {
  const [parsedCode, setParseCode] = useState<ParseResult | null>(null);

  return (
    <div className={styles.mainContainer}>
      <div className={styles.mainContent}>
        <Editor onParse={setParseCode} />
        <div>
          <pre>{parsedCode && JSON.stringify(parsedCode, null, 2)}</pre>
        </div>
      </div>
    </div>
  );
}
