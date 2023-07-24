import { Badge, HorizontalGroup } from "@grafana/ui";

export const LogsBadge = () => (
  <Badge icon="gf-logs" color="orange" text="Logs" />
);
export const MetricsBadge = () => (
  <Badge icon="chart-line" color="blue" text="Metrics" />
);
export const TracesBadge = () => (
  <Badge icon="list-ui-alt" color="purple" text="Traces" />
);
export const ProfilesBadge = () => (
  <Badge icon="dashboard" color="red" text="Profiles" />
);
export const LMBadge = () => (
  <HorizontalGroup>
    <LogsBadge />
    <MetricsBadge />
  </HorizontalGroup>
);
export const LMPBadge = () => (
  <HorizontalGroup>
    <LogsBadge />
    <MetricsBadge />
    <ProfilesBadge />
  </HorizontalGroup>
);
export const LMTBadge = () => (
  <HorizontalGroup>
    <LogsBadge />
    <MetricsBadge />
    <TracesBadge />
  </HorizontalGroup>
);
export const LBadge = () => (
  <HorizontalGroup>
    <LogsBadge />
  </HorizontalGroup>
);
export const MBadge = () => (
  <HorizontalGroup>
    <MetricsBadge />
  </HorizontalGroup>
);
export const PBadge = () => (
  <HorizontalGroup>
    <ProfilesBadge />
  </HorizontalGroup>
);
