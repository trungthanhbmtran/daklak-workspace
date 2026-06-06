export function buildTree(
  items: any[],
  rootParentId: number | null = null,
  linkKey = 'parentId',
) {
  // Build adjacency list map O(N)
  const childrenMap = new Map<number | null | string, any[]>();
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const pid = item[linkKey] ?? null;
    if (!childrenMap.has(pid)) {
      childrenMap.set(pid, []);
    }
    childrenMap.get(pid)!.push(item);
  }

  // Recursive builder O(N) total since each node is visited once
  const buildNode = (parentId: number | null | string): any[] => {
    const children = childrenMap.get(parentId) || [];
    return children.map((child) => ({
      ...child,
      children: buildNode(child.id),
    }));
  };

  return buildNode(rootParentId);
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
