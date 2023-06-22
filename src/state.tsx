import React, { useContext, useState } from "react";
import Parser from "web-tree-sitter";
import { Block } from "./lib/river";

export type Component = { block: Block; node: Parser.SyntaxNode };

const ComponentContext = React.createContext<{
  components: Component[];
  setComponents: (b: Component[]) => void;
}>({ components: [], setComponents: (_: Component[]) => { } });

// Component provider
export const ComponentProvider = ({ children }: React.PropsWithChildren) => {
  const [components, setComponents] = useState<Component[]>([]);
  // Remember to pass the state and the updater function to the provider
  return (
    <ComponentContext.Provider value={{ components, setComponents }}>
      {children}
    </ComponentContext.Provider>
  );
};

export function useComponentContext() {
  const context = useContext(ComponentContext);
  if (!context) {
    throw new Error(
      "useComponentContext must be used within the ComponentProvider"
    );
  }
  return context;
}

const ModelContext = React.createContext<{
  model: string;
  setModel: (m: string) => void;
}>({ model: "", setModel: (_: string) => { } });

// Model provider
export const ModelProvider = ({ children }: React.PropsWithChildren) => {
  const urlModel = new URLSearchParams(document.location.search).get("c");
  const localStorageModel = localStorage.getItem("config.river");
  let initialModel = "";
  if (urlModel) initialModel = atob(urlModel);
  else if (localStorageModel) initialModel = localStorageModel;
  const [model, setModel] = useState<string>(initialModel);
  // Remember to pass the state and the updater function to the provider
  return (
    <ModelContext.Provider value={{ model, setModel }}>
      {children}
    </ModelContext.Provider>
  );
};

export function useModelContext() {
  const context = useContext(ModelContext);
  if (!context) {
    throw new Error("useModelContext must be used within the ModelProvider");
  }
  return context;
}
