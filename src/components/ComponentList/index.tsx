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
            <Card key={c.name}>
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
