import { MultiSelect } from "@grafana/ui";
import { useMemo } from "react";
import { Controller, useFormContext } from "react-hook-form";
import Sources from "../sources";
import { WizardFormBasicValues } from "../types/form";

const SourcesInput = () => {
  const {
    control,
    watch,
    formState: { errors },
  } = useFormContext<WizardFormBasicValues>();
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
          menuPlacement="top"
          onChange={f.onChange}
          options={options}
          invalid={!!errors?.sources}
        />
      )}
      rules={{ required: true }}
    />
  );
};

export default SourcesInput;
