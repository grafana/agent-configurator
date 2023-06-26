type LiteralType = "string" | "int" | "list(string)";

export class LiteralArgument {
  type: LiteralType;
  constructor(type: LiteralType) {
    this.type = type;
  }
  isBlock(): boolean {
    return false;
  }
  multiple(): boolean {
    return false;
  }
}

export class BlockType {
  args: Record<string, ArgumentType> = {};
  multi: boolean = false;
  isBlock(): boolean {
    return true;
  }
  multiple(): boolean {
    return this.multi;
  }
  constructor({ multi = false, args = {} }) {
    this.multi = multi;
    this.args = args;
  }
}

interface ArgumentType {
  isBlock(): boolean;
  multiple(): boolean;
}

export const KnownComponents: Record<string, BlockType> = {
  "prometheus.remote_write": new BlockType({
    args: {
      endpoint: new BlockType({
        multi: true,
      }),
    },
  }),
  "discovery.ec2": new BlockType({
    args: {
      filter: new BlockType({
        multi: true,
        args: {
          name: "string",
          value: "list(string)",
        },
      }),
    },
  }),
};
