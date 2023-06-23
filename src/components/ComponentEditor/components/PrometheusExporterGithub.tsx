import { Field, FormAPI, Input, InputControl, MultiSelect } from "@grafana/ui";

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
      <Field
        label="api_token_file"
        description="File containing API token to use to authenticate against GitHub."
      >
        <Input {...methods.register("api_token_file")} />
      </Field>
      <Field
        label="api_token_file"
        description="File containing API token to use to authenticate against GitHub. Takes precedence over api_token"
      >
        <Input {...methods.register("api_token_file")} />
      </Field>
      {["organizations", "users", "repositories"].map((type) => {
        return (
          <Field label={type} key={type}>
            <InputControl
              render={({ field: { onChange, ...field } }) => (
                <MultiSelect
                  {...field}
                  onChange={(v) => onChange(v.map((x) => x.value))}
                  options={[]}
                  allowCustomValue
                  placeholder={`Enter ${type}`}
                />
              )}
              defaultValue={[]}
              control={methods.control}
              name={type}
            />
          </Field>
        );
      })}
      <p>
        GitHub uses an aggressive rate limit for unauthenticated requests based
        on IP address. To allow more API requests, it is recommended to
        configure either <code>api_token</code> or <code>api_token_file</code>{" "}
        to authenticate against GitHub.
      </p>
    </>
  );
};

export default PrometheusExporterGithub;
