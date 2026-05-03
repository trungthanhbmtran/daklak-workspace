export function buildTree(items: any[], parentId: number | null = null, linkKey = 'parentId') {
  return items
    .filter((item) => item[linkKey] === parentId)
    .map((item) => ({
      ...item,
      children: buildTree(items, item.id, linkKey),
    }));
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
