# quill-footnote

Quill-Footnote is a Quill module that enables easy insertion and management of footnotes within a Quill editor. It handles automatic indexing, insertion, deletion, and navigation of footnotes.

## Installation
```sh
npm install quill-footnote
# or
yarn add quill-footnote
```

Ensure that `quill` is installed in your project:

```sh
npm install quill
# or
yarn add quill
```

## Usage

### Register the Module

To use `quill-footnote`, you must first register the module with Quill:

```javascript
import Quill from "quill";
import { FootnoteModule, footnoteKeyboardBindings } from "quill-footnote";

Quill.register("modules/footnote", FootnoteModule);
```

### Include the Module in Quill Configuration

When initializing your Quill editor, ensure that the `footnote` module and related keyboard bindings are included in the configuration:

```javascript
const quill = new Quill(editorContainer, {
  theme: "snow",
  modules: {
    toolbar: {
      container: "#toolbar",
    },
    footnote: true, // Enables footnote functionality
    keyboard: {
      bindings: {
        ...footnoteKeyboardBindings, // Ensures proper keyboard interactions with footnotes
      },
    },
  },
});
```

### Insert Footnotes Using Button

To enable users to insert footnotes easily, create a custom toolbar button and attach the following event listener:

```javascript
const insertFootnoteButton = document.querySelector("#ql-footnote");
insertFootnoteButton.addEventListener("click", function () {
  const footnoteModule = quill.getModule("footnote");
  footnoteModule.addFootnote("");
});
```

### Complete React Example

Here's a complete example demonstrating how you might integrate `quill-footnote` in a React project:

**App.jsx**
```jsx
import { useRef } from "react";
import Quill from "quill";
import { FootnoteModule } from "quill-footnote";
import Editor from "./Editor";

import "quill/dist/quill.snow.css";

Quill.register("modules/footnote", FootnoteModule);

function App() {
  const quillRef = useRef(null);
  return <Editor ref={quillRef} readOnly={false} />;
}

export default App;
```

**Editor.jsx**
```jsx
import React, { forwardRef, useEffect, useLayoutEffect, useRef } from "react";
import Quill from "quill";
import { FootnoteModule, footnoteKeyboardBindings } from "quill-footnote";

const Editor = forwardRef(({ readOnly, defaultValue, onTextChange, onSelectionChange }, ref) => {
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
      container.ownerDocument.createElement("div")
    );

    const quill = new Quill(editorContainer, {
      theme: "snow",
      modules: {
        toolbar: {
          container: "#toolbar",
        },
        footnote: true, // Enables footnote functionality
        keyboard: {
          bindings: {
            ...footnoteKeyboardBindings, // Required keyboard bindings for footnotes
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

    // Attach footnote insertion to custom button
    const insertFootnoteButton = document.querySelector("#ql-footnote");
    insertFootnoteButton.addEventListener("click", function () {
      const footnoteModule = quill.getModule("footnote");
      footnoteModule.addFootnote("");
    });

    return () => {
      ref.current = null;
      container.innerHTML = "";
    };
  }, [ref]);

  return (
    <>
      <div id="toolbar">
        <button id="ql-footnote" className="ql-footnote" style={{ width: "auto" }}>
          Insert Footnote
        </button>
      </div>
      <div ref={containerRef} />
    </>
  );
});

Editor.displayName = "Editor";
export default Editor;
```

### CSS Styling

The following CSS provides basic styling for footnotes. Feel free to customize according to your project's needs:

```css
a.footnote-number {
  text-decoration: none !important;
  padding-left: 1px;
  padding-right: 1px;
  cursor: pointer;
}

a.footnote-index {
  padding-right: 3px;
  cursor: pointer;
  text-decoration: none !important;
}

hr.footnote-divider {
  background-color: #dddddd;
  height: 1px;
  border: 0;
}
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contributing

Contributions are welcome! If you find an issue or have a feature request, feel free to open an issue or submit a pull request.

## Author

[Youngeui Hong](https://github.com/YoungeuiHong)
