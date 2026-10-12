import 'dotenv/config';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { PrismaClient } from '../src/generated/prisma/client';

function createPrismaClient(): PrismaClient {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    throw new Error('DATABASE_URL environment variable is not set');
  }
  const mariadbUrl = dbUrl.replace(/^mysql:\/\//, 'mariadb://');
  const adapter = new PrismaMariaDb(mariadbUrl);
  return new PrismaClient({ adapter });
}

// Bảng từ điển nhãn tiếng Việt chuẩn theo edgeId hoặc action
const SPECIFIC_EDGE_LABELS: Record<string, string> = {
  // WF_BTCTU_QUAN_LY_CONG_VIEC
  'e_start_ldb': 'Khởi tạo & Giao việc',
  'e_ldb_gw': 'Phân luồng về phòng chuyên môn',
  'e_gw_ldp': 'Tiếp nhận nhiệm vụ cấp phòng',
  'e_ldp_officer': 'Giao Chuyên viên 22 VTVL chủ trì',
  'e_officer_review': 'Nộp sản phẩm kèm minh chứng',
  'e_review_gw': 'Thẩm định chất lượng (3 mức lỗi)',
  'e_gwldp_return': 'Có lỗi · Trả lại sửa (-5% / -15% / -35%)',
  'e_gwldp_pass': 'Đạt chuẩn · Ký nháy trình Lãnh đạo Ban',
  'e_ldb_gw_eval': 'Xem xét & Phê duyệt Tờ trình',
  'e_gwldb_rework': 'Chỉ đạo rà soát lại',
  'e_gwldb_approve': 'Phê duyệt (Ký số CA) / Trình BTVTU',
  'e_gwldb_reject': 'Đình chỉ / Hủy nhiệm vụ',
  'e_auto_end': 'Tính điểm KPI 4 thành tố & Lưu trữ ATTT Cấp 3',

  // WF_BTCTU_DANH_GIA_KPI
  'e_kpi_start_mau01': 'Kích hoạt kỳ đánh giá quý',
  'e_mau01_mau02': 'Đăng ký danh mục (Mẫu 01)',
  'e_mau02_mau04': 'Tự chấm điểm (Mẫu 02)',
  'e_mau04_mau03': 'Kê khai nổi trội (Mẫu 04)',
  'e_mau03_audit': 'Họp phòng & Thẩm định (Mẫu 03)',
  'e_audit_gw': 'Đối soát 08 nguồn CSDL & Rà soát kỷ luật',
  'e_gw_violation': 'Có vi phạm (Kỷ luật / Lọt lộ bí mật)',
  'e_gw_noviolation': 'Không vi phạm (Đủ điều kiện xét)',
  'e_demote_mau05': 'Chuyển danh sách ấn định hạ bậc',
  'e_caps_council': 'Áp trần 20% & Trần người đứng đầu',
  'e_council_gw': 'Hội đồng Ban họp xét duyệt',
  'e_gwcouncil_rework': 'Yêu cầu phòng rà soát lại',
  'e_gwcouncil_pass': 'Hội đồng thông qua kết quả',
  'e_mau05_end': 'Ban hành QĐ (Mẫu 05) & Công khai',

  // BUSINESS_LICENSE
  'e_start_recv': 'Tiếp nhận hồ sơ xin cấp phép',
  'e_recv_gw': 'Kiểm tra tính hợp lệ',
  'e_gw_rej': 'Không hợp lệ · Từ chối hồ sơ',
  'e_gw_ok': 'Hợp lệ · Chuyển thẩm định',
  'e_ver_appr': 'Đã xác minh · Trình Lãnh đạo phê duyệt',
  'e_appr_end': 'Phê duyệt & Ban hành Giấy phép',

  // DOCUMENT_APPROVAL
  'e_start1_task1': 'Khởi tạo dự thảo văn bản',
  'e_task1_task2': 'Trình Trưởng phòng ký duyệt',
  'e_task2_task3': 'Trình Ban Giám đốc phê duyệt',
  'e_task3_end1': 'Ký ban hành & Phát hành văn bản',

  // LEAVE_REQUEST
  'e_task2_gateway1': 'Trình Lãnh đạo xem xét',
  'e_gateway1_integration1': 'Đồng ý phê duyệt nghỉ phép',
  'e_gateway1_rejected': 'Không đồng ý · Từ chối nghỉ phép',
  'e_integration1_end': 'Đồng bộ dữ liệu nghỉ phép sang HRM',

  // TASK_PROCESSING_ID
  'e_start_assign': 'Khởi tạo & Giao việc',
  'e_assign_gw': 'Phân công cán bộ thụ lý',
  'e_gw_reject': 'Từ chối tiếp nhận việc',
  'e_gw_process': 'Tiếp nhận & Thực hiện',
  'e_process_eval': 'Nộp báo cáo hoàn thành',
  'e_eval_gw': 'Đánh giá & Thẩm định',
  'e_gweval_reject': 'Yêu cầu làm lại / Chỉnh sửa',
  'e_gweval_done': 'Đánh giá Đạt yêu cầu',
  'e_auto_done': 'Tích lũy kết quả vào KPI',

  // UNEXPECTED_TASK_PROCESSING
  'e_start_propose': 'Khởi tạo nhiệm vụ đột xuất',
  'e_propose_approve': 'Trình phê duyệt chủ trương',
  'e_approve_gw': 'Lãnh đạo xem xét chủ trương',
  'e_gweval_rework': 'Yêu cầu bổ sung / Làm lại',
};

const ACTION_LABELS_FALLBACK: Record<string, string> = {
  'ASSIGN_START': 'Khởi tạo & Giao việc',
  'DISPATCH_TO_DEPT': 'Phân luồng về phòng chuyên môn',
  'ROUTED_TO_DEPT': 'Tiếp nhận nhiệm vụ cấp phòng',
  'ASSIGN_OFFICER': 'Giao Chuyên viên 22 VTVL chủ trì',
  'SUBMIT_FOR_REVIEW': 'Nộp sản phẩm kèm minh chứng',
  'CHECK_QUALITY': 'Thẩm định chất lượng (3 mức lỗi)',
  'RETURN': 'Có lỗi · Trả lại sửa (-5% / -15% / -35%)',
  'SUBMIT_TO_BAN': 'Đạt chuẩn · Ký nháy trình Lãnh đạo Ban',
  'EVALUATE_DECISION': 'Xem xét & Phê duyệt Tờ trình',
  'BAN_REQUEST_REVIEW': 'Chỉ đạo rà soát lại',
  'BAN_APPROVE': 'Phê duyệt (Ký số CA) / Trình BTVTU',
  'BAN_CANCEL': 'Đình chỉ / Hủy nhiệm vụ',
  'KPI_COMPLETED': 'Tính điểm KPI 4 thành tố & Lưu trữ ATTT Cấp 3',
  'INITIATE_PERIOD': 'Kích hoạt kỳ đánh giá quý',
  'SUBMIT_MAU_01': 'Đăng ký danh mục (Mẫu 01)',
  'SUBMIT_MAU_02': 'Tự chấm điểm (Mẫu 02)',
  'SUBMIT_MAU_04': 'Kê khai nổi trội (Mẫu 04)',
  'SUBMIT_MAU_03': 'Họp phòng & Thẩm định (Mẫu 03)',
  'CHECK_AUDIT': 'Đối soát 08 nguồn CSDL & Rà soát kỷ luật',
  'HAS_VIOLATION': 'Có vi phạm (Kỷ luật / Lọt lộ bí mật)',
  'NO_VIOLATION': 'Không vi phạm (Đủ điều kiện xét)',
  'FORWARD_DEMOTION': 'Chuyển danh sách ấn định hạ bậc',
  'CAPS_APPLIED': 'Áp trần 20% & Trần người đứng đầu',
  'COUNCIL_REVIEW': 'Hội đồng Ban họp xét duyệt',
  'REQUEST_REWORK': 'Yêu cầu phòng rà soát lại',
  'COUNCIL_APPROVED': 'Hội đồng thông qua kết quả',
  'PUBLISH_RESULTS': 'Ban hành QĐ (Mẫu 05) & Công khai',
  'CHECK': 'Kiểm tra tính hợp lệ',
  'INVALID': 'Không hợp lệ · Từ chối',
  'VALID': 'Hợp lệ · Chuyển xác minh',
  'VERIFIED': 'Đã xác minh · Trình phê duyệt',
  'APPROVE': 'Phê duyệt',
  'SUBMIT': 'Trình duyệt hồ sơ',
  'REVIEW': 'Thẩm định / Xem xét',
  'PUBLISH': 'Ban hành văn bản',
  'REJECT': 'Từ chối tiếp nhận',
  'ASSIGN': 'Phân công xử lý',
  'ACCEPT': 'Tiếp nhận xử lý',
  'SUBMIT_REPORT': 'Báo cáo kết quả',
  'EVALUATE': 'Đánh giá kết quả',
  'REWORK': 'Yêu cầu làm lại',
};

function getNormalizedLabel(edge: any): string {
  if (edge.id && SPECIFIC_EDGE_LABELS[edge.id]) {
    return SPECIFIC_EDGE_LABELS[edge.id];
  }
  const action = edge.action || edge.data?.action;
  if (action && ACTION_LABELS_FALLBACK[action]) {
    return ACTION_LABELS_FALLBACK[action];
  }
  if (edge.label && typeof edge.label === 'string' && edge.label.trim()) {
    return edge.label.trim();
  }
  if (edge.sourceHandle === 'true') return 'Đúng';
  if (edge.sourceHandle === 'false') return 'Sai';
  return 'Tiếp tục';
}

async function main() {
  const prisma = createPrismaClient();
  try {
    const definitions = await (prisma as any).processDefinition.findMany({
      include: { versions: true },
    });

    console.log(`Tìm thấy ${definitions.length} quy trình trong CSDL.`);

    let updatedVersionsCount = 0;

    for (const def of definitions) {
      for (const ver of def.versions) {
        let rawGraph = ver.graph;
        if (typeof rawGraph === 'string') {
          try { rawGraph = JSON.parse(rawGraph); } catch {}
        }
        let rawCompiled = ver.compiledGraph;
        if (typeof rawCompiled === 'string') {
          try { rawCompiled = JSON.parse(rawCompiled); } catch {}
        }

        if (!rawGraph || !Array.isArray(rawGraph.edges)) {
          continue;
        }

        const newEdges = rawGraph.edges.map((e: any) => {
          const label = getNormalizedLabel(e);
          return {
            ...e,
            label,
            data: {
              ...(e.data || {}),
              label,
            },
          };
        });

        const updatedGraph = {
          ...rawGraph,
          edges: newEdges,
        };

        let updatedCompiledGraph = rawCompiled;
        if (rawCompiled && Array.isArray(rawCompiled.edges)) {
          updatedCompiledGraph = {
            ...rawCompiled,
            edges: rawCompiled.edges.map((e: any) => {
              const label = getNormalizedLabel(e);
              return {
                ...e,
                label,
                data: {
                  ...(e.data || {}),
                  label,
                },
              };
            }),
          };
        }

        await (prisma as any).processVersion.update({
          where: { id: ver.id },
          data: {
            graph: updatedGraph,
            compiledGraph: updatedCompiledGraph,
          },
        });

        console.log(`- Đã cập nhật ${newEdges.length} nhãn đường nối cho quy trình: [${def.code}] version ${ver.version}`);
        updatedVersionsCount++;
      }
    }

    console.log(`Hoàn thành! Đã cập nhật thành công ${updatedVersionsCount} phiên bản quy trình.`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((err) => {
  console.error('Lỗi khi cập nhật nhãn đường nối CSDL:', err);
  process.exit(1);
});
