"use client";

import React, { useCallback, useEffect, useState, useRef, forwardRef } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  $getSelection, $isRangeSelection, $isNodeSelection, $isElementNode, $isTextNode,
  FORMAT_TEXT_COMMAND, FORMAT_ELEMENT_COMMAND,
  UNDO_COMMAND, REDO_COMMAND
} from "lexical";
import { $isHeadingNode, $createHeadingNode, $createQuoteNode } from "@lexical/rich-text";
import { $setBlocksType, $patchStyleText } from "@lexical/selection";
import { $createParagraphNode } from "lexical";
import { INSERT_ORDERED_LIST_COMMAND, INSERT_UNORDERED_LIST_COMMAND } from "@lexical/list";
import { INSERT_TABLE_COMMAND, $isTableNode, $isTableSelection } from "@lexical/table";
import { $findMatchingParent } from "@lexical/utils";

import { INSERT_IMAGE_COMMAND } from "./ImagePlugin";
import { TOGGLE_LINK_COMMAND, $isLinkNode } from "@lexical/link";

import {
  Bold, Italic, Underline, Strikethrough,
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  List, ListOrdered, Undo, Redo, ImagePlus, Table as TableIcon,
  Video, Upload, Baseline, PaintBucket,
  Link as LinkIcon, Unlink,
  Subscript, Superscript, Eraser 
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input"; 
import { Switch } from "@/components/ui/switch"; 
import { Label } from "@/components/ui/label"; 
import { cn } from "@/lib/utils";

// ============================================================================
// 1. NÚT BẤM DÙNG CHUNG (Giữ nguyên style phẳng của Mạnh)
// ============================================================================
const ToolbarIconButton = forwardRef<HTMLButtonElement, any>(
  ({ icon: Icon, onClick, isActive = false, className, title, ...props }, ref) => (
    <Button
      ref={ref}
      variant={isActive ? "secondary" : "ghost"}
      size="icon"
      title={title}
      className={cn("h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors", className, isActive && "bg-muted text-foreground font-bold shadow-sm")}
      onMouseDown={(e) => e.preventDefault()} 
      onClick={onClick} 
      {...props}
    >
      <Icon className="h-4 w-4" />
    </Button>
  )
);
ToolbarIconButton.displayName = "ToolbarIconButton";

const ToolbarSeparator = () => <Separator orientation="vertical" className="h-5 mx-1 bg-border/50" />;

const COLORS = [
  "#000000", "#434343", "#666666", "#999999", "#b7b7b7", "#cccccc", "#d9d9d9", "#efefef", "#f3f3f3", "#ffffff",
  "#980000", "#ff0000", "#ff9900", "#ffff00", "#00ff00", "#00ffff", "#4a86e8", "#0000ff", "#9900ff", "#ff00ff",
  "#e6b8af", "#f4cccc", "#fce5cd", "#fff2cc", "#d9ead3", "#d0e0e3", "#c9daf8", "#cfe2f3", "#d9d2e9", "#ead1dc",
  "#dd7e6b", "#ea9999", "#f9cb9c", "#ffe599", "#b6d7a8", "#a2c4c9", "#a4c2f4", "#9fc5e8", "#b4a7d6", "#d5a6bd",
  "#cc4125", "#e06666", "#f6b26b", "#ffd966", "#93c47d", "#76a5af", "#6d9eeb", "#6fa8dc", "#8e7cc3", "#c27ba0",
  "#a61c00", "#cc0000", "#e69138", "#f1c232", "#6aa84f", "#45818e", "#3c78d8", "#3d85c6", "#674ea7", "#a64d79",
  "#85200c", "#990000", "#b45f06", "#bf9000", "#38761d", "#134f5c", "#1155cc", "#0b5394", "#351c75", "#741b47",
  "#5b0f00", "#660000", "#783f04", "#7f6000", "#274e13", "#0c343d", "#1c4587", "#073763", "#20124d", "#4c1130"
];

// ============================================================================
// 2. SMART COMPONENTS (Đã gộp lại cho phẳng)
// ============================================================================

const UndoRedoPlugin = () => {
  const [editor] = useLexicalComposerContext();
  return (
    <>
      <ToolbarIconButton icon={Undo} title="Hoàn tác (Ctrl+Z)" onClick={() => editor.dispatchCommand(UNDO_COMMAND, undefined)} />
      <ToolbarIconButton icon={Redo} title="Làm lại (Ctrl+Y)" onClick={() => editor.dispatchCommand(REDO_COMMAND, undefined)} />
    </>
  );
};

const BlockFormatPlugin = () => {
  const [editor] = useLexicalComposerContext();
  const [blockType, setBlockType] = useState("paragraph");

  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          const anchorNode = selection.anchor.getNode();
          const element = anchorNode.getKey() === "root" ? anchorNode : anchorNode.getTopLevelElementOrThrow();
          if (element !== null) setBlockType($isHeadingNode(element) ? element.getTag() : element.getType());
        }
      });
    });
  }, [editor]);

  const formatBlock = (type: string) => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        if (type === "h1") $setBlocksType(selection, () => $createHeadingNode("h1"));
        else if (type === "h2") $setBlocksType(selection, () => $createHeadingNode("h2"));
        else if (type === "quote") $setBlocksType(selection, () => $createQuoteNode());
        else $setBlocksType(selection, () => $createParagraphNode());
      }
    });
  };

  return (
    <Select value={blockType} onValueChange={formatBlock}>
      <SelectTrigger className="w-[130px] h-8 bg-transparent border-none shadow-none font-medium focus:ring-0 text-foreground">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="paragraph">Đoạn văn</SelectItem>
        <SelectItem value="h1"><span className="font-bold text-lg">Tiêu đề 1</span></SelectItem>
        <SelectItem value="h2"><span className="font-bold text-base">Tiêu đề 2</span></SelectItem>
        <SelectItem value="quote">Trích dẫn</SelectItem>
      </SelectContent>
    </Select>
  );
};

const FontFormatPlugin = () => {
  const [editor] = useLexicalComposerContext();
  const [fontFamily, setFontFamily] = useState("Arial");

  const applyStyleText = useCallback((styles: Record<string, string>) => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) $patchStyleText(selection, styles);
    });
  }, [editor]);

  return (
    <Select value={fontFamily} onValueChange={(v) => { setFontFamily(v); applyStyleText({ "font-family": v }); }}>
      <SelectTrigger className="w-[120px] h-8 bg-transparent border-none shadow-none text-sm focus:ring-0 text-foreground">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="Arial"><span style={{ fontFamily: "Arial" }}>Arial</span></SelectItem>
        <SelectItem value="Times New Roman"><span style={{ fontFamily: "Times New Roman" }}>Times New Roman</span></SelectItem>
        <SelectItem value="Roboto"><span style={{ fontFamily: "Roboto" }}>Roboto</span></SelectItem>
        <SelectItem value="Courier New"><span style={{ fontFamily: "Courier New" }}>Courier New</span></SelectItem>
        <SelectItem value="Georgia"><span style={{ fontFamily: "Georgia" }}>Georgia</span></SelectItem>
      </SelectContent>
    </Select>
  );
};

const TextFormatPlugin = () => {
  const [editor] = useLexicalComposerContext();
  const [format, setFormat] = useState({ bold: false, italic: false, underline: false, strikethrough: false, sub: false, sup: false });

  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          setFormat({
            bold: selection.hasFormat("bold"),
            italic: selection.hasFormat("italic"),
            underline: selection.hasFormat("underline"),
            strikethrough: selection.hasFormat("strikethrough"),
            sub: selection.hasFormat("subscript"),
            sup: selection.hasFormat("superscript"),
          });
        }
      });
    });
  }, [editor]);

  const clearFormatting = useCallback(() => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        selection.getNodes().forEach((node) => {
          if ($isTextNode(node)) { node.setFormat(0); node.setStyle(""); }
          if ($isElementNode(node)) { node.setFormat(""); }
        });
      }
    });
  }, [editor]);

  return (
    <>
      <ToolbarIconButton icon={Bold} title="In đậm (Ctrl+B)" isActive={format.bold} onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold")} />
      <ToolbarIconButton icon={Italic} title="In nghiêng (Ctrl+I)" isActive={format.italic} onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "italic")} />
      <ToolbarIconButton icon={Underline} title="Gạch chân (Ctrl+U)" isActive={format.underline} onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "underline")} />
      <ToolbarIconButton icon={Strikethrough} title="Gạch ngang" isActive={format.strikethrough} onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "strikethrough")} />
      
      <ToolbarSeparator />
      
      <ToolbarIconButton icon={Subscript} title="Chỉ số dưới (Ví dụ: H₂O)" isActive={format.sub} onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "subscript")} />
      <ToolbarIconButton icon={Superscript} title="Chỉ số trên (Ví dụ: m²)" isActive={format.sup} onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "superscript")} />
      
      <ToolbarSeparator />
      
      <ToolbarIconButton icon={Eraser} title="Xóa định dạng" className="text-red-500 hover:text-red-700 hover:bg-red-50" onClick={clearFormatting} />
    </>
  );
};

const ColorAndLinkPlugin = () => {
  const [editor] = useLexicalComposerContext();
  const [isLink, setIsLink] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [isTargetBlank, setIsTargetBlank] = useState(true); 
  const [isLinkPopoverOpen, setIsLinkPopoverOpen] = useState(false);

  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          const node = selection.anchor.getNode();
          const parent = node.getParent();
          if ($isLinkNode(parent) || $isLinkNode(node)) {
            setIsLink(true);
            const linkNode = $isLinkNode(parent) ? parent : node;
            setLinkUrl((linkNode as any).getURL());
            setIsTargetBlank((linkNode as any).getTarget() === "_blank");
          } else {
            setIsLink(false); setLinkUrl(""); setIsTargetBlank(true);
          }
        }
      });
    });
  }, [editor]);

  const applyStyleText = useCallback((styles: Record<string, string>) => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) $patchStyleText(selection, styles);
    });
  }, [editor]);

  const insertLink = useCallback(() => {
    if (!isLinkPopoverOpen) return setIsLinkPopoverOpen(true);
    if (linkUrl.trim() === "") editor.dispatchCommand(TOGGLE_LINK_COMMAND, null);
    else editor.dispatchCommand(TOGGLE_LINK_COMMAND, { url: linkUrl.trim(), target: isTargetBlank ? "_blank" : undefined, rel: isTargetBlank ? "noopener noreferrer" : undefined });
    setIsLinkPopoverOpen(false);
  }, [editor, linkUrl, isTargetBlank, isLinkPopoverOpen]);

  const removeLink = useCallback(() => {
    editor.dispatchCommand(TOGGLE_LINK_COMMAND, null);
    setIsLinkPopoverOpen(false);
  }, [editor]);

  return (
    <>
      <Popover>
        <PopoverTrigger asChild><ToolbarIconButton icon={Baseline} title="Màu chữ" className="text-blue-600 hover:bg-blue-50" /></PopoverTrigger>
        <PopoverContent className="w-[280px] p-3 shadow-xl rounded-xl" align="start">
          <div className="text-xs font-semibold mb-2 text-slate-500 uppercase">Màu chữ</div>
          <div className="grid grid-cols-10 gap-1">
            {COLORS.map((color) => (<button key={`text-${color}`} className="w-5 h-5 rounded-sm border hover:scale-110" style={{ backgroundColor: color }} onClick={() => applyStyleText({ color: color })} title={color} />))}
          </div>
        </PopoverContent>
      </Popover>

      <Popover>
        <PopoverTrigger asChild><ToolbarIconButton icon={PaintBucket} title="Màu nền" className="text-amber-600 hover:bg-amber-50" /></PopoverTrigger>
        <PopoverContent className="w-[280px] p-3 shadow-xl rounded-xl" align="start">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase">Màu nền</span>
            <button className="text-[10px] text-blue-600 hover:underline" onClick={() => applyStyleText({ "background-color": "transparent" })}>Xóa nền</button>
          </div>
          <div className="grid grid-cols-10 gap-1">
            {COLORS.map((color) => (<button key={`bg-${color}`} className="w-5 h-5 rounded-sm border hover:scale-110" style={{ backgroundColor: color }} onClick={() => applyStyleText({ "background-color": color })} title={color} />))}
          </div>
        </PopoverContent>
      </Popover>

      <ToolbarSeparator />

      <Popover open={isLinkPopoverOpen} onOpenChange={setIsLinkPopoverOpen}>
        <PopoverTrigger asChild>
          <ToolbarIconButton icon={LinkIcon} title="Chèn liên kết" isActive={isLink} className={cn(isLink && "text-blue-600 bg-blue-50")} />
        </PopoverTrigger>
        <PopoverContent className="w-80 p-4 shadow-xl border-slate-200 rounded-xl" align="center">
          <div className="flex flex-col gap-3">
            <span className="text-xs font-bold text-slate-700 uppercase">{isLink ? "Sửa Liên Kết" : "Chèn Liên Kết"}</span>
            <Input placeholder="Dán URL vào đây..." className="h-8 text-sm" value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} onKeyDown={(e) => e.key === "Enter" && insertLink()} autoFocus />
            <div className="flex items-center space-x-2 py-1">
              <Switch id="target-blank" checked={isTargetBlank} onCheckedChange={setIsTargetBlank} />
              <Label htmlFor="target-blank" className="text-xs text-slate-600 font-medium cursor-pointer">Mở trong Tab mới</Label>
            </div>
            <div className="flex justify-end gap-2 mt-1">
              {isLink && (<Button variant="ghost" size="sm" className="h-8 text-xs text-red-600 hover:bg-red-50" onClick={removeLink}><Unlink className="h-3.5 w-3.5 mr-1" /> Gỡ Link</Button>)}
              <Button size="sm" className="h-8 px-4 text-xs bg-blue-600 hover:bg-blue-700 text-white" onClick={insertLink}>Áp dụng</Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </>
  );
};

const AlignmentAndListPlugin = () => {
  const [editor] = useLexicalComposerContext();
  const [isList, setIsList] = useState({ bullet: false, number: false });

  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          const anchorNode = selection.anchor.getNode();
          const element = anchorNode.getKey() === "root" ? anchorNode : anchorNode.getTopLevelElementOrThrow();
          if (element !== null) setIsList({ bullet: element.getType() === "bullet", number: element.getType() === "number" });
        }
      });
    });
  }, [editor]);

  const handleAlign = (formatType: 'left' | 'center' | 'right' | 'justify') => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, formatType);

  return (
    <>
      <ToolbarIconButton icon={AlignLeft} title="Căn trái" onClick={() => handleAlign("left")} />
      <ToolbarIconButton icon={AlignCenter} title="Căn giữa" onClick={() => handleAlign("center")} />
      <ToolbarIconButton icon={AlignRight} title="Căn phải" onClick={() => handleAlign("right")} />
      <ToolbarIconButton icon={AlignJustify} title="Căn đều 2 bên" onClick={() => handleAlign("justify")} />
      <ToolbarSeparator />
      <ToolbarIconButton icon={List} title="Danh sách chấm" isActive={isList.bullet} onClick={() => editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined)} />
      <ToolbarIconButton icon={ListOrdered} title="Danh sách số" isActive={isList.number} onClick={() => editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined)} />
    </>
  );
};

const InsertMediaPlugin = () => {
  const [editor] = useLexicalComposerContext();
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [isTableOpen, setIsTableOpen] = useState(false);
  const [gridSize, setGridSize] = useState({ rows: 0, cols: 0 });
  const [isImageOpen, setIsImageOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState("");

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          editor.dispatchCommand(INSERT_IMAGE_COMMAND, { src: reader.result, altText: file.name });
          setIsImageOpen(false);
        }
      };
      reader.readAsDataURL(file);
    }
    if (imageInputRef.current) imageInputRef.current.value = "";
  };

  const handleInsertTable = (rows: number, cols: number) => {
    if (rows > 0 && cols > 0) {
      editor.dispatchCommand(INSERT_TABLE_COMMAND, { columns: cols.toString(), rows: rows.toString(), includeHeaders: true });
      setIsTableOpen(false);
      setGridSize({ rows: 0, cols: 0 });
    }
  };

  return (
    <>
      <input type="file" ref={imageInputRef} className="hidden" accept="image/png, image/jpeg, image/webp" onChange={handleImageUpload} />

      <Popover open={isImageOpen} onOpenChange={setIsImageOpen}>
        <PopoverTrigger asChild>
          <ToolbarIconButton icon={ImagePlus} title="Chèn Hình" className="text-emerald-600 hover:bg-emerald-50" />
        </PopoverTrigger>
        <PopoverContent className="w-72 p-4 shadow-xl rounded-xl" align="center">
          <div className="flex flex-col gap-3">
            <span className="text-xs font-bold text-slate-700 uppercase">Chèn Hình Ảnh</span>
            <div className="flex gap-2">
              <Input placeholder="Dán link (https://...)" className="h-8 text-xs" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} onKeyDown={(e) => e.key === "Enter" && editor.dispatchCommand(INSERT_IMAGE_COMMAND, { src: imageUrl, altText: "Img" })} />
              <Button size="sm" className="h-8 bg-emerald-600 text-xs text-white" onClick={() => { editor.dispatchCommand(INSERT_IMAGE_COMMAND, { src: imageUrl, altText: "Img" }); setIsImageOpen(false);}}>Chèn</Button>
            </div>
            <div className="relative flex items-center py-1">
              <div className="grow border-t"></div><span className="mx-2 text-[10px] text-slate-400 uppercase">Hoặc</span><div className="grow border-t"></div>
            </div>
            <Button variant="outline" size="sm" className="h-8 text-xs text-slate-600" onClick={() => imageInputRef.current?.click()}>
              <Upload className="h-3.5 w-3.5 mr-2 text-emerald-600" /> Tải lên từ máy
            </Button>
          </div>
        </PopoverContent>
      </Popover>

      <Popover open={isTableOpen} onOpenChange={(o) => { setIsTableOpen(o); if(!o) setGridSize({rows:0, cols:0}) }}>
        <PopoverTrigger asChild>
          <ToolbarIconButton icon={TableIcon} title="Chèn bảng" className="text-blue-600 hover:bg-blue-50" />
        </PopoverTrigger>
        <PopoverContent className="w-auto p-4 shadow-xl rounded-xl" align="center">
          <div className="flex flex-col gap-3">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-slate-700 uppercase">Chèn bảng</span>
              <span className="text-xs font-bold px-2 bg-blue-100 text-blue-700 rounded-sm">
                {gridSize.rows > 0 ? `${gridSize.cols} x ${gridSize.rows}` : "0 x 0"}
              </span>
            </div>
            <div className="grid grid-cols-10 gap-1 p-1 bg-white" onMouseLeave={() => setGridSize({ rows: 0, cols: 0 })}>
              {Array.from({ length: 10 }).map((_, rIdx) => Array.from({ length: 10 }).map((_, cIdx) => {
                const r = rIdx + 1, c = cIdx + 1;
                const isHovered = r <= gridSize.rows && c <= gridSize.cols;
                return (
                  <div key={`${r}-${c}`}
                    className={cn("w-4 h-4 rounded-[2px] border cursor-pointer", isHovered ? "bg-blue-200 border-blue-500 scale-110 z-10" : "bg-slate-50 border-slate-300")}
                    onMouseEnter={() => setGridSize({ rows: r, cols: c })}
                    onClick={() => handleInsertTable(r, c)}
                  />
                );
              }))}
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </>
  );
};

// ============================================================================
// 3. MAIN COMPONENT (Khung xương lắp ráp các mảnh ghép)
// ============================================================================
export function ToolbarPlugin() {
  return (
    // Sửa z-10 thành z-[1] để không đè lên Modal phóng to ảnh
    <div className="bg-muted/30 border-b px-2 py-2 flex flex-wrap items-center gap-1 text-muted-foreground sticky top-0 `z-[1]` transition-all">
      <UndoRedoPlugin />
      <ToolbarSeparator />
      
      <BlockFormatPlugin />
      <ToolbarSeparator />
      
      <FontFormatPlugin />
      <ToolbarSeparator />
      
      <TextFormatPlugin />
      <ToolbarSeparator />

      <ColorAndLinkPlugin />
      <ToolbarSeparator />

      <AlignmentAndListPlugin />
      <ToolbarSeparator />

      <InsertMediaPlugin />
    </div>
  );
}
