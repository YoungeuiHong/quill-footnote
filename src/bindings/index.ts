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

  footnoteEnter: {
    key: "Enter",
    format: ["footnote-row"],
    handler: function (this: { quill: Quill }, range: any): boolean {
      const [line] = this.quill.getLine(range.index);
      return line?.statics?.blotName !== "footnote-row";
    },
  },
};
