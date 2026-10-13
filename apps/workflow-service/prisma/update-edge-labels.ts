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
  'e_gw_p_tccb': 'Phòng TCCB · Bổ nhiệm cán bộ 5 bước',
  'e_gw_p_tcd_dv': 'Phòng TCĐ-ĐV · Đảng viên & Huy hiệu Đảng LGSP',
  'e_gw_p_bvctnb': 'Phòng BVCTNB · Thẩm tra chính trị CSDL Mức 3',
  'e_gw_van_phong': 'Văn phòng · Văn thư Mật & ATTT Cấp 3',
  'e_ldp_officer': 'Giao Chuyên viên 22 VTVL chủ trì',
  'e_officer_review': 'Nộp sản phẩm kèm minh chứng',
  'e_officer_to_ext': 'Đề xuất xin gia hạn (trước 24h)',
  'e_ext_to_autolink': 'Chuyển thẩm định gia hạn (WF_BTCTU_XIN_GIA_HAN_VIEC)',
  'e_autolink_to_officer': 'Cập nhật hạn mới · Tiếp tục thực thi',
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

  // WF_BTCTU_XIN_GIA_HAN_VIEC
  'e_ext_start_req': 'Khởi tạo đề xuất gia hạn',
  'e_ext_req_ldp': 'Trình Lãnh đạo Phòng thẩm định',
  'e_ext_ldp_gw': 'Kiểm tra tính hợp lệ',
  'e_ext_gwldp_pass': 'Đồng ý · Trình Lãnh đạo Ban',
  'e_ext_gwldp_reject': 'Không đồng ý · Giữ nguyên hạn',
  'e_ext_ldb_gw': 'Lãnh đạo Ban xem xét',
  'e_ext_gwldb_pass': 'Chấp thuận gia hạn',
  'e_ext_gwldb_reject': 'Bác bỏ · Giữ nguyên hạn',
  'e_ext_auto_end': 'Cập nhật hạn mới hoàn tất',

  // WF_BTCTU_BVCTNB_XAC_MINH
  'e_bvctnb_start_assign': 'Tiếp nhận hồ sơ',
  'e_bvctnb_assign_inv': 'Phân công Chuyên viên thẩm tra',
  'e_bvctnb_inv_gw': 'Đối soát CSDL Mật Mức 3',
  'e_bvctnb_gw_no_field': 'Không cần đi thực địa',
  'e_bvctnb_gw_need_field': 'Cần xác minh thực tế',
  'e_bvctnb_field_concl': 'Hoàn tất xác minh cơ sở',
  'e_bvctnb_concl_ldp': 'Trình Lãnh đạo Phòng duyệt',
  'e_bvctnb_ldp_ban': 'Trình Lãnh đạo Ban ký duyệt',
  'e_bvctnb_ban_end': 'Ký ban hành Kết luận',

  // WF_BTCTU_TCCB_BO_NHIEM
  'e_app_start_s1': 'Khởi tạo quy trình bổ nhiệm',
  'e_app_s1_s2': 'Hoàn thành bước 1 · Sang bước 2',
  'e_app_s2_bvctnb': 'Lấy phiếu bước 2 · Kích hoạt thẩm tra chính trị',
  'e_app_bvctnb_s3': 'Nhận kết quả thẩm tra · Hoàn thiện hồ sơ 2C',
  'e_app_s3_gw': 'Đối soát tiêu chuẩn & chính trị',
  'e_app_gw_pass': 'Đủ điều kiện · Sang bước 4',
  'e_app_gw_fail': 'Có vi phạm · Dừng bổ nhiệm',
  'e_app_s4_s5': 'Hoàn thành bước 4 · Biểu quyết bước 5',
  'e_app_s5_btv': 'Trình Ban Thường vụ Tỉnh ủy',
  'e_app_btv_end': 'Ban hành Quyết định bổ nhiệm',

  // WF_BTCTU_TCD_DV_HUY_HIEU_DANG
  'e_badge_start_auto': 'Tiếp nhận hồ sơ',
  'e_badge_auto_spec': 'Đối soát tự động qua LGSP',
  'e_badge_spec_gw': 'Thẩm định hồ sơ',
  'e_badge_gw_pass': 'Đủ điều kiện · Trình Trưởng phòng',
  'e_badge_gw_fail': 'Chưa đủ điều kiện · Trả hồ sơ',
  'e_badge_ldp_ldb': 'Ký nháy trình Lãnh đạo Ban',
  'e_badge_ldb_btv': 'Trình Ban Thường vụ Tỉnh ủy',
  'e_badge_btv_sync': 'Ban hành QĐ · Đồng bộ dữ liệu',
  'e_badge_sync_end': 'Cập nhật hồ sơ thành công',

  // WF_ATTT_XU_LY_SU_CO
  'e_inc_start_tri': 'Tiếp nhận cảnh báo',
  'e_inc_tri_gw': 'Phân loại sự cố',
  'e_inc_gw_crit': 'Khẩn cấp · Cô lập ngay',
  'e_inc_gw_norm': 'Mức độ trung bình/thấp',
  'e_inc_cont_rec': 'Đã cô lập an toàn · Tiến hành xử lý',
  'e_inc_rec_rep': 'Khôi phục xong · Lập báo cáo',
  'e_inc_rep_end': 'Đóng hồ sơ sự cố',

  // WF_ATTT_THOI_VIEC_THU_HOI
  'e_off_start_hand': 'Tiếp nhận quyết định',
  'e_off_hand_dept': 'Bàn giao tài sản',
  'e_off_dept_auto': 'Trưởng phòng xác nhận',
  'e_off_auto_sec': 'Vô hiệu hóa quyền xong',
  'e_off_sec_end': 'Xác nhận an toàn · Hoàn tất',

  // WF_ATTT_THU_NGHIEM_NGHIEM_THU
  'e_sys_start_func': 'Nộp bản phát hành thử nghiệm',
  'e_sys_func_sec': 'UAT hoàn thành · Chuyển Pentest',
  'e_sys_sec_gw': 'Đối soát kết quả kiểm thử',
  'e_sys_gw_pass': 'Đạt chuẩn · Trình Hội đồng nghiệm thu',
  'e_sys_gw_fail': 'Có lỗi bảo mật · Yêu cầu khắc phục',
  'e_sys_rem_sec': 'Đã vá lỗi · Quét lại bảo mật',
  'e_sys_board_deploy': 'Hội đồng nghiệm thu thông qua',
  'e_sys_board_reject': 'Hội đồng bác bỏ nghiệm thu',
  'e_sys_deploy_end': 'Triển khai Production thành công',

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
