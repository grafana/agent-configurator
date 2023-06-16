import { Field, FormAPI, Input } from "@grafana/ui";

const PrometheusExporterRedis = ({
  methods,
}: {
  methods: FormAPI<Record<string, any>>;
}) => {
  return (
    <>
      <Field
        label="Redis Address"
        description="Address (host and port) of the Redis instance to connect to."
        error="The redis address is required"
        invalid={!!methods.errors["redis_addr"]}
      >
        <Input {...methods.register("redis_addr")} />
      </Field>
    </>
  );
};

export default PrometheusExporterRedis;
