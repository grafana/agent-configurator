import { FormAPI, InlineField, Input } from "@grafana/ui";

const PrometheusExporterMysql = ({
  methods,
}: {
  methods: FormAPI<Record<string, any>>;
}) => {
  return (
    <>
      <InlineField
        label="Data Source Name"
        tooltip="Data Source Name for the MySQL server to connect to."
        error="The data source name is required"
        invalid={!!methods.errors["data_source_name"]}
        labelWidth={20}
      >
        <Input
          {...methods.register("data_source_name", { required: true })}
          placeholder="root@(server-a:3306)/"
        />
      </InlineField>
    </>
  );
};

export default PrometheusExporterMysql;
