import { Field, FormAPI } from "@grafana/ui";
import ReferenceSelect from "../inputs/ReferenceSelect";
import ReferenceMultiSelect from "../inputs/ReferenceMultiSelect";

const PrometheusScrape = ({
  methods,
}: {
  methods: FormAPI<Record<string, any>>;
}) => {
  console.log(methods);
  return (
    <>
      <Field
        label="Targets"
        description="List of targets to scrape."
        error="You must specify the targets parameter"
        invalid={!!methods.errors["targets"]}
      >
        <ReferenceSelect
          name="targets"
          exportName="targets"
          control={methods.control}
        />
      </Field>
      <Field
        label="Forward to"
        description="Receivers for the data scraped by this component"
        error="You must specify the destination"
        invalid={!!methods.errors["forward_to"]}
      >
        <ReferenceMultiSelect
          name="forward_to"
          exportName="receiver"
          control={methods.control}
        />
      </Field>
    </>
  );
};

export default PrometheusScrape;
