import { Destination } from "../types/destination";
import { TelemetryType } from "../types/telemetry";
import { PBadge } from "./badges";

const StaticProfiling = {
  label: "Static Profiling Target",
  value: "profiling",
  imgUrl: `${process.env.PUBLIC_URL}/logos/pyroscope.svg`,
  component: PBadge,
  supports: ["profiles"] as TelemetryType[],
  template(d: Destination) {
    return `pyroscope.scrape "local" {
  targets    = [
    {"__address__" = "localhost:4100", "service_name"="pyroscope"},
  ]
  forward_to = [${d.profiles.receiver}]
}
`;
  },
};
export default StaticProfiling;
