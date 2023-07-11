import { FormAPI, InlineField, VerticalGroup } from "@grafana/ui";
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
            exportName="LokiReceiver"
          />
        </InlineField>
      </VerticalGroup>
    </>
  );
};

const OTelColExporterLoki = {
  preTransform(data: Record<string, any>): Record<string, any> {
    return data;
  },
  postTransform(data: Record<string, any>): Record<string, any> {
    return data;
  },
  Component,
};

export default OTelColExporterLoki;
