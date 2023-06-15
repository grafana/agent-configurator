import { Field, Input } from "@grafana/ui";
import { UseFormRegister } from "react-hook-form";

const PrometheusRemoteWrite = ({
  register,
}: {
  register: UseFormRegister<Record<string, any>>;
}) => {
  return (
    <>
      <Field label="Endpoint URL" description="Where to send metrics to">
        <Input {...register("endpoint.url")} />
      </Field>
      <Field label="Basic auth username" description="Basic auth username">
        <Input {...register("endpoint.basic_auth.username")} />
      </Field>
    </>
  );
};

export default PrometheusRemoteWrite;
