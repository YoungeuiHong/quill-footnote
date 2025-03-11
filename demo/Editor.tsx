import React, { forwardRef, useEffect, useLayoutEffect, useRef } from "react";
import Quill from "quill";
import { FootnoteModule, footnoteKeyboardBindings } from "quill-footnote";
import "quill/dist/quill.snow.css";

Quill.register("modules/footnote", FootnoteModule);

const Editor = forwardRef(
  ({ readOnly, defaultValue, onTextChange, onSelectionChange }, ref) => {
    const containerRef = useRef(null);
    const defaultValueRef = useRef(defaultValue);
    const onTextChangeRef = useRef(onTextChange);
    const onSelectionChangeRef = useRef(onSelectionChange);

    useLayoutEffect(() => {
      onTextChangeRef.current = onTextChange;
      onSelectionChangeRef.current = onSelectionChange;
    });

    useEffect(() => {
      ref.current?.enable(!readOnly);
    }, [ref, readOnly]);

    const editorHTML = `
      <div id="toolbar">
        <button type="button" id="ql-footnote" class="ql-footnote" style="width: auto">Insert Footnote</button>
      </div>
      <div id="editor-container" style="height: 400px;" />
  `;

    useEffect(() => {
      const container = containerRef.current;
      container.innerHTML = editorHTML;

      const quill = new Quill("#editor-container", {
        modules: {
          toolbar: {
            container: "#toolbar",
          },
          footnote: true,
          keyboard: {
            bindings: {
              ...footnoteKeyboardBindings,
            },
          },
        },
        theme: "snow",
      });

      ref.current = quill;

      if (defaultValueRef.current) {
        quill.setContents(defaultValueRef.current);
      }

      quill.on(Quill.events.TEXT_CHANGE, (...args) => {
        onTextChangeRef.current?.(...args);
      });

      quill.on(Quill.events.SELECTION_CHANGE, (...args) => {
        onSelectionChangeRef.current?.(...args);
      });

      const footnoteButton = document.querySelector("#ql-footnote");
      footnoteButton.addEventListener("click", function () {
        const module = quill.getModule("footnote");
        module.addFootnote("");
      });

      return () => {
        ref.current = null;
        container.innerHTML = "";
      };
    }, [ref]);

    return (
      <div style={{ margin: "auto", maxWidth: "800px", width: "80%" }}>
        <h1>quill-footnote</h1>
        <div ref={containerRef} />
      </div>
    );
  },
);

Editor.displayName = "Editor";
export default Editor;
