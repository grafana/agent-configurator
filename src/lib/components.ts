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
  | "otel.LogsConsumer"
  | "otel.TracesConsumer"
  | "RelabelRules"
  | "ProfilesReceiver"
  | "otel.MetricsConsumer";

type Collection<T extends string> = `list(${T})` | `map(${T})`;

// adapted slightly from upstream to provide a safer way to select references
export type ExportType =
  | LiteralType
  | Capsule
  | Collection<Capsule | LiteralType>
  | Collection<Collection<Capsule | LiteralType>>;

export class LiteralArgument {
  arg_type: ExportType;
  def: any;
  type: "attribute" = "attribute";
  constructor(type: ExportType, def: any) {
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

const BasicAuthBlock = new BlockType({
  multi: false,
  args: {
    username: new LiteralArgument("string", ""),
    password: new LiteralArgument("string", ""),
    password_file: new LiteralArgument("string", ""),
  },
});

const TLSConfig = new BlockType({
  multi: false,
  args: {
    ca_pem: new LiteralArgument("string", ""),
    ca_file: new LiteralArgument("string", ""),
    cert_pem: new LiteralArgument("string", ""),
    cert_file: new LiteralArgument("string", ""),
    key_pem: new LiteralArgument("string", ""),
    key_file: new LiteralArgument("string", ""),
    server_name: new LiteralArgument("string", ""),
    insecure_skip_verify: new LiteralArgument("boolean", false),
  },
});

export const KnownComponents: Record<string, BlockType> = {
  "prometheus.remote_write": new BlockType({
    multi: true,
    exports: {
      receiver: "PrometheusReceiver",
    },
    args: {
      wal: new BlockType({
        multi: false,
        args: {
          truncate_frequency: new LiteralArgument("string", "2h"),
          min_keepalive_time: new LiteralArgument("string", "5m"),
          max_keepalive_time: new LiteralArgument("string", "8h"),
        },
      }),
      endpoint: new BlockType({
        multi: true,
        args: {
          name: new LiteralArgument("string", ""),
          url: new LiteralArgument("string", ""),
          send_exemplars: new LiteralArgument("boolean", true),
          send_native_histograms: new LiteralArgument("boolean", false),
          remote_timeout: new LiteralArgument("string", "30s"),
          tls_config: TLSConfig,
          basic_auth: BasicAuthBlock,
          enable_http2: new LiteralArgument("boolean", true),
          follow_redirects: new LiteralArgument("boolean", false),

          queue_config: new BlockType({
            multi: false,
            args: {
              capacity: new LiteralArgument("number", 10000),
              min_shards: new LiteralArgument("number", 1),
              max_shards: new LiteralArgument("number", 50),
              max_samples_per_send: new LiteralArgument("number", 2000),
              batch_send_deadline: new LiteralArgument("string", "5s"),
              min_backoff: new LiteralArgument("string", "30ms"),
              max_backoff: new LiteralArgument("string", "5s"),
              retry_on_http_429: new LiteralArgument("boolean", false),
            },
          }),
          metadata_config: new BlockType({
            multi: false,
            args: {
              send: new LiteralArgument("boolean", true),
              send_interval: new LiteralArgument("string", "1m"),
              max_samples_per_send: new LiteralArgument("number", 2000),
            },
          }),
        },
      }),
    },
  }),
  "loki.write": new BlockType({
    multi: true,
    exports: {
      receiver: "LokiReceiver",
    },
    args: {
      endpoint: new BlockType({
        multi: true,
        args: {
          name: new LiteralArgument("string", ""),
          url: new LiteralArgument("string", ""),
          batch_wait: new LiteralArgument("string", "1s"),
          batch_size: new LiteralArgument("string", "1MiB"),
          tenant_id: new LiteralArgument("string", ""),
          remote_timeout: new LiteralArgument("string", "10s"),
          tls_config: TLSConfig,
          basic_auth: BasicAuthBlock,
          enable_http2: new LiteralArgument("boolean", true),
          follow_redirects: new LiteralArgument("boolean", true),

          min_backoff_period: new LiteralArgument("string", "500ms"),
          max_backoff_period: new LiteralArgument("string", "5m"),
          max_backoff_retries: new LiteralArgument("number", 10),
        },
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
          values: new LiteralArgument("list(string)", []),
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
  "loki.source.windowsevent": new BlockType({
    multi: true,
    args: {
      event_log_name: new LiteralArgument("string", ""),
      forward_to: new LiteralArgument("list(LokiReceiver)", ""),
      xpath_query: new LiteralArgument("string", "*"),
      bookmark_path: new LiteralArgument("string", "DATA_PATH/bookmark.xml"),
      poll_interval: new LiteralArgument("string", "3s"),
      exclude_event_data: new LiteralArgument("boolean", false),
      exclude_user_data: new LiteralArgument("boolean", false),
      use_incoming_timestamp: new LiteralArgument("boolean", false),
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
    args: {
      follow_redirects: new LiteralArgument("boolean", true),
      enable_http2: new LiteralArgument("boolean", true),
      proxy_url: new LiteralArgument("string", ""),
      basic_auth: BasicAuthBlock,
      tls_config: TLSConfig,
      scrape_interval: new LiteralArgument("string", "60s"),
      scrape_timeout: new LiteralArgument("string", "10s"),
      scheme: new LiteralArgument("string", ""),
      job_name: new LiteralArgument("string", ""),
      extra_metrics: new LiteralArgument("boolean", false),
      honor_labels: new LiteralArgument("boolean", false),
      honor_timestamps: new LiteralArgument("boolean", true),
    },
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
  "pyroscope.scrape": new BlockType({
    multi: true,
    args: {
      targets: new LiteralArgument("list(Target)", []),
      forward_to: new LiteralArgument("list(ProfilesReceiver)", []),
      job_name: new LiteralArgument("string", ""),
      scrape_interval: new LiteralArgument("string", "15s"),
      scrape_timeout: new LiteralArgument("string", "15s"),
      scheme: new LiteralArgument("string", ""),
      bearer_token: new LiteralArgument("string", ""),
      bearer_token_file: new LiteralArgument("string", ""),
      proxy_url: new LiteralArgument("string", ""),
      follow_redirects: new LiteralArgument("boolean", true),
      enable_http2: new LiteralArgument("boolean", true),

      basic_auth: BasicAuthBlock,
      profiling_config: new BlockType({
        multi: false,
        args: {
          "profile.memory": new BlockType({
            args: {
              path: new LiteralArgument("string", "/debug/pprof/memory"),
              enabled: new LiteralArgument("boolean", true),
              delta: new LiteralArgument("boolean", false),
            },
          }),
          "profile.block": new BlockType({
            args: {
              path: new LiteralArgument("string", "/debug/pprof/block"),
              enabled: new LiteralArgument("boolean", true),
              delta: new LiteralArgument("boolean", false),
            },
          }),
          "profile.goroutine": new BlockType({
            args: {
              path: new LiteralArgument("string", "/debug/pprof/goroutine"),
              enabled: new LiteralArgument("boolean", true),
              delta: new LiteralArgument("boolean", false),
            },
          }),
          "profile.mutex": new BlockType({
            args: {
              path: new LiteralArgument("string", "/debug/pprof/mutex"),
              enabled: new LiteralArgument("boolean", true),
              delta: new LiteralArgument("boolean", false),
            },
          }),
          "profile.process_cpu": new BlockType({
            args: {
              path: new LiteralArgument("string", "/debug/pprof/profile"),
              enabled: new LiteralArgument("boolean", true),
              delta: new LiteralArgument("boolean", true),
            },
          }),
          "profile.fgprof": new BlockType({
            args: {
              path: new LiteralArgument("string", "/debug/fgprof"),
              enabled: new LiteralArgument("boolean", false),
              delta: new LiteralArgument("boolean", true),
            },
          }),
          "profile.custom": new BlockType({
            args: {
              path: new LiteralArgument("string", ""),
              enabled: new LiteralArgument("boolean", false),
              delta: new LiteralArgument("boolean", false),
            },
          }),
        },
      }),
    },
    exports: {},
  }),
};

export const KnownModules: Record<string, Record<string, BlockType>> = {
  "https://github.com/grafana/agent-modules.git": {
    "modules/grafana-cloud/autoconfigure/module.river": new BlockType({
      exports: {
        "exports.metrics_receiver": "PrometheusReceiver",
        "exports.logs_receiver": "LokiReceiver",
        "exports.traces_receiver": "otel.TracesConsumer",
        "exports.profiles_receiver": "ProfilesReceiver",
      },
    }),
  },
};
