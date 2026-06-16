const fs = require('fs');

const path = 'c:\\Users\\Admin\\Desktop\\daklak-workspace\\apps\\api-gateway\\src\\modules\\hrm\\tasks.controller.ts';
let code = fs.readFileSync(path, 'utf8');

// Fix `list` method
code = code.replace(
  /    let callerAncestorUnitIds: number\[\] = \[\];\n    let callerDescendantUnitIds: number\[\] = \[\];\n    if \(\!isAdmin && user\?\.unitId\) \{\n      const unitMap = await this\.getUnitMap\(\);\n      callerAncestorUnitIds = this\.getAncestorUnitIds\(\n        unitMap,\n        parseInt\(user\.unitId, 10\),\n      \);\n      callerDescendantUnitIds = this\.getDescendantUnitIds\(\n        unitMap,\n        parseInt\(user\.unitId, 10\),\n      \);\n    \}/g,
  ''
);
code = code.replace(/        callerAncestorUnitIds,\n        callerDescendantUnitIds,/g, '');

// Fix `recommendAssignees`
code = code.replace(/    const unitMap = await this\.getUnitMap\(\);\n\n/g, '');

const recommendMapStr = `    topEmployees = topEmployees.map((emp: any, idx: number) => {
      const deptId = emp.departmentId ? parseInt(emp.departmentId, 10) : 0;
      const dept = unitMap[deptId];
      return {
        ...emp,
        employeeName:
          emp.fullName || emp.employeeName || emp.username || emp.employeeCode,
        departmentName: dept?.name || '',
        currentLoad:
          emp.currentLoad !== undefined ? emp.currentLoad : emp.taskCount || 0,
        performanceScore:
          emp.performanceScore !== undefined
            ? emp.performanceScore
            : emp.kpiScore || Math.max(50, 100 - idx * 5),
      };
    });

    topDepartments = topDepartments.map((d: any) => {
      const deptId = d.departmentId ? parseInt(d.departmentId, 10) : 0;
      const dept = unitMap[deptId];
      return {
        ...d,
        departmentName: dept?.name || '',
      };
    });`;

const newRecommendMapStr = `    topEmployees = topEmployees.map((emp: any, idx: number) => {
      return {
        ...emp,
        employeeName:
          emp.fullName || emp.employeeName || emp.username || emp.employeeCode,
        departmentName: emp.departmentName || '',
        currentLoad:
          emp.currentLoad !== undefined ? emp.currentLoad : emp.taskCount || 0,
        performanceScore:
          emp.performanceScore !== undefined
            ? emp.performanceScore
            : emp.kpiScore || Math.max(50, 100 - idx * 5),
      };
    });

    topDepartments = topDepartments.map((d: any) => {
      return {
        ...d,
        departmentName: d.departmentName || '',
      };
    });`;

code = code.replace(recommendMapStr, newRecommendMapStr);

fs.writeFileSync(path, code);
console.log('Fixed tasks.controller.ts');
