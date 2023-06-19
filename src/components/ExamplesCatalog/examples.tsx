import { Attribute, Block } from "../../lib/river";

function promScrapePushExample(collector: Block): string {
  return (
    `prometheus.remote_write "grafana_cloud" {
  endpoint {
    url = "<your Grafana Cloud endpoint>" // Go to your account console to view this
  }
}

prometheus.scrape "default" {
  targets = ${collector.name}.${collector.label}.targets
  forward_to = [
    prometheus.remote_write.grafana_cloud.receiver,
  ]
}
` +
    collector.marshal() +
    "\n\n"
  );
}

const Examples: Array<{ name: string; source: string; logo: string }> = [
  {
    name: "Redis",
    source: promScrapePushExample(
      new Block("prometheus.exporter.redis", "default", [
        new Attribute("redis_addr", "localhost:6379"),
      ])
    ),
    logo: "https://storage.googleapis.com/grafanalabs-integration-logos/redis.png",
  },
  {
    name: "MySQL",
    source: promScrapePushExample(
      new Block("prometheus.exporter.mysql", "default", [
        new Attribute("data_source_name", "root@(server-a:3306)/"),
      ])
    ),
    logo: "https://storage.googleapis.com/grafanalabs-integration-logos/mysql.png",
  },
  {
    name: "GitHub",
    source: promScrapePushExample(
      new Block("prometheus.exporter.github", "default", [])
    ),
    logo: "https://storage.googleapis.com/grafanalabs-integration-logos/github.png",
  },
];
export default Examples;
