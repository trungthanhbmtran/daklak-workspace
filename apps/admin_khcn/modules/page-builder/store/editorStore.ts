import { create } from "zustand";
import { Row, Column, Widget, SectionSettings, PageLanguage } from "../core/types";

interface HistoryState {
  past: Row[][];
  future: Row[][];
}

export interface EditorStore {
  // --- States ---
  layout: Row[];
  languages: PageLanguage[];
  activeLang: string;
  selectedWidgetId: string | null;
  selectedRowId: string | null;
  viewport: "desktop" | "tablet" | "mobile";
  showLeftPanel: boolean;
  showRightPanel: boolean;
  activeTab: string;
  history: HistoryState;

  // --- Core Lifecycle ---
  initStore: (layout: Row[], languages: PageLanguage[]) => void;
  setLayout: (newLayout: Row[]) => void;
  
  // --- Interface Controls ---
  setActiveLang: (lang: string) => void;
  setSelectedWidgetId: (id: string | null) => void;
  setSelectedRowId: (id: string | null) => void;
  setViewport: (v: "desktop" | "tablet" | "mobile") => void;
  setShowLeftPanel: (b: boolean) => void;
  setShowRightPanel: (b: boolean) => void;
  setActiveTab: (tab: string) => void;

  // --- History Management (Undo/Redo) ---
  undo: () => void;
  redo: () => void;
  pushHistory: (newLayout: Row[]) => void;

  // --- Atomic Mutations ---
  addRow: (type: "12" | "6-6" | "7-5" | "8-4" | "4-4-4") => void;
  deleteRow: (rowId: string) => void;
  moveRow: (index: number, direction: "up" | "down") => void;
  updateRowSettings: (rowId: string, settings: Partial<SectionSettings>) => void;
  
  // --- Widget Mutations ---
  addWidget: (rowId: string, colId: string, widget: Widget, index?: number) => void;
  deleteWidget: (rowId: string, colId: string, widgetId: string) => void;
  updateWidgetTitle: (widgetId: string, value: string) => void;
  updateWidgetContent: (widgetId: string, lexicalJson: string) => void;
  updateWidgetData: (widgetId: string, newData: any) => void;
}

export const useEditorStore = create<EditorStore>((set, get) => {
  return {
    // --- Initial States ---
    layout: [],
    languages: [],
    activeLang: "vi",
    selectedWidgetId: null,
    selectedRowId: null,
    viewport: "desktop",
    showLeftPanel: true,
    showRightPanel: true,
    activeTab: "customizer",
    history: { past: [], future: [] },

    // --- Core Lifecycle ---
    initStore: (layout, languages) => {
      set({
        layout,
        languages,
        activeLang: languages[0]?.code || "vi",
        selectedWidgetId: null,
        selectedRowId: null,
        history: { past: [], future: [] },
      });
    },

    setLayout: (newLayout) => {
      get().pushHistory(get().layout);
      set({ layout: newLayout });
    },

    // --- Interface Controls ---
    setActiveLang: (activeLang) => set({ activeLang }),
    setSelectedWidgetId: (selectedWidgetId) => set({
      selectedWidgetId,
      selectedRowId: null, // Clear row selection if a widget is selected
      activeTab: "customizer"
    }),
    setSelectedRowId: (selectedRowId) => set({
      selectedRowId,
      selectedWidgetId: null, // Clear widget selection if a row is selected
      activeTab: "design"
    }),
    setViewport: (viewport) => set({ viewport }),
    setShowLeftPanel: (showLeftPanel) => set({ showLeftPanel }),
    setShowRightPanel: (showRightPanel) => set({ showRightPanel }),
    setActiveTab: (activeTab) => set({ activeTab }),

    // --- Undo/Redo Engine ---
    pushHistory: (newLayout) => {
      const { history } = get();
      // Keep maximum 30 states in undo history
      const newPast = [...history.past, JSON.parse(JSON.stringify(newLayout))].slice(-30);
      set({
        history: {
          past: newPast,
          future: [], // Clear redo stack on manual state changes
        },
      });
    },

    undo: () => {
      const { history, layout } = get();
      if (history.past.length === 0) return;

      const previous = history.past[history.past.length - 1];
      const newPast = history.past.slice(0, history.past.length - 1);

      set({
        layout: previous,
        selectedWidgetId: null,
        selectedRowId: null,
        history: {
          past: newPast,
          future: [JSON.parse(JSON.stringify(layout)), ...history.future],
        },
      });
    },

    redo: () => {
      const { history, layout } = get();
      if (history.future.length === 0) return;

      const next = history.future[0];
      const newFuture = history.future.slice(1);

      set({
        layout: next,
        selectedWidgetId: null,
        selectedRowId: null,
        history: {
          past: [...history.past, JSON.parse(JSON.stringify(layout))],
          future: newFuture,
        },
      });
    },

    // --- Atomic Section (Row) Mutations ---
    addRow: (type) => {
      const timestamp = Date.now();
      let columns: Column[] = [];

      if (type === "12") {
        columns = [{ id: `col-${timestamp}-1`, colSpan: "lg:col-span-12", widgets: [] }];
      } else if (type === "6-6") {
        columns = [
          { id: `col-${timestamp}-1`, colSpan: "lg:col-span-6", widgets: [] },
          { id: `col-${timestamp}-2`, colSpan: "lg:col-span-6", widgets: [] }
        ];
      } else if (type === "7-5") {
        columns = [
          { id: `col-${timestamp}-1`, colSpan: "lg:col-span-7", widgets: [] },
          { id: `col-${timestamp}-2`, colSpan: "lg:col-span-5", widgets: [] }
        ];
      } else if (type === "8-4") {
        columns = [
          { id: `col-${timestamp}-1`, colSpan: "lg:col-span-8", widgets: [] },
          { id: `col-${timestamp}-2`, colSpan: "lg:col-span-4", widgets: [] }
        ];
      } else if (type === "4-4-4") {
        columns = [
          { id: `col-${timestamp}-1`, colSpan: "lg:col-span-4", widgets: [] },
          { id: `col-${timestamp}-2`, colSpan: "lg:col-span-4", widgets: [] },
          { id: `col-${timestamp}-3`, colSpan: "lg:col-span-4", widgets: [] }
        ];
      }

      const newRow: Row = { rowId: `row-${timestamp}`, columns };
      get().setLayout([...get().layout, newRow]);
      set({ selectedRowId: newRow.rowId, activeTab: "design" });
    },

    deleteRow: (rowId) => {
      const filtered = get().layout.filter((r) => r.rowId !== rowId);
      get().setLayout(filtered);
      if (get().selectedRowId === rowId) {
        set({ selectedRowId: null });
      }
    },

    moveRow: (index, direction) => {
      const nextIndex = direction === "up" ? index - 1 : index + 1;
      const { layout } = get();
      if (nextIndex < 0 || nextIndex >= layout.length) return;

      const newLayout = [...layout];
      const temp = newLayout[index];
      newLayout[index] = newLayout[nextIndex];
      newLayout[nextIndex] = temp;

      get().setLayout(newLayout);
    },

    updateRowSettings: (rowId, newSettings) => {
      const updated = get().layout.map((row) => {
        if (row.rowId === rowId) {
          return {
            ...row,
            settings: { ...(row.settings || {}), ...newSettings },
          };
        }
        return row;
      });
      get().setLayout(updated);
    },

    // --- Widget Mutations ---
    addWidget: (rowId, colId, widget, index) => {
      const updated = get().layout.map((row) => {
        if (row.rowId === rowId) {
          return {
            ...row,
            columns: row.columns.map((col) => {
              if (col.id === colId) {
                const newWidgets = [...col.widgets];
                if (typeof index === "number") {
                  newWidgets.splice(index, 0, widget);
                } else {
                  newWidgets.push(widget);
                }
                return { ...col, widgets: newWidgets };
              }
              return col;
            }),
          };
        }
        return row;
      });

      get().setLayout(updated);
      set({ selectedWidgetId: widget.id, activeTab: "customizer" });
    },

    deleteWidget: (rowId, colId, widgetId) => {
      const updated = get().layout.map((row) => {
        if (row.rowId === rowId) {
          return {
            ...row,
            columns: row.columns.map((col) => {
              if (col.id === colId) {
                return { ...col, widgets: col.widgets.filter((w) => w.id !== widgetId) };
              }
              return col;
            }),
          };
        }
        return row;
      });

      get().setLayout(updated);
      if (get().selectedWidgetId === widgetId) {
        set({ selectedWidgetId: null });
      }
    },

    updateWidgetTitle: (widgetId, value) => {
      const { activeLang } = get();
      const updated = get().layout.map((row) => ({
        ...row,
        columns: row.columns.map((col) => ({
          ...col,
          widgets: col.widgets.map((w) => {
            if (w.id === widgetId) {
              const currentTitles = typeof w.title === "string" ? { vi: w.title, en: w.title } : (w.title || {});
              return {
                ...w,
                title: { ...currentTitles, [activeLang]: value },
              };
            }
            return w;
          }),
        })),
      }));

      // In store mutations that occur on every keystroke, we can use a direct set to avoid polluting the undo history stack too fast.
      // However, we still set the layout state immediately.
      set({ layout: updated });
    },

    updateWidgetContent: (widgetId, lexicalJson) => {
      const { activeLang } = get();
      const updated = get().layout.map((row) => ({
        ...row,
        columns: row.columns.map((col) => ({
          ...col,
          widgets: col.widgets.map((w) => {
            if (w.id === widgetId) {
              const currentContents = typeof w.content === "string" ? { vi: w.content, en: w.content } : (w.content || {});
              return {
                ...w,
                content: { ...currentContents, [activeLang]: lexicalJson },
              };
            }
            return w;
          }),
        })),
      }));
      
      set({ layout: updated });
    },

    updateWidgetData: (widgetId, newData) => {
      const updated = get().layout.map((row) => ({
        ...row,
        columns: row.columns.map((col) => ({
          ...col,
          widgets: col.widgets.map((w) => {
            if (w.id === widgetId) {
              return {
                ...w,
                data: newData,
              };
            }
            return w;
          }),
        })),
      }));

      // Push history before saving major data changes to allow rollback of selection states
      get().pushHistory(get().layout);
      set({ layout: updated });
    },
  };
});
