import { Field, FormAPI, Input } from "@grafana/ui";

const PrometheusExporterMysql = ({
  methods,
}: {
  methods: FormAPI<Record<string, any>>;
}) => {
  return (
    <>
      <Field
        label="Data Source Name"
        description="Data Source Name for the MySQL server to connect to."
        error="The data source name is required"
        invalid={!!methods.errors["data_source_name"]}
      >
        <Input {...methods.register("data_source_name", { required: true })} />
      </Field>
    </>
  );
};

export default PrometheusExporterMysql;
