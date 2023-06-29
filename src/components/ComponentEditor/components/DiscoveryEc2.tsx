import {
  Button,
  FieldArray,
  FieldSet,
  FormAPI,
  InlineField,
  InlineFieldRow,
  Input,
  InputControl,
  MultiSelect,
} from "@grafana/ui";

const DiscoveryEc2 = ({
  methods,
}: {
  methods: FormAPI<Record<string, any>>;
}) => {
  const commonOptions = {
    labelWidth: 14,
  };
  return (
    <>
      <InlineField
        label="Region"
        tooltip="The AWS region. If blank, the region from the instance metadata is used."
        {...commonOptions}
      >
        <Input {...methods.register("region")} placeholder="us-east-1" />
      </InlineField>
      <InlineField
        label="Port"
        tooltip="The port to scrape metrics from. If using the public IP address, this must instead be specified in the relabeling rule."
        {...commonOptions}
      >
        <Input
          type="number"
          {...methods.register("port", { valueAsNumber: true })}
          placeholder="80"
        />
      </InlineField>
      <InlineField
        label="Access Key"
        tooltip="The AWS API key ID. If blank, the environment variable AWS_ACCESS_KEY_ID is used."
        {...commonOptions}
      >
        <Input {...methods.register("access_key")} />
      </InlineField>
      <InlineField
        label="Secret Key"
        tooltip="The AWS API key ID. If blank, the environment variable AWS_SECRET_ACCESS_KEY is used."
        {...commonOptions}
      >
        <Input {...methods.register("secret_key")} />
      </InlineField>
      <InlineField
        label="Profile"
        tooltip="Named AWS profile used to connect to the API."
        {...commonOptions}
      >
        <Input {...methods.register("profile")} />
      </InlineField>
      <InlineField
        label="Role ARN"
        tooltip="AWS Role Amazon Resource Name (ARN), an alternative to using AWS API keys."
        {...commonOptions}
      >
        <Input {...methods.register("role_arn")} />
      </InlineField>

      <FieldSet label="Filters">
        <FieldArray control={methods.control} name="filter">
          {({ fields, append, remove }) => (
            <>
              {fields.map((field, index) => (
                <InlineFieldRow key={field.id}>
                  <InlineField
                    label="Filter name"
                    tooltip="Filter name to use."
                    {...commonOptions}
                  >
                    <Input
                      defaultValue={field["name"]}
                      {...methods.register(`filter[${index}].name` as const)}
                    />
                  </InlineField>
                  <InlineField
                    label="Values"
                    tooltip="Values to pass to the filter."
                    {...commonOptions}
                  >
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
                  </InlineField>
                  <Button
                    fill="outline"
                    variant="secondary"
                    icon="trash-alt"
                    tooltip="Delete this filter"
                    onClick={(e) => {
                      remove(index);
                      e.preventDefault();
                    }}
                  />
                </InlineFieldRow>
              ))}
              <Button onClick={() => append({})} icon="plus">
                Add
              </Button>
            </>
          )}
        </FieldArray>
      </FieldSet>
    </>
  );
};

export default DiscoveryEc2;
