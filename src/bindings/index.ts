import Quill from "quill";
import { FootnoteModule } from "@src/module";

export const footnoteKeyboardBindings = {
  footnoteBackspace: {
    key: "Backspace",
    format: ["footnote"],
    handler: function (this: { quill: Quill }, range: any): boolean {
      const [leaf] = this.quill.getLeaf(range.index);
      if (leaf?.statics?.blotName === "footnote-number") {
        const footnoteModule = this.quill.getModule(
          "footnote",
        ) as FootnoteModule;
        footnoteModule.deleteFootnote(leaf);
        return false;
      }
      return true;
    },
  },

  footnoteDelete: {
    key: "Delete",
    handler: function (this: { quill: Quill }, range: any): boolean {
      const [leaf] = this.quill.getLeaf(range.index + 1);
      if (leaf?.statics?.blotName === "footnote-number") {
        const footnoteModule = this.quill.getModule(
          "footnote",
        ) as FootnoteModule;
        footnoteModule.deleteFootnote(leaf);
        return false;
      }
      return true;
    },
  },

  footnoteRowBackspace: {
    key: "Backspace",
    format: ["footnote-row"],
    handler: function (this: { quill: Quill }, range: any): boolean {
      const [curr] = this.quill.getLeaf(range.index);
      const [prev] = this.quill.getLeaf(range.index - 1);
      return !(
        prev?.statics?.blotName === "footnote-divider" ||
        prev?.statics?.blotName === "break" ||
        curr?.statics?.blotName === "break"
      );
    },
  },

  footnoteRowDelete: {
    key: "Delete",
    format: ["footnote-row"],
    handler: function (this: { quill: Quill }, range: any) {
      const [currentLine, offset] = this.quill.getLine(range.index);
      if (!currentLine) return true;

      if (currentLine.statics.blotName !== "footnote-row") {
        return true;
      }

      const lineLength = currentLine.length();
      if (offset >= lineLength - 1) {
        const [nextLine] = this.quill.getLine(range.index + 1);
        if (nextLine?.statics?.blotName === "footnote-row") {
          return false;
        }
      }

      return true;
    },
  },

  footnoteEnter: {
    key: "Enter",
    format: ["footnote-row"],
    handler: function (this: { quill: Quill }, range: any): boolean {
      const [line] = this.quill.getLine(range.index);
      return line?.statics?.blotName !== "footnote-row";
    },
  },
};
