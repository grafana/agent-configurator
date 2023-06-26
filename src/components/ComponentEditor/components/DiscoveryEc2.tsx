import {
  Field,
  FormAPI,
  Input,
  InputControl,
  MultiSelect,
  VerticalGroup,
} from "@grafana/ui";
import MultiBlock from "../inputs/MultiBlock";

const DiscoveryEc2 = ({
  methods,
}: {
  methods: FormAPI<Record<string, any>>;
}) => {
  return (
    <>
      <Field
        label="Region"
        description="The AWS region. If blank, the region from the instance metadata is used."
      >
        <Input {...methods.register("region")} placeholder="us-east-1" />
      </Field>
      <Field
        label="Port"
        description="The port to scrape metrics from. If using the public IP address, this must instead be specified in the relabeling rule."
      >
        <Input
          type="number"
          {...methods.register("port", { valueAsNumber: true })}
          placeholder="80"
        />
      </Field>
      <Field
        label="Access Key"
        description="The AWS API key ID. If blank, the environment variable AWS_ACCESS_KEY_ID is used."
      >
        <Input {...methods.register("access_key")} />
      </Field>
      <Field
        label="Secret Key"
        description="The AWS API key ID. If blank, the environment variable AWS_SECRET_ACCESS_KEY is used."
      >
        <Input {...methods.register("secret_key")} />
      </Field>
      <Field
        label="Profile"
        description="Named AWS profile used to connect to the API."
      >
        <Input {...methods.register("profile")} />
      </Field>
      <Field
        label="Role ARN"
        description="AWS Role Amazon Resource Name (ARN), an alternative to using AWS API keys."
      >
        <Input {...methods.register("role_arn")} />
      </Field>

      <MultiBlock name="filter" title="Filters" methods={methods}>
        {(field, index) => (
          <VerticalGroup>
            <Field label="Filter name" description="Filter name to use.">
              <Input
                defaultValue={field["name"]}
                {...methods.register(`filter[${index}].name` as const)}
              />
            </Field>
            <Field label="Values" description="Values to pass to the filter.">
              <InputControl
                render={({ field: { onChange, ref, ...field } }) => (
                  <MultiSelect
                    {...field}
                    onChange={(v) => onChange(v.map((x) => x.value))}
                    options={[]}
                    allowCustomValue
                    placeholder="Filter Values"
                  />
                )}
                defaultValue={field["values"]}
                control={methods.control}
                name={`filter[${index}].values` as const}
              />
            </Field>
          </VerticalGroup>
        )}
      </MultiBlock>
    </>
  );
};

export default DiscoveryEc2;
