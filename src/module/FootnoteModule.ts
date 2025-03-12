import Quill from "quill";
import Module from "quill/core/module";
import Delta from "quill-delta";
import {
  FootnoteDivider,
  FootnoteNumber,
  FootnoteRow,
  FootnoteSection,
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
  }

  private addEventListener(): void {
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
        const createdAt = target.getAttribute("data-index");
        const footnoteRow = document.querySelector(
          `.footnote-row[id="footnote-row-${createdAt}"]`,
        );
        footnoteRow && footnoteRow.scrollIntoView();
      } else if (target && target.classList?.contains("footnote-row")) {
        const createdAt = target.getAttribute("data-index");
        const footnoteNumber = document.querySelector(
          `.footnote-number[id="footnote-${createdAt}"]`,
        );
        footnoteNumber && footnoteNumber.scrollIntoView();
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

    const createdAt = Date.now();
    const insertPos = range.index + range.length;

    this.applyInsertionDelta(createdAt, content, insertPos);

    this.updateAfterInsertion(createdAt, content);
  }

  private applyInsertionDelta(
    createdAt: number,
    content: string,
    insertPos: number,
  ): void {
    let delta = new Delta();
    delta.retain(insertPos);
    delta.insert({
      "footnote-number": {
        id: createdAt,
        index: "",
        createdAt,
      },
    });

    if (!this.quill.root.querySelector(".footnote-divider")) {
      const docLength = this.quill.getLength();
      delta.retain(docLength - insertPos);
      delta.insert({ "footnote-divider": true });
    }

    if (!this.quill.root.querySelector(".footnote-section")) {
      const docLength = this.quill.getLength();
      delta.retain(docLength - insertPos);
      delta.insert({ "footnote-section": true });
      delta.insert({
        "footnote-row": {
          index: 1,
          createdAt,
          content,
        },
      });
    }

    this.quill.updateContents(delta, Quill.sources.USER);
  }

  private updateAfterInsertion(createdAt: number, content: string): void {
    const numbers = Array.from(
      this.quill.root.querySelectorAll(".footnote-number"),
    );
    numbers.sort((a, b) => {
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
        const section = Quill.find(sectionElem) as FootnoteSection;
        section.insertFootnoteRowAt(newRowIndex, content, createdAt);
      }
    }

    this.updateAllIndices();
  }

  private updateAllIndices(): void {
    const sectionElem = this.quill.root.querySelector(".footnote-section");
    if (!sectionElem) return;

    const numberNodes = Array.from(
      this.quill.root.querySelectorAll(".footnote-number"),
    );
    numberNodes.sort((a, b) => {
      const aBlot = Quill.find(a) as FootnoteNumber;
      const bBlot = Quill.find(b) as FootnoteNumber;
      const aPos = aBlot ? this.quill.getIndex(aBlot) : 0;
      const bPos = bBlot ? this.quill.getIndex(bBlot) : 0;
      return aPos - bPos;
    });
    numberNodes.forEach((node, i) => {
      const newIndex = i + 1;
      const blot = Quill.find(node) as FootnoteNumber;
      if (blot && typeof blot.format === "function") {
        blot.format("update-footnote-number-index", {
          id: (blot.domNode as HTMLElement).getAttribute("id") || "",
          index: newIndex,
        });
      }
    });

    const rowNodes = Array.from(sectionElem.querySelectorAll(".footnote-row"));
    rowNodes.forEach((node, i) => {
      const newIndex = i + 1;
      const blot = Quill.find(node) as FootnoteRow;
      if (blot && typeof blot.format === "function") {
        blot.format("update-footnote-row-index", { index: newIndex });
      }
    });
  }

  deleteFootnote(footnoteNumber: any): void {
    const createdAt = footnoteNumber.domNode.getAttribute("data-index");
    if (!createdAt) return;

    const targetNumbers = this.quill.scroll.descendants(FootnoteNumber);
    const targetNumber = targetNumbers.find(
      (b: any) => b.domNode.getAttribute("data-index") === String(createdAt),
    );
    if (!targetNumber) return;
    const Npos = this.quill.getIndex(targetNumber);
    const Nlen = targetNumber.length();
    let delta = new Delta();
    delta.retain(Npos).delete(Nlen);

    const rowBlots = this.quill.scroll.descendants(FootnoteRow);
    const targetRow = rowBlots.find(
      (b: any) => b.domNode.getAttribute("data-index") === String(createdAt),
    );
    if (targetRow) {
      const Rpos = this.quill.getIndex(targetRow);
      const Rlen = targetRow.length();
      const adjustedRpos = Npos < Rpos ? Rpos - Nlen : Rpos;
      delta.retain(adjustedRpos - Npos).delete(Rlen);
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
            extraDelta.retain(dpos).delete(dlen);
          }
        }
        const section = this.quill.root.querySelector(".footnote-section");
        if (section) {
          const sectionBlot = Quill.find(section) as FootnoteSection | null;
          if (sectionBlot) {
            const spos = this.quill.getIndex(sectionBlot);
            const slen = sectionBlot.length() || 1;
            extraDelta.retain(spos).delete(slen);
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
