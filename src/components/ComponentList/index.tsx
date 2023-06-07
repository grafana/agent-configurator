import { Card, Button } from "@grafana/ui";

interface ComponentListProps {
  addComponent: (component: string) => void;
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
                'prometheus.exporter.redis "LABEL" {\nredis_addr = "REDIS_ADDRESS"\n}'
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
                'prometheus.exporter.redis "LABEL" {\n    redis_addr = "REDIS_ADDRESS"\n}'
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
