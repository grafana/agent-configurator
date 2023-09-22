import { Attribute, Block } from "../../lib/river";

function promScrapePushExample(collector: Block): string {
  return (
    `module.git "grafana_cloud" {
  repository = "https://github.com/grafana/agent-modules.git"
  path = "modules/grafana-cloud/autoconfigure/module.river"
  revision = "main"
  pull_frequency = "0s"
  arguments {
    stack_name = "stackname" // Replace this with your stack name
    token = env("GRAFANA_CLOUD_TOKEN") 
  }
}

prometheus.scrape "default" {
  targets = ${collector.name}.${collector.label ? collector.label + "." : ""
    }targets
  forward_to = [
    module.git.grafana_cloud.exports.metrics_receiver,
  ]
}
` +
    collector.marshal() +
    "\n\n"
  );
}

const Examples: Array<{ name: string; source: string; logo: string }> = [
  {
    name: "Redis",
    source: promScrapePushExample(
      new Block("prometheus.exporter.redis", "default", [
        new Attribute("redis_addr", "localhost:6379"),
      ]),
    ),
    logo: "https://storage.googleapis.com/grafanalabs-integration-logos/redis.png",
  },
  {
    name: "MySQL",
    source: promScrapePushExample(
      new Block("prometheus.exporter.mysql", "default", [
        new Attribute("data_source_name", "root@(server-a:3306)/"),
      ]),
    ),
    logo: "https://storage.googleapis.com/grafanalabs-integration-logos/mysql.png",
  },
  {
    name: "GitHub",
    source: promScrapePushExample(
      new Block("prometheus.exporter.github", "default", []),
    ),
    logo: "https://storage.googleapis.com/grafanalabs-integration-logos/github.png",
  },
  {
    name: "OpenTelemetry to Grafana Cloud",
    source: `module.git "grafana_cloud" {
  repository = "https://github.com/grafana/agent-modules.git"
  path = "modules/grafana-cloud/autoconfigure/module.river"
  revision = "main"
  pull_frequency = "0s"
  arguments {
    stack_name = "stackname" // Replace this with your stack name
    token = env("GRAFANA_CLOUD_TOKEN")
  }
}
otelcol.exporter.prometheus "to_prometheus" {
  forward_to = [
    module.git.grafana_cloud.exports.metrics_receiver,
  ]
}
otelcol.exporter.loki "to_loki" {
  forward_to = [
    module.git.grafana_cloud.exports.logs_receiver,
  ]
}
otelcol.receiver.otlp "default" {
  grpc {
  }
  http {
  }
  output {
    metrics = [
      otelcol.exporter.prometheus.to_prometheus.input,
    ]
    logs = [
      otelcol.exporter.loki.to_loki.input,
    ]
    traces = [
      module.git.grafana_cloud.exports.traces_receiver,
    ]
  }
}
`,
    logo: `${process.env.PUBLIC_URL}/logos/otel.png`,
  },
  {
    name: "Monitor a Linux Host",
    source: `module.git "grafana_cloud" {
  repository = "https://github.com/grafana/agent-modules.git"
  path = "modules/grafana-cloud/autoconfigure/module.river"
  revision = "main"
  pull_frequency = "0s"
  arguments {
    stack_name = "stackname" // Replace this with your stack name
    token = env("GRAFANA_CLOUD_TOKEN")
  }
}

prometheus.scrape "default" {
  targets = prometheus.exporter.unix.targets
  forward_to = [
    module.git.grafana_cloud.exports.metrics_receiver,
  ]
}

prometheus.exporter.unix {
}

loki.relabel "journal" {
  forward_to = []

  rule {
    source_labels = ["__journal__systemd_unit"]
    target_label  = "unit"
  }
  rule {
    source_labels = ["__journal__boot_id"]
    target_label  = "boot_id"
  }
  rule {
    source_labels = ["__journal__transport"]
    target_label  = "transport"
  }
  rule {
    source_labels = ["__journal_priority_keyword"]
    target_label  = "level"
  }
  rule {
    source_labels = ["__journal__hostname"]
    target_label  = "instance"
  }
}

loki.source.journal "read" {
  forward_to = [
    module.git.grafana_cloud.exports.logs_receiver,
  ]
  relabel_rules = loki.relabel.journal.rules
  labels = {
    "job" = "integrations/node_exporter",
  }
}
`,
    logo: "https://storage.googleapis.com/grafanalabs-integration-logos/linux.png",
  },
];
export default Examples;
