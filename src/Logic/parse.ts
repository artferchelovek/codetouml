import type { Token } from "./tokenize.ts";
import type { Field, Method, Parameter, ParseResult } from "../types/parseResult.ts";
import { analyzeTypes } from "./analyzeTypes.ts";

export class Parser {
  private position = 0;
  private readonly tokens: Token[] = [];

  constructor(tokens: Token[]) {
    this.tokens = tokens;
  }

  private current() {
    return this.tokens[this.position];
  }

  private expect(value: string) {
    const token = this.current();

    if (token?.value !== value) {
      throw new Error(`Expected "${value}", got "${token?.value ?? "end of input"}"`);
    }

    this.position++;
  }

  private readIdentifier() {
    const token = this.current();

    if (token?.type !== "identifier") {
      throw new Error(`Expected identifier, got "${token?.value ?? "end of input"}"`);
    }

    this.position++;
    return token.value;
  }

  private readType(allowVoid = false) {
    const token = this.current();

    if (token?.type !== "identifier" && !(allowVoid && token?.value === "void")) {
      throw new Error(`Expected type, got "${token?.value ?? "end of input"}"`);
    }

    this.position++;
    return token.value;
  }

  private parseMember(): { kind: "field"; value: Field } | { kind: "method"; value: Method } {
    const token = this.current();
    let visibility: string | undefined;
    let isReadonly = false;

    if (token && ["public", "private", "protected"].includes(token.value)) {
      visibility = token.value;
      this.position++;
    }

    if (this.current()?.value === "readonly") {
      isReadonly = true;
      this.position++;
    }

    const type = this.readType(true);
    const name = this.readIdentifier();

    if (this.current()?.value === "(") {
      if (isReadonly) {
        throw new Error(`Method "${name}" cannot be readonly`);
      }

      this.expect("(");
      const parameters: Parameter[] = [];

      while (this.current()?.value !== ")") {
        const parameterType = this.readType();
        const parameterName = this.readIdentifier();
        parameters.push({ type: parameterType, name: parameterName });

        if (this.current()?.value !== ",") break;
        this.expect(",");
      }

      this.expect(")");
      this.expect(";");
      return {
        kind: "method",
        value: { visibility, returnType: type, name, parameters },
      };
    }

    if (type === "void") {
      throw new Error(`Field "${name}" cannot have type void`);
    }

    this.expect(";");

    return { kind: "field", value: { visibility, isReadonly, type, name } };
  }

  private parseClass() {
    this.expect("class");
    const name = this.readIdentifier();
    this.expect("{");

    const fields: Field[] = [];
    const methods: Method[] = [];

    while (this.current()?.value !== "}") {
      if (!this.current()) {
        throw new Error(`Class "${name}" is missing a closing brace`);
      }

      const member = this.parseMember();
      if (member.kind === "field") {
        fields.push(member.value);
      } else {
        methods.push(member.value);
      }
    }

    this.expect("}");
    return { name, fields, methods };
  }

  public parse(): ParseResult {
    const classes: ParseResult["classes"] = [];

    while (this.current()) {
      classes.push(this.parseClass());
    }

    return { classes, ...analyzeTypes(classes) };
  }
}
