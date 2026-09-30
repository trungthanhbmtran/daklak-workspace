export function buildTree(
  items: any[],
  rootParentId: number | null | string = null,
  linkKey = 'parentId',
) {
  const nodeMap = new Map<number | string, any>();
  const roots: any[] = [];

  // Bước 1: Khởi tạo danh sách Node với Array children rỗng (O(N) Time, O(N) Space)
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    nodeMap.set(item.id, { ...item, children: [] });
  }

  // Bước 2: Liên kết các Node con vào cha (O(N) Time)
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const pid = item[linkKey] ?? null;
    const node = nodeMap.get(item.id);

    // Nếu Node là Root hoặc ID cha không tồn tại (orphan)
    if (pid === rootParentId || pid === null || !nodeMap.has(pid)) {
      roots.push(node);
    } else {
      // Đẩy Reference của Node con vào Node cha
      nodeMap.get(pid).children.push(node);
    }
  }

  return roots;
}

/** Hàm cắt tỉa cành khô (Dùng cho Menu) */
export function pruneEmptyParents(nodes: any[]) {
  return nodes.filter((node) => {
    if (!node.children || node.children.length === 0) {
      return node.route !== null;
    }
    node.children = pruneEmptyParents(node.children);
    return node.children.length > 0;
  });
}
