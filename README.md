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

When initializing your Quill editor, ensure that the `footnote` module and related keyboard bindings are included in the configuration.  
`footnoteKeyboardBindings` provides custom shortcuts for managing footnotes, such as deleting them using Backspace or Delete.

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

### Insert Footnotes

You can insert footnotes by using the `addFootnote(content: string)` method provided by the `FootnoteModule`.
To add a toolbar button for inserting footnotes, you can create a button and register a click event listener as shown below:

```javascript
const footnoteButton = document.querySelector("#ql-footnote");
footnoteButton.addEventListener("click", function () {
  const footnoteModule = quill.getModule("footnote");
  footnoteModule.addFootnote("");
});
```


### CSS Styling
The default styles for `quill-footnote` are included in:

```javascript
import "quill-footnote/dist/quill-footnote.css";
```
If needed, you can override these styles in your own CSS file after importing `"quill-footnote/dist/quill-footnote.css"`.

**Default Styles (quill-footnote/dist/quill-footnote.css):**
```css
a.footnote-number {
    text-decoration: none !important;
    padding-left: 1px;
    padding-right: 1px;
    cursor: pointer;
}

hr.footnote-divider {
    background-color: #dddddd;
    height: 1px;
    border: 0;
}

.footnote-row::before {
    content: "[" attr(data-index) "] ";
    pointer-events: auto;
    color: #007bff;
    cursor: pointer;
}

.footnote-row {
    pointer-events: auto;
}

```

### Complete React Example

Here's a complete example demonstrating how you might integrate `quill-footnote` in a React project:

**App.jsx**
```jsx
import { useRef } from "react";
import Editor from "./Editor";

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
import { footnoteKeyboardBindings, FootnoteModule } from "quill-footnote";
import "quill/dist/quill.snow.css";
import "quill-footnote/dist/quill-footnote.css"; // Import default footnote styles

Quill.register("modules/footnote", FootnoteModule); // Register the footnote module

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

        // Add a footnote button to the toolbar for inserting footnotes
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
                    footnote: true, // Enables footnote functionality
                    keyboard: {
                        bindings: {
                            ...footnoteKeyboardBindings, // Ensures proper keyboard interactions with footnotes
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

            // Add event listener for the footnote button
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

        return <div ref={containerRef} />
    },
);

Editor.displayName = "Editor";
export default Editor;

```


## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contributing

Contributions are welcome! If you find an issue or have a feature request, feel free to open an issue or submit a pull request.

## Author

[Youngeui Hong](https://github.com/YoungeuiHong)
