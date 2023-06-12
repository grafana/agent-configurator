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
    const begin = `${this.key} = `
    switch(typeof this.value){
      case "string":
      case "object":
        return begin + JSON.stringify(this.value);
      default:
        return begin + this.value
    }
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
  const attrNodes = n.childForFieldName("body")?.namedChildren;
  const attrs: Attribute[] = [];
  if (attrNodes) {
    for (const attr of attrNodes) {
      if (attr.type !== "attribute") continue;
      const keyNode = attr.childForFieldName("key")!;
      const valueNode = attr.childForFieldName("value")!;
      const key = source.substring(keyNode.startIndex,keyNode.endIndex);
      let value: any;
      switch (valueNode.type) {
        case "literal_value":
        case "array":
          value = JSON.parse(source.substring(valueNode.startIndex,valueNode.endIndex));
          break;
        default:
          value = {}
      }
      attrs.push(new Attribute(key,value))
    }
  }
  return new Component(name, label,attrs);
}
