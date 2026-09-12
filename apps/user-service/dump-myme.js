require('dotenv').config();
const { PrismaClient } = require('./src/generated/prisma/client');
const { PrismaMariaDb } = require('@prisma/adapter-mariadb');

function buildTree(items, rootParentId = null, linkKey = 'parentId') {
  const childrenMap = new Map();
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const pid = item[linkKey] ?? null;
    if (!childrenMap.has(pid)) {
      childrenMap.set(pid, []);
    }
    childrenMap.get(pid).push(item);
  }

  const buildNode = (parentId) => {
    const children = childrenMap.get(parentId) || [];
    return children.map((child) => ({
      ...child,
      children: buildNode(child.id),
    }));
  };

  return buildNode(rootParentId);
}

function pruneEmptyParents(nodes) {
  return nodes.filter((node) => {
    if (!node.children || node.children.length === 0) {
      return node.route !== null;
    }
    node.children = pruneEmptyParents(node.children);
    return node.children.length > 0;
  });
}

const dbUrl = process.env.DATABASE_URL;
const mariadbUrl = dbUrl.replace(/^mysql:\/\//, 'mariadb://');
const adapter = new PrismaMariaDb(mariadbUrl);
const prisma = new PrismaClient({ adapter });

async function main() {
  const userId = 1; // superadmin

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      roles: { include: { policies: { include: { resource: true } } } },
    },
  });

  const allowedResources = new Set();
  for (const role of user?.roles ?? []) {
    for (const p of role.policies ?? []) {
      if (p.resource?.code) {
        allowedResources.add(p.resource.code);
      }
    }
  }

  const rawMenus = await prisma.menu.findMany({
    where: { isActive: true },
    orderBy: { order: 'asc' },
  });

  const visibleMenus = rawMenus.filter((menu) => {
    if (menu.linkedResourceCode) {
      return allowedResources.has(menu.linkedResourceCode);
    }
    return true;
  });

  const menuTree = buildTree(visibleMenus, null);
  const result = pruneEmptyParents(menuTree);

  const allowedPaths = new Set();
  for (const menu of visibleMenus) {
    const p = menu.route;
    if (!p) continue;
    
    allowedPaths.add(p);
    const segmentsCount = p.split('/').filter(Boolean).length;
    if (segmentsCount >= 3) {
      allowedPaths.add(`${p}/*`);
    }
  }

  console.log('Allowed paths:', Array.from(allowedPaths));
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
