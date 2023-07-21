import { Destination } from "../types/destination";
import { TelemetryType } from "../types/telemetry";
import { MBadge } from "./badges";

const StaticPrometheus = {
  label: "Static Prometheus Target",
  value: "staticprometheus",
  imgUrl: `https://grafana.com/api/plugins/prometheus/versions/5.0.0/logos/small`,
  component: MBadge,
  supports: ["metrics"] as TelemetryType[],
  template(d: Destination) {
    return `prometheus.scrape "static" {
  forward_to = [
    ${d.metrics.receiver},
  ]
  targets = [
    {
      "__address__" = "localhost:8080",
      "environment" = "production",
    },
  ]
}
`;
  },
};
export default StaticPrometheus;
