const { createHeadlessEditor } = require('@lexical/headless');
const { $generateHtmlFromNodes } = require('@lexical/html');
const { JSDOM } = require('jsdom');
const { EditorNodes } = require('../utils/FlexicalEditor');

/**
 * Hàm setup môi trường giả lập Browser (Bắt buộc chạy trước khi tạo Editor)
 */
function setupDomEnvironment() {
  const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
  const { window } = dom;

  // Gán các biến global quan trọng
  global.window = window;
  global.document = window.document;
  global.navigator = window.navigator;
  global.HTMLElement = window.HTMLElement;
  global.Node = window.Node;
  global.DocumentFragment = window.DocumentFragment;
  // Sửa lỗi "undefined reading replace" hoặc lỗi style
  global.CSSStyleDeclaration = window.CSSStyleDeclaration; 
  global.Element = window.Element;
  
  return () => {
    // Hàm cleanup để giải phóng bộ nhớ
    delete global.window;
    delete global.document;
    delete global.navigator;
    delete global.HTMLElement;
    delete global.Node;
    delete global.DocumentFragment;
    delete global.CSSStyleDeclaration;
    delete global.Element;
  };
}

async function renderLexicalToHtml(editorStateJson) {
  // 1. Kiểm tra đầu vào
  if (!editorStateJson) return '';
  
  // Nếu là JSON object thì stringify, nếu là string rồi thì giữ nguyên
  const editorStateString = typeof editorStateJson === 'object' 
    ? JSON.stringify(editorStateJson) 
    : editorStateJson;

  // 2. Setup môi trường DOM
  const cleanup = setupDomEnvironment();

  try {
    // 3. Khởi tạo Editor Headless
    const editor = createHeadlessEditor({
      nodes: EditorNodes,
      onError: (error) => {
        console.error('⚠️ Lexical Headless Error:', error);
      },
    });

    // 4. Load State vào Editor
    const editorState = editor.parseEditorState(editorStateString);
    editor.setEditorState(editorState);

    // 5. Generate HTML
    let htmlContent = '';
    editor.update(() => {
      // null ở đây nghĩa là không chọn vùng nào cả, convert toàn bộ
      htmlContent = $generateHtmlFromNodes(editor, null);
    });

    return htmlContent;

  } catch (error) {
    console.error('❌ Lỗi Render Lexical -> HTML:', error);
    // Trả về rỗng hoặc fallback text tùy logic của bạn
    return ''; 
  } finally {
    // 6. Luôn dọn dẹp biến Global để tránh Memory Leak cho Node server
    cleanup();
  }
}

module.exports = { renderLexicalToHtml };