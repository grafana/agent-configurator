import { DestinationFormType } from "./destination";
import { SourceTransformer } from "./source";
export type WizardFormValues = {
  destination: DestinationFormType;
  stackName?: string;
  telemetry: {
    logs: boolean;
    metrics: boolean;
    traces: boolean;
    profiles: boolean;
  };
  sources: SourceTransformer[];
};

export const WizardFormDefaults: WizardFormValues = {
  destination: "cloud",
  telemetry: {
    logs: true,
    metrics: true,
    traces: true,
    profiles: true,
  },
  sources: [],
};
