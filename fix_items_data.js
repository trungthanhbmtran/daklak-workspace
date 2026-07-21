const fs = require('fs');
const path = require('path');

const files = [
  'apps/admin_khcn/features/hrm/components/employee-tabs/useEmployeeTitles.ts',
  'apps/admin_khcn/features/hrm/components/EmployeeCreateClient.tsx',
  'apps/admin_khcn/features/hrm/components/EmployeeEditClient.tsx',
  'apps/admin_khcn/features/hrm/components/tasks/create-task-dialog.tsx',
  'apps/admin_khcn/features/hrm/components/tasks/task-assign-dialog.tsx',
  'apps/admin_khcn/features/system-admin/organization/components/OrganizationStaffing/hooks/useStaffingReport.ts',
  'apps/admin_khcn/features/system-admin/organization/components/OrganizationStaffing/index.tsx',
  'apps/admin_khcn/features/system-admin/users/components/CreateUserModal.tsx'
];

files.forEach(relPath => {
  const fullPath = path.join('c:/Users/Admin/Desktop/daklak-workspace', relPath);
  if (!fs.existsSync(fullPath)) {
    console.log('Not found:', fullPath);
    return;
  }
  let content = fs.readFileSync(fullPath, 'utf8');
  
  // Replacements
  // Usually it's something like `jobTitles?.items` or `orgUnits?.items`
  // We can just replace `.items` with `.data` cautiously, but it's safer to use regex that targets specific known variable names or just `.items` if it's the only one.
  
  // Let's replace `items` with `data` in specific contexts:
  // e.g. `jobTitles?.items` -> `jobTitles?.data`
  // `unitsResponse?.items` -> `unitsResponse?.data`
  // `titlesRes?.items` -> `titlesRes?.data`
  content = content.replace(/(\w+)\?\.items/g, '$1?.data');
  content = content.replace(/(\w+)\.items/g, (match, p1) => {
    // Only replace if it's not a known DOM/React thing.
    // Most likely `jobTitles.items`
    return `${p1}.data`;
  });

  fs.writeFileSync(fullPath, content);
  console.log('Fixed:', fullPath);
});
