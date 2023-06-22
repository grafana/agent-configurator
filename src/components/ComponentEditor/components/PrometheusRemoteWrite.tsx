import { Field, FormAPI, Input, Alert } from "@grafana/ui";

const PrometheusRemoteWrite = ({
  methods,
}: {
  methods: FormAPI<Record<string, any>>;
}) => {
  return (
    <>
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
