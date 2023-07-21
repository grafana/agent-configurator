import { createContext, PropsWithChildren, useContext, useState } from "react";

export type WizardForm = {
  destination: "cloud" | "local";
  stackName?: string;
  telemetry: {
    logs: boolean;
    metrics: boolean;
    traces: boolean;
    profiles: boolean;
  };
  metrics: {
    template: "static" | "kubernetes" | "unix";
  };
};

const formDefaults: WizardForm = {
  destination: "cloud",
  telemetry: {
    logs: true,
    metrics: true,
    traces: true,
    profiles: true,
  },
  metrics: {
    template: "static",
  },
};

const WizardContext = createContext<{
  wizardData: WizardForm;
  setWizardData: (m: WizardForm) => void;
}>({
  wizardData: formDefaults,
  setWizardData: (_: WizardForm) => { },
});

export const WizardProvider = ({ children }: PropsWithChildren) => {
  const [wizardData, setWizardData] = useState<WizardForm>(formDefaults);
  return (
    <WizardContext.Provider value={{ wizardData, setWizardData }}>
      {children}
    </WizardContext.Provider>
  );
};

export function useWizardContext() {
  const context = useContext(WizardContext);
  if (!context) {
    throw new Error("useWizardContext must be used within the WizardProvider");
  }
  return context;
}
