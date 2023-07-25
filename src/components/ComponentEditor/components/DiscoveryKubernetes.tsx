import {
  Button,
  FieldArray,
  FieldSet,
  FormAPI,
  InlineField,
  InlineFieldRow,
  InlineSwitch,
  Input,
  InputControl,
  Select,
} from "@grafana/ui";
import AuthenticationEditor from "../common/AuthenticationEditor";
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
      <AuthenticationEditor.Component
        methods={methods}
        options={["in_cluster", "basic_auth", "authorization", "oauth2"]}
        defaultValue="in_cluster"
      />
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
    data = AuthenticationEditor.postTransform(data);
    return data;
  },
  Component,
};

export default DiscoveryKubernetes;
