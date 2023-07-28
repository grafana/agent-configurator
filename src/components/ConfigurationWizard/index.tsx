import { useModelContext } from "../../state";
import { CloudDestination } from "./destinations/cloud";
import { LocalDestination } from "./destinations/local";
import { Destination } from "./types/destination";
import { WizardFormBasicValues } from "./types/form";
import { faro } from "@grafana/faro-web-sdk";
import BasicConfiguration from "./components/BasicConfiguration";
import { useState } from "react";
import AdvancedConfiguration from "./components/AdvancedConfiguration";

const ConfigurationWizard = ({ dismiss }: { dismiss: () => void }) => {
  const { setModel } = useModelContext();
  const [basicValues, setBasicValues] = useState<WizardFormBasicValues | null>(
    null
  );
  const submitBasic = (data: WizardFormBasicValues) => {
    setBasicValues(data);
  };
  const submitAdvanced = (
    data: WizardFormBasicValues,
    advanced: Record<string, any>
  ) => {
    const destination: Destination =
      data.destination === "cloud"
        ? CloudDestination(data.stackName)
        : LocalDestination;

    destination.metrics.enabled = data.telemetry.metrics;
    destination.logs.enabled = data.telemetry.logs;
    destination.traces.enabled = data.telemetry.traces;
    destination.profiles.enabled = data.telemetry.profiles;

    let out = destination.template();
    for (const source of data.sources) {
      out += source.template(destination, advanced);
      out += "\n";
    }
    setModel(out);
    dismiss();
    faro.api?.pushEvent("used_wizard", {
      destination: data.destination,
      telemetry: JSON.stringify(data.telemetry),
      sources: JSON.stringify(data.sources.map((x) => x.label)),
    });
  };
  return (
    <>
      {basicValues === null && (
        <BasicConfiguration onSubmit={submitBasic} dismiss={dismiss} />
      )}
      {basicValues !== null && (
        <AdvancedConfiguration
          onSubmit={submitAdvanced}
          dismiss={dismiss}
          basicValues={basicValues}
        />
      )}
    </>
  );
};

export default ConfigurationWizard;
