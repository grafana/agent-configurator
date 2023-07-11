import {
  Button,
  FieldArray,
  FieldSet,
  FormAPI,
  InlineField,
  InlineFieldRow,
  Input,
} from "@grafana/ui";

const Component = ({ methods }: { methods: FormAPI<Record<string, any>> }) => {
  const commonOptions = {
    labelWidth: 14,
  };
  return (
    <>
      <InlineField
        label="Sync period"
        tooltip="How often to sync filesystem and targets"
        {...commonOptions}
      >
        <Input {...methods.register("sync_period")} placeholder="10s" />
      </InlineField>
      <FieldSet label="Path Targets">
        <FieldArray control={methods.control} name="path_targets">
          {({ fields, append, remove }) => (
            <>
              {fields.map((field, index) => (
                <InlineFieldRow key={field.id}>
                  <InlineField
                    label="Include"
                    tooltip="Target to expand."
                    {...commonOptions}
                  >
                    <Input
                      defaultValue={field["__path__"]}
                      {...methods.register(
                        `path_targets[${index}].__path__` as const
                      )}
                    />
                  </InlineField>
                  <InlineField
                    label="Exclude"
                    tooltip="Exclude files matching this pattern"
                    {...commonOptions}
                  >
                    <Input
                      defaultValue={field["__path_exclude__"]}
                      {...methods.register(
                        `path_targets[${index}].__path_exclude__` as const
                      )}
                    />
                  </InlineField>
                  <Button
                    fill="outline"
                    variant="secondary"
                    icon="trash-alt"
                    tooltip="Delete this pattern"
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

const DiscoveryFile = {
  preTransform(data: Record<string, any>): Record<string, any> {
    return data;
  },
  postTransform(data: Record<string, any>): Record<string, any> {
    if (!data["path_targets"]) data["path_targets"] = [];
    data["path_targets"] = data["path_targets"].map(
      (target: Record<string, string>) => {
        if (target["__path_exclude__"] === "")
          delete target["__path_exclude__"];
        return target;
      }
    );
    return data;
  },
  Component,
};

export default DiscoveryFile;
