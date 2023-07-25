import { FormAPI, InlineField, VerticalGroup } from "@grafana/ui";

import ReferenceMultiSelect from "../inputs/ReferenceMultiSelect";
import TargetSelector from "../common/TargetSelector";

const Component = ({ methods }: { methods: FormAPI<Record<string, any>> }) => {
  return (
    <>
      <VerticalGroup>
        <InlineField
          label="Forward to"
          tooltip="Receivers for the data scraped by this component"
          labelWidth={14}
          error="You must specify the destination"
          invalid={!!methods.errors["forward_to"]}
        >
          <ReferenceMultiSelect
            name="forward_to"
            exportName="PrometheusReceiver"
            control={methods.control}
          />
        </InlineField>
      </VerticalGroup>
      <TargetSelector.Component methods={methods} />
    </>
  );
};

const PrometheusScrape = {
  preTransform(data: Record<string, any>): Record<string, any> {
    return TargetSelector.preTransform(data);
  },
  postTransform(data: Record<string, any>): Record<string, any> {
    return TargetSelector.postTransform(data);
  },
  Component,
};

export default PrometheusScrape;
