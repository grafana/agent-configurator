import { Field, FormAPI } from "@grafana/ui";
import ReferenceSelect from "../inputs/ReferenceSelect";

const PrometheusScrape = ({
  methods,
}: {
  methods: FormAPI<Record<string, any>>;
}) => {
  return (
    <>
      <Field label="Targets" description="List of targets to scrape.">
        <ReferenceSelect
          name="targets"
          exportName="targets"
          control={methods.control}
        />
      </Field>
      <Field
        label="Forward to"
        description="Receivers for the data scraped by this component"
      >
        <ReferenceSelect
          name="forward_to"
          exportName="receiver"
          control={methods.control}
        />
      </Field>
    </>
  );
};

export default PrometheusScrape;
