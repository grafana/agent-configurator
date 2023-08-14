import { Destination } from "../types/destination";
import { TelemetryType } from "../types/telemetry";
import { LBadge } from "./badges";

const WindowsNode = {
  label: "Windows Node",
  value: "windowsnode",
  imgUrl:
    "https://storage.googleapis.com/grafanalabs-integration-logos/windows.png",
  component: LBadge,
  supports: ["logs"] as TelemetryType[],
  template(d: Destination) {
    let out = "";
    if (d.logs.enabled) {
      out += `loki.relabel "windows_mapping" {
  forward_to = [${d.logs.receiver}]

  rule {
    source_labels = ["computer"]
    target_label  = "agent_hostname"
  }
}

loki.source.windowsevent "system" {
  forward_to = [
    loki.relabel.windows_mapping.receiver,
  ]
  eventlog_name = "System"
}
loki.source.windowsevent "application" {
  forward_to = [
    loki.relabel.windows_mapping.receiver,
  ]
  eventlog_name = "Application"
}
`;
    }
    return out;
  },
};

export default WindowsNode;
