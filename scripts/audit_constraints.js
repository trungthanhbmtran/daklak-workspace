const fs = require('fs');
const path = require('path');

const findings = {
  rule1_ui_layout: [],
  rule2_base_url: [],
  rule3_next_router: [],
  rule4_grpc: [],
  rule5_database_prisma: [],
  rule6_pbac_sovereignty: [],
  rule7_cleanup_encoding: [],
};

function walkDir(dir, filterFn, fileList = []) {
  if (!fs.existsSync(dir)) return fileList;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    if (file === 'node_modules' || file === '.next' || file === 'dist' || file === '.git' || file === 'build') continue;
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      walkDir(fullPath, filterFn, fileList);
    } else if (filterFn(fullPath)) {
      fileList.push(fullPath);
    }
  }
  return fileList;
}

console.log('=== AUDITING DAKLAK-WORKSPACE FOR INVIOLABLE CONSTRAINTS ===\n');

// 1. RULE 2: BaseURL & Routing Frontend (apps/admin_khcn & portal-goverment)
const adminKhcnFiles = walkDir('apps/admin_khcn', f => f.endsWith('.ts') || f.endsWith('.tsx'));
for (const file of adminKhcnFiles) {
  const content = fs.readFileSync(file, 'utf8');
  const lines = content.split('\n');
  lines.forEach((line, idx) => {
    if (/(?:apiClient|serverFetch)\s*\.\s*(?:get|post|put|patch|delete)\s*\(\s*['"`]\/(?:admin|api\/v1)/.test(line) ||
        /(?:apiClient|serverFetch)\s*\(\s*['"`]\/(?:admin|api\/v1)/.test(line)) {
      findings.rule2_base_url.push({
        file,
        line: idx + 1,
        code: line.trim(),
        message: 'Calling apiClient/serverFetch with /admin or /api/v1 prefix causes 404 double prefix'
      });
    }
  });
}

const portalGovFiles = walkDir('apps/portal-goverment', f => f.endsWith('.ts') || f.endsWith('.tsx'));
for (const file of portalGovFiles) {
  const content = fs.readFileSync(file, 'utf8');
  const lines = content.split('\n');
  lines.forEach((line, idx) => {
    if (/(?:apiClient|serverFetch)\s*\.\s*(?:get|post|put|patch|delete)\s*\(\s*['"`]\/api\/v1/.test(line) ||
        /(?:apiClient|serverFetch)\s*\(\s*['"`]\/api\/v1/.test(line)) {
      findings.rule2_base_url.push({
        file,
        line: idx + 1,
        code: line.trim(),
        message: 'Calling apiClient/serverFetch with /api/v1 prefix in portal-goverment causes 404 double prefix'
      });
    }
  });
}

// 2. RULE 3: Next.js App Router (apps/admin_khcn/app/**/page.tsx)
const pageFiles = walkDir('apps/admin_khcn/app', f => f.endsWith('page.tsx'));
for (const file of pageFiles) {
  const content = fs.readFileSync(file, 'utf8');
  if (/^['"]use client['"]/m.test(content)) {
    findings.rule3_next_router.push({
      file,
      line: 1,
      message: 'page.tsx has "use client". Ràng buộc 3 yêu cầu page.tsx phải là Server Component gọn, chuyển tương tác vào *Client.tsx'
    });
  }
  const lines = content.split('\n');
  lines.forEach((line, idx) => {
    if (/(?:params|searchParams)\s*\.\s*[a-zA-Z0-9_]+/.test(line) && !line.includes('await') && !line.includes('Promise<')) {
      findings.rule3_next_router.push({
        file,
        line: idx + 1,
        code: line.trim(),
        message: 'Accessing params/searchParams directly without await (Next.js 15+ breaking change)'
      });
    }
    if (/const\s*\{[^}]*\}\s*=\s*(?:params|searchParams)/.test(line) && !line.includes('await')) {
      findings.rule3_next_router.push({
        file,
        line: idx + 1,
        code: line.trim(),
        message: 'Destructuring params/searchParams without await (Next.js 15+ breaking change)'
      });
    }
  });
}

// 3. RULE 1: UI/UX & CSS Layout (admin_khcn)
for (const file of adminKhcnFiles) {
  const content = fs.readFileSync(file, 'utf8');
  const lines = content.split('\n');
  lines.forEach((line, idx) => {
    // Check break-words (deprecated in Tailwind v4)
    if (/\bbreak-words\b/.test(line) && !line.includes('wrap-break-word')) {
      findings.rule1_ui_layout.push({
        file,
        line: idx + 1,
        code: line.trim(),
        message: 'Found "break-words". In Tailwind v4, wrap-break-word is required for normal text, or break-all for IDs'
      });
    }
    // Check SelectTrigger missing min-w-0
    if (/<SelectTrigger\b/.test(line) && line.includes('className=')) {
      if (!line.includes('min-w-0') && !line.includes('w-fit') && !line.includes('w-full')) {
        findings.rule1_ui_layout.push({
          file,
          line: idx + 1,
          code: line.trim(),
          message: '<SelectTrigger> without explicit w-full or min-w-0'
        });
      }
    }
  });
}

// Check Dialog with large forms (Sheet should be used instead of Dialog)
for (const file of adminKhcnFiles) {
  if (file.endsWith('.tsx') && !file.includes('components/ui/')) {
    const content = fs.readFileSync(file, 'utf8');
    if (content.includes('DialogContent') && (content.match(/<Input\b|<Select\b|<Textarea\b/g) || []).length >= 6) {
      findings.rule1_ui_layout.push({
        file,
        line: 1,
        message: `Dialog contains ${(content.match(/<Input\b|<Select\b|<Textarea\b/g) || []).length} form fields. Rule 1 requires <Sheet> for long forms/detailed config.`
      });
    }
  }
}

// 4. RULE 4: gRPC Defensive Initialization & Metadata
const allBackendFiles = walkDir('apps', f => (f.endsWith('.ts') && !f.includes('admin_khcn') && !f.includes('portal-goverment') && !f.endsWith('.spec.ts')));
for (const file of allBackendFiles) {
  if (file.endsWith('.controller.ts')) {
    const content = fs.readFileSync(file, 'utf8');
    if (content.includes('@GrpcMethod')) {
      const lines = content.split('\n');
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes('@GrpcMethod(')) {
          for (let j = i; j < Math.min(i + 5, lines.length); j++) {
            const m = lines[j].match(/(?:async\s+)?([a-zA-Z0-9_]+)\s*\(\s*(?:@Payload\(\)\s*)?([a-zA-Z0-9_]+)\s*:[^,)]*,/);
            if (m) {
              const paramName = m[2];
              if (paramName !== 'metadata' && paramName !== '_' && paramName !== 'req') {
                const nextLines = lines.slice(j + 1, Math.min(j + 10, lines.length)).join('\n');
                if (!nextLines.includes(`${paramName} = ${paramName} ||`) &&
                    !nextLines.includes(`${paramName} = ${paramName} ??`) &&
                    !nextLines.includes(`if (!${paramName})`) &&
                    !nextLines.includes(`${paramName} || {}`) &&
                    !nextLines.includes('data = data ||') &&
                    !nextLines.includes(`${paramName}?.`)) {
                  findings.rule4_grpc.push({
                    file,
                    line: j + 1,
                    code: lines[j].trim(),
                    message: `gRPC method missing defensive parameter initialization (${paramName} = ${paramName} || {})`
                  });
                }
              }
              break;
            }
          }
        }
      }
    }
  }
}

// 5. RULE 5: Database & Prisma queries inside loops (N+1)
for (const file of allBackendFiles) {
  if (file.includes('seed') || file.includes('simulate') || file.includes('sync-db') || file.includes('sync-pbac')) continue;
  const content = fs.readFileSync(file, 'utf8');
  const lines = content.split('\n');
  lines.forEach((line, idx) => {
    if (/await\s+(?:this\.)?prisma\.[a-zA-Z0-9_]+\.(?:create|update|upsert|delete|findUnique|findFirst)/.test(line)) {
      const prevBlock = lines.slice(Math.max(0, idx - 15), idx).join('\n');
      if (/\b(?:for\s*\(|for\s+await\s*\(|\.forEach\s*\(|\.map\s*\(\s*async)/.test(prevBlock)) {
        findings.rule5_database_prisma.push({
          file,
          line: idx + 1,
          code: line.trim(),
          message: 'Potential N+1 Query: Await Prisma query inside loop/map in production service'
        });
      }
    }
  });
}

// 6. RULE 6: PBAC, Source of Truth & Service Sovereignty
const allPrismaFiles = walkDir('apps', f => f.endsWith('.prisma') && !f.includes('dist') && !f.includes('generated'));
for (const file of allPrismaFiles) {
  const content = fs.readFileSync(file, 'utf8');
  // Check if non-user-service defines job_titles or staffing_slots or org_staffing
  if (!file.includes('user-service')) {
    if (/model\s+(?:JobTitle|StaffingSlot|OrgStaffing|StaffingSlotDomain|StaffingSlotGeographicArea)\b/.test(content)) {
      findings.rule6_pbac_sovereignty.push({
        file,
        line: 1,
        message: 'Violation of Source of Truth: VTVL models must belong exclusively to user-service'
      });
    }
  }
}

// 7. RULE 7: Clean-up (debug logs) and Encoding
const allSourceFiles = walkDir('apps', f => (f.endsWith('.ts') || f.endsWith('.tsx') || f.endsWith('.js')) && !f.endsWith('.spec.ts') && !f.endsWith('.test.ts') && !f.includes('seed') && !f.includes('test-grpc') && !f.includes('simulate'));
for (const file of allSourceFiles) {
  const content = fs.readFileSync(file, 'utf8');
  const lines = content.split('\n');
  lines.forEach((line, idx) => {
    if (/^\s*console\.(?:log|debug|dir)\s*\(/.test(line) && !line.includes('//')) {
      findings.rule7_cleanup_encoding.push({
        file,
        line: idx + 1,
        code: line.trim(),
        message: 'Debug log (console.log/debug/dir) found in production code'
      });
    }
    if (/^\s*debugger\s*;?/.test(line)) {
      findings.rule7_cleanup_encoding.push({
        file,
        line: idx + 1,
        code: line.trim(),
        message: 'debugger statement found'
      });
    }
  });

  // Check UTF-8 BOM
  const buf = fs.readFileSync(file);
  if (buf.length >= 3 && buf[0] === 0xEF && buf[1] === 0xBB && buf[2] === 0xBF) {
    findings.rule7_cleanup_encoding.push({
      file,
      line: 1,
      message: 'UTF-8 with BOM detected! Violates UTF-8 without BOM constraint'
    });
  } else if (buf.length >= 2 && ((buf[0] === 0xFF && buf[1] === 0xFE) || (buf[0] === 0xFE && buf[1] === 0xFF))) {
    findings.rule7_cleanup_encoding.push({
      file,
      line: 1,
      message: 'UTF-16 encoding detected! Crashes Next.js / Turbopack'
    });
  }
}

// Summary
console.log('--- FINDINGS SUMMARY ---');
for (const [rule, list] of Object.entries(findings)) {
  console.log(`${rule}: ${list.length} violations found`);
}

fs.writeFileSync('scripts/audit_results.json', JSON.stringify(findings, null, 2), 'utf8');
console.log('\nFull results written to scripts/audit_results.json');
