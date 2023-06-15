import { Field, Input } from "@grafana/ui";
import { UseFormRegister } from "react-hook-form";

const PrometheusExporterRedis = ({
  register,
}: {
  register: UseFormRegister<Record<string, any>>;
}) => {
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
