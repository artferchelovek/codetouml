export type Field = {
  visibility?: string;
  isReadonly: boolean;
  type: string;
  name: string;
};

export type Parameter = {
  type: string;
  name: string;
};

export type Method = {
  visibility?: string;
  returnType: string;
  name: string;
  parameters: Parameter[];
};

export type ParsedClass = {
  name: string;
  fields: Field[];
  methods: Method[];
};

export type ClassReference = {
  from: string;
  to: string;
  via: "field" | "return" | "parameter";
  member: string;
};

export type ParseResult = {
  classes: ParsedClass[];
  references: ClassReference[];
  errors: string[];
};
