import React from "react";
import { Widget } from "../core/types";
import { BlockRegistry } from "../core/registry";
import { initializeBlockRegistry } from "../blocks";
import { AlertCircle } from "lucide-react";

interface BlockRendererProps {
  widget: Widget;
  activeLang: string;
}

// Auto-initialize registry if empty
if (BlockRegistry.getAllBlocks().length === 0) {
  initializeBlockRegistry();
}

export const BlockRenderer: React.FC<BlockRendererProps> = ({ widget, activeLang }) => {
  const registeredBlock = BlockRegistry.getBlock(widget.type);

  if (!registeredBlock) {
    return (
      <div className="p-5 border border-dashed border-rose-200 dark:border-rose-900 bg-rose-50/50 dark:bg-rose-950/20 rounded-2xl flex items-center gap-3">
        <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] font-black uppercase text-rose-500 tracking-wider">Lỗi hiển thị Widget</span>
          <span className="text-[10px] text-slate-500 font-bold leading-normal">
            Không tìm thấy kiểu cấu hình đăng ký cho: &quot;{widget.type}&quot;
          </span>
        </div>
      </div>
    );
  }

  const RendererComponent = registeredBlock.renderer;

  return (
    <div className="w-full">
      <RendererComponent widget={widget} activeLang={activeLang} />
    </div>
  );
};

export default BlockRenderer;
