import { Field } from "@grafana/ui";
import ReferenceSelect from "../inputs/ReferenceSelect";
import { Control } from "react-hook-form";

const PrometheusScrape = ({
  control,
}: {
  control: Control<Record<string, any>>;
}) => {
  return (
    <>
      <Field label="Targets" description="List of targets to scrape.">
        <ReferenceSelect
          name="targets"
          exportName="targets"
          control={control}
        />
      </Field>
      <Field
        label="Forward to"
        description="Receivers for the data scraped by this component"
      >
        <ReferenceSelect
          name="forward_to"
          exportName="receiver"
          control={control}
        />
      </Field>
    </>
  );
};

export default PrometheusScrape;
