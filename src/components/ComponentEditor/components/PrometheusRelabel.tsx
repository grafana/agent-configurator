import { FormAPI, InlineField } from "@grafana/ui";
import ReferenceMultiSelect from "../inputs/ReferenceMultiSelect";
import { RelabelRules, transformRules } from "../common/RelabelRules";

const Component = ({ methods }: { methods: FormAPI<Record<string, any>> }) => {
  return (
    <>
      <InlineField
        label="Forward to"
        tooltip="Where the metrics should be forwarded to, after relabeling takes place."
        labelWidth={22}
        error="You must specify a list of destinations"
        invalid={!!methods.errors["targets"]}
      >
        <ReferenceMultiSelect
          name="forward_to"
          exportName="PrometheusReceiver"
          control={methods.control}
        />
      </InlineField>
      <RelabelRules methods={methods} />
    </>
  );
};
const PrometheusRelabel = {
  preTransform(data: Record<string, any>): Record<string, any> {
    return data;
  },
  postTransform(data: Record<string, any>): Record<string, any> {
    return transformRules(data);
  },
  Component,
};
export default PrometheusRelabel;
