export const CloudDestination = (stackName?: string) => {
  return {
    metrics: {
      enabled: true,
      receiver: "module.git.grafana_cloud.exports.metrics_receiver",
    },
    logs: {
      enabled: true,
      receiver: "module.git.grafana_cloud.exports.logs_receiver",
    },
    traces: {
      enabled: true,
      receiver: "module.git.grafana_cloud.exports.traces_receiver",
    },
    profiles: {
      enabled: true,
      receiver: "module.git.grafana_cloud.exports.profiles_receiver",
    },
    template(): string {
      return `module.git "grafana_cloud" {
  repository = "https://github.com/grafana/agent-modules.git"
  path = "modules/grafana-cloud/autoconfigure/module.river"
  revision = "main"
  arguments {
    stack_name = "${!!stackName ? stackName : "stackName"}"
    token = env("GRAFANA_CLOUD_TOKEN")
  }
}
`;
    },
  };
};
