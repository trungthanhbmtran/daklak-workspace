const fs = require('fs');

const path = 'c:\\Users\\Admin\\Desktop\\daklak-workspace\\apps\\api-gateway\\src\\modules\\hrm\\tasks.controller.ts';
let code = fs.readFileSync(path, 'utf8');

// 1. Add ParseIntPipe to imports
code = code.replace(
  '  Req,\n} from \'@nestjs/common\';',
  '  Req,\n  ParseIntPipe,\n} from \'@nestjs/common\';'
);

// 2. Remove orgService and cache fields
code = code.replace(/  private orgService: any;\n/, '');
code = code.replace(/  \/\/ Cache org tree \(5 phút\)\n  private unitMapCache: \{\n    data: Record<number, any>;\n    expiresAt: number;\n  \} \| null = null;\n/, '');

// 3. Update constructor
code = code.replace(
  '    @Inject(MICROSERVICES.TASK.SYMBOL) private readonly client: any,\n    @Inject(MICROSERVICES.ORGANIZATION.SYMBOL) private readonly orgClient: any,\n    @Inject(MICROSERVICES.USER.SYMBOL) private readonly userClient: any,\n  ) { }',
  '    @Inject(MICROSERVICES.TASK.SYMBOL) private readonly client: any,\n    @Inject(MICROSERVICES.USER.SYMBOL) private readonly userClient: any,\n  ) { }'
);

// 4. Update onModuleInit
code = code.replace(
  /    this\.orgService = this\.orgClient\.getService\(\n      MICROSERVICES\.ORGANIZATION\.SERVICE,\n    \);\n/,
  ''
);

// 5. Remove getUnitMap, getAncestorUnitIds, getDescendantUnitIds (lines 104-177 approximately)
code = code.replace(/  private async getUnitMap\(\)[\s\S]*?  private getDescendantUnitIds\([\s\S]*?  \}\n\n\n/, '');

// 6. Fix list() method
code = code.replace(
  /    let callerAncestorUnitIds: number\[\] = \[\];\n    let callerDescendantUnitIds: number\[\] = \[\];\n    if \(\!isAdmin && user\?\.unitId\) \{\n      const unitMap = await this\.getUnitMap\(\);\n      callerAncestorUnitIds = this\.getAncestorUnitIds\(\n        unitMap,\n        parseInt\(user\.unitId, 10\),\n      \);\n      callerDescendantUnitIds = this\.getDescendantUnitIds\(\n        unitMap,\n        parseInt\(user\.unitId, 10\),\n      \);\n    \}/,
  ''
);
code = code.replace(/        callerAncestorUnitIds,\n        callerDescendantUnitIds,/g, '');

// 7. Fix update()
code = code.replace(
  /@Put\(':id'\)\n  async update\(@Param\('id'\) id: string, @Body\(\) body: any\) \{/g,
  "@Put(':id')\n  async update(@Param('id', ParseIntPipe) id: number, @Body() body: any) {"
);
code = code.replace(/id: parseInt\(id, 10\),/g, 'id,');
code = code.replace(/taskId: parseInt\(id, 10\),/g, 'taskId: id,');

// 8. Fix updateStatus()
code = code.replace(
  /@Param\('id'\) id: string,/g,
  "@Param('id', ParseIntPipe) id: number,"
);

// 9. Fix assignTask()
code = code.replace(
  /const taskId = parseInt\(id, 10\);\n\n    return firstValueFrom\(\n      this\.taskService\.AssignTask\(\{\n        id: taskId,/g,
  'return firstValueFrom(\n      this.taskService.AssignTask({\n        id,'
);

// 10. Fix breakdownTask()
code = code.replace(
  /const taskId = parseInt\(id, 10\);\n    const taskResponse: any = await firstValueFrom\(\n      this\.taskService\.GetTask\(\{ id: taskId \}\),\n    \);/g,
  'const taskResponse: any = await firstValueFrom(\n      this.taskService.GetTask({ id }),\n    );'
);
code = code.replace(/parentId: taskId,/g, 'parentId: id,');

// 11. Fix getComments()
code = code.replace(
  /    const taskId = parseInt\(id, 10\);\n    if \(isNaN\(taskId\)\) \{\n      return \{ success: false, message: 'ID không hợp lệ', data: \[\] \};\n    \}/g,
  ''
);

code = code.replace(
  /    let callerAncestorUnitIds: number\[\] = \[\];\n    let callerDescendantUnitIds: number\[\] = \[\];\n    if \(\!isAdmin && user\?\.unitId\) \{\n      const unitMap = await this\.getUnitMap\(\);\n      callerAncestorUnitIds = this\.getAncestorUnitIds\(\n        unitMap,\n        parseInt\(user\.unitId, 10\),\n      \);\n      callerDescendantUnitIds = this\.getDescendantUnitIds\(\n        unitMap,\n        parseInt\(user\.unitId, 10\),\n      \);\n    \}/g,
  ''
);

// 12. Fix requestCoordination()
code = code.replace(
  /const taskId = parseInt\(id, 10\);\n\n    const taskResponse: any = await firstValueFrom\(\n      this\.taskService\.GetTask\(\{ id: taskId \}\),\n    \);/g,
  'const taskResponse: any = await firstValueFrom(\n      this.taskService.GetTask({ id }),\n    );'
);
code = code.replace(
  /        taskId,/g,
  '        taskId: id,'
);


fs.writeFileSync(path, code);
console.log('Transformation complete.');
