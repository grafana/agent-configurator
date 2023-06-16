import { Form, Field, Input, Button, FormAPI } from "@grafana/ui";
import { Block, toBlock } from "../../lib/river";
import PrometheusRemoteWrite from "./components/PrometheusRemoteWrite";
import PrometheusExporterRedis from "./components/PrometheusExporterRedis";
import PrometheusScrape from "./components/PrometheusScrape";
import UnsupportedComponent from "./components/UnsupportedComponent";

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

  const componentForm = (methods: FormAPI<Record<string, any>>) => {
    switch (component.name) {
      case "prometheus.remote_write":
        return <PrometheusRemoteWrite methods={methods} />;
      case "prometheus.exporter.redis":
        return <PrometheusExporterRedis methods={methods} />;
      case "prometheus.scrape":
        return <PrometheusScrape methods={methods} />;
      default:
        return <UnsupportedComponent />;
    }
  };

  return (
    <Form
      onSubmit={async ({ label, ...args }) => {
        updateComponent(toBlock(component.name, args, label)!);
      }}
      defaultValues={formValues}
    >
      {(methods) => {
        const { register, errors } = methods;
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
            {componentForm(methods)}
            <Button type="submit">Save</Button>
          </>
        );
      }}
    </Form>
  );
};

export default ComponentEditor;
