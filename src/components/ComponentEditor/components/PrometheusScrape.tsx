import { Field, Input } from "@grafana/ui";
import TargetList from "../inputs/TargetList";

const PrometheusScrape = ({ register }: { register: any }) => {
  return (
    <>
      <Field label="Targets" description="	List of targets to scrape.">
        <TargetList register={register} />
      </Field>
    </>
  );
};

export default PrometheusScrape;
