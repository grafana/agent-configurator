type LiteralType = "string" | "number" | "boolean" | "list(string)";

export class LiteralArgument {
  type: LiteralType;
  def: any;
  constructor(type: LiteralType, def: any) {
    this.type = type;
    this.def = def;
  }
  isBlock(): boolean {
    return false;
  }
  multiple(): boolean {
    return false;
  }
  default(): any {
    return this.def;
  }
}

export class BlockType {
  args: Record<string, ArgumentType> = {};
  multi: boolean = false;
  allowEmpty: boolean = false;
  isBlock(): boolean {
    return true;
  }
  multiple(): boolean {
    return this.multi;
  }
  constructor({ multi = false, args = {}, allowEmpty = false }) {
    this.multi = multi;
    this.args = args;
    this.allowEmpty = allowEmpty;
  }
  default(): any {
    if (this.multi) return [];
    const blockDefaults: Record<string, any> = {};
    for (const k of Object.keys(this.args)) {
      blockDefaults[k] = this.args[k].default();
    }
    return blockDefaults;
  }
}

export interface ArgumentType {
  isBlock(): boolean;
  multiple(): boolean;
  default(): any;
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
          name: new LiteralArgument("string", ""),
          value: new LiteralArgument("list(string)", []),
        },
      }),
    },
  }),
  "otelcol.receiver.otlp": new BlockType({
    args: {
      grpc: new BlockType({
        allowEmpty: true,
        multi: false,
        args: {
          include_metadata: new LiteralArgument("boolean", false),
        },
      }),
      http: new BlockType({
        multi: false,
        allowEmpty: true,
        args: {
          include_metadata: new LiteralArgument("boolean", false),
        },
      }),
    },
  }),
  "otelcol.exporter.prometheus": new BlockType({
    args: {
      include_target_info: new LiteralArgument("boolean", true),
      include_scope_info: new LiteralArgument("boolean", true),
    },
  }),
};
