import 'dotenv/config';
import { PrismaClient } from '../src/generated/prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import {
  btctuTaskManagementGraph,
  btctuKpiEvaluationGraph,
  btctuTaskExtensionGraph,
  btctuBvctnbVerificationGraph,
  btctuTccbAppointmentGraph,
  btctuTcdDvBadgeGraph,
  btctuSecurityIncidentGraph,
  btctuOffboardingSecurityGraph,
  btctuSystemTestingGraph,
} from './seed-btctu';

const mariadbUrl = process.env.DATABASE_URL!.replace(/^mysql:\/\//, 'mariadb://');
const prisma = new PrismaClient({ adapter: new PrismaMariaDb(mariadbUrl) });

function compileGraphCanonical(graph: any) {
  const nodes = (graph?.nodes ?? []).map((n: any) => ({
    id: n.id,
    type: n.type,
    name: n.name ?? n.data?.label ?? '',
    code: n.code ?? n.id,
    assignments: n.assignments ?? n.data?.assignments ?? [],
    data: {
      label: n.data?.label,
      description: n.data?.description,
      targetStatus: n.data?.targetStatus,
      formSchema: n.data?.formSchema,
      integrationCode: n.data?.integrationCode,
      endpoint: n.data?.endpoint,
      method: n.data?.method,
    },
  }));

  const edges = (graph?.edges ?? []).map((e: any) => ({
    id: e.id,
    source: e.source,
    target: e.target,
    label: e.label ?? null,
    action: e.action ?? null,
    condition: e.condition ?? null,
    priority: e.priority ?? 0,
    data: {
      ...(e.data ?? {}),
      ...(e.label ? { label: e.label } : {}),
    },
  }));

  return {
    nodes,
    edges,
    compiledAt: new Date().toISOString(),
    schemaVersion: 1,
  };
}

const BTCTU_WORKFLOW_MAP = [
  { code: 'WF_BTCTU_QUAN_LY_CONG_VIEC', graph: btctuTaskManagementGraph },
  { code: 'WF_BTCTU_DANH_GIA_KPI', graph: btctuKpiEvaluationGraph },
  { code: 'WF_BTCTU_XIN_GIA_HAN_VIEC', graph: btctuTaskExtensionGraph },
  { code: 'WF_BTCTU_BVCTNB_XAC_MINH', graph: btctuBvctnbVerificationGraph },
  { code: 'WF_BTCTU_TCCB_BO_NHIEM', graph: btctuTccbAppointmentGraph },
  { code: 'WF_BTCTU_TCD_DV_HUY_HIEU_DANG', graph: btctuTcdDvBadgeGraph },
  { code: 'WF_ATTT_XU_LY_SU_CO', graph: btctuSecurityIncidentGraph },
  { code: 'WF_ATTT_THOI_VIEC_THU_HOI', graph: btctuOffboardingSecurityGraph },
  { code: 'WF_ATTT_THU_NGHIEM_NGHIEM_THU', graph: btctuSystemTestingGraph },
];

async function updatePositions() {
  console.log('--- BẮT ĐẦU CẬP NHẬT TỌA ĐỘ VÀ ĐỒ THỊ SƠ ĐỒ QUY TRÌNH HỆ THỐNG ---');

  for (const item of BTCTU_WORKFLOW_MAP) {
    const def = await prisma.processDefinition.findFirst({
      where: { code: item.code },
      include: { versions: true },
    });

    if (def) {
      console.log(`Tìm thấy ${item.code} (${def.id}), số versions: ${def.versions.length}`);
      const compiled = compileGraphCanonical(item.graph);

      for (const v of def.versions) {
        await prisma.processVersion.update({
          where: { id: v.id },
          data: {
            graph: item.graph as any,
            compiledGraph: compiled as any,
          },
        });
        console.log(`  -> Đã cập nhật Version ${v.version} (${v.id}) cho ${item.code}`);
      }
    } else {
      console.warn(`Không tìm thấy định nghĩa ${item.code}`);
    }
  }

  console.log('--- HOÀN THÀNH CẬP NHẬT TỌA ĐỘ & ĐỒ THỊ 9 QUY TRÌNH THÀNH CÔNG ---');
  await prisma.$disconnect();
}

updatePositions().catch((err) => {
  console.error('Lỗi cập nhật tọa độ:', err);
  process.exit(1);
});
