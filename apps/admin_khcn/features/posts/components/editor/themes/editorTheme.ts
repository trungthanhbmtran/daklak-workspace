export const editorTheme = {
  text: {
    bold: "font-bold",
    italic: "italic",
    underline: "underline",
    strikethrough: "line-through",
    subscript: "text-xs",
    superscript: "text-xs",
    fontFamily: "font-sans",
    fontSize: "text-base",
    fontWeight: "font-normal",
    color: "text-foreground",
    backgroundColor: "bg-background",
    textAlign: "text-left",
    textIndent: "0",
    textTransform: "none",
  },
  heading: {
    h1: "text-3xl font-extrabold mt-6 mb-4 text-foreground",
    h2: "text-2xl font-bold mt-5 mb-3 text-foreground",
    h3: "text-xl font-bold mb-2 mt-4",
    h4: "text-lg font-bold mb-2 mt-4",
    h5: "text-base font-bold mb-2 mt-4",
    h6: "text-sm font-bold mb-2 mt-4",
  },
  list: {
    ul: "list-disc pl-6 my-3 space-y-1",
    ol: "list-decimal pl-6 my-3 space-y-1",
  },
  quote: "border-l-4 border-primary bg-primary/5 p-4 my-4 italic text-muted-foreground",
  paragraph: "mb-3 leading-relaxed",
  // CSS Cho bảng biểu
  table: "border-collapse border border-border w-full my-4 table-fixed",
  tableCell: "border border-border p-2 min-w-[100px] outline-none relative transition-colors",
  tableCellHeader: "bg-muted font-bold text-center outline-none relative transition-colors",

  tableCellSelected: "bg-primary/20",
  tableCellPrimarySelected: "bg-primary/30 border-2 border-primary",
};
