import { Destination } from "../types/destination";
import { TelemetryType } from "../types/telemetry";
import { MBadge } from "./badges";

const GitHub = {
  label: "GitHub",
  value: "github",
  imgUrl: `https://storage.googleapis.com/grafanalabs-integration-logos/github.png`,
  component: MBadge,
  supports: ["metrics"] as TelemetryType[],
  template(d: Destination) {
    return `prometheus.scrape "github" {
  targets = prometheus.exporter.github.targets
  forward_to = [
    ${d.metrics.receiver},
  ]
}

prometheus.exporter.github "default" {
}`;
  },
};
export default GitHub;
