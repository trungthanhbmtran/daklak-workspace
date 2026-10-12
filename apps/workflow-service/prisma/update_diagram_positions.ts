import 'dotenv/config';
import { PrismaClient } from '../src/generated/prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { btctuTaskManagementGraph, btctuKpiEvaluationGraph } from './seed-btctu';

const mariadbUrl = process.env.DATABASE_URL!.replace(/^mysql:\/\//, 'mariadb://');
const prisma = new PrismaClient({ adapter: new PrismaMariaDb(mariadbUrl) });

async function updatePositions() {
  console.log('--- BẮT ĐẦU CẬP NHẬT TỌA ĐỘ VÀ ĐƯỜNG NỐI SƠ ĐỒ QUY TRÌNH ---');

  // 1. Cập nhật WF_BTCTU_QUAN_LY_CONG_VIEC
  const taskDef = await prisma.processDefinition.findFirst({
    where: { code: 'WF_BTCTU_QUAN_LY_CONG_VIEC' },
    include: { versions: true }
  });

  if (taskDef) {
    console.log(`Tìm thấy WF_BTCTU_QUAN_LY_CONG_VIEC (${taskDef.id}), số versions: ${taskDef.versions.length}`);
    for (const v of taskDef.versions) {
      await prisma.processVersion.update({
        where: { id: v.id },
        data: {
          graph: btctuTaskManagementGraph as any,
          compiledGraph: btctuTaskManagementGraph as any,
        }
      });
      console.log(`  -> Đã cập nhật Version ${v.version} (${v.id}) cho WF_BTCTU_QUAN_LY_CONG_VIEC`);
    }
  } else {
    console.warn('Không tìm thấy định nghĩa WF_BTCTU_QUAN_LY_CONG_VIEC');
  }

  // 2. Cập nhật WF_BTCTU_DANH_GIA_KPI
  const kpiDef = await prisma.processDefinition.findFirst({
    where: { code: 'WF_BTCTU_DANH_GIA_KPI' },
    include: { versions: true }
  });

  if (kpiDef) {
    console.log(`Tìm thấy WF_BTCTU_DANH_GIA_KPI (${kpiDef.id}), số versions: ${kpiDef.versions.length}`);
    for (const v of kpiDef.versions) {
      await prisma.processVersion.update({
        where: { id: v.id },
        data: {
          graph: btctuKpiEvaluationGraph as any,
          compiledGraph: btctuKpiEvaluationGraph as any,
        }
      });
      console.log(`  -> Đã cập nhật Version ${v.version} (${v.id}) cho WF_BTCTU_DANH_GIA_KPI`);
    }
  } else {
    console.warn('Không tìm thấy định nghĩa WF_BTCTU_DANH_GIA_KPI');
  }

  console.log('--- HOÀN THÀNH CẬP NHẬT TỌA ĐỘ THÀNH CÔNG ---');
  await prisma.$disconnect();
}

updatePositions().catch((err) => {
  console.error('Lỗi cập nhật tọa độ:', err);
  process.exit(1);
});
