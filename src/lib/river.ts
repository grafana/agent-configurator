import Parser from "web-tree-sitter";

export class Block {
  name: string;
  label: string | null;
  attributes: Argument[];
  constructor(
    name: string,
    label: string | null = null,
    attributes: Argument[] = []
  ) {
    this.name = name;
    this.label = label;
    this.attributes = attributes;
  }
  marshal(): string {
    let out = `${this.name} `;
    if (this.label) {
      out += `"${this.label}" `
    }
    out += "{\n";
    this.attributes.forEach((a) => {
      out += "  " + a.marshal().replaceAll('\n','\n  ') + "\n";
    });
    out += "}";
    return out;
  }
  formValues(): Record<string,any> {
    let values: Record<string,any> = {};
    this.attributes.forEach((a) => {
      if (a instanceof Attribute) {
        values[`${a.name}`]=a.value;
      } else {
        const fv = a.formValues();
        values[a.name]=fv;
      }
    })
    return values;
  }
}

export class Attribute {
  name: string;
  value: any;
  constructor(name: string, value: any) {
    this.name = name;
    this.value = value;
  }
  marshal(): string {
    const begin = `${this.name} = `
    switch(typeof this.value){
      case "object":
      case "string":
        return begin + JSON.stringify(this.value);
      default:
        return begin + this.value
    }
  }
  formValues(): Record<string,any> {
    let v: Record<string,any> = {};
    v[this.name] = this.value;
    return v;
  }
}

interface Argument {
  name: string
  marshal(): string
  formValues(): Record<string,any>
}

export function Unmarshal(source: string, n: Parser.SyntaxNode): Block {
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
  const argNodes = n.childForFieldName("body")?.namedChildren;
  const args: Argument[] = [];
  if (argNodes) {
    for (const arg of argNodes) {
      switch (arg.type) {
        case "attribute":
          const keyNode = arg.childForFieldName("key")!;
          const valueNode = arg.childForFieldName("value")!;
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
          args.push(new Attribute(key,value))
          break;
        case "block":
          args.push(Unmarshal(source, arg))
      }
    }
  }
  return new Block(name, label, args);
}

export function toArgument(k: string,v: any): Argument {
  switch(typeof v) {
    case "string":
    case "number":
      return new Attribute(k,v);
    default:
      if (Array.isArray(v)) {
        return new Attribute(k,v)
      }
      return new Block(k,null,Object.keys(v).map(x => toArgument(x,v[x])))
  }
}
