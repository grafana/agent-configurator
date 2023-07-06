import { Alert, FormAPI, InlineField, Input, VerticalGroup } from "@grafana/ui";

const Component = ({ methods }: { methods: FormAPI<Record<string, any>> }) => {
  const commonOptions = {
    labelWidth: 25,
  };
  return (
    <>
      <VerticalGroup>
        <InlineField
          label="Stack name"
          tooltip="Name of your stack as shown in the Grafana Cloud Console"
          error="The stack name is required"
          invalid={!!methods.errors["arguments"]?.stack_name}
          {...commonOptions}
        >
          <Input
            {...methods.register("arguments.stack_name", { required: true })}
          />
        </InlineField>
        <InlineField
          label="Token"
          tooltip="Access policy token or API Key"
          error="The token is required"
          invalid={!!methods.errors["arguments"]?.token}
          {...commonOptions}
        >
          <Input {...methods.register("arguments.token", { required: true })} />
        </InlineField>

        <Alert severity="info" title="Creating the token">
          To retrieve the token, go to the <i>Access Policies</i> section in the{" "}
          <a
            href="https://grafana.com/profile/org"
            target="_blank"
            rel="noreferrer"
          >
            Grafana Cloud console
          </a>{" "}
          and create a new Access policy. In addition to the scopes you are
          planning to use (e.g. writing metrics/logs/traces), you will need to
          add the <code>stacks:read</code> scope using the dropdown menu.
          Afterwards, create a new token for this access policy and use it here.
        </Alert>
        <p></p>
      </VerticalGroup>
    </>
  );
};

const GrafanaCloudAutoconfigure = {
  preTransform(data: Record<string, any>): Record<string, any> {
    return data;
  },
  postTransform(data: Record<string, any>): Record<string, any> {
    return data;
  },
  Component,
};

export default GrafanaCloudAutoconfigure;
