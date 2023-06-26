import { Form, Field, Input, Button, FormAPI } from "@grafana/ui";
import { Block, toBlock } from "../../lib/river";
import PrometheusRemoteWrite from "./components/PrometheusRemoteWrite";
import PrometheusExporterRedis from "./components/PrometheusExporterRedis";
import PrometheusScrape from "./components/PrometheusScrape";
import UnsupportedComponent from "./components/UnsupportedComponent";
import PrometheusExporterMysql from "./components/PrometheusExporterMysql";
import PrometheusExporterGithub from "./components/PrometheusExporterGithub";
import DiscoveryEc2 from "./components/DiscoveryEc2";
import { KnownComponents } from "../../lib/components";

interface ComponentEditorProps {
  updateComponent: (component: Block) => void;
  component: Block;
}
const ComponentEditor = ({
  updateComponent,
  component,
}: ComponentEditorProps) => {
  let formValues = component.formValues(KnownComponents[component.name]);
  formValues["label"] = component.label;

  const componentForm = (methods: FormAPI<Record<string, any>>) => {
    switch (component.name) {
      case "discovery.ec2":
        return <DiscoveryEc2 methods={methods} />;
      case "prometheus.remote_write":
        return <PrometheusRemoteWrite methods={methods} />;
      case "prometheus.exporter.redis":
        return <PrometheusExporterRedis methods={methods} />;
      case "prometheus.scrape":
        return <PrometheusScrape methods={methods} />;
      case "prometheus.exporter.mysql":
        return <PrometheusExporterMysql methods={methods} />;
      case "prometheus.exporter.github":
        return <PrometheusExporterGithub methods={methods} />;
      default:
        return <UnsupportedComponent />;
    }
  };

  return (
    <Form
      onSubmit={async ({ label, ...args }) => {
        updateComponent(
          toBlock(component.name, args, label, KnownComponents[component.name])!
        );
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
