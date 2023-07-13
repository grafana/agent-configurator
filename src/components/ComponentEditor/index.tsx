import {
  Form,
  Field,
  Input,
  Button,
  FormAPI,
  HorizontalGroup,
} from "@grafana/ui";
import { Attribute, Block, toBlock } from "../../lib/river";
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
import GrafanaCloudAutoconfigure from "./components/modules/GrafanaCloudAutoConfigure";
import OTelColExporterLoki from "./components/OTelColExporterLoki";
import PrometheusExporterUnix from "./components/PrometheusExporterUnix";
import DiscoveryFile from "./components/DiscoveryFile";
import LokiSourceFile from "./components/LokiSourceFile";
import LokiRelabel from "./components/LokiRelabel";
import LokiSourceJournal from "./components/LokiSourceJournal";

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
      case "otelcol.exporter.loki":
        return OTelColExporterLoki;
      case "prometheus.exporter.unix":
        return PrometheusExporterUnix;
      case "discovery.file":
        return DiscoveryFile;
      case "loki.source.file":
        return LokiSourceFile;
      case "loki.source.journal":
        return LokiSourceJournal;
      case "loki.relabel":
        return LokiRelabel;
      //@ts-ignore if no module matches, we fall through to the unsupported component path
      case "module.git":
        const repo = component.attributes.find(
          (x) => x.name === "repository"
        ) as Attribute | null;
        const path = component.attributes.find(
          (x) => x.name === "path"
        ) as Attribute | null;
        switch (`${repo?.value};${path?.value}`) {
          case "https://github.com/grafana/agent-modules.git;modules/grafana-cloud/autoconfigure/module.river":
            return GrafanaCloudAutoconfigure;
        }
      //@ts-ignore if no module matches, we fall through to the unsupported component path
      default:
        return {
          Component: UnsupportedComponent,
          postTransform: id,
          preTransform: id,
        };
    }
  })();

  let spec = KnownComponents[component.name];
  let formValues = component.formValues(spec);
  formValues = preTransform(formValues);
  if (spec && spec.multi) formValues["label"] = component.label;

  return (
    <Form
      onSubmit={({ label, ...args }) => {
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
            {spec && spec.multi && (
              <Field
                label="Label"
                description="Component Label"
                invalid={!!errors["label"]}
                error="A label is required"
              >
                <Input {...register("label", { required: true })} />
              </Field>
            )}
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
