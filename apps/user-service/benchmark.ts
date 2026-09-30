import { performance } from 'perf_hooks';

// Cũ: Dùng đệ quy (Vi phạm Rule E)
export function buildTreeRecursive(items: any[], rootParentId: number | null = null, linkKey = 'parentId') {
  const childrenMap = new Map<number | null | string, any[]>();
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const pid = item[linkKey] ?? null;
    if (!childrenMap.has(pid)) {
      childrenMap.set(pid, []);
    }
    childrenMap.get(pid)!.push(item);
  }

  const buildNode = (parentId: number | null | string): any[] => {
    const children = childrenMap.get(parentId) || [];
    return children.map((child) => ({
      ...child,
      children: buildNode(child.id),
    }));
  };

  return buildNode(rootParentId);
}

// Mới: Không dùng đệ quy (Chuẩn AGENTS.md Rule E)
export function buildTreeIterative(items: any[], rootParentId: number | null = null, linkKey = 'parentId') {
  const nodeMap = new Map<number | string, any>();
  const roots: any[] = [];

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    nodeMap.set(item.id, { ...item, children: [] });
  }

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const pid = item[linkKey] ?? null;
    const node = nodeMap.get(item.id);

    if (pid === rootParentId || pid === null || !nodeMap.has(pid)) {
      roots.push(node);
    } else {
      nodeMap.get(pid).children.push(node);
    }
  }

  return roots;
}

// Giả lập dữ liệu Cây cực sâu (Worst Case: Linked List)
const generateDeepData = (size: number) => {
  const data: any[] = [];
  data.push({ id: 1, parentId: null, name: 'Root' });
  for (let i = 2; i <= size; i++) {
    // Mỗi node là con của node ngay trước nó => Độ sâu = size
    data.push({ id: i, parentId: i - 1, name: `Node ${i}` });
  }
  return data;
};

const items = generateDeepData(20000); // 20,000 node (Đủ làm sập stack V8)

console.log('--- BẮT ĐẦU BENCHMARK TRÊN 20,000 NODES (CÂY SÂU TUYỆT ĐỐI) ---');

// Warmup JS Engine
buildTreeIterative([{id: 1}]);

try {
  const startRec = performance.now();
  buildTreeRecursive(items);
  const endRec = performance.now();
  console.log(`[CŨ] Đệ Quy (Recursive): ${(endRec - startRec).toFixed(2)} ms`);
} catch (e: any) {
  console.log(`[CŨ] Đệ Quy (Recursive): LỖI CRASH TRẦM TRỌNG - ${e.message}`);
}

const startIter = performance.now();
buildTreeIterative(items);
const endIter = performance.now();
console.log(`[MỚI] Tuyến tính (Iterative / Rule E): ${(endIter - startIter).toFixed(2)} ms`);

