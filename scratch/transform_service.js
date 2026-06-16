const fs = require('fs');

const path = 'c:\\Users\\Admin\\Desktop\\daklak-workspace\\apps\\hrm-service\\src\\modules\\tasks\\tasks.service.ts';
let code = fs.readFileSync(path, 'utf8');

// 1. Update constructor
code = code.replace(
  /@Inject\('USER_PACKAGE'\) private userClient: any,\n  \) \{ \}/g,
  `@Inject('USER_PACKAGE') private userClient: any,
    @Inject('ORGANIZATION_PACKAGE') private orgClient: any,
  ) { }`
);

// 2. Add orgService to onModuleInit
code = code.replace(
  /this\.userService = this\.userClient\.getService\('UserService'\);\n  \}/g,
  `this.userService = this.userClient.getService('UserService');
    this.orgService = this.orgClient.getService('OrganizationService');
  }`
);

// Add private orgService declaration
code = code.replace(
  /private userService: any;/g,
  `private userService: any;
  private orgService: any;
  private unitMapCache: { data: Record<number, any>; expiresAt: number } | null = null;`
);

// 3. Add getUnitMap methods
const mapMethods = `

  private async getUnitMap(): Promise<Record<number, any>> {
    if (this.unitMapCache && this.unitMapCache.expiresAt > Date.now())
      return this.unitMapCache.data;
    try {
      const treeRes: any = await firstValueFrom(
        this.orgService.GetFullTree({}),
      );
      const unitMap: Record<number, any> = {};
      const flattenNodes = (nodes: any[]) => {
        for (const n of nodes) {
          const nId = parseInt(n.id, 10);
          if (nId) {
            unitMap[nId] = {
              id: nId,
              name: n.name || n.title || '',
              code: n.code,
              parentId: n.parentId ? parseInt(n.parentId, 10) : null,
              isLeaf: n.isLeaf ?? !n.children?.length,
              directChildIds: (n.children || [])
                .map((c: any) => parseInt(c.id, 10))
                .filter(Boolean),
            };
          }
          if (n.children && n.children.length > 0) flattenNodes(n.children);
        }
      };
      flattenNodes(treeRes?.nodes || []);
      this.unitMapCache = {
        data: unitMap,
        expiresAt: Date.now() + 5 * 60 * 1000,
      };
      return unitMap;
    } catch (e) {
      console.error('Failed to get org tree', e);
      return {};
    }
  }

  private getAncestorUnitIds(unitMap: Record<number, any>, unitId: number): number[] {
    const ids: number[] = [];
    let current = unitMap[unitId];
    if (current) ids.push(unitId);
    while (current?.parentId) {
      ids.push(current.parentId);
      current = unitMap[current.parentId];
    }
    return ids;
  }

  private getDescendantUnitIds(unitMap: Record<number, any>, unitId: number): number[] {
    const ids: number[] = [unitId];
    const queue = [unitId];
    while (queue.length > 0) {
      const currentId = queue.shift()!;
      const current = unitMap[currentId];
      if (current && current.directChildIds) {
        for (const childId of current.directChildIds) {
          if (!ids.includes(childId)) {
            ids.push(childId);
            queue.push(childId);
          }
        }
      }
    }
    return ids;
  }

  private async populateQueryHierarchy(query: any) {
    if (!query.isAdmin && query.currentUserDept) {
      const unitMap = await this.getUnitMap();
      query.callerAncestorUnitIds = this.getAncestorUnitIds(unitMap, query.currentUserDept);
      query.callerDescendantUnitIds = this.getDescendantUnitIds(unitMap, query.currentUserDept);
    } else {
      query.callerAncestorUnitIds = [];
      query.callerDescendantUnitIds = [];
    }
  }
`;

code = code.replace(
  /private async checkTaskAccess/g,
  `${mapMethods}\n  private async checkTaskAccess`
);


// 4. Inject populateQueryHierarchy in listTasks
code = code.replace(
  /async listTasks\(query: any\) \{/g,
  `async listTasks(query: any) {
    await this.populateQueryHierarchy(query);`
);

// 5. Inject populateQueryHierarchy in getTask
code = code.replace(
  /async getTask\(id: number, query: any\) \{/g,
  `async getTask(id: number, query: any) {
    await this.populateQueryHierarchy(query);`
);

// 6. Inject populateQueryHierarchy in getSubTasks
code = code.replace(
  /async getSubTasks\(id: number, query: any\) \{/g,
  `async getSubTasks(id: number, query: any) {
    await this.populateQueryHierarchy(query);`
);

// 7. Inject populateQueryHierarchy in getComments
code = code.replace(
  /async getComments\(id: number, query: any\) \{/g,
  `async getComments(id: number, query: any) {
    await this.populateQueryHierarchy(query);`
);


fs.writeFileSync(path, code);
console.log('Transformation service complete.');
