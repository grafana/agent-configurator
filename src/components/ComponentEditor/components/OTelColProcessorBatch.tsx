import { FormAPI, InlineField, Input, VerticalGroup } from "@grafana/ui";
import ReferenceMultiSelect from "../inputs/ReferenceMultiSelect";

const Component = ({ methods }: { methods: FormAPI<Record<string, any>> }) => {
  const commonOptions = {
    labelWidth: 25,
  };
  return (
    <>
      <VerticalGroup>
        <InlineField
          label="Timeout"
          tooltip="How long to wait before flushing the batch."
          {...commonOptions}
        >
          <Input {...methods.register("timeout")} placeholder="200ms" />
        </InlineField>
        <InlineField
          label="Batch size"
          tooltip="Amount of data to buffer before flushing the batch."
          {...commonOptions}
        >
          <Input
            type="number"
            {...methods.register("send_batch_size", { valueAsNumber: true })}
            placeholder="8192"
          />
        </InlineField>
        <InlineField
          label="Max batch size"
          tooltip="Upper limit of a batch size."
          {...commonOptions}
        >
          <Input
            type="number"
            {...methods.register("send_batch_max_size", {
              valueAsNumber: true,
            })}
            placeholder="0"
          />
        </InlineField>
      </VerticalGroup>
      <h3 className="page-heading">Output</h3>
      <VerticalGroup>
        <InlineField label="Metrics" {...commonOptions}>
          <ReferenceMultiSelect
            control={methods.control}
            name="output.metrics"
            exportName="input"
          />
        </InlineField>
        <InlineField label="Logs" {...commonOptions}>
          <ReferenceMultiSelect
            control={methods.control}
            name="output.logs"
            exportName="input"
          />
        </InlineField>
        <InlineField label="traces" {...commonOptions}>
          <ReferenceMultiSelect
            control={methods.control}
            name="output.traces"
            exportName="input"
          />
        </InlineField>
      </VerticalGroup>
    </>
  );
};

const OTelColProcessorBatch = {
  preTransform(data: Record<string, any>): Record<string, any> {
    return data;
  },
  postTransform(data: Record<string, any>): Record<string, any> {
    return data;
  },
  Component,
};

export default OTelColProcessorBatch;
