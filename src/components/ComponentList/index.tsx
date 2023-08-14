import {
  Card,
  Button,
  LinkButton,
  Icon,
  IconName,
  Input,
  Field,
} from "@grafana/ui";
import { useMemo, useState } from "react";
import { Block, Attribute } from "../../lib/river";
import { faro } from "@grafana/faro-web-sdk";

interface ComponentListProps {
  addComponent: (component: Block) => void;
}

type ListEntry = {
  name: string;
  title: string;
  meta: Array<string>;
  icon: IconName | `${string}.svg` | `${string}.png`;
  component: Block;
};

const components: ListEntry[] = [
  {
    name: "module.git",
    title: "Grafana Cloud Autoconfigure",
    meta: ["cloud", "metrics", "logs", "traces", "profiles"],
    icon: "grafana",
    component: new Block("module.git", "grafana_cloud", [
      new Attribute(
        "repository",
        "https://github.com/grafana/agent-modules.git",
      ),
      new Attribute("path", "modules/grafana-cloud/autoconfigure/module.river"),
      new Attribute("revision", "main"),
    ]),
  },
  {
    name: "prometheus.remote_write",
    title: "Prometheus Remote Write",
    meta: ["Output", "Cloud", "Prometheus"],
    icon: "cloud-upload",
    component: new Block("prometheus.remote_write", "default", [
      new Block("endpoint", null, [
        new Attribute("url", "http://mimir:9009/api/v1/push"),
      ]),
    ]),
  },
  {
    name: "loki.write",
    title: "Loki Write",
    meta: ["Output", "Cloud", "Loki"],
    icon: "cloud-upload",
    component: new Block("loki.write", "default", [
      new Block("endpoint", null, [
        new Attribute("url", "http://loki:3100/loki/api/v1/push"),
      ]),
    ]),
  },
  {
    name: "prometheus.exporter.redis",
    title: "Prometheus Redis Exporter",
    meta: ["Prometheus", "Redis", "Cache"],
    icon: "database",
    component: new Block("prometheus.exporter.redis", "default", [
      new Attribute("redis_addr", "localhost:6379"),
    ]),
  },
  {
    name: "prometheus.exporter.github",
    title: "Prometheus GitHub Exporter",
    meta: ["Prometheus", "GitHub", "SaaS"],
    icon: "code-branch",
    component: new Block("prometheus.exporter.github", "default", []),
  },
  {
    name: "prometheus.exporter.windows",
    title: "Prometheus Windows Exporter",
    meta: ["Prometheus", "Windows"],
    icon: "https://storage.googleapis.com/grafanalabs-integration-logos/windows.png",
    component: new Block("prometheus.exporter.windows", "default", []),
  },
  {
    name: "prometheus.scrape",
    title: "Prometheus Scrape",
    meta: ["Prometheus", "Glue"],
    icon: "bolt",
    component: new Block("prometheus.scrape", "default", []),
  },
  {
    name: "discovery.ec2",
    title: "EC2 Discovery",
    meta: ["AWS", "EC2", "Discovery"],
    icon: "sitemap",
    component: new Block("discovery.ec2", "ec2_instances", []),
  },
  {
    name: "otelcol.receiver.otlp",
    title: "OpenTelemetry Collector OTLP Receiver",
    meta: ["OTEL", "Receiver", "Metrics", "Logs", "Traces"],
    icon: "import",
    component: new Block("otelcol.receiver.otlp", "default", []),
  },
  {
    name: "otelcol.exporter.prometheus",
    title: "OpenTelemetry Collector Prometheus Export",
    meta: ["OTEL", "Prometheus", "Exporter"],
    icon: "rocket",
    component: new Block("otelcol.exporter.prometheus", "to_prometheus", []),
  },
  {
    name: "otelcol.exporter.loki",
    title: "OpenTelemetry Collector Loki Export",
    meta: ["OTEL", "Loki", "Logs", "Exporter"],
    icon: "rocket",
    component: new Block("otelcol.exporter.loki", "to_loki", []),
  },
  {
    name: "otelcol.processor.batch",
    title: "OpenTelemetry Collector Batch Processor",
    meta: ["OTEL", "Processor"],
    icon: "process",
    component: new Block("otelcol.processor.batch", "default", []),
  },
  {
    name: "loki.relabel",
    title: "Loki relabeling",
    meta: ["Logs", "Loki", "relabel"],
    icon: "process",
    component: new Block("loki.relabel", "default", []),
  },
  {
    name: "local.file_match",
    title: "File discovery",
    meta: ["Discovery", "Logs"],
    icon: "file-alt",
    component: new Block("local.file_match", "log_files", [
      new Attribute("path_targets", [{ __path__: "/var/log/**/*.log" }]),
    ]),
  },
  {
    name: "loki.source.file",
    title: "Loki File Source",
    meta: ["Logs", "Loki", "Source"],
    icon: "gf-logs",
    component: new Block("loki.source.file", "log_files", []),
  },
  {
    name: "loki.source.journal",
    title: "Loki Journal Source",
    meta: ["Logs", "Loki", "Source"],
    icon: "gf-logs",
    component: new Block("loki.source.journal", "journal", []),
  },
  {
    name: "loki.source.windowsevent",
    title: "Loki Windows Event Log Source",
    meta: ["Logs", "Loki", "Source", "Windows"],
    icon: "gf-logs",
    component: new Block("loki.source.windowsevent", "application", [
      new Attribute("eventlog_name", "Application"),
    ]),
  },
  {
    name: "discovery.kubernetes",
    title: "Kubernetes Discovery",
    meta: ["Discovery", "Kuberentes"],
    icon: "https://storage.googleapis.com/grafanalabs-integration-logos/kubernetes.svg",
    component: new Block("discovery.kubernetes", "application_pods", [
      new Attribute("role", "pod"),
    ]),
  },
  {
    name: "prometheus.relabel",
    title: "Relabel Prometheus Metrics",
    meta: ["Prometheus", "Relabel"],
    icon: "process",
    component: new Block("prometheus.relabel", "relabel_metrics", []),
  },
  {
    name: "discovery.relabel",
    title: "Relabel Discovery Targets",
    meta: ["Discovery", "Relabel"],
    icon: "process",
    component: new Block("discovery.relabel", "relabel_targets", []),
  },
  {
    name: "pyroscope.scrape",
    title: "Scrape profiles",
    meta: ["Profiling", "Pyroscope", "Source"],
    icon: `${process.env.PUBLIC_URL}/logos/pyroscope.svg`,
    component: new Block("pyroscope.scrape", "default", [
      new Attribute("targets", [
        {
          __address__: "http://localhost:8080",
        },
      ]),
    ]),
  },
];

const ComponentList = ({ addComponent }: ComponentListProps) => {
  const [filter, setFilter] = useState("");
  const filtered = useMemo(() => {
    if (filter === "") return components;
    return components.filter(
      (c) =>
        c.name.includes(filter.toLowerCase()) ||
        c.title.toLowerCase().includes(filter.toLowerCase()),
    );
  }, [filter]);
  return (
    <>
      <Field label="Search components">
        <Input
          value={filter}
          onChange={(e) => setFilter(e.currentTarget.value)}
          prefix={<Icon name="search" />}
          required
        />
      </Field>
      <section>
        {filtered.map((c) => {
          return (
            <Card key={c.name + c.title}>
              <Card.Heading>{c.title}</Card.Heading>
              <Card.Figure>
                {!c.icon.includes(".") && (
                  <Icon size="xxxl" name={c.icon as IconName} />
                )}
                {c.icon.includes(".") && (
                  <img src={c.icon} alt={`Icon representing ${c.title}`} />
                )}
              </Card.Figure>
              <Card.Meta>{c.meta}</Card.Meta>
              <Card.Actions>
                <Button
                  onClick={() => {
                    addComponent(c.component);
                    faro.api?.pushEvent("added_component", {
                      component: c.name,
                    });
                  }}
                >
                  Add
                </Button>
                <LinkButton
                  variant="secondary"
                  href={`https://grafana.com/docs/agent/latest/flow/reference/components/${c.name}/`}
                  target="_blank"
                >
                  Documentation
                </LinkButton>
              </Card.Actions>
            </Card>
          );
        })}
      </section>
    </>
  );
};

export default ComponentList;
