import { MultiSelect } from "@grafana/ui";
import { useMemo } from "react";
import { Controller, useFormContext } from "react-hook-form";
import Sources from "../sources";
import { WizardFormValues } from "../types/form";

const SourcesInput = () => {
  const { control, watch } = useFormContext<WizardFormValues>();
  const telemetry = watch("telemetry");
  const options = useMemo(() => {
    const enabled: string[] = [];
    if (telemetry.metrics) enabled.push("metrics");
    if (telemetry.logs) enabled.push("logs");
    if (telemetry.traces) enabled.push("traces");
    if (telemetry.profiles) enabled.push("profiles");
    return Sources.filter((x) => x.supports?.some((s) => enabled.includes(s)));
  }, [telemetry]);
  return (
    <Controller
      control={control}
      name="sources"
      render={({ field: { ref, ...f } }) => (
        <MultiSelect
          onChange={(v) => f.onChange(v.map((x) => x.template))}
          options={options}
        />
      )}
    />
  );
};

export default SourcesInput;
