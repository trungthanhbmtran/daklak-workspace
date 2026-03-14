// Converted from InlineImageNode.tsx
// Removed: Only exporting an empty object, as this node is not needed for server-side HTML rendering
module.exports = {};
  static getType() {
    return "inline-image";
  }
  static clone(node) {
    return new InlineImageNode(
      node.__src,
      node.__altText,
      node.__position,
      node.__width,
      node.__height,
      node.__showCaption,
      node.__caption,
      node.__key
    );
  }
  static importJSON(serializedNode) {
    const { altText, height, width, src, showCaption, position } = serializedNode;
    return $createInlineImageNode({
      altText,
      height,
      position,
      showCaption,
      src,
      width
    }).updateFromJSON ? $createInlineImageNode({
      altText,
      height,
      position,
      showCaption,
      src,
      width
    }).updateFromJSON(serializedNode) : $createInlineImageNode({
      altText,
      height,
      position,
      showCaption,
      src,
      width
    });
  }
  constructor(src, altText, position, width, height, showCaption, caption, key) {
    super(key);
    this.__src = src;
    this.__altText = altText;
    this.__width = width || "inherit";
    this.__height = height || "inherit";
    this.__showCaption = showCaption || false;
    this.__caption = caption || createEditor();
    this.__position = position;
  }
  exportJSON() {
    return {
      ...super.exportJSON(),
      altText: this.__altText,
      caption: this.__caption.toJSON ? this.__caption.toJSON() : {},
      height: this.__height === "inherit" ? 0 : this.__height,
      position: this.__position,
      showCaption: this.__showCaption,
      src: this.__src,
      width: this.__width === "inherit" ? 0 : this.__width
    };
  }
  decorate() {
    return React.createElement(
      'img',
      {
        alt: this.__altText,
        src: this.__src,
        width: this.__width,
        height: this.__height,
        style: { display: 'inline-block' }
      }
    );
  }
}
export function $createInlineImageNode({
  altText,
  position,
  height,
  src,
  width,
  showCaption,
  caption,
  key
}) {
  return $applyNodeReplacement(
    new InlineImageNode(
      src,
      altText,
      position,
      width,
      height,
      showCaption,
      caption,
      key
    )
  );
}
export function $isInlineImageNode(node) {
  return node instanceof InlineImageNode;
}

