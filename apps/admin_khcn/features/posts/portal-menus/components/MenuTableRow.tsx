"use client";

import React, { Fragment } from "react";
import { PortalMenu } from "@/features/posts/types";
import { CategoryItem } from "@/features/system-admin/categories/types";
import { TableRow, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { ChevronRight, Layers, FileText, ExternalLink, Layout, Edit, Trash2 } from "lucide-react";

interface MenuTableRowProps {
  menu: PortalMenu;
  depth?: number;
  expandedItems: Record<string, boolean>;
  toggleExpand: (id: string) => void;
  displayLang: string;
  languages: CategoryItem[];
  onEdit: (menu: PortalMenu) => void;
  onDelete: (id: string) => void;
  onToggleActive: (id: string, active: boolean) => void;
}

const getMenuTranslation = (menu: PortalMenu, langCode: string) => {
  if (langCode === "vi") {
    return { name: menu.name, description: menu.description || "" };
  }
  let parsedTranslations = menu.translations || {};
  if (typeof parsedTranslations === "string") {
    try {
      parsedTranslations = JSON.parse(parsedTranslations);
    } catch (e) {
      parsedTranslations = {};
    }
  }
  const trans = parsedTranslations[langCode];
  return {
    name: trans?.name || "",
    description: trans?.description || "",
  };
};

export const MenuTableRow = React.memo(function MenuTableRow({
  menu,
  depth = 0,
  expandedItems,
  toggleExpand,
  displayLang,
  languages,
  onEdit,
  onDelete,
  onToggleActive,
}: MenuTableRowProps) {
  const hasChildren = menu.children && menu.children.length > 0;
  const isExpanded = !!expandedItems[menu.id];

  const trans = getMenuTranslation(menu, displayLang);
  const isTranslated = displayLang === "vi" || !!trans.name;
  const displayName = trans.name || menu.name;
  const displayDescription = trans.description || menu.description;

  return (
    <Fragment>
      <TableRow className={`${depth > 0 ? "bg-slate-50/30" : ""} hover:bg-slate-50 transition-colors`}>
        <TableCell className="font-medium p-0">
          <div
            className="flex items-center min-h-[52px]"
            style={{ paddingLeft: `${depth * 28 + 12}px` }}
          >
            <div className="flex items-center gap-2 flex-1">
              {hasChildren ? (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 p-0 hover:bg-blue-100 text-blue-600 transition-transform duration-200"
                  onClick={() => toggleExpand(menu.id)}
                  style={{ transform: isExpanded ? "rotate(90deg)" : "rotate(0deg)" }}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              ) : (
                <div className="w-6" /> // Spacer for alignment
              )}

              {depth > 0 && <div className="w-4 h-[2px] bg-slate-200 -ml-2 mr-1" />}

              <div
                className={`p-1.5 rounded ${!menu.isActive ? "bg-slate-100 text-slate-400" : "bg-blue-50 text-blue-600"
                  }`}
              >
                {menu.type === "CATEGORY" && <Layers className="w-3.5 h-3.5" />}
                {menu.type === "POST" && <FileText className="w-3.5 h-3.5" />}
                {menu.type === "URL" && <ExternalLink className="w-3.5 h-3.5" />}
                {menu.type === "STATIC_PAGE" && <Layout className="w-3.5 h-3.5" />}
              </div>

              <div className="flex flex-col">
                <span
                  className={`text-sm ${!menu.isActive ? "text-slate-400 line-through" : "text-slate-800 font-semibold"
                    } ${!isTranslated ? "italic text-slate-400 font-medium" : ""}`}
                >
                  {displayName}
                  {!isTranslated && (
                    <span
                      className="text-[9px] text-amber-600 font-bold ml-1.5 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded-full uppercase"
                      title="Mục này chưa được cấu hình bản dịch"
                    >
                      Chưa dịch
                    </span>
                  )}
                </span>
                {displayDescription && (
                  <span className="text-[10px] text-slate-400 truncate max-w-[200px] italic">
                    {displayDescription}
                  </span>
                )}
              </div>
            </div>
          </div>
        </TableCell>
        <TableCell>
          <div className="flex items-center gap-1">
            <span
              className="inline-flex items-center justify-center text-[9px] font-black w-5 h-5 rounded-full bg-blue-100 text-blue-700 border border-blue-200 cursor-default"
              title="Tiếng Việt (Gốc)"
            >
              VI
            </span>
            {(languages.length > 0 ? languages : [{ code: "en", name: "English" }])
              .filter((l) => l.code !== "vi")
              .map((lang) => {
                const hasTrans = !!getMenuTranslation(menu, lang.code).name;
                return hasTrans ? (
                  <span
                    key={lang.code}
                    className="inline-flex items-center justify-center text-[9px] font-black w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200 cursor-default"
                    title={`Đã dịch sang ${lang.name}`}
                  >
                    {lang.code.toUpperCase()}
                  </span>
                ) : (
                  <span
                    key={lang.code}
                    className="inline-flex items-center justify-center text-[9px] font-black w-5 h-5 rounded-full border border-dashed border-slate-300 bg-slate-50 text-slate-400 cursor-default"
                    title={`Chưa dịch sang ${lang.name}`}
                  >
                    {lang.code.toUpperCase()}
                  </span>
                );
              })}
          </div>
        </TableCell>
        <TableCell>
          <Badge
            variant="secondary"
            className={`text-[10px] uppercase font-bold py-0 h-5 ${menu.position === "HORIZONTAL"
                ? "bg-indigo-50 text-indigo-700 border-indigo-100"
                : menu.position === "VERTICAL"
                  ? "bg-amber-50 text-amber-700 border-amber-100"
                  : "bg-slate-100 text-slate-600 border-slate-200"
              }`}
          >
            {menu.position === "HORIZONTAL"
              ? "Ngang"
              : menu.position === "VERTICAL"
                ? "Dọc"
                : "Chân trang"}
          </Badge>
        </TableCell>
        <TableCell>
          <Badge
            variant="outline"
            className="flex items-center w-fit gap-1 uppercase text-[9px] font-bold px-1.5 h-5 bg-white shadow-sm"
          >
            {menu.type}
          </Badge>
        </TableCell>
        <TableCell className="max-w-[180px]">
          <div className="flex items-center gap-1.5 text-slate-500 group">
            <span className="text-[11px] font-mono truncate bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100 group-hover:border-blue-200 group-hover:bg-blue-50 transition-colors">
              {menu.link || "—"}
            </span>
          </div>
        </TableCell>
        <TableCell className="text-center">
          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 text-[11px] font-bold text-slate-600 border border-slate-200">
            {menu.order}
          </span>
        </TableCell>
        <TableCell>
          <Switch
            checked={menu.isActive}
            className="data-[state=checked]:bg-blue-600 scale-90"
            onCheckedChange={() => onToggleActive(menu.id, menu.isActive)}
          />
        </TableCell>
        <TableCell className="text-right">
          <div className="flex justify-end gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 hover:bg-blue-50 hover:text-blue-600"
              onClick={() => onEdit(menu)}
              title="Chỉnh sửa"
            >
              <Edit className="w-3.5 h-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-red-400 hover:text-red-600 hover:bg-red-50"
              onClick={() => onDelete(menu.id)}
              title="Xóa"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </div>
        </TableCell>
      </TableRow>

      {hasChildren &&
        isExpanded &&
        menu.children?.map((child) => (
          <MenuTableRow
            key={child.id}
            menu={child}
            depth={depth + 1}
            expandedItems={expandedItems}
            toggleExpand={toggleExpand}
            displayLang={displayLang}
            languages={languages}
            onEdit={onEdit}
            onDelete={onDelete}
            onToggleActive={onToggleActive}
          />
        ))}
    </Fragment>
  );
});
