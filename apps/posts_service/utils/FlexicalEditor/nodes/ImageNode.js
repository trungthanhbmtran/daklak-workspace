const { DecoratorNode } = require('lexical');

class ServerImageNode extends DecoratorNode {
  static getType() {
    return 'image';
  }

  static clone(node) {
    return new ServerImageNode(
      node.__src,
      node.__altText,
      node.__width,
      node.__height,
      node.__key
    );
  }

  static importJSON(serializedNode) {
    const { src, altText, width, height } = serializedNode;
    return new ServerImageNode(src, altText, width, height);
  }

  constructor(src, altText, width, height, key) {
    super(key);
    this.__src = src;
    this.__altText = altText;
    this.__width = width;
    this.__height = height;
  }

  // Đây là hàm quan trọng nhất để tạo HTML string
  exportDOM() {
    const element = document.createElement('img');
    element.setAttribute('src', this.__src);
    element.setAttribute('alt', this.__altText || '');
    if (this.__width) element.setAttribute('width', this.__width.toString());
    if (this.__height) element.setAttribute('height', this.__height.toString());
    
    // Style cho ảnh responsive cơ bản
    element.style.maxWidth = '100%';
    element.style.height = 'auto';
    element.style.display = 'block';
    
    return { element };
  }
}

module.exports = { ImageNode };