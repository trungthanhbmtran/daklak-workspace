/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { 
  DecoratorNode, NodeKey, SerializedLexicalNode, Spread,
  DOMConversionMap, DOMConversionOutput, DOMExportOutput, LexicalNode
} from "lexical";
import * as React from "react";

export type SerializedImageNode = Spread<{ src: string; altText: string; }, SerializedLexicalNode>;

const ImageUIComponent = ({ src, altText }: { src: string, altText: string }) => {
  if (!src) return null;
  return (
    <div className="flex justify-center my-4 group relative">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img 
        src={src} alt={altText} referrerPolicy="no-referrer" 
        className="rounded-lg shadow-sm max-w-full h-auto border border-border" 
      />
    </div>
  );
};

export class ImageNode extends DecoratorNode<React.ReactNode> {
  __src: string;
  __altText: string;

  static getType(): string { return "image"; }
  static clone(node: ImageNode): ImageNode { return new ImageNode(node.__src, node.__altText, node.__key); }

  static importDOM(): DOMConversionMap | null {
    return {
      // eslint-disable-next-line unused-imports/no-unused-vars
      img: (node: Node) => ({
        conversion: (domNode: Node): DOMConversionOutput | null => {
          if (domNode instanceof HTMLImageElement) {
            let realSrc = domNode.getAttribute('data-src') || domNode.getAttribute('src');

            if (realSrc && realSrc.startsWith('data:')) {
              const srcset = domNode.getAttribute('srcset') || domNode.getAttribute('data-srcset');
              if (srcset) {
                realSrc = srcset.split(' ')[0]; 
              }
            }

            // Quét ngược lên thẻ picture nếu có
            if ((!realSrc || realSrc.startsWith('data:')) && domNode.parentElement && domNode.parentElement.tagName.toUpperCase() === 'PICTURE') {
               const source = domNode.parentElement.querySelector('source');
               if (source) {
                  const srcset = source.getAttribute('srcset') || source.getAttribute('data-srcset');
                  if (srcset) {
                     realSrc = srcset.split(' ')[0];
                  }
               }
            }

            if (realSrc && realSrc.startsWith('http')) {
              return { node: $createImageNode(realSrc, domNode.alt || "Hình ảnh") };
            } else {
              console.error("❌ [LỖI] Không tìm thấy link http/https hợp lệ. Hủy bỏ tấm ảnh này.");
            }
          }
          return null;
        },
        priority: 4, 
      }),
    };
  }

  exportDOM(): DOMExportOutput {
    const element = document.createElement("img");
    element.setAttribute("src", this.__src);
    element.setAttribute("alt", this.__altText);
    element.setAttribute("class", "rounded-lg shadow-sm max-w-full h-auto border border-border");
    return { element };
  }

  constructor(src: string = "", altText: string = "", key?: NodeKey) {
    super(key);
    this.__src = src;
    this.__altText = altText;
  }

  static importJSON(serializedNode: SerializedImageNode): ImageNode { return $createImageNode(serializedNode.src, serializedNode.altText); }
  exportJSON(): SerializedImageNode { return { src: this.getSrc(), altText: this.getAltText(), type: "image", version: 1 }; }
  
  getSrc(): string { return this.__src; }
  getAltText(): string { return this.__altText; }
  setSrc(src: string): void { const writable = this.getWritable(); writable.__src = src; }

  createDOM(config: any): HTMLElement {
    const span = document.createElement("span");
    if (config.theme.image) span.className = config.theme.image;
    return span;
  }

  updateDOM(): false { return false; }
  decorate(): React.ReactNode { return <ImageUIComponent src={this.__src} altText={this.__altText} />; }
}

export function $createImageNode(src: string, altText: string): ImageNode { return new ImageNode(src, altText); }
export function $isImageNode(node: LexicalNode | null | undefined): node is ImageNode { return node instanceof ImageNode; }
