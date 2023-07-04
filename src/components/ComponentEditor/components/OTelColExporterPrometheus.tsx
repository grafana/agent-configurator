import {
  FormAPI,
  InlineField,
  InlineSwitch,
  Input,
  VerticalGroup,
} from "@grafana/ui";
import ReferenceMultiSelect from "../inputs/ReferenceMultiSelect";

const Component = ({ methods }: { methods: FormAPI<Record<string, any>> }) => {
  const commonOptions = {
    labelWidth: 25,
  };
  return (
    <>
      <VerticalGroup>
        <InlineField label="Forward to" {...commonOptions}>
          <ReferenceMultiSelect
            control={methods.control}
            name="forward_to"
            exportName="PrometheusReceiver"
          />
        </InlineField>
        <InlineField
          label="Include target info"
          tooltip="Whether to include target_info metrics."
          {...commonOptions}
        >
          <InlineSwitch {...methods.register("include_target_info")} />
        </InlineField>
        <InlineField
          label="Include scope"
          tooltip="Whether to include otel_scope_info metrics."
          {...commonOptions}
        >
          <InlineSwitch {...methods.register("include_scope_info")} />
        </InlineField>
        <InlineField
          label="GC Frequency"
          tooltip="How often to clean up stale metrics from memory."
          {...commonOptions}
        >
          <Input placeholder="5m" {...methods.register("gc_frequency")} />
        </InlineField>
      </VerticalGroup>
    </>
  );
};

const OTelColExporterPrometheus = {
  preTransform(data: Record<string, any>): Record<string, any> {
    return data;
  },
  postTransform(data: Record<string, any>): Record<string, any> {
    return data;
  },
  Component,
};

export default OTelColExporterPrometheus;
