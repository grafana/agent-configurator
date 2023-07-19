type LiteralType =
  | "string"
  | "number"
  | "boolean"
  | "list(string)"
  | "map(string)";

type Capsule =
  | "Target"
  | "PrometheusReceiver"
  | "LokiReceiver"
  | "PyroscopeReceiver"
  | "otel.LogsConsumer"
  | "otel.TracesConsumer"
  | "RelabelRules"
  | "otel.MetricsConsumer";

type Collection =
  | `list(${Capsule | LiteralType})`
  | `map(${Capsule | LiteralType})`;

// adapted slightly from upstream to provide a safer way to select references
export type ExportType = LiteralType | Capsule | Collection;

export class LiteralArgument {
  arg_type: LiteralType;
  def: any;
  type: "attribute" = "attribute";
  constructor(type: LiteralType, def: any) {
    this.arg_type = type;
    this.def = def;
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
  exports: Record<string, ExportType> = {};
  multi: boolean = false;
  allowEmpty: boolean = false;
  type: "block" = "block";
  multiple(): boolean {
    return this.multi;
  }
  constructor({
    multi = false,
    args = {},
    allowEmpty = false,
    exports = {},
  }: {
    multi?: boolean;
    args?: Record<string, ArgumentType>;
    allowEmpty?: boolean;
    exports?: Record<string, ExportType>;
  }) {
    this.multi = multi;
    this.args = args;
    this.allowEmpty = allowEmpty;
    this.exports = exports;
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
  multiple(): boolean;
  default(): any;
  type: "block" | "attribute";
}

export const KnownComponents: Record<string, BlockType> = {
  "prometheus.remote_write": new BlockType({
    multi: true,
    exports: {
      receiver: "PrometheusReceiver",
    },
    args: {
      endpoint: new BlockType({
        multi: true,
      }),
    },
  }),
  "discovery.ec2": new BlockType({
    multi: true,
    exports: {
      targets: "list(Target)",
    },
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
    multi: true,
    exports: {
      targets: "list(Target)",
    },
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
    multi: true,
    args: {
      include_target_info: new LiteralArgument("boolean", true),
      include_scope_info: new LiteralArgument("boolean", true),
    },
    exports: {
      input: "otel.MetricsConsumer",
    },
  }),
  "otelcol.exporter.loki": new BlockType({
    exports: {
      input: "otel.LogsConsumer",
    },
  }),
  "prometheus.exporter.github": new BlockType({
    multi: true,
    exports: {
      targets: "list(Target)",
    },
  }),
  "prometheus.exporter.redis": new BlockType({
    multi: true,
    exports: {
      targets: "list(Target)",
    },
    args: {
      namespace: new LiteralArgument("string", "redis"),
      config_command: new LiteralArgument("string", "CONFIG"),
      check_key_groups_batch_size: new LiteralArgument("number", 10000),
      max_distinct_key_groups: new LiteralArgument("number", 100),
      connection_timeout: new LiteralArgument("string", "15s"),
      is_cluster: new LiteralArgument("boolean", false),
      skip_tls_verification: new LiteralArgument("boolean", false),
      incl_system_metrics: new LiteralArgument("boolean", false),
      ping_on_connect: new LiteralArgument("boolean", false),
      redis_metrics_only: new LiteralArgument("boolean", false),
      export_client_port: new LiteralArgument("boolean", false),
      export_client_list: new LiteralArgument("boolean", false),
      is_tile38: new LiteralArgument("boolean", false),
      set_client_name: new LiteralArgument("boolean", true),
    },
  }),
  "module.git": new BlockType({
    multi: true,
  }),
  "prometheus.exporter.unix": new BlockType({
    allowEmpty: true,
    multi: false,
    exports: {
      targets: "list(Target)",
    },
    args: {
      set_collectors: new LiteralArgument("list(string)", []),
      enable_collectors: new LiteralArgument("list(string)", []),
      disable_collectors: new LiteralArgument("list(string)", []),
      include_exporter_metrics: new LiteralArgument("boolean", false),
      procfs_path: new LiteralArgument("string", "/proc"),
      sysfs_path: new LiteralArgument("string", "/sys"),
      rootfs_path: new LiteralArgument("string", "/"),
    },
  }),
  "local.file_match": new BlockType({
    multi: true,
    exports: {
      targets: "list(Target)",
    },
  }),
  "loki.source.file": new BlockType({
    multi: true,
  }),
  "loki.source.journal": new BlockType({
    multi: true,
    args: {
      format_as_json: new LiteralArgument("boolean", false),
      max_age: new LiteralArgument("string", "7h"),
      path: new LiteralArgument("string", ""),
      matches: new LiteralArgument("string", ""),
      labels: new LiteralArgument("map(string)", {}),
    },
  }),
  "loki.relabel": new BlockType({
    multi: true,
    args: {
      max_cache_size: new LiteralArgument("number", 10000),
      rule: new BlockType({
        multi: true,
        args: {
          target_label: new LiteralArgument("string", ""),
          action: new LiteralArgument("string", "replace"),
        },
      }),
    },
    exports: {
      receiver: "LokiReceiver",
      relabel_rules: "RelabelRules",
    },
  }),
  "prometheus.relabel": new BlockType({
    multi: true,
    args: {
      rule: new BlockType({
        multi: true,
        args: {
          target_label: new LiteralArgument("string", ""),
          action: new LiteralArgument("string", "replace"),
        },
      }),
    },
    exports: {
      receiver: "PrometheusReceiver",
      relabel_rules: "RelabelRules",
    },
  }),
  "prometheus.scrape": new BlockType({
    multi: true,
  }),
  "discovery.kubernetes": new BlockType({
    multi: true,
    args: {
      follow_redirects: new LiteralArgument("boolean", true),
      enable_http2: new LiteralArgument("boolean", true),
      selectors: new BlockType({ multi: true }),
      attach_metadata: new BlockType({
        args: {
          node: new LiteralArgument("boolean", false),
        },
      }),
    },
    exports: {
      targets: "list(Target)",
    },
  }),
  "discovery.relabel": new BlockType({
    multi: true,
    args: {
      rule: new BlockType({
        multi: true,
        args: {
          target_label: new LiteralArgument("string", ""),
          action: new LiteralArgument("string", "replace"),
        },
      }),
    },
    exports: {
      output: "list(Target)",
      rules: "RelabelRules",
    },
  }),
};

export const KnownModules: Record<string, Record<string, BlockType>> = {
  "https://github.com/grafana/agent-modules.git": {
    "modules/grafana-cloud/autoconfigure/module.river": new BlockType({
      exports: {
        "exports.metrics_receiver": "PrometheusReceiver",
        "exports.logs_receiver": "LokiReceiver",
        "exports.traces_receiver": "otel.TracesConsumer",
        "exports.profiles_receiver": "PyroscopeReceiver",
      },
    }),
  },
};
