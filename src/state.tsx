import React, { useContext, useState } from "react";
import Parser from "web-tree-sitter";

import { Block } from "./lib/river";

const ParserContext = React.createContext<{
  parser: Parser | null;
  river: Parser.Language | null;
  setParser: (p: Parser) => void;
  setRiver: (l: Parser.Language) => void;
}>({
  parser: null,
  river: null,
  setParser: (_: Parser) => {},
  setRiver: (_: Parser.Language) => {},
});
const ComponentContext = React.createContext<{
  components: Block[];
  setComponents: (b: Block[]) => void;
}>({ components: [], setComponents: (_: Block[]) => {} });

// Parser provider
export const ParserProvider = ({ children }: React.PropsWithChildren) => {
  const [parser, setParser] = useState<Parser | null>(null);
  const [river, setRiver] = useState<Parser.Language | null>(null);
  // Remember to pass the state and the updater function to the provider
  return (
    <ParserContext.Provider value={{ parser, setParser, river, setRiver }}>
      {children}
    </ParserContext.Provider>
  );
};

// Parser provider
export const ComponentProvider = ({ children }: React.PropsWithChildren) => {
  const [components, setComponents] = useState<Block[]>([]);
  // Remember to pass the state and the updater function to the provider
  return (
    <ComponentContext.Provider value={{ components, setComponents }}>
      {children}
    </ComponentContext.Provider>
  );
};

// Model state hook
export function useParserContext() {
  const context = useContext(ParserContext);
  if (!context) {
    throw new Error("useModelContext must be used within the ModelProvider");
  }
  return context;
}

export function useComponentContext() {
  const context = useContext(ComponentContext);
  if (!context) {
    throw new Error("useModelContext must be used within the ModelProvider");
  }
  return context;
}
