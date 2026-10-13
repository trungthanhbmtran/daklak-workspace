Backend task: verify and fix XML persistence for five HRM form templates MAU_01–MAU_05.

User approved using existing XML templates, Hướng dẫn 05-HD/TU (16/06/2026), and Quy định 348-QĐ/BTCTW (25/06/2026).
Evidence: 5 XML files exist under apps/hrm-service/templates/kpi-forms; KpiFormTemplate.xmlContent is nullable; seed currently does not set xmlContent; service falls back to getTemplateXmlContent from disk, so API can return XML even if DB column is empty. User asked to check the live app, but it redirects to login, so do not claim production DB was checked.

Legal scope: public HĐND source summarizes Hướng dẫn 05 as quarterly evaluation, 30 points common criteria + 70 points task results, clarity of person/task/time/responsibility/product/authority and decision by competent level. Original QĐ348 is about data connectivity/sharing, authoritative sources, data minimization, approved purpose, privacy and state secrets. It does NOT define XML/XSD or evaluation scoring. Correct misattributed citations in existing MAU_01/05 if needed, but do not invent criteria or call these official annex forms without the original annexes.

Owned files only:
- apps/hrm-service/templates/kpi-forms/mau-01-dang-ky-dau-ky.xml
- apps/hrm-service/templates/kpi-forms/mau-02-tu-danh-gia-ca-nhan.xml
- apps/hrm-service/templates/kpi-forms/mau-03-nhan-xet-tap-the.xml
- apps/hrm-service/templates/kpi-forms/mau-04-tong-hop-phong.xml
- apps/hrm-service/templates/kpi-forms/mau-05-tong-hop-co-quan.xml
- apps/hrm-service/prisma/btctu-kpi-engine.seed.ts

Implement: read the existing XML files in seed; fetch existing formCode/xmlContent values for the five codes in one batch select; fill xmlContent only when DB value is null/empty; preserve any non-empty customized XML. Do not add migrations, run seed against a database, or add personal identifiers. Keep placeholders and business structure. No frontend/gateway/proto/workflow changes.
Verify XML well-formedness, exact formCode, UTF-8 without BOM, and run npx tsc --noEmit in apps/hrm-service plus git diff --check. Create backend decision record at .agents/reports/20261013-hrm-digitize-five-forms/backend-coder.md.