import Embed from "quill/blots/embed";

export interface FootnoteNumberValue {
  id: number;
  index: string;
  createdAt: number;
}

export class FootnoteNumber extends Embed {
  static blotName = "footnote-number";
  static tagName = "a";
  static className = "footnote-number";

  static create(value: FootnoteNumberValue): HTMLElement {
    const node = super.create() as HTMLElement;
    const footnoteId = `footnote-${value.createdAt}`;
    node.setAttribute("id", footnoteId);
    node.setAttribute("class", "footnote-number");
    node.setAttribute("data-index", value.index);
    node.setAttribute("data-createdAt", value.createdAt.toString());
    node.setAttribute("contenteditable", "false");
    node.textContent = `[${value.index || "?"}]`;
    return node;
  }

  static formats(node: HTMLElement) {
    return {
      id: node.getAttribute("id"),
      index: node.getAttribute("data-index"),
      createdAt: node.getAttribute("data-createdAt"),
      footnote: true,
    };
  }

  static value(node: HTMLElement) {
    return {
      id: parseInt(node.getAttribute("data-createdAt") || "0", 10),
      index: node.getAttribute("data-index") || "",
      createdAt: parseInt(node.getAttribute("data-createdAt") || "0", 10),
    };
  }

  format(name: string, value: any): void {
    if (
      name === "update-footnote-number-index" &&
      value.id &&
      value.id === (this.domNode as HTMLElement).getAttribute("id")
    ) {
      (this.domNode as HTMLElement).setAttribute(
        "data-index",
        value.index.toString(),
      );
      this.domNode.textContent = `[${value.index}]`;
    }
  }
}
