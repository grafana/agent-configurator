import Editor, { Monaco } from "@monaco-editor/react";
import * as monaco from "monaco-editor";
import { useCallback, useMemo, useRef, useState, useEffect } from "react";
import { Button, Drawer, HorizontalGroup, LinkButton } from "@grafana/ui";

import Parser from "web-tree-sitter";

import { Theme, useTheme } from "../../theme";
import ComponentList from "../ComponentList";
import ComponentEditor from "../ComponentEditor";
import * as River from "../../lib/river";
import { useComponentContext, Component, useModelContext } from "../../state";

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
  const { model, setModel } = useModelContext();
  const editorRef = useRef<null | monaco.editor.IStandaloneCodeEditor>(null);
  const monacoRef = useRef<null | Monaco>(null);
  const parserRef = useRef<null | { parser: Parser; river: Parser.Language }>(
    null
  );
  const commandRef = useRef<null | {
    addComponent: string;
    editComponent: string;
  }>(null);

  const componentsRef = useRef<Component[]>([]);

  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const [currentComponent, setCurrentComponent] =
    useState<SelectedComponent | null>(null);

  const theme = useTheme();
  const editorTheme = useMemo(
    () =>
      theme.name.toLowerCase() === Theme.dark ? "thema-dark" : "thema-light",
    [theme]
  );

  const parseComponents = useCallback(() => {
    if (!parserRef.current) return;
    const { parser, river } = parserRef.current;
    const tree = parser.parse(model);
    const componentQuery = river.query(`(config_file (block) @component)`);
    const matches = componentQuery.matches(tree.rootNode);
    const components = matches.map((match) => {
      const node = match.captures[0].node;
      return { node, block: River.UnmarshalBlock(node) };
    });
    setComponents(components);
    componentsRef.current = components;
  }, [setComponents, model]);

  useEffect(() => {
    (async () => {
      await Parser.init({
        locateFile(scriptName: string, scriptDirectory: string) {
          return scriptName;
        },
      });
      const parser = new Parser();
      const river = await Parser.Language.load("tree-sitter-river.wasm");
      parser.setLanguage(river);
      parserRef.current = { parser, river };
      parseComponents();
    })();
  }, [parseComponents]);

  const provideCodeLenses = useCallback(function(
    model: monaco.editor.ITextModel,
    token: monaco.CancellationToken
  ) {
    if (!commandRef.current) return;
    const { addComponent, editComponent } = commandRef.current;
    const lastLine = model.getLineCount();
    const lenses: monaco.languages.CodeLens[] = [
      {
        range: {
          startLineNumber: lastLine,
          endLineNumber: lastLine,
          startColumn: 1,
          endColumn: 1,
        },
        command: {
          id: addComponent,
          title: "Add Component",
        },
      },
    ];
    if (!parserRef.current) {
      return {
        lenses,
        dispose: () => { },
      };
    }
    if (!componentsRef.current) return;
    lenses.push(
      ...componentsRef.current.map((c) => {
        return {
          range: {
            startLineNumber: c.node.startPosition.row + 1,
            startColumn: c.node.startPosition.column,
            endLineNumber: c.node.endPosition.row + 1,
            endColumn: c.node.endPosition.column,
          },
          command: {
            id: editComponent,
            title: "Edit Component",
            arguments: [River.UnmarshalBlock(c.node), c.node],
          },
        };
      })
    );
    return {
      lenses,
      dispose: () => { },
    };
  },
    []);

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
        function() {
          setCurrentComponent(null);
          // need a timeout to prevent the drawer from immediately closing as this happens during the mousedown event
          setTimeout(() => setDrawerOpen(true), 1);
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
          // need a timeout to prevent the drawer from immediately closing as this happens during the mousedown event
          setTimeout(() => setDrawerOpen(true), 1);
        },
        ""
      );

      commandRef.current = {
        addComponent: addComponentCommand!,
        editComponent: editComponentCommand!,
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
    [editorTheme, provideCodeLenses]
  );

  useEffect(parseComponents, [model, setComponents, parseComponents]);

  const onChange = (text: string | undefined) => {
    setModel(text || "");
    localStorage.setItem("config.river", text || "");
  };

  const insertComponent = (component: River.Block) => {
    setCurrentComponent({
      component,
      node: null,
    });
  };

  const updateComponent = (component: River.Block) => {
    const editor = editorRef.current!;
    const model = editor.getModel()!;
    if (currentComponent === null) {
      return;
    }
    if (currentComponent.node !== null) {
      const node = currentComponent.node!;
      const edits = [
        {
          range: {
            startLineNumber: node.startPosition.row + 1,
            startColumn: node.startPosition.column,
            endLineNumber: node.endPosition.row + 1,
            endColumn: node.endPosition.column + 1,
          },
          text: component.marshal(),
        },
      ];
      const oldLabel = node.childForFieldName("label")?.namedChild(0)?.text;
      const oldRef = `${component.name}.${oldLabel}`;

      const existingRefs = model.findMatches(
        oldRef, // searchString
        true, // searchOnlyEditableRange
        false, // isRegex
        true, // matchCase
        null, // wordSeparators
        false // captureMatches
      );
      for (const ref of existingRefs) {
        edits.push({
          range: ref.range,
          text: `${component.name}.${component.label}`,
        });
      }
      editor.executeEdits("configuration-editor", edits);
    } else {
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
        value={model}
        defaultLanguage="hcl"
        onMount={handleEditorDidMount}
        onChange={onChange}
      />
      {isDrawerOpen && (
        <Drawer
          scrollableContent={true}
          onClose={() => setDrawerOpen(false)}
          title={
            currentComponent != null
              ? `Edit Component [${currentComponent.component.name}]`
              : "Add Component"
          }
          closeOnMaskClick={false}
          subtitle={
            currentComponent != null ? (
              <HorizontalGroup>
                {currentComponent?.node == null && (
                  <Button
                    icon="arrow-left"
                    fill="text"
                    variant="secondary"
                    onClick={() => setCurrentComponent(null)}
                  />
                )}
                <LinkButton
                  href={`https://grafana.com/docs/agent/latest/flow/reference/components/${currentComponent.component.name}/`}
                  icon="external-link-alt"
                  variant="secondary"
                  target="_blank"
                >
                  Component Documentation
                </LinkButton>
              </HorizontalGroup>
            ) : null
          }
        >
          {!currentComponent && (
            <ComponentList addComponent={insertComponent} />
          )}
          {currentComponent && (
            <ComponentEditor
              component={currentComponent.component}
              updateComponent={updateComponent}
              discard={() => setDrawerOpen(false)}
            />
          )}
        </Drawer>
      )}
    </>
  );
};

export default ConfigEditor;
