"use client";

import { useRef, useEffect } from "react";
import { DragEndEvent } from "@dnd-kit/core";
import { toast } from "sonner";
import { useEditorStore } from "../store/editorStore";
import { BlockRegistry } from "../core/registry";
import { useDndSensors } from "../dnd/DndWrapper";
import { Row, PageLanguage } from "../core/types";

export function useVisualEditor(initialLayout: Row[], languages: PageLanguage[], onChange: (layout: Row[]) => void) {
    const sensors = useDndSensors();
    const store = useEditorStore();
    const isInitialized = useRef(false);

    // 1. Khởi tạo store ban đầu
    useEffect(() => {
        if (!isInitialized.current) {
            store.initStore(initialLayout, languages);
            isInitialized.current = true;
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [initialLayout, languages, store.initStore]);

    // 2. Đồng bộ ngược dữ liệu ra database khi layout trong store biến động
    useEffect(() => {
        if (isInitialized.current) {
            onChange(store.layout);
        }
    }, [store.layout, onChange]);

    // 3. Thuật toán xử lý Drag & Drop
    const handleDragEnd = (event: DragEndEvent) => {
        try {
            const { active, over } = event;
            if (!over) return;

            const activeData = active.data.current;
            const overData = over.data.current;

            if (!activeData || !overData) return;

            const targetRowId = overData.rowId;
            const targetColId = overData.colId;

            if (!targetRowId || !targetColId) {
                toast.warning("Bạn đã nhấn chồng!");
                return;
            }

            const targetRow = store.layout.find((r) => r.rowId === targetRowId);
            const targetCol = targetRow?.columns.find((c) => c.id === targetColId);
            const hasExistingWidget = targetCol && targetCol.widgets.length > 0;

            if (hasExistingWidget) {
                toast.warning("Bạn đã nhấn chồng!");
                return;
            }

            // Kéo widget mẫu từ Sidebar trái vào Canvas
            if (activeData.isTemplate) {
                const blockType = activeData.blockType;
                const blockConfig = BlockRegistry.getBlock(blockType);
                if (!blockConfig) return;

                const newWidget = {
                    id: `widget-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                    type: blockType,
                    title: { vi: blockConfig.name.vi, en: blockConfig.name.en },
                    data: JSON.parse(JSON.stringify(blockConfig.defaultData)),
                    settings: {},
                };

                store.addWidget(targetRowId, targetColId, newWidget);
                toast.success("Đã thêm widget mới thành công!");
            }
            // Di chuyển vị trí giữa các widget đã có trên Canvas
            else {
                const { blockId, rowId: sourceRowId, colId: sourceColId } = activeData;

                if (sourceRowId !== targetRowId || sourceColId !== targetColId) {
                    const sourceRow = store.layout.find((r) => r.rowId === sourceRowId);
                    const sourceCol = sourceRow?.columns.find((c) => c.id === sourceColId);
                    const widget = sourceCol?.widgets.find((w) => w.id === blockId);

                    if (widget) {
                        const updatedLayoutWithDelete = store.layout.map((row) => {
                            if (row.rowId === sourceRowId) {
                                return {
                                    ...row,
                                    columns: row.columns.map((col) => {
                                        if (col.id === sourceColId) {
                                            return { ...col, widgets: col.widgets.filter((w) => w.id !== blockId) };
                                        }
                                        return col;
                                    }),
                                };
                            }
                            return row;
                        });

                        const finalLayout = updatedLayoutWithDelete.map((row) => {
                            if (row.rowId === targetRowId) {
                                return {
                                    ...row,
                                    columns: row.columns.map((col) => {
                                        if (col.id === targetColId) {
                                            return { ...col, widgets: [...col.widgets, widget] };
                                        }
                                        return col;
                                    }),
                                };
                            }
                            return row;
                        });

                        store.setLayout(finalLayout);
                        toast.success("Đã di chuyển vị trí widget thành công!");
                    }
                }
            }
        } catch (error) {
            console.error(error);
            toast.warning("Bạn đã nhấn chồng!");
        }
    };

    return {
        sensors,
        store,
        handleDragEnd,
    };
}