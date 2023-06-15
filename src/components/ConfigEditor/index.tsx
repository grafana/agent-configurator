import Editor, { Monaco } from "@monaco-editor/react";
import * as monaco from "monaco-editor";
import { useCallback, useMemo, useRef, useState } from "react";
import { Drawer } from "@grafana/ui";

import Parser from "web-tree-sitter";

import { Theme, useTheme } from "../../theme";
import ComponentList from "../ComponentList";
import ComponentEditor from "../ComponentEditor";
import * as River from "../../lib/river";
import { useComponentContext } from "../../state";

const defaultOpts: monaco.editor.IStandaloneEditorConstructionOptions = {
  fontSize: 15,
  minimap: { enabled: false },
  scrollbar: {
    vertical: "hidden",
    horizontal: "hidden",
  },
};

type SelectedComponent = {
  component: River.Block;
  node: Parser.SyntaxNode | null;
};

const ConfigEditor = () => {
  const { setComponents } = useComponentContext();
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
      const river = await Parser.Language.load("/tree-sitter-river.wasm");
      const componentQuery = river.query(`(config_file (block) @component)`);
      parser.setLanguage(river);

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
        function() {
          setCurrentComponent(null);
          setDrawerOpen(true);
        },
        ""
      );
      var editComponentCommand = editor.addCommand(
        0,
        function(ctx, component: River.Block, node: Parser.SyntaxNode) {
          setCurrentComponent({
            component,
            node,
          });
          setDrawerOpen(true);
        },
        ""
      );

      const provideCodeLenses = function(
        model: monaco.editor.ITextModel,
        token: monaco.CancellationToken
      ) {
        const lenses: monaco.languages.CodeLens[] = [];
        const value = model.getValue();
        const tree = parser.parse(value);
        const components = componentQuery.matches(tree.rootNode);

        setComponents(
          components.map((match) => {
            const c = match.captures[0];
            return River.Unmarshal(value, c.node);
          })
        );
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
                arguments: [River.Unmarshal(value, c.node), c.node],
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
          dispose: () => { },
        };
      };
      monaco.languages.registerCodeLensProvider("hcl", {
        provideCodeLenses,
        resolveCodeLens: function(model, codeLens, token) {
          return codeLens;
        },
      });
      editorRef.current = editor;
      monacoRef.current = monaco;
    },
    [editorTheme, setComponents]
  );

  const insertComponent = (component: River.Block) => {
    setCurrentComponent({
      component,
      node: null,
    });
  };

  const updateComponent = (component: River.Block) => {
    const editor = editorRef.current!;
    if (currentComponent == null) {
      return;
    }
    if (currentComponent.node != null) {
      editor.executeEdits("configuration-editor", [
        {
          range: {
            startLineNumber: currentComponent.node.startPosition.row + 1,
            startColumn: currentComponent.node.startPosition.column,
            endLineNumber: currentComponent.node.endPosition.row + 1,
            endColumn: currentComponent.node.endPosition.column + 1,
          },
          text: component.marshal(),
        },
      ]);
    } else {
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
    }

    setDrawerOpen(false);
  };

  return (
    <>
      <Editor
        options={defaultOpts}
        theme={editorTheme}
        height="100%"
        defaultValue={"\n"}
        defaultLanguage="hcl"
        onMount={handleEditorDidMount}
      />
      {isDrawerOpen && (
        <Drawer
          scrollableContent={true}
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
