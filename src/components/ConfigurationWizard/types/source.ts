import { Destination } from "./destination";
import { TelemetryType } from "./telemetry";

export type SourceTransformer = (d: Destination) => string;

export interface Source {
  template: SourceTransformer;
  value: string;
  label: string;
  imgUrl: string;
  supports: TelemetryType[];
  component: React.ComponentType;
}
