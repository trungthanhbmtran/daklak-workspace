"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $getSelection, $isRangeSelection } from "lexical";
import {
  $isTableNode,
  $isTableCellNode,
  TableCellNode,
  $insertTableRow__EXPERIMENTAL,
  $insertTableColumn__EXPERIMENTAL,
  $deleteTableRow__EXPERIMENTAL,
  $deleteTableColumn__EXPERIMENTAL,
  $isTableSelection,
  $mergeCells,
  $unmergeCell,
  // --- IMPORT THÊM 2 HÀM NÀY ĐỂ LẤY TỌA ĐỘ Ô ---
  $getTableColumnIndexFromTableCellNode,
  $getTableRowIndexFromTableCellNode
} from "@lexical/table";
import { $findMatchingParent } from "@lexical/utils";

import {
  BetweenHorizonalEnd, BetweenVerticalEnd, Trash2, Columns, Rows,
  Combine, SplitSquareHorizontal
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

export function TableContextMenuPlugin() {
  const [editor] = useLexicalComposerContext();
  const [menuState, setMenuState] = useState<{ x: number; y: number } | null>(null);
  const [isTableSelectionActive, setIsTableSelectionActive] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const updateMenuState = useCallback(() => {
    editor.getEditorState().read(() => {
      const selection = $getSelection();
      setIsTableSelectionActive($isTableSelection(selection));
    });
  }, [editor]);

  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const cell = target.closest("td, th");

      if (cell) {
        e.preventDefault();
        updateMenuState();

        let x = e.clientX;
        let y = e.clientY;
        if (x + 224 > window.innerWidth) x -= 224;
        if (y + 320 > window.innerHeight) y -= 320;

        setMenuState({ x, y });
      } else {
        setMenuState(null);
      }
    };

    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuState(null);
      }
    };

    const rootElement = editor.getRootElement();
    if (rootElement) {
      rootElement.addEventListener("contextmenu", handleContextMenu);
    }
    window.addEventListener("click", handleClick);

    return () => {
      if (rootElement) rootElement.removeEventListener("contextmenu", handleContextMenu);
      window.removeEventListener("click", handleClick);
    };
  }, [editor, updateMenuState]);

  if (!menuState) return null;

  const handleAction = (action: () => void) => {
    editor.update(() => action());
    setMenuState(null);
  };

  const MenuItem = ({ icon: Icon, label, onClick, disabled, isDestructive }: any) => (
    <button
      disabled={disabled}
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); onClick(); }}
      className={cn(
        "relative flex w-full cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground disabled:pointer-events-none disabled:opacity-50",
        isDestructive && "text-destructive hover:bg-destructive/10 focus:bg-destructive/10 font-medium"
      )}
    >
      <Icon className="mr-2 h-4 w-4" />
      {label}
    </button>
  );

  const menu = (
    <div
      ref={menuRef}
      className="fixed z-[9999] min-w-[14rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-lg animate-in fade-in-80 zoom-in-95"
      style={{ top: menuState.y, left: menuState.x }}
      onContextMenu={(e) => e.preventDefault()}
    >
      <div className="px-2 py-1.5 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Thêm / Xóa dòng cột</div>

      <MenuItem icon={BetweenHorizonalEnd} label="Thêm dòng (Lên trên)" onClick={() => handleAction(() => $insertTableRow__EXPERIMENTAL(false))} />
      <MenuItem icon={Rows} label="Thêm dòng (Xuống dưới)" onClick={() => handleAction(() => $insertTableRow__EXPERIMENTAL(true))} />
      <MenuItem icon={BetweenVerticalEnd} label="Thêm cột (Bên trái)" onClick={() => handleAction(() => $insertTableColumn__EXPERIMENTAL(false))} />
      <MenuItem icon={Columns} label="Thêm cột (Bên phải)" onClick={() => handleAction(() => $insertTableColumn__EXPERIMENTAL(true))} />

      <Separator className="my-1" />

      <div className="px-2 py-1.5 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Hợp ô (Merge)</div>

      <MenuItem
        icon={Combine}
        label="Hợp nhất các ô đã chọn"
        disabled={!isTableSelectionActive}
        onClick={() => handleAction(() => {
          const selection = $getSelection();
          if ($isTableSelection(selection)) {
            const cellNodes = selection.getNodes().filter($isTableCellNode) as TableCellNode[];
            if (cellNodes.length > 1) {
              // --- FIX LỖI: SẮP XẾP LẠI MẢNG CELL TRƯỚC KHI MERGE ---
              cellNodes.sort((a, b) => {
                const rowA = $getTableRowIndexFromTableCellNode(a);
                const rowB = $getTableRowIndexFromTableCellNode(b);
                // Nếu khác dòng thì sắp từ dòng trên xuống dòng dưới
                if (rowA !== rowB) return rowA - rowB;
                // Nếu cùng dòng thì sắp từ cột trái qua cột phải
                const colA = $getTableColumnIndexFromTableCellNode(a);
                const colB = $getTableColumnIndexFromTableCellNode(b);
                return colA - colB;
              });

              // Gọi Merge sau khi mảng đã chuẩn hóa 100%
              $mergeCells(cellNodes);
            }
          }
        })}
      />

      <MenuItem
        icon={SplitSquareHorizontal}
        label="Tách ô hiện tại"
        onClick={() => handleAction(() => {
          const selection = $getSelection();
          let targetCell: TableCellNode | null = null;

          if ($isRangeSelection(selection)) {
            targetCell = $findMatchingParent(selection.anchor.getNode(), $isTableCellNode) as TableCellNode;
          } else if ($isTableSelection(selection)) {
            const cellNodes = selection.getNodes().filter($isTableCellNode) as TableCellNode[];
            if (cellNodes.length === 1) targetCell = cellNodes[0];
          }

          if (targetCell) {
            $unmergeCell();
          }
        })}
      />

      <Separator className="my-1" />

      <MenuItem icon={Trash2} label="Xóa dòng hiện tại" isDestructive onClick={() => handleAction(() => $deleteTableRow__EXPERIMENTAL())} />
      <MenuItem icon={Trash2} label="Xóa cột hiện tại" isDestructive onClick={() => handleAction(() => $deleteTableColumn__EXPERIMENTAL())} />

      <MenuItem icon={Trash2} label="Xóa toàn bộ Bảng" isDestructive onClick={() => handleAction(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection) || $isTableSelection(selection)) {
          const nodes = selection.getNodes();
          const tableNode = $findMatchingParent(nodes[0], $isTableNode);
          if (tableNode) tableNode.remove();
        }
      })} />
    </div>
  );

  return typeof document !== "undefined" ? createPortal(menu, document.body) : null;
}
