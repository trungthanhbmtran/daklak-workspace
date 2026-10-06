const fs = require('fs'); 
let f = 'apps/admin_khcn/features/reports/api/v2/index.ts';
let c = fs.readFileSync(f, 'utf8');
c = c.replace("import { axiosInstance }", "import axiosInstance");
c = c.replace("'../types/v2'", "'../../types/v2'");
fs.writeFileSync(f, c);

f = 'apps/admin_khcn/features/reports/components/reports/v2/designer/Canvas.tsx';
c = fs.readFileSync(f, 'utf8');
c = c.replace("'../../../types/v2'", "'../../../../types/v2'");
c = c.replace(/config\.sources\.filter\(\(s\)/g, 'config.sources.filter((s: any)');
c = c.replace(/config\.joins\.filter\(\s*\(\j\)/g, 'config.joins.filter((j: any)');
c = c.replace(/config\.sources\.map\(\(src\)/g, 'config.sources.map((src: any)');
c = c.replace(/src\.fields\.map\(\(field\)/g, 'src.fields.map((field: any)');
c = c.replace(/config\.sources\.map\(\(s\)/g, 'config.sources.map((s: any)');
c = c.replace(/config\.joins\.map\(\(j, idx\)/g, 'config.joins.map((j: any, idx: number)');
fs.writeFileSync(f, c);

f = 'apps/admin_khcn/features/reports/components/reports/v2/designer/ReportDesigner.tsx';
c = fs.readFileSync(f, 'utf8');
c = c.replace("'../../../types/v2'", "'../../../../types/v2'");
fs.writeFileSync(f, c);

f = 'apps/admin_khcn/features/reports/components/reports/v2/designer/SourceExplorer.tsx';
c = fs.readFileSync(f, 'utf8');
c = c.replace("'../../../types/v2'", "'../../../../types/v2'");
fs.writeFileSync(f, c);

f = 'apps/admin_khcn/features/reports/components/reports/v2/ReportViewer.tsx';
c = fs.readFileSync(f, 'utf8');
c = c.replace("'../../api/v2'", "'../../../api/v2'");
fs.writeFileSync(f, c);

f = 'apps/admin_khcn/features/reports/components/reports/v2/ReportWorkspace.tsx';
c = fs.readFileSync(f, 'utf8');
c = c.replace("'../../api/v2'", "'../../../api/v2'");
c = c.replace("'../../types/v2'", "'../../../types/v2'");
fs.writeFileSync(f, c);
