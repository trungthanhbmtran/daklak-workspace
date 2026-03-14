// utils/nodes/YouTubeNode.js
const { DecoratorNode } = require('lexical');

class YouTubeNode extends DecoratorNode {
  static getType() { return 'youtube'; }
  
  constructor(id, key) {
    super(key);
    this.__id = id;
  }

  static importJSON(serializedNode) {
    return new YouTubeNode(serializedNode.videoID);
  }

  exportDOM() {
    const element = document.createElement('div');
    element.setAttribute('class', 'video-container');
    const iframe = document.createElement('iframe');
    iframe.setAttribute('width', '560');
    iframe.setAttribute('height', '315');
    iframe.setAttribute('src', `https://www.youtube.com/embed/${this.__id}`);
    iframe.setAttribute('frameborder', '0');
    iframe.setAttribute('allowfullscreen', 'true');
    
    element.appendChild(iframe);
    return { element };
  }
}

module.exports = { YouTubeNode };