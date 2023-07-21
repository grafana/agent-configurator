import { Destination } from "../types/destination";
import { TelemetryType } from "../types/telemetry";
import { LMBadge } from "./badges";

const LinuxNode = {
  label: "Linux Node",
  value: "linuxNode",
  imgUrl:
    "https://storage.googleapis.com/grafanalabs-integration-logos/linux.png",
  component: LMBadge,
  supports: ["logs", "metrics"] as TelemetryType[],
  template(d: Destination) {
    let out = "";
    if (d.metrics.enabled) {
      out += `prometheus.scrape "linux_node" {
  targets = prometheus.exporter.unix.targets
  forward_to = [
    ${d.metrics.receiver},
  ]
}

prometheus.exporter.unix {
}

`;
    }
    if (d.logs.enabled) {
      out += `loki.relabel "journal" {
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
    ${d.logs.receiver},
  ]
  relabel_rules = loki.relabel.journal.rules
  labels = {
    "job" = "integrations/node_exporter",
  }
}`;
    }
    return out;
  },
};

export default LinuxNode;
