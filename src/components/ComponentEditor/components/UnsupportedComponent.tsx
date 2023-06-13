import { Field, Input, Alert } from "@grafana/ui";

const UnsupportedComponent = () => {
  return (
    <Alert severity="error" title="Unsupported component">
      <p>This component is currently not supported by the configuration generator</p>
    </Alert>
  );
};

export default UnsupportedComponent;
