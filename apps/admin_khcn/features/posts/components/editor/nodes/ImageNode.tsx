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

  // ==========================================================
  // HÀM THEO DÕI PASTE (ĐÃ THÊM CONSOLE.LOG ĐỂ BẮT BỆNH)
  // ==========================================================
  static importDOM(): DOMConversionMap | null {
    return {
      img: (node: Node) => ({
        conversion: (domNode: Node): DOMConversionOutput | null => {
          if (domNode instanceof HTMLImageElement) {
            console.log("-----------------------------------------");
            console.log("🔍 [1] LEXICAL ĐÃ THẤY THẺ IMG KHI PASTE!");
            console.log("👉 [2] Thuộc tính src gốc:", domNode.src);
            console.log("👉 [3] Thuộc tính data-src:", domNode.getAttribute('data-src'));
            
            let realSrc = domNode.getAttribute('data-src') || domNode.getAttribute('src');

            if (realSrc && realSrc.startsWith('data:')) {
              console.log("⚠️ [4] Cảnh báo: Đây là ảnh base64 (Lazy load), đang tìm trong srcset...");
              const srcset = domNode.getAttribute('srcset') || domNode.getAttribute('data-srcset');
              if (srcset) {
                realSrc = srcset.split(' ')[0]; 
                console.log("✅ [5] Đã tìm thấy link thật trong srcset:", realSrc);
              }
            }

            // Quét ngược lên thẻ picture nếu có
            if ((!realSrc || realSrc.startsWith('data:')) && domNode.parentElement && domNode.parentElement.tagName.toUpperCase() === 'PICTURE') {
               console.log("⚠️ [4b] Đang lục lọi thẻ <picture> cha...");
               const source = domNode.parentElement.querySelector('source');
               if (source) {
                  const srcset = source.getAttribute('srcset') || source.getAttribute('data-srcset');
                  if (srcset) {
                     realSrc = srcset.split(' ')[0];
                     console.log("✅ [5b] Đã tìm thấy link thật từ thẻ <picture>:", realSrc);
                  }
               }
            }

            console.log("🎯 [6] KẾT QUẢ CUỐI CÙNG TRUYỀN VÀO EDITOR:", realSrc);
            console.log("-----------------------------------------");

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
