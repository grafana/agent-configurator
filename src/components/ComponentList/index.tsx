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

interface ComponentListProps {
  addComponent: (component: Block) => void;
}

type ListEntry = {
  name: string;
  title: string;
  meta: Array<string>;
  icon: IconName;
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
        "https://github.com/grafana/agent-modules.git"
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
        new Attribute("url", "https://example.com"),
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
    name: "discovery.file",
    title: "File discovery",
    meta: ["Discovery", "Logs"],
    icon: "file-alt",
    component: new Block("discovery.file", "log_files", [
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
];

const ComponentList = ({ addComponent }: ComponentListProps) => {
  const [filter, setFilter] = useState("");
  const filtered = useMemo(() => {
    if (filter === "") return components;
    return components.filter(
      (c) =>
        c.name.includes(filter.toLowerCase()) ||
        c.title.toLowerCase().includes(filter.toLowerCase())
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
                <Icon size="xxxl" name={c.icon} />
              </Card.Figure>
              <Card.Meta>{c.meta}</Card.Meta>
              <Card.Actions>
                <Button onClick={() => addComponent(c.component)}>Add</Button>
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
