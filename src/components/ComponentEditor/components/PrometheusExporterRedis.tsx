import { Field, Input } from "@grafana/ui";

const PrometheusExporterRedis = ({ register }: { register: any }) => {
  return (
    <>
      <Field
        label="Redis Address"
        description="Address (host and port) of the Redis instance to connect to."
      >
        <Input {...register("redis_addr")} />
      </Field>
    </>
  );
};

export default PrometheusExporterRedis;
