import { Form, Field, Input, Button } from "@grafana/ui";
import { Block, toArgument } from "../../lib/river";
import PrometheusRemoteWrite from "./components/PrometheusRemoteWrite";
import PrometheusExporterRedis from "./components/PrometheusExporterRedis";
import PrometheusScrape from "./components/PrometheusScrape";
import UnsupportedComponent from "./components/UnsupportedComponent";
import { Control, UseFormRegister } from "react-hook-form";

interface ComponentEditorProps {
  updateComponent: (component: Block) => void;
  component: Block;
}
const ComponentEditor = ({
  updateComponent,
  component,
}: ComponentEditorProps) => {
  let formValues = component.formValues();
  formValues["label"] = component.label;

  const componentForm = (
    register: UseFormRegister<Record<string, any>>,
    control: Control<Record<string, any>>
  ) => {
    switch (component.name) {
      case "prometheus.remote_write":
        return <PrometheusRemoteWrite register={register} />;
      case "prometheus.exporter.redis":
        return <PrometheusExporterRedis register={register} />;
      case "prometheus.scrape":
        return <PrometheusScrape control={control} />;
      default:
        return <UnsupportedComponent />;
    }
  };

  return (
    <Form
      onSubmit={async (values) => {
        updateComponent(
          new Block(
            component.name,
            values.label,
            Object.keys(values)
              .filter((x) => x !== "label")
              .map((x) => toArgument(x, values[x]))
          )
        );
      }}
      defaultValues={formValues}
    >
      {({ register, errors, control }) => {
        return (
          <>
            <Field
              label="Label"
              description="Component Label"
              invalid={!!errors["label"]}
              error="A label is required"
            >
              <Input {...register("label", { required: true })} />
            </Field>
            {componentForm(register, control)}
            <Button type="submit">Save</Button>
          </>
        );
      }}
    </Form>
  );
};

export default ComponentEditor;
