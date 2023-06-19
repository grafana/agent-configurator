import { Field, FormAPI, Input } from "@grafana/ui";

const PrometheusExporterGithub = ({
  methods,
}: {
  methods: FormAPI<Record<string, any>>;
}) => {
  return (
    <>
      <Field
        label="api_token"
        description="API token to use to authenticate against GitHub."
      >
        <Input {...methods.register("api_token")} />
      </Field>
    </>
  );
};

export default PrometheusExporterGithub;
