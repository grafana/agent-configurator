import { Destination } from "./destination";
import { AdvancedFormProps } from "./form";
import { TelemetryType } from "./telemetry";

export type SourceTransformer = (
  d: Destination,
  advanced?: Record<string, any>
) => string;

export interface Source {
  template: SourceTransformer;
  value: string;
  label: string;
  imgUrl: string;
  supports: TelemetryType[];
  component: React.ComponentType;
  advancedForm?: (props: AdvancedFormProps) => JSX.Element;
  defaults?: Record<string, any>;
}
