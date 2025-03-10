import Quill from "quill";
import Module from "quill/core/module";
import Delta from "quill-delta";
import {
  FootnoteDivider,
  FootnoteNumber,
  FootnoteRow,
  FootnoteContent,
  FootnoteSection,
  FootnoteIndex,
} from "../formats";

class FootnoteModule extends Module {
  constructor(quill: Quill, options: any) {
    super(quill, options);
    this.addEventListener();
  }

  static register(): void {
    Quill.register(FootnoteNumber);
    Quill.register(FootnoteDivider);
    Quill.register(FootnoteSection);
    Quill.register(FootnoteRow);
    Quill.register(FootnoteIndex);
    Quill.register(FootnoteContent);
  }

  addEventListener(): void {
    this.quill.on(
      "editor-change",
      (
        eventName: string,
        currentDelta: Delta,
        oldDelta: Delta,
        source: string,
      ) => {
        if (
          source === "undo" ||
          (currentDelta && currentDelta.ops?.some((op: any) => op.delete))
        ) {
          this.updateAllIndices();
        }
      },
    );

    this.quill.root.addEventListener("click", (event: Event) => {
      const target = event.target as HTMLElement;
      if (target && target.classList?.contains("footnote-number")) {
        const createdAt = target.getAttribute("data-createdAt");
        const footnoteRow = document.querySelector(
          `.footnote-row[id="footnote-row-${createdAt}"]`,
        );
        footnoteRow && footnoteRow.scrollIntoView();
      } else if (target && target.classList?.contains("footnote-index")) {
        const createdAt = target.getAttribute("data-createdAt");
        const footnoteNumber = document.querySelector(
          `.footnote-number[id="footnote-${createdAt}"]`,
        );
        footnoteNumber && footnoteNumber.scrollIntoView();
      }
    });
  }

  private applyInsertionDelta(
    createdAt: number,
    content: string,
    insertPos: number,
  ): void {
    let delta = new Delta();
    delta.retain(insertPos);
    delta.insert({
      "footnote-number": { id: createdAt, content, createdAt },
    });
    if (!this.quill.root.querySelector(".footnote-divider")) {
      const docLength = this.quill.getLength();
      delta.retain(docLength - insertPos);
      delta.insert({ "footnote-divider": true });
    }
    const footnoteSection = this.quill.root.querySelector(".footnote-section");
    if (!footnoteSection) {
      const docLength = this.quill.getLength();
      delta.retain(docLength - insertPos);
      delta.insert({ "footnote-section": true });
      delta.insert({
        [FootnoteRow.blotName]: { index: 1, content, createdAt },
      });
    }
    this.quill.updateContents(delta, Quill.sources.USER);
  }

  private updateAfterInsertion(createdAt: number, content: string): void {
    const numbers = Array.from(
      this.quill.root.querySelectorAll(".footnote-number"),
    );
    numbers.sort((a: Element, b: Element) => {
      const aBlot = Quill.find(a) as FootnoteNumber;
      const bBlot = Quill.find(b) as FootnoteNumber;
      const aPos = aBlot ? this.quill.getIndex(aBlot) : 0;
      const bPos = bBlot ? this.quill.getIndex(bBlot) : 0;
      return aPos - bPos;
    });
    let newRowIndex = 1;
    for (let i = 0; i < numbers.length; i++) {
      if (numbers[i].getAttribute("data-createdAt") === String(createdAt)) {
        newRowIndex = i + 1;
        break;
      }
    }
    const sectionElem = this.quill.root.querySelector(".footnote-section");
    if (sectionElem) {
      const currentRows = Array.from(
        sectionElem.querySelectorAll(".footnote-row"),
      );
      const exists = currentRows.some(
        (row) => row.getAttribute("data-createdAt") === String(createdAt),
      );
      if (!exists) {
        const section = Quill.find(sectionElem);
        (section as any).insertFootnoteRowAt(newRowIndex, content, createdAt);
      }
    }
    this.updateAllIndices();
    this.quill.setSelection(0, 0);
  }

  private updateAllIndices(): void {
    const sectionElem = this.quill.root.querySelector(".footnote-section");
    if (!sectionElem) return;
    const rowNodes = Array.from(sectionElem.querySelectorAll(".footnote-row"));
    rowNodes.forEach((node: Element, i: number) => {
      const newIndex = i + 1;
      const blot = Quill.find(node) as FootnoteRow;
      if (blot && typeof blot.format === "function") {
        blot.format("update-footnote-row-index", { index: newIndex });
      }
    });
    const numberNodes = Array.from(
      this.quill.root.querySelectorAll(".footnote-number"),
    );
    numberNodes.sort((a: Element, b: Element) => {
      const aBlot = Quill.find(a) as FootnoteNumber;
      const bBlot = Quill.find(b) as FootnoteNumber;
      const aPos = aBlot ? this.quill.getIndex(aBlot) : 0;
      const bPos = bBlot ? this.quill.getIndex(bBlot) : 0;
      return aPos - bPos;
    });
    numberNodes.forEach((node: Element, i: number) => {
      const newIndex = i + 1;
      const blot = Quill.find(node) as FootnoteNumber;
      if (blot && typeof blot.format === "function") {
        blot.format("update-footnote-number-index", {
          id: (blot.domNode as HTMLElement).getAttribute("id") || "",
          index: newIndex,
        });
      }
    });
  }

  addFootnote(content: string): void {
    if (!this.quill.hasFocus()) {
      this.quill.focus();
    }
    const range = this.quill.getSelection();
    if (!range) return;
    const [leaf] = this.quill.getLine(range.index);
    if (leaf?.statics?.blotName === "footnote-row") {
      return;
    }
    const createdAt = Number(new Date());
    const insertPos = range.index + range.length;
    this.applyInsertionDelta(createdAt, content, insertPos);
    setTimeout(() => {
      this.updateAfterInsertion(createdAt, content);
    }, 0);
  }

  deleteFootnote(footnoteNumber: any): void {
    const createdAt = footnoteNumber.domNode.getAttribute("data-createdAt");
    if (!createdAt) return;
    const targetNumbers = this.quill.scroll.descendants(FootnoteNumber);
    const targetNumber = targetNumbers.find(
      (b: any) =>
        b.domNode.getAttribute("data-createdAt") === String(createdAt),
    );
    if (!targetNumber) return;
    const Npos = this.quill.getIndex(targetNumber);
    const Nlen = targetNumber.length();
    let delta = new Delta();
    delta.retain(Npos);
    delta.delete(Nlen);
    const rowBlots = this.quill.scroll.descendants(FootnoteRow);
    const targetRow = rowBlots.find(
      (b: any) =>
        b.domNode.getAttribute("data-createdAt") === String(createdAt),
    );
    if (targetRow) {
      const Rpos = this.quill.getIndex(targetRow);
      const Rlen = targetRow.length();
      const adjustedRpos = Npos < Rpos ? Rpos - Nlen : Rpos;
      delta.retain(adjustedRpos - Npos);
      delta.delete(Rlen);
    }
    this.quill.updateContents(delta, Quill.sources.USER);
    setTimeout(() => {
      const remainingNumbers = this.quill.scroll.descendants(FootnoteNumber);
      if (remainingNumbers.length === 0) {
        let extraDelta = new Delta();
        const divider = this.quill.root.querySelector(".footnote-divider");
        if (divider) {
          const dividerBlot = Quill.find(divider) as FootnoteDivider | null;
          if (dividerBlot) {
            const dpos = this.quill.getIndex(dividerBlot);
            const dlen = dividerBlot.length() || 1;
            extraDelta.retain(dpos);
            extraDelta.delete(dlen);
          }
        }
        const section = this.quill.root.querySelector(".footnote-section");
        if (section) {
          const sectionBlot = Quill.find(section) as FootnoteSection | null;
          if (sectionBlot) {
            const spos = this.quill.getIndex(sectionBlot);
            const slen = sectionBlot.length() || 1;
            extraDelta.retain(spos);
            extraDelta.delete(slen);
          }
        }
        if (extraDelta.ops.length > 0) {
          this.quill.updateContents(extraDelta, Quill.sources.USER);
        }
      }
      this.updateAllIndices();
      this.quill.history.cutoff();
    }, 0);
  }
}

export default FootnoteModule;
