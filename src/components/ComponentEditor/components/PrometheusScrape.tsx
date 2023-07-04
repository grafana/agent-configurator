import { FormAPI, InlineField } from "@grafana/ui";
import ReferenceSelect from "../inputs/ReferenceSelect";
import ReferenceMultiSelect from "../inputs/ReferenceMultiSelect";

const PrometheusScrape = ({
  methods,
}: {
  methods: FormAPI<Record<string, any>>;
}) => {
  return (
    <>
      <InlineField
        label="Targets"
        tooltip="List of targets to scrape."
        labelWidth={14}
        error="You must specify the targets parameter"
        invalid={!!methods.errors["targets"]}
      >
        <ReferenceSelect
          name="targets"
          exportName="list(PrometheusTarget)"
          control={methods.control}
        />
      </InlineField>
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
    </>
  );
};

export default PrometheusScrape;
