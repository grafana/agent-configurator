import { Destination } from "../types/destination";
import { TelemetryType } from "../types/telemetry";
import { LMBadge } from "./badges";

const WindowsNode = {
  label: "Windows Node",
  value: "windowsnode",
  imgUrl:
    "https://storage.googleapis.com/grafanalabs-integration-logos/windows.png",
  component: LMBadge,
  supports: ["logs", "metrics"] as TelemetryType[],
  template(d: Destination) {
    let out = "";
    if (d.metrics.enabled) {
      out += `prometheus.relabel "windows_add_job" {
  rule {
    target_label = "job"
    replacement = "integrations/windows_exporter"
  }
  rule {
    source_labels = ["instance"]
    target_label  = "agent_hostname"
  }
  forward_to = [
    ${d.metrics.receiver},
  ]
}

prometheus.scrape "windows_node" {
  targets = prometheus.exporter.windows.default.targets
  forward_to = [
    prometheus.relabel.windows_add_job.receiver,
  ]
}

prometheus.exporter.windows "default" {
}

`;
    }
    if (d.logs.enabled) {
      out += `loki.relabel "windows_mapping" {
  forward_to = [${d.logs.receiver}]

  rule {
    source_labels = ["computer"]
    target_label  = "agent_hostname"
  }
}

loki.process "parse_eventlog" {
  forward_to = [
    loki.relabel.windows_mapping.receiver,
  ]
  stage.json {
    expressions = {
      "source"  = "source",
    }
  }
  stage.labels {
    values = {
      "source"  = "source",
    }
  }
}

loki.source.windowsevent "system" {
  forward_to = [
    loki.process.parse_eventlog.receiver,
  ]
  eventlog_name = "System"
}
loki.source.windowsevent "application" {
  forward_to = [
    loki.process.parse_eventlog.receiver,
  ]
  eventlog_name = "Application"
}
`;
    }
    return out;
  },
};

export default WindowsNode;
