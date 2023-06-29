import {
  Form,
  Field,
  Input,
  Button,
  FormAPI,
  HorizontalGroup,
} from "@grafana/ui";
import { Block, toBlock } from "../../lib/river";
import PrometheusRemoteWrite from "./components/PrometheusRemoteWrite";
import PrometheusExporterRedis from "./components/PrometheusExporterRedis";
import PrometheusScrape from "./components/PrometheusScrape";
import UnsupportedComponent from "./components/UnsupportedComponent";
import PrometheusExporterMysql from "./components/PrometheusExporterMysql";
import PrometheusExporterGithub from "./components/PrometheusExporterGithub";
import DiscoveryEc2 from "./components/DiscoveryEc2";
import { KnownComponents } from "../../lib/components";
import OTelColReceiverOTLP from "./components/OTelColReceiverOTLP";
import { useStyles } from "../../theme";
import { css } from "@emotion/css";
import { GrafanaTheme2 } from "@grafana/data";
import OTelColProcessorBatch from "./components/OTelColProcessorBatch";
import OTelColExporterPrometheus from "./components/OTelColExporterPrometheus";

interface ComponentEditorProps {
  updateComponent: (component: Block) => void;
  discard: () => void;
  component: Block;
}
const ComponentEditor = ({
  updateComponent,
  component,
  discard,
}: ComponentEditorProps) => {
  const styles = useStyles(getStyles);

  const {
    Component,
    preTransform,
    postTransform,
  }: {
    Component: ({
      methods,
    }: {
      methods: FormAPI<Record<string, any>>;
    }) => JSX.Element;
    preTransform: (data: Record<string, any>) => Record<string, any>;
    postTransform: (data: Record<string, any>) => Record<string, any>;
  } = (() => {
    const id = (data: any) => data;
    switch (component.name) {
      case "discovery.ec2":
        return {
          Component: DiscoveryEc2,
          postTransform: id,
          preTransform: id,
        };
      case "prometheus.remote_write":
        return {
          Component: PrometheusRemoteWrite,
          postTransform: id,
          preTransform: id,
        };
      case "prometheus.exporter.redis":
        return {
          Component: PrometheusExporterRedis,
          postTransform: id,
          preTransform: id,
        };
      case "prometheus.scrape":
        return {
          Component: PrometheusScrape,
          postTransform: id,
          preTransform: id,
        };
      case "prometheus.exporter.mysql":
        return {
          Component: PrometheusExporterMysql,
          postTransform: id,
          preTransform: id,
        };
      case "prometheus.exporter.github":
        return {
          Component: PrometheusExporterGithub,
          postTransform: id,
          preTransform: id,
        };
      case "otelcol.receiver.otlp":
        return OTelColReceiverOTLP;
      case "otelcol.processor.batch":
        return OTelColProcessorBatch;
      case "otelcol.exporter.prometheus":
        return OTelColExporterPrometheus;
      default:
        return {
          Component: UnsupportedComponent,
          postTransform: id,
          preTransform: id,
        };
    }
  })();

  let formValues = component.formValues(KnownComponents[component.name]);
  formValues = preTransform(formValues);
  formValues["label"] = component.label;

  return (
    <Form
      onSubmit={async ({ label, ...args }) => {
        const transformed = postTransform(args);
        updateComponent(
          toBlock(
            component.name,
            transformed,
            label,
            KnownComponents[component.name]
          )!
        );
      }}
      defaultValues={formValues}
      className={styles.form}
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
            <Component methods={methods} />
            <HorizontalGroup>
              <Button type="submit">Save</Button>
              <Button onClick={discard} variant="secondary">
                Discard
              </Button>
            </HorizontalGroup>
          </>
        );
      }}
    </Form>
  );
};

const getStyles = (theme: GrafanaTheme2) => {
  return {
    form: css`
      width: 100%;
    `,
  };
};

export default ComponentEditor;
