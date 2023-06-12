import Parser from "web-tree-sitter";

export class Component {
  name: string;
  label: string | null;
  attributes: Attribute[];
  constructor(
    name: string,
    label: string | null = null,
    attributes: Attribute[] = []
  ) {
    this.name = name;
    this.label = label;
    this.attributes = attributes;
  }
  marshal(): string {
    let out = `
${this.name} "${this.label}" {
`;
    this.attributes.forEach((a) => {
      out += "  " + a.marshal() + "\n";
    });
    out += "}";
    return out;
  }
}

export class Attribute {
  key: string;
  value: any;
  constructor(key: string, value: any) {
    this.key = key;
    this.value = value;
  }
  marshal(): string {
    return `${this.key} = ${this.value}`;
  }
}

export function Unmarshal(source: string, n: Parser.SyntaxNode): Component {
  const blockNameNode = n.childForFieldName("name")!;
  const name = source.substring(
    blockNameNode.startIndex,
    blockNameNode.endIndex
  );
  const blockLabelIdentifierNode = n.childForFieldName("label")?.namedChild(0);
  let label = null;
  if (blockLabelIdentifierNode != null) {
    label = source.substring(
      blockLabelIdentifierNode.startIndex,
      blockLabelIdentifierNode.endIndex
    );
  }
  return new Component(name, label);
}
