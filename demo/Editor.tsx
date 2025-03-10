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

    useEffect(() => {
      const container = containerRef.current;
      const editorContainer = container.appendChild(
        container.ownerDocument.createElement("div"),
      );

      const quill = new Quill(editorContainer, {
        theme: "snow",
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

      const customButton = document.querySelector("#ql-footnote");
      customButton.addEventListener("click", function () {
        const module = quill.getModule("footnote");
        module.addFootnote("");
      });

      return () => {
        ref.current = null;
        container.innerHTML = "";
      };
    }, [ref]);

    return (
      <div style={{ margin: '50px'}}>
        <div id="toolbar">
          <button
            id="ql-footnote"
            className="ql-footnote"
            style={{ width: "auto" }}
          >
            Insert Footnote
          </button>
        </div>
        <div ref={containerRef} />
      </div>
    );
  },
);

Editor.displayName = "Editor";

export default Editor;
