import Container from "quill/blots/container";
import Block, { BlockEmbed } from "quill/blots/block";
import Inline from "quill/blots/inline";

export interface FootnoteIndexValue {
  index: number;
  createdAt: number;
}

export interface FootnoteContentValue {
  content: string;
  createdAt: number;
}

export interface FootnoteRowValue {
  index: number;
  content: string;
  createdAt: number;
}

export class FootnoteIndex extends BlockEmbed {
  static blotName = "footnote-index";
  static tagName = "a";
  static className = "footnote-index";

  static create(value: FootnoteIndexValue): HTMLElement {
    const node = super.create() as HTMLElement;
    const footnoteId = `footnote-index-${value.createdAt}`;
    node.setAttribute("id", footnoteId);
    node.setAttribute("class", "footnote-index");
    node.setAttribute("data-index", value.index.toString());
    node.setAttribute("data-createdAt", value.createdAt.toString());
    node.setAttribute("contenteditable", "false");
    node.textContent = `[${value.index}]`;
    return node;
  }

  remove(): void {
    // prevents deletion
  }

  format(name: string, value: { index: number }): void {
    if (name === "update-footnote-row-index") {
      (this.domNode as HTMLElement).setAttribute(
        "data-index",
        value.index.toString(),
      );
      this.domNode.textContent = `[${value.index}]`;
    }
  }
}

export class FootnoteContent extends Inline {
  static blotName = "footnote-content";
  static tagName = "span";
  static className = "footnote-content";

  static create(value: FootnoteContentValue): HTMLElement {
    const node = super.create() as HTMLElement;
    const id = `footnote-content-${value.createdAt}`;
    node.setAttribute("id", id);
    node.setAttribute("class", "footnote-content");
    node.setAttribute("data-content", value.content);
    node.setAttribute("data-createdAt", value.createdAt.toString());
    node.textContent = value.content;
    return node;
  }
}

export class FootnoteRow extends Block {
  static blotName = "footnote-row";
  static tagName = "p";
  static className = "footnote-row";

  static create(value: FootnoteRowValue): HTMLElement {
    const node = super.create() as HTMLElement;
    const id = `footnote-row-${value.createdAt}`;
    node.setAttribute("id", id);
    node.setAttribute("class", "footnote-row");
    node.setAttribute("data-index", value.index.toString());
    node.setAttribute("data-content", value.content);
    node.setAttribute("data-createdAt", value.createdAt.toString());
    return node;
  }

  static formats(node: HTMLElement) {
    return { footnoteRow: true };
  }

  format(name: string, value: { index: number }): void {
    if (name === "update-footnote-row-index") {
      (this.domNode as HTMLElement).setAttribute(
        "data-index",
        value.index.toString(),
      );
      const indexElem = this.domNode.querySelector(".footnote-index");
      if (indexElem) {
        indexElem.textContent = `[${value.index}]`;
        indexElem.setAttribute("data-index", value.index.toString());
      }
    }
  }

  makeFootnoteRow(index: number, content: string, createdAt: number): void {
    const rowNumber = this.scroll.create("footnote-index", {
      index,
      createdAt,
    });
    this.appendChild(rowNumber);
    const rowContent = this.scroll.create(FootnoteContent.blotName, {
      content,
      createdAt,
    });
    this.appendChild(rowContent);
  }

  optimize(context: any): void {
    if (
      this.statics.requiredContainer &&
      !(this.parent instanceof FootnoteSection)
    ) {
      this.wrap("footnote-section");
    }
    if (!this.domNode.innerText) {
      this.makeFootnoteRow(
        parseInt(this.domNode.getAttribute("data-index") || "0", 10),
        this.domNode.getAttribute("data-content") || "",
        parseInt(this.domNode.getAttribute("data-createdAt") || "0", 10),
      );
    }
    super.optimize(context);
  }
}

export class FootnoteSection extends Container {
  static blotName = "footnote-section";
  static tagName = "div";
  static className = "footnote-section";
  static allowedChildren = [FootnoteRow, FootnoteIndex, FootnoteContent];

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
      content,
      createdAt,
    });
    (newRow as FootnoteRow).makeFootnoteRow(newRowIndex, content, createdAt);
    if (referenceNode) {
      this.domNode.insertBefore(newRow.domNode, referenceNode);
    } else {
      this.domNode.appendChild(newRow.domNode);
    }
  }
}

FootnoteRow.requiredContainer = FootnoteSection;
