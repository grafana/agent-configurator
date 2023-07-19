import { FormAPI, InlineField } from "@grafana/ui";
import { RelabelRules, transformRules } from "../common/RelabelRules";
import ReferenceSelect from "../inputs/ReferenceSelect";

const Component = ({ methods }: { methods: FormAPI<Record<string, any>> }) => {
  return (
    <>
      <InlineField
        label="Targets"
        tooltip="Targets to relabel"
        labelWidth={22}
        error="You must specify a list of destinations"
        invalid={!!methods.errors["targets"]}
      >
        <ReferenceSelect
          name="targets"
          exportName="list(Target)"
          control={methods.control}
        />
      </InlineField>

      <RelabelRules methods={methods} />
    </>
  );
};

const DiscoveryRelabel = {
  preTransform(data: Record<string, any>): Record<string, any> {
    return data;
  },
  postTransform(data: Record<string, any>): Record<string, any> {
    return transformRules(data);
  },
  Component,
};
export default DiscoveryRelabel;
