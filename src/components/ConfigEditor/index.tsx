import Editor, { Monaco } from "@monaco-editor/react";
import * as monaco from "monaco-editor";
import { useCallback, useMemo, useRef, useState } from "react";
import { Drawer } from "@grafana/ui";

import Parser from "web-tree-sitter";

import { Theme, useTheme } from "../../theme";
import ComponentList from "../ComponentList";
import ComponentEditor from "../ComponentEditor";
import * as river from "../../lib/river";

const defaultOpts: monaco.editor.IStandaloneEditorConstructionOptions = {
  fontSize: 15,
  minimap: { enabled: false },
  scrollbar: {
    vertical: "hidden",
    horizontal: "hidden",
  },
};

const readOnlyOpts: monaco.editor.IStandaloneEditorConstructionOptions = {
  readOnly: true,
  lineNumbers: "off",
};

interface Props {
  value: string;
  onChange?: (value?: string) => void;
  isReadOnly?: boolean;
}

type SelectedComponent = {
  component: river.Component;
  node: Parser.SyntaxNode;
};

const ConfigEditor = ({ value, onChange, isReadOnly }: Props) => {
  const editorRef = useRef<null | monaco.editor.IStandaloneCodeEditor>(null);
  const monacoRef = useRef<null | Monaco>(null);

  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const [currentComponent, setCurrentComponent] =
    useState<SelectedComponent | null>(null);

  const theme = useTheme();
  const editorTheme = useMemo(
    () =>
      theme.name.toLowerCase() === Theme.dark ? "thema-dark" : "thema-light",
    [theme]
  );

  const handleEditorDidMount = useCallback(
    async (editor: monaco.editor.IStandaloneCodeEditor, monaco: Monaco) => {
      await Parser.init({
        locateFile(scriptName: string, scriptDirectory: string) {
          return scriptName;
        },
      });
      const parser = new Parser();
      const River = await Parser.Language.load("/tree-sitter-river.wasm");
      const componentQuery = River.query(`(config_file (block) @component)`);
      parser.setLanguage(River);
      monaco.editor.defineTheme("thema-dark", {
        base: "vs-dark",
        inherit: true,
        rules: [],
        colors: {
          "editor.background": "#22252b",
        },
      });
      monaco.editor.defineTheme("thema-light", {
        base: "vs",
        inherit: true,
        rules: [],
        colors: {
          "editor.background": "#F4F5F5",
        },
      });
      monaco.editor.setTheme(editorTheme);

      var addComponentCommand = editor.addCommand(
        0,
        function () {
          setCurrentComponent(null);
          setDrawerOpen(true);
        },
        ""
      );
      var editComponentCommand = editor.addCommand(
        0,
        function (ctx, component: river.Component, node: Parser.SyntaxNode) {
          console.log(component);
          setCurrentComponent({
            component,
            node,
          });
          setDrawerOpen(true);
        },
        ""
      );

      const provideCodeLenses = function (
        model: monaco.editor.ITextModel,
        token: monaco.CancellationToken
      ) {
        const lenses: monaco.languages.CodeLens[] = [];
        const value = model.getValue();
        const tree = parser.parse(value);
        const components = componentQuery.matches(tree.rootNode);
        lenses.push(
          ...components.map((match) => {
            const c = match.captures[0];

            return {
              range: {
                startLineNumber: c.node.startPosition.row + 1,
                startColumn: c.node.startPosition.column,
                endLineNumber: c.node.endPosition.row + 1,
                endColumn: c.node.endPosition.column,
              },
              command: {
                id: editComponentCommand!,
                title: "Edit Component",
                arguments: [river.Unmarshal(value, c.node), c.node],
              },
            };
          })
        );
        const lastLine = model.getLineCount();
        lenses.push({
          range: {
            startLineNumber: lastLine,
            endLineNumber: lastLine,
            startColumn: 1,
            endColumn: 1,
          },
          command: {
            id: addComponentCommand!,
            title: "Add Component",
          },
        });
        return {
          lenses,
          dispose: () => {},
        };
      };
      monaco.languages.registerCodeLensProvider("hcl", {
        provideCodeLenses,
        resolveCodeLens: function (model, codeLens, token) {
          return codeLens;
        },
      });
      editorRef.current = editor;
      monacoRef.current = monaco;
    },
    [editorTheme]
  );

  const opts = useMemo(
    () => (isReadOnly ? { ...defaultOpts, ...readOnlyOpts } : defaultOpts),
    [isReadOnly]
  );

  const insertComponent = (component: river.Component) => {
    const editor = editorRef.current!;
    const model = editor.getModel()!;

    const lastLine = model.getLineCount();
    const column = model.getLineMaxColumn(lastLine);
    editor.executeEdits("configuration-editor", [
      {
        range: {
          startLineNumber: model.getLineCount(),
          endLineNumber: model.getLineCount(),
          startColumn: column,
          endColumn: column,
        },
        text: component.marshal() + "\n",
      },
    ]);
    setDrawerOpen(false);
  };

  const updateComponent = (component: river.Component) => {
    const editor = editorRef.current!;
    if (currentComponent == null) {
      return;
    }

    editor.executeEdits("configuration-editor", [
      {
        range: {
          startLineNumber: currentComponent.node.startPosition.row,
          startColumn: currentComponent.node.startPosition.column,
          endLineNumber: currentComponent.node.endPosition.row + 1,
          endColumn: currentComponent.node.endPosition.column + 1,
        },
        text: component.marshal(),
      },
    ]);
    setDrawerOpen(false);
  };

  return (
    <>
      <Editor
        options={opts}
        theme={editorTheme}
        height="100%"
        value={value}
        defaultValue={
          "# Welcome to the Grafana Agent Config Generator! Click on 'Add Component' below to get started\n\n"
        }
        defaultLanguage="hcl"
        onMount={handleEditorDidMount}
        onChange={onChange}
      />
      {isDrawerOpen && (
        <Drawer
          onClose={() => setDrawerOpen(false)}
          title={currentComponent != null ? "Edit Component" : "Add Component"}
        >
          {!currentComponent && (
            <ComponentList addComponent={insertComponent} />
          )}
          {currentComponent && (
            <ComponentEditor
              component={currentComponent.component}
              updateComponent={updateComponent}
            />
          )}
        </Drawer>
      )}
    </>
  );
};

export default ConfigEditor;
