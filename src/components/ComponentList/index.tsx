import { Card, Button } from "@grafana/ui";
import { Component, Attribute } from "../../lib/river";

interface ComponentListProps {
  addComponent: (component: Component) => void;
}

const ComponentList = ({ addComponent }: ComponentListProps) => {
  return (
    <>
      <Card>
        <Card.Heading>Linux Node Exporter</Card.Heading>
        <Card.Meta>{["Infrastructure", "Linux", "node_exporter"]}</Card.Meta>
        <Card.Actions>
          <Button
            onClick={() => {
              addComponent(
                new Component("prometheus.exporter.redis", "LABEL", [
                  new Attribute("redis_addr", '"REDIS_ADDRESS"'),
                ])
              );
            }}
          >
            Add
          </Button>
        </Card.Actions>
      </Card>
      <Card>
        <Card.Heading>Redis</Card.Heading>
        <Card.Meta>{["Infrastructure", "Database"]}</Card.Meta>
        <Card.Actions>
          <Button
            onClick={() => {
              addComponent(
                new Component("prometheus.exporter.redis", "LABEL", [
                  new Attribute("redis_addr", '"REDIS_ADDRESS"'),
                ])
              );
            }}
          >
            Add
          </Button>
        </Card.Actions>
      </Card>
    </>
  );
};

export default ComponentList;
