import { Card, Button } from "@grafana/ui";
import { Block, Attribute } from "../../lib/river";

interface ComponentListProps {
  addComponent: (component: Block) => void;
}

const ComponentList = ({ addComponent }: ComponentListProps) => {
  return (
    <>
      <Card>
        <Card.Heading>Prometheus Remote Write</Card.Heading>
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
        </Card.Actions>
      </Card>
      <Card>
        <Card.Heading>Prometheus Redis Exporter</Card.Heading>
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
        </Card.Actions>
      </Card>
      <Card>
        <Card.Heading>Prometheus Scrape</Card.Heading>
        <Card.Meta>{["Prometheus", "Glue"]}</Card.Meta>
        <Card.Actions>
          <Button
            onClick={() =>
              addComponent(
                new Block("prometheus.scrape", "default", [
                  new Attribute("targets", []),
                  new Attribute("forward_to", []),
                ])
              )
            }
          >
            Add
          </Button>
        </Card.Actions>
      </Card>
    </>
  );
};

export default ComponentList;
