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
        <Input {...methods.register("redis_addr", { required: true })} />
      </Field>
      <h6>Advanced Options</h6>
      <Field
        label="Redis User"
        description="User name to use for authentication (Redis ACL for Redis 6.0 and newer)."
      >
        <Input {...methods.register("redis_user")} />
      </Field>
      <Field
        label="Redis Password"
        description="Password of the Redis instance."
      >
        <Input {...methods.register("redis_password")} />
      </Field>
    </>
  );
};

export default PrometheusExporterRedis;
