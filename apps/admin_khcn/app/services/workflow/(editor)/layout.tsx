export default function WorkflowEditorLayout({ children }: { children: React.ReactNode }) {
  // Lớp layout trống dành riêng cho màn hình thiết kế full screen, không Sidebar
  return <div className="h-screen w-screen overflow-hidden bg-background">{children}</div>;
}
