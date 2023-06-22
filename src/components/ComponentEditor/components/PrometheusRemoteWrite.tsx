import { Field, FormAPI, Input, Alert, LinkButton } from "@grafana/ui";

const PrometheusRemoteWrite = ({
  methods,
}: {
  methods: FormAPI<Record<string, any>>;
}) => {
  return (
    <>
      <Alert severity="info" title="Connection Information">
        To view your connection information, navigate to{" "}
        <LinkButton
          href="https://grafana.com/profile/org"
          fill="text"
          icon="external-link-alt"
          target="_blank"
        >
          your cloud console
        </LinkButton>
      </Alert>
      <Field
        label="Endpoint URL"
        description="Where to send metrics to"
        error="An endpoint URL is required"
        invalid={!!methods.errors["endpoint"]?.url}
      >
        <Input
          {...methods.register("endpoint.url", {
            required: true,
          })}
        />
      </Field>
      <Field label="Basic auth username">
        <Input {...methods.register("endpoint.basic_auth.username")} />
      </Field>
      <Field label="Basic auth password">
        <Input {...methods.register("endpoint.basic_auth.password")} />
      </Field>
      <Field
        label="Basic auth password file"
        description="File containing the basic auth password."
      >
        <Input {...methods.register("endpoint.basic_auth.password_file")} />
      </Field>
      <Alert
        severity="info"
        title="password and password_file are mutually exclusive and only one can be provided."
      ></Alert>
    </>
  );
};

export default PrometheusRemoteWrite;
