// Converted from MentionNode.ts
const { $applyNodeReplacement, TextNode } = require("lexical");

class MentionNode extends TextNode {
  static getType() {
    return "mention";
  }
  static clone(node) {
    return new MentionNode(node.__mention, node.__text, node.__key);
  }
  static importJSON(serializedNode) {
    return $createMentionNode(serializedNode.mentionName).updateFromJSON(serializedNode);
  }
  constructor(mentionName, text, key) {
    super(text ?? mentionName, key);
    this.__mention = mentionName;
  }
  exportJSON() {
    return {
      ...super.exportJSON(),
      mentionName: this.__mention,
    };
  }
  createDOM(config) {
    const dom = super.createDOM(config);
    dom.style.cssText = "background-color: rgba(24, 119, 232, 0.2)";
    dom.className = "mention";
    dom.spellcheck = false;
    return dom;
  }
  exportDOM() {
    const element = document.createElement("span");
    element.setAttribute("data-lexical-mention", "true");
    if (this.__text !== this.__mention) {
      element.setAttribute("data-lexical-mention-name", this.__mention);
    }
    element.textContent = this.__text;
    return { element };
  }
  isTextEntity() {
    return true;
  }
  canInsertTextBefore() {
    return false;
  }
  canInsertTextAfter() {
    return false;
  }
}
function $createMentionNode(mentionName, textContent) {
  const mentionNode = new MentionNode(mentionName, textContent = mentionName);
  mentionNode.setMode && mentionNode.setMode("segmented");
  mentionNode.toggleDirectionless && mentionNode.toggleDirectionless();
  return $applyNodeReplacement(mentionNode);
}
function $isMentionNode(node) {
  return node instanceof MentionNode;
}

module.exports = {
  MentionNode,
  $createMentionNode,
  $isMentionNode
};

