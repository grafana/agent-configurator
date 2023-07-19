import { SelectableValue } from "@grafana/data";
import {
  Alert,
  Button,
  FieldArray,
  FieldSet,
  FormAPI,
  InlineField,
  InlineFieldRow,
  InlineSwitch,
  Input,
  InputControl,
  MultiSelect,
  RadioButtonGroup,
  Select,
} from "@grafana/ui";
import TypedInput from "../inputs/TypedInput";

const roleOptions = [
  "node",
  "pod",
  "service",
  "endpoint",
  "endpointslice",
  "ingress",
].map((role) => ({
  value: role,
  label: role.charAt(0).toUpperCase() + role.slice(1),
}));

const Component = ({ methods }: { methods: FormAPI<Record<string, any>> }) => {
  const commonOptions = {
    labelWidth: 24,
  };
  const selectorsOptions = {
    labelWidth: 14,
  };
  const watchAuthType = methods.watch("auth_type");
  return (
    <>
      <InlineField
        label="Role"
        tooltip="Type of Kubernetes resource to query."
        required
        invalid={!!methods.errors?.role}
        error="You must select a role"
        {...commonOptions}
      >
        <InputControl
          name="role"
          control={methods.control}
          rules={{ required: true }}
          render={({ field: { ref, ...f } }) => (
            <Select {...f} options={roleOptions} width={24} />
          )}
        />
      </InlineField>
      <InlineField
        label="API Server"
        tooltip="URL of Kubernetes API server."
        {...commonOptions}
      >
        <TypedInput name="api_server" control={methods.control} />
      </InlineField>
      <InlineField
        label="kubeconfig file"
        tooltip="Path of kubeconfig file to use for connecting to Kubernetes."
        {...commonOptions}
      >
        <TypedInput name="kubeconfig_file" control={methods.control} />
      </InlineField>
      <InlineField
        label="Proxy URL"
        tooltip="HTTP proxy to proxy requests through."
        {...commonOptions}
      >
        <TypedInput name="proxy_url" control={methods.control} />
      </InlineField>
      <InlineField
        label="Follow redirects"
        tooltip="Whether redirects returned by the server should be followed."
        {...commonOptions}
      >
        <InlineSwitch {...methods.register("follow_redirects")} />
      </InlineField>
      <InlineField
        label="Enable HTTP2"
        tooltip="Whether HTTP2 is supported for requests."
        {...commonOptions}
      >
        <InlineSwitch {...methods.register("enable_http2")} />
      </InlineField>
      <InlineField
        label="Attach node metadata"
        tooltip="Whether to attach information about the node running the workload to the metrics"
        {...commonOptions}
      >
        <InlineSwitch {...methods.register("attach_metadata.node")} />
      </InlineField>
      <FieldSet label="Authentication">
        <InputControl
          name="auth_type"
          control={methods.control}
          defaultValue="in_cluster"
          render={({ field: { ref, ...f } }) => (
            <RadioButtonGroup
              fullWidth
              {...f}
              options={[
                {
                  value: "in_cluster",
                  label: "In-cluster",
                },
                {
                  value: "bearer",
                  label: "Bearer Token",
                },
                {
                  value: "basic_auth",
                  label: "Basic Auth",
                },
                {
                  value: "authorization",
                  label: "Authorization Header",
                },
                {
                  value: "oauth2",
                  label: "OAuth2",
                },
              ]}
            />
          )}
        />
        {watchAuthType === "in_cluster" && (
          <Alert
            severity="info"
            title="No further configuration is neccesarry when running the agent in a
            Kubernetes environment with the correct service account"
          />
        )}
        {watchAuthType === "basic_auth" && (
          <>
            <InlineField label="Username" {...commonOptions}>
              <TypedInput
                name="basic_auth.username"
                control={methods.control}
              />
            </InlineField>
            <InlineField label="Password" {...commonOptions}>
              <TypedInput
                name="basic_auth.password"
                control={methods.control}
              />
            </InlineField>
            <InlineField label="Password file" {...commonOptions}>
              <TypedInput
                name="basic_auth.password_file"
                control={methods.control}
              />
            </InlineField>
          </>
        )}
        {watchAuthType === "bearer" && (
          <>
            <InlineField
              label="Bearer token"
              tooltip="Bearer token to authenticate with."
              {...commonOptions}
            >
              <TypedInput name="bearer_token" control={methods.control} />
            </InlineField>
            <InlineField
              label="Bearer token file"
              tooltip="File containing a bearer token to authenticate with."
              {...commonOptions}
            >
              <TypedInput name="bearer_token_file" control={methods.control} />
            </InlineField>
          </>
        )}
        {watchAuthType === "authorization" && (
          <>
            <InlineField
              label="Type"
              tooltip="Authorization type, for example, 'Bearer'"
              {...commonOptions}
            >
              <TypedInput name="authorization.type" control={methods.control} />
            </InlineField>
            <InlineField label="Credentials" {...commonOptions}>
              <TypedInput
                name="authorization.credentials"
                control={methods.control}
              />
            </InlineField>
            <InlineField label="Credentials file" {...commonOptions}>
              <TypedInput
                name="authorization.credentials_file"
                control={methods.control}
              />
            </InlineField>
          </>
        )}
        {watchAuthType === "oauth2" && (
          <>
            <InlineField label="Client ID" {...commonOptions}>
              <TypedInput name="oauth2.client_id" control={methods.control} />
            </InlineField>
            <InlineField label="Client secret" {...commonOptions}>
              <TypedInput
                name="oauth2.client_secret"
                control={methods.control}
              />
            </InlineField>
            <InlineField label="Client secret file" {...commonOptions}>
              <TypedInput
                name="oauth2.client_secret_file"
                control={methods.control}
              />
            </InlineField>
            <InlineField label="Scopes" {...commonOptions}>
              <InputControl
                name="oauth2.scopes"
                control={methods.control}
                render={({ field: { ref, ...f } }) => (
                  <MultiSelect
                    {...f}
                    allowCustomValue
                    placeholder="Enter to add"
                  />
                )}
              />
            </InlineField>
            <InlineField label="Token URL" {...commonOptions}>
              <TypedInput name="oauth2.token_url" control={methods.control} />
            </InlineField>
            <InlineField label="Proxy URL" {...commonOptions}>
              <TypedInput name="oauth2.proxy_url" control={methods.control} />
            </InlineField>
          </>
        )}
      </FieldSet>
      <FieldSet label="Selectors">
        <p>
          Optional label and field selectors to limit the discovery process to a
          subset of available resources.
        </p>
        <p>
          The endpoints role supports pod, service and endpoints selectors. The
          pod role supports node selectors when the <i>Attach node metadata</i>{" "}
          option is enabled. Other roles only support selectors matching the
          role itself (e.g. node role can only contain node selectors).
        </p>
        <FieldArray control={methods.control} name="selectors">
          {({ fields, append, remove }) => (
            <>
              {fields.map((field, index) => (
                <InlineFieldRow key={field.id}>
                  <InlineField
                    label="Role"
                    tooltip="Role of the selector"
                    {...selectorsOptions}
                  >
                    <InputControl
                      name={`selectors[${index}].role` as const}
                      control={methods.control}
                      rules={{ required: true }}
                      render={({ field: { ref, ...f } }) => (
                        <Select {...f} options={roleOptions} width={24} />
                      )}
                    />
                  </InlineField>
                  <InlineField
                    label="Label"
                    tooltip="Label selector string."
                    {...selectorsOptions}
                  >
                    <Input
                      defaultValue={field["label"]}
                      placeholder="app=frontend"
                      {...methods.register(
                        `selectors[${index}].label` as const
                      )}
                    />
                  </InlineField>
                  <InlineField
                    label="Field"
                    tooltip="Field selector string."
                    {...selectorsOptions}
                  >
                    <Input
                      defaultValue={field["field"]}
                      placeholder="metadata.name=my-service"
                      {...methods.register(
                        `selectors[${index}].field` as const
                      )}
                    />
                  </InlineField>
                  <Button
                    fill="outline"
                    variant="secondary"
                    icon="trash-alt"
                    tooltip="Delete this selector"
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

const DiscoveryKubernetes = {
  preTransform(data: Record<string, any>): Record<string, any> {
    data["auth_type"] = "in_cluster";
    if (data.bearer_token || data.bearer_token_file)
      data["auth_type"] = "bearer";
    if (data.oauth2?.client_id) data["auth_type"] = "oauth2";
    if (
      data.authorization?.type ||
      data.authorization?.credentials ||
      data.authorization?.credentials_file
    )
      data["auth_type"] = "authorization";
    if (
      data.basic_auth?.username ||
      data.basic_auth?.password ||
      data.basic_auth?.password_file
    )
      data["auth_type"] = "basic_auth";
    return data;
  },
  postTransform(data: Record<string, any>): Record<string, any> {
    if (data["role"]?.value) data["role"] = data["role"].value;
    switch (data["auth_type"]) {
      case "bearer":
        delete data["oauth2"];
        delete data["basic_auth"];
        delete data["authorization"];
        break;
      case "oauth2":
        data.oauth2.scopes = data.oauth2.scopes.map(
          (x: string | SelectableValue<string>) =>
            typeof x === "object" ? x.value : x
        );

        delete data["bearer_token"];
        delete data["bearer_token_file"];
        delete data["basic_auth"];
        delete data["authorization"];
        break;
      case "authorization":
        delete data["bearer_token"];
        delete data["bearer_token_file"];
        delete data["basic_auth"];
        delete data["oauth2"];
        break;
      case "basic_auth":
        delete data["bearer_token"];
        delete data["bearer_token_file"];
        delete data["authorization"];
        delete data["oauth2"];
        break;
      case "in_cluster":
        delete data["bearer_token"];
        delete data["bearer_token_file"];
        delete data["authorization"];
        delete data["oauth2"];
        delete data["basic_auth"];
        break;
    }
    delete data["auth_type"];
    return data;
  },
  Component,
};

export default DiscoveryKubernetes;
