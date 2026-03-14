// Converted from TextBoxNode.tsx
// Removed: Only exporting an empty object, as this node is not needed for server-side HTML rendering
module.exports = {};
  static getType() {
    return "text-box";
  }
  static clone(node) {
    return new TextBoxNode(node.__x, node.__y, node.__text, node.__key);
  }
  static importJSON(serializedNode) {
    const { x, y, text } = serializedNode;
    return new TextBoxNode(x, y, text);
  }
  exportJSON() {
    return {
      type: "text-box",
      version: 1,
      x: this.__x,
      y: this.__y,
      text: this.__text,
    };
  }
  constructor(x = 100, y = 100, text = "", key) {
    super(key);
    this.__x = x;
    this.__y = y;
    this.__text = text;
  }
  createDOM() {
    const div = document.createElement("div");
    div.style.position = "absolute";
    div.style.left = `${this.__x}px`;
    div.style.top = `${this.__y}px`;
    return div;
  }
  updateDOM() {
    return false;
  }
  decorate() {
    return React.createElement(
      'div',
      {
        style: {
          position: 'absolute',
          left: this.__x + 'px',
          top: this.__y + 'px',
          border: '1px solid #ccc',
          padding: '8px',
        }
      },
      this.__text
    );
  }
}

