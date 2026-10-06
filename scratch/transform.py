import glob
import re
import os

files = glob.glob('../apps/hrm-service/prisma/schema/*.prisma') + glob.glob('../apps/user-service/prisma/schema/*.prisma')

for file_path in files:
    with open(file_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()
        
    out_lines = []
    in_model = False
    has_org_id = False
    model_name = ""
    single_id_field = None
    single_uniques = []
    added_org_field = False
    
    i = 0
    while i < len(lines):
        line = lines[i]
        
        model_match = re.match(r'^model\s+(\w+)\s*\{', line)
        if model_match:
            in_model = True
            model_name = model_match.group(1)
            has_org_id = False
            single_id_field = None
            single_uniques = []
            added_org_field = False
            out_lines.append(line)
            i += 1
            continue
            
        if in_model and line.strip() == '}':
            if not has_org_id and not added_org_field:
                out_lines.append('  organizationId String @default("DEFAULT") @map("organization_id")\n')
                if single_id_field:
                    out_lines.append(f'  @@id([{single_id_field}, organizationId])\n')
                for u in single_uniques:
                    out_lines.append(f'  @@unique([{u}, organizationId])\n')
            out_lines.append(line)
            in_model = False
            i += 1
            continue
            
        if in_model:
            if re.search(r'\borganizationId\b', line):
                has_org_id = True
                
            if not has_org_id and not added_org_field and line.strip().startswith('@@'):
                out_lines.append('  organizationId String @default("DEFAULT") @map("organization_id")\n')
                if single_id_field:
                    out_lines.append(f'  @@id([{single_id_field}, organizationId])\n')
                    single_id_field = None
                for u in single_uniques:
                    out_lines.append(f'  @@unique([{u}, organizationId])\n')
                single_uniques = []
                added_org_field = True

            if '@id' in line and not line.strip().startswith('@@'):
                field_match = re.match(r'^\s+(\w+)\s+', line)
                if field_match:
                    single_id_field = field_match.group(1)
                line = re.sub(r'@id\s*', '', line)
                
            if '@unique' in line and not line.strip().startswith('@@'):
                field_match = re.match(r'^\s+(\w+)\s+', line)
                if field_match:
                    single_uniques.append(field_match.group(1))
                line = re.sub(r'@unique\s*', '', line)
                
            if '@@id([' in line:
                line = re.sub(r'@@id\(\[(.*?)\]\)', r'@@id([\1, organizationId])', line)
                
            if '@@unique([' in line:
                line = re.sub(r'@@unique\(\[(.*?)\](.*?)\)', lambda m: f"@@unique([{m.group(1)}, organizationId]{m.group(2)})" if 'organizationId' not in m.group(1) else m.group(0), line)
                
            if '@relation' in line:
                line = re.sub(r'fields:\s*\[(.*?)\]', lambda m: f"fields: [{m.group(1)}, organizationId]" if 'organizationId' not in m.group(1) else m.group(0), line)
                line = re.sub(r'references:\s*\[(.*?)\]', lambda m: f"references: [{m.group(1)}, organizationId]" if 'organizationId' not in m.group(1) else m.group(0), line)
                
        out_lines.append(line)
        i += 1
        
    with open(file_path, 'w', encoding='utf-8') as f:
        f.writelines(out_lines)
    print(f"Updated {file_path}")
