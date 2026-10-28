import type { ClassReference, ParsedClass } from "../types/parseResult.ts";

const builtInTypes = new Set([
  "bool",
  "byte",
  "char",
  "decimal",
  "double",
  "float",
  "int",
  "long",
  "object",
  "short",
  "string",
  "void",
]);

export function analyzeTypes(classes: ParsedClass[]) {
  const classNames = new Set(classes.map((item) => item.name));
  const references: ClassReference[] = [];
  const errors: string[] = [];

  for (const item of classes) {
    const checkType = (
      type: string,
      via: ClassReference["via"],
      member: string,
    ) => {
      if (builtInTypes.has(type)) return;

      if (classNames.has(type)) {
        references.push({ from: item.name, to: type, via, member });
      } else {
        errors.push(`Unknown type "${type}" in ${item.name}.${member}`);
      }
    };

    for (const field of item.fields) {
      checkType(field.type, "field", field.name);
    }

    for (const method of item.methods) {
      checkType(method.returnType, "return", method.name);

      for (const parameter of method.parameters) {
        checkType(parameter.type, "parameter", `${method.name}.${parameter.name}`);
      }
    }
  }

  return { references, errors };
}
