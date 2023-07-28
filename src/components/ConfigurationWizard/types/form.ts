import { SelectableValue } from "@grafana/data";
import { DestinationFormType } from "./destination";
export type WizardFormBasicValues = {
  destination: DestinationFormType;
  stackName?: string;
  telemetry: {
    logs: boolean;
    metrics: boolean;
    traces: boolean;
    profiles: boolean;
  };
  // cannot use 'Source[]' here due to https://github.com/orgs/react-hook-form/discussions/7764
  sources: SelectableValue[];
};

export const WizardFormDefaults: WizardFormBasicValues = {
  destination: "cloud",
  telemetry: {
    logs: true,
    metrics: true,
    traces: true,
    profiles: true,
  },
  sources: [],
};

export type AdvancedFormProps = {
  basicValues: WizardFormBasicValues;
};
