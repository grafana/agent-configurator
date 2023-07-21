export const LocalDestination = {
  metrics: {
    enabled: true,
    receiver: "prometheus.remote_write.local.receiver",
  },
  logs: {
    enabled: true,
    receiver: "loki.write.local.receiver",
  },
  traces: {
    enabled: true,
    receiver: "otelcol.exporter.otlp.local.input",
  },
  profiles: {
    enabled: true,
    receiver: "pyroscope.remote_write.default.receiver",
  },
  template(): string {
    let out = "";
    if (this.metrics.enabled) {
      out += `prometheus.remote_write "default" {
  endpoint {
    url = "http://mimir:9009/api/v1/push"
  }
}

`;
    }
    if (this.logs.enabled) {
      out += `loki.write "local" {
  endpoint {
    url = "http://loki:3100/loki/api/v1/push"
  }
}

`;
    }
    if (this.traces.enabled) {
      out += `otelcol.exporter.otlp "local" {
  client {
    endpoint = "tempo:4317"
  }
}

`;
    }
    if (this.profiles.enabled) {
      out += `pyroscope.write "staging" {
  endpoint {
    url = "http://pyroscope:4100"
  }
}

`;
    }
    return out;
  },
};
