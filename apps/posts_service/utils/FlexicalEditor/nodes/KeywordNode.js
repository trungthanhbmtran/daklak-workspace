// Converted from KeywordNode.ts
const { $applyNodeReplacement, TextNode } = require("lexical");

class KeywordNode extends TextNode {
  static getType() {
    return "keyword";
  }

  static clone(node) {
    return new KeywordNode(node.__text, node.__key);
  }

  static importJSON(serializedNode) {
    return $createKeywordNode().updateFromJSON(serializedNode);
  }

  createDOM(config) {
    const dom = super.createDOM(config);
    dom.style.cursor = "default";
    dom.className = "keyword";
    return dom;
  }

  canInsertTextBefore() {
    return false;
  }

  canInsertTextAfter() {
    return false;
  }

  isTextEntity() {
    return true;
  }
}

function $createKeywordNode(keyword = "") {
  return $applyNodeReplacement(new KeywordNode(keyword));
}

function $isKeywordNode(node) {
  return node instanceof KeywordNode;
}

module.exports = {
  KeywordNode,
  $createKeywordNode,
  $isKeywordNode
};

