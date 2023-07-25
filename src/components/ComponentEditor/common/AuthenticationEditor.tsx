import { SelectableValue } from "@grafana/data";
import {
  Alert,
  FieldSet,
  FormAPI,
  InlineField,
  InputControl,
  MultiSelect,
  RadioButtonGroup,
} from "@grafana/ui";
import TypedInput from "../inputs/TypedInput";

type AuthenticationType =
  | "none"
  | "in_cluster"
  | "bearer"
  | "basic_auth"
  | "authorization"
  | "oauth2";
const Component = ({
  methods,
  options,
  defaultValue,
}: {
  methods: FormAPI<Record<string, any>>;
  options?: AuthenticationType[];
  defaultValue?: AuthenticationType;
}) => {
  const commonOptions = {
    labelWidth: 24,
  };
  if (!options) {
    options = ["none", "bearer", "basic_auth", "authorization", "oauth2"];
  }
  if (!defaultValue) {
    defaultValue = "none";
  }
  const watchAuthType = methods.watch("auth_type");
  return (
    <FieldSet label="Authentication">
      <InputControl
        name="auth_type"
        control={methods.control}
        defaultValue={defaultValue}
        render={({ field: { ref, ...f } }) => (
          <RadioButtonGroup
            fullWidth
            {...f}
            options={[
              {
                value: "none",
                label: "None",
              },
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
            ].filter((x) => options?.some((n) => n === x.value))}
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
            <TypedInput name="basic_auth.username" control={methods.control} />
          </InlineField>
          <InlineField label="Password" {...commonOptions}>
            <TypedInput name="basic_auth.password" control={methods.control} />
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
            <TypedInput name="oauth2.client_secret" control={methods.control} />
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
  );
};

const AuthenticationEditor = {
  Component,
  preTransform(
    data: Record<string, any>,
    def: AuthenticationType = "none"
  ): Record<string, any> {
    data["auth_type"] = def;
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
};

export default AuthenticationEditor;
