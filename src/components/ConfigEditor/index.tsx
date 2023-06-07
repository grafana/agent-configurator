import Editor, { Monaco } from "@monaco-editor/react";
import * as monaco from "monaco-editor";
import { useCallback, useMemo, useRef, useState } from "react";
import { Drawer } from "@grafana/ui";

import { Theme, useTheme } from "../../theme";
import ComponentList from "../ComponentList";
import ComponentEditor from "../ComponentEditor";

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

const ConfigEditor = ({ value, onChange, isReadOnly }: Props) => {
  const editorRef = useRef<null | monaco.editor.IStandaloneCodeEditor>(null);
  const monacoRef = useRef<null | Monaco>(null);

  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const [currentComponent, setCurrentComponent] = useState({ active: false });

  const theme = useTheme();
  const editorTheme = useMemo(
    () =>
      theme.name.toLowerCase() === Theme.dark ? "thema-dark" : "thema-light",
    [theme]
  );

  const handleEditorDidMount = useCallback(
    (editor: monaco.editor.IStandaloneCodeEditor, monaco: Monaco) => {
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
          setCurrentComponent({ active: false });
          setDrawerOpen(true);
        },
        ""
      );
      var editComponentCommand = editor.addCommand(
        0,
        function () {
          setCurrentComponent({ active: true });
          setDrawerOpen(true);
        },
        ""
      );
      monaco.languages.registerCodeLensProvider("hcl", {
        provideCodeLenses: function (model, token) {
          const components = model.findMatches(
            '^[a-z_-]+\\.([a-z_-]+\\.?)+ ".*"',
            true,
            true,
            false,
            null,
            true
          );
          const lastLine = model.getLineCount();
          const lenses: monaco.languages.CodeLens[] = [];
          lenses.push(
            ...components.map((c) => {
              return {
                range: c.range,
                command: {
                  id: editComponentCommand!,
                  title: "Edit Component",
                },
              };
            })
          );
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
        },
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

  const insertComponent = (component: string) => {
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
        text: "\n" + component + "\n",
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
          title={currentComponent.active ? "Edit Component" : "Add Component"}
        >
          {!currentComponent.active && (
              <ComponentList addComponent={insertComponent} />
          )}
          {currentComponent.active && (
              <ComponentEditor updateComponent={(_) => setDrawerOpen(false) } />
          )}
        </Drawer>
      )}
    </>
  );
};

export default ConfigEditor;
