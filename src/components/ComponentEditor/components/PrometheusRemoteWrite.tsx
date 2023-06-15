import { Field, FormAPI, Input } from "@grafana/ui";

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
      <Field label="Basic auth username" description="Basic auth username">
        <Input {...methods.register("endpoint.basic_auth.username")} />
      </Field>
    </>
  );
};

export default PrometheusRemoteWrite;
