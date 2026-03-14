const { DecoratorNode } = require('lexical');

class VideoNode extends DecoratorNode {
  constructor(src, width, height, key) {
    super(key);
    this.__src = src;
    this.__width = width || '100%';
    this.__height = height || 'auto';
  }

  static getType() {
    return 'video'; // Phải khớp với type ở Frontend
  }

  static clone(node) {
    return new VideoNode(node.__src, node.__width, node.__height, node.__key);
  }

  static importJSON(serializedNode) {
    const { src, width, height } = serializedNode;
    return new VideoNode(src, width, height);
  }

  exportJSON() {
    return {
      src: this.__src,
      width: this.__width,
      height: this.__height,
      type: 'video',
      version: 1,
    };
  }

  // --- Render ra thẻ HTML Video ---
  exportDOM() {
    const element = document.createElement('video');
    element.setAttribute('src', this.__src);
    element.setAttribute('controls', 'true'); // Hiện nút play/pause
    
    if (this.__width) element.style.width = this.__width;
    if (this.__height) element.style.height = this.__height;

    return { element };
  }
}

module.exports = { VideoNode };