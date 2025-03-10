import { BlockEmbed } from "quill/blots/block";

export class FootnoteDivider extends BlockEmbed {
  static blotName = "footnote-divider";

  static className = "footnote-divider";

  static tagName = "hr";
}
