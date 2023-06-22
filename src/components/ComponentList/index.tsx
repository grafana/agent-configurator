import { Card, Button, LinkButton, Icon } from "@grafana/ui";
import { Block, Attribute } from "../../lib/river";

interface ComponentListProps {
  addComponent: (component: Block) => void;
}

const ComponentList = ({ addComponent }: ComponentListProps) => {
  return (
    <>
      <Card>
        <Card.Heading>Prometheus Remote Write</Card.Heading>
        <Card.Figure>
          <Icon size="xxxl" name="cloud-upload" />
        </Card.Figure>
        <Card.Meta>{["Output", "Cloud", "Prometheus"]}</Card.Meta>
        <Card.Actions>
          <Button
            onClick={() =>
              addComponent(
                new Block("prometheus.remote_write", "default", [
                  new Block("endpoint", null, [
                    new Attribute("url", "https://example.com"),
                  ]),
                ])
              )
            }
          >
            Add
          </Button>
          <LinkButton
            variant="secondary"
            href="https://grafana.com/docs/agent/latest/flow/reference/components/prometheus.remote_write/"
          >
            Documentation
          </LinkButton>
        </Card.Actions>
      </Card>
      <Card>
        <Card.Heading>Prometheus Redis Exporter</Card.Heading>
        <Card.Figure>
          <Icon size="xxxl" name="database" />
        </Card.Figure>
        <Card.Meta>{["Prometheus", "Redis", "Cache"]}</Card.Meta>
        <Card.Actions>
          <Button
            onClick={() =>
              addComponent(
                new Block("prometheus.exporter.redis", "default", [
                  new Attribute("redis_addr", "localhost:6317"),
                ])
              )
            }
          >
            Add
          </Button>
          <LinkButton
            variant="secondary"
            href="https://grafana.com/docs/agent/latest/flow/reference/components/prometheus.exporter.redis/"
          >
            Documentation
          </LinkButton>
        </Card.Actions>
      </Card>
      <Card>
        <Card.Heading>Prometheus Scrape</Card.Heading>
        <Card.Figure>
          <Icon size="xxxl" name="bolt" />
        </Card.Figure>
        <Card.Meta>{["Prometheus", "Glue"]}</Card.Meta>
        <Card.Actions>
          <Button
            onClick={() =>
              addComponent(new Block("prometheus.scrape", "default", []))
            }
          >
            Add
          </Button>
          <LinkButton
            variant="secondary"
            href="https://grafana.com/docs/agent/latest/flow/reference/components/prometheus.scrape/"
          >
            Documentation
          </LinkButton>
        </Card.Actions>
      </Card>
    </>
  );
};

export default ComponentList;
