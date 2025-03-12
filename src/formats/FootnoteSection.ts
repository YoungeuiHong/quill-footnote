import Container from "quill/blots/container";
import Block from "quill/blots/block";

export interface FootnoteRowValue {
  index: number;
  createdAt: number;
  content?: string;
}

export class FootnoteSection extends Container {
  static blotName = "footnote-section";
  static tagName = "div";
  static className = "footnote-section";

  insertFootnoteRowAt(
    newRowIndex: number,
    content: string,
    createdAt: number,
  ): void {
    const rows = Array.from(this.domNode.querySelectorAll(".footnote-row"));
    let referenceNode: Node | null = null;

    if (rows.length >= newRowIndex) {
      referenceNode = rows[newRowIndex - 1];
    }

    const newRow = this.scroll.create(FootnoteRow.blotName, {
      index: newRowIndex,
      createdAt,
      content,
    }) as FootnoteRow;

    if (referenceNode) {
      this.domNode.insertBefore(newRow.domNode, referenceNode);
    } else {
      this.domNode.appendChild(newRow.domNode);
    }
  }
}

export class FootnoteRow extends Block {
  static blotName = "footnote-row";
  static tagName = "p";
  static className = "footnote-row";

  static create(value: FootnoteRowValue): HTMLElement {
    const node = super.create() as HTMLElement;
    const rowId = `footnote-row-${value.createdAt}`;
    node.setAttribute("id", rowId);
    node.setAttribute("data-index", String(value.index ?? 1));
    node.setAttribute("data-createdAt", String(value.createdAt ?? 0));

    return node;
  }

  static value(node: HTMLElement): FootnoteRowValue {
    return {
      index: parseInt(node.getAttribute("data-index") || "1", 10),
      createdAt: parseInt(node.getAttribute("data-createdAt") || "0", 10),
      content: node.textContent || "",
    };
  }

  static formats(node: HTMLElement) {
    return {
      index: parseInt(node.getAttribute("data-index") || "1", 10),
      createdAt: parseInt(node.getAttribute("data-createdAt") || "0", 10),
      content: node.textContent || "",
      "footnote-row": true,
    };
  }

  format(name: string, value: { index: number }): void {
    if (name === "update-footnote-row-index") {
      this.domNode.setAttribute("data-index", String(value.index));
    }
  }

  optimize(context: any): void {
    if (
      this.statics.requiredContainer &&
      !(this.parent instanceof FootnoteSection)
    ) {
      this.wrap(FootnoteSection.blotName);
    }
    super.optimize(context);
  }
}

FootnoteSection.allowedChildren = [FootnoteRow];
FootnoteRow.requiredContainer = FootnoteSection;
