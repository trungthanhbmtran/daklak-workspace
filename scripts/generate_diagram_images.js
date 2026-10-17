const fs = require('fs');
const path = require('path');
const axios = require('axios');

const diagrams = {
  swimlane: `flowchart TD
    subgraph BTVTU["BAN THƯỜNG VỤ TỈNH ỦY / THƯỜNG TRỰC TỈNH ỦY"]
        B1["1. Giao nhiệm vụ, phê duyệt chương trình (Đề án, Quy hoạch)"]
        B2["10. Ban hành Nghị quyết / Kết luận phê duyệt cán bộ"]
    end
    subgraph LDB["LÃNH ĐẠO BAN TỔ CHỨC TỈNH ỦY (Trưởng ban & 4 Phó ban)"]
        L1["2. Tiếp nhận chỉ đạo, phân công Lãnh đạo Ban & Phòng phụ trách"]
        L2["Phê duyệt Kế hoạch / Giao việc cấp Phòng"]
        L3["8. Ký duyệt Tờ trình, Kết luận (Ký số trình BTVTU)"]
        L4["12. Chủ trì Hội đồng Đánh giá & Ban hành Quyết định (Mẫu 05)"]
    end
    subgraph LDP["LÃNH ĐẠO PHÒNG CHUYÊN MÔN (05 Phòng)"]
        P1["3. Tiếp nhận, lập Kế hoạch chi tiết (hệ số K, hạn chót)"]
        P2["4. Phân công Chuyên viên chủ trì & Phối hợp"]
        P3{"7. Thẩm định sản phẩm & Kiểm soát 3 mức lỗi"}
        P4["Yêu cầu chỉnh sửa (Trừ điểm B%)"]
        P5["Ký nháy Tờ trình trình Lãnh đạo Ban"]
        P6["11. Họp phòng chấm điểm & Tổng hợp Mẫu 03"]
    end
    subgraph CV["CHUYÊN VIÊN NGHIỆP VỤ (22 VTVL)"]
        C1["5. Tiếp nhận việc, chuyển trạng thái Đang làm"]
        C2["6. Thực thi nghiệp vụ theo 4 domain đặc thù"]
        C3["Xin gia hạn 24h (Bảo lưu 100% điểm C%)"]
        C4["Nộp sản phẩm hoàn thành kèm file minh chứng"]
        C5["10. Tự đánh giá Mẫu 02 & Kê khai Nổi trội Mẫu 04"]
    end

    B1 --> L1
    L1 --> L2
    L2 --> P1
    P1 --> P2
    P2 --> C1
    C1 --> C2
    C2 -.-> C3
    C3 -.-> C2
    C2 --> C4
    C4 --> P3
    P3 --"Có lỗi"--> P4
    P4 --> C2
    P3 --"Đạt chuẩn"--> P5
    P5 --> L3
    L3 --> B2
    L3 --> P6
    B2 --> P6
    C4 --> C5
    C5 --> P6
    P6 --> L4`,

  statemachine: `stateDiagram-v2
    [*] --> TEMPLATE: Lập Kế hoạch khung đầu kỳ (Mẫu 01)
    TEMPLATE --> TODO: Lãnh đạo Ban/Phòng giao việc
    [*] --> TODO: Giao việc đột xuất / Khẩn cấp

    TODO --> IN_PROGRESS: Chuyên viên bấm 'Bắt đầu làm'
    TODO --> RETURNED: Từ chối tiếp nhận (có lý do)
    RETURNED --> TODO: Lãnh đạo phân công lại người khác

    IN_PROGRESS --> IN_PROGRESS: Xin gia hạn 24h (Bảo lưu 100% điểm C)
    IN_PROGRESS --> IN_PROGRESS: Cập nhật tiến độ / Phối hợp liên phòng

    IN_PROGRESS --> REVIEWING: Nộp sản phẩm & Minh chứng đầu ra
    
    REVIEWING --> RETURNED: Trưởng phòng yêu cầu sửa (Trừ lỗi B%)
    RETURNED --> IN_PROGRESS: Chuyên viên chỉnh sửa theo ý kiến

    REVIEWING --> PENDING_APPROVAL: Trưởng phòng duyệt đạt chất lượng
    PENDING_APPROVAL --> REVIEWING: Lãnh đạo Ban chỉ đạo rà soát lại
    PENDING_APPROVAL --> DONE: Lãnh đạo Ban ký duyệt hoàn thành

    DONE --> EVALUATED: Tự chấm Mẫu 02, Ban xếp loại Mẫu 05
    
    TODO --> CANCELLED: Hủy nhiệm vụ theo chỉ đạo
    IN_PROGRESS --> CANCELLED: Đình chỉ thực hiện theo chỉ đạo

    DONE --> [*]
    EVALUATED --> [*]
    CANCELLED --> [*]`,

  kpiflow: `flowchart TD
    subgraph G1["GIAI ĐOẠN 1: TỰ ĐÁNH GIÁ (Trước ngày 15 tháng cuối quý)"]
        A1["Công chức tổng hợp danh mục công việc đã hoàn thành"]
        A2["Lập Bản tự đánh giá, chấm điểm KPI MẪU 02:\n• S_chung (tối đa 30 điểm)\n• S_nhiệm_vụ (quy đổi thang 70)"]
        A3["Lập Bảng kê khai Nhiệm vụ Nổi trội MẪU 04\n(Điều kiện bắt buộc để xét Xuất sắc)"]
        A1 --> A2
        A2 --> A3
    end

    subgraph G2["GIAI ĐOẠN 2: TẬP THỂ PHÒNG THẨM ĐỊNH (Từ ngày 15 đến 20)"]
        B1["Họp toàn thể Chi bộ / Phòng chuyên môn"]
        B2["Tập thể góp ý, Trưởng phòng thẩm định điểm từng cá nhân"]
        B3["Tổng hợp kết quả đánh giá Tập thể phòng MẪU 03:\n• Điểm tập thể S_tập_thể\n• Bảng đề xuất xếp loại của phòng"]
        B1 --> B2
        B2 --> B3
    end

    subgraph G3["GIAI ĐOẠN 3: HỘI ĐỒNG BAN THẨM ĐỊNH & SIẾT TRẦN (Từ ngày 21 đến 25)"]
        C1["Hội đồng Thẩm định Ban Tổ chức Tỉnh ủy họp xét duyệt"]
        C2["Đối soát dữ liệu tự động với 08 Nguồn hệ thống:\n• Sổ văn bản, Ký số, CSDL Đảng viên, LGSP, Hồ sơ 2C"]
        C3{"Kiểm tra Điều kiện Bắt buộc Hạ bậc:\n• Kỷ luật Đảng/Hành chính?\n• Tỷ lệ HT < 70%?\n• Lọt lộ bí mật?"}
        C4["Hạ bậc: 'KHÔNG HOÀN THÀNH NHIỆM VỤ'"]
        C5{"Xét danh hiệu 'HOÀN THÀNH XUẤT SẮC':\n• S_tổng ≥ 90.0 điểm?\n• Có Mẫu 04 hợp lệ?"}
        C6["Áp trần Khống chế 20%:\nSố Xuất sắc ≤ INT(20% × Tổng số Tốt trở lên)"]
        C7["Áp trần Người đứng đầu:\nRank_Trưởng_phòng ≤ Rank_Tập_thể_phòng"]
        C8["Xếp loại: 'HOÀN THÀNH TỐT' hoặc 'HOÀN THÀNH'"]

        C1 --> C2
        C2 --> C3
        C3 --"Có vi phạm"--> C4
        C3 --"Không vi phạm"--> C5
        C5 --"Đủ điều kiện"--> C6
        C5 --"Không đủ"--> C8
        C6 --> C7
    end

    subgraph G4["GIAI ĐOẠN 4: BAN HÀNH QUYẾT ĐỊNH (Trước ngày 28)"]
        D1["Dự thảo Quyết định xếp loại chất lượng MẪU 05"]
        D2["Trưởng ban ký duyệt ban hành & Công khai trên Dashboard"]
        D3["Báo cáo kết quả lên Ban Thường vụ Tỉnh ủy"]
        D1 --> D2
        D2 --> D3
    end

    G1 --> G2
    G2 --> G3
    C7 --> D1
    C8 --> D1
    C4 --> D1`,

  integration: `flowchart TB
    subgraph NATIONAL["CÁC HỆ THỐNG DỮ LIỆU NỀN TẢNG QUỐC GIA & TỈNH ĐẮK LẮK"]
        direction LR
        N1["CSDL QG Cán bộ CCVC\n(Bộ Nội vụ - Mẫu 2C)"]
        N2["Trục Văn bản VXP\n(Quốc gia & Tỉnh ủy)"]
        N3["Sổ tay ĐV & CSDL Đảng viên\n(Ban Tổ chức TW)"]
        N4["Cổng DVC Tỉnh Đắk Lắk\n(Đo lường tiến độ giải quyết)"]
    end

    subgraph BUS_ZONE["TRỤC CHIA SẺ DỮ LIỆU QUỐC GIA (NDXP) & TRỤC LGSP TỈNH ĐẮK LẮK"]
        BUS["Trục Tích hợp Chia sẻ Dữ liệu (ESB / REST / SOAP / WSDL)\nBảo mật qua đường truyền VPN & Chứng thư số chuyên dùng"]
    end

    subgraph GW_ZONE["INTEGRATION HUB - API GATEWAY (NestJS)"]
        direction TB
        GW1["Xác thực OAuth2/mTLS & GatewayContextToken Injection"]
        GW2["Bộ Chuyển đổi Dữ liệu (Data Transformation Engine)"]
        GW3["Webhook Receiver & Chống nghẽn (Rate Limiter / Circuit Breaker)"]
    end

    subgraph CORE_ZONE["HỆ SINH THÁI DAKLAK-WORKSPACE MICROSERVICES"]
        S1["user-service: Đồng bộ VTVL & Hồ sơ 2C"]
        S2["hrm-service: Tính điểm KPI & Giao việc realtime"]
        S3["document-service: Bắt văn bản chỉ đạo & Phôi Quyết định"]
    end

    subgraph REALTIME_ZONE["HẠ TẦNG XỬ LÝ SỰ KIỆN THỜI GIAN THỰC (REALTIME STREAMING)"]
        MQ["RabbitMQ Event Bus (task.synced / kpi.evaluated)"]
        WS["WebSocket Server (Socket.IO): Push tức thời < 1s lên UI"]
    end

    NATIONAL --> BUS_ZONE
    BUS_ZONE -->|"mTLS / VPN"| GW_ZONE
    GW1 --> GW2 --> GW3
    GW3 -->|"gRPC Binary < 5ms"| S1
    GW3 -->|"gRPC Binary < 5ms"| S2
    GW3 -->|"gRPC Binary < 5ms"| S3
    S2 -->|"Publish Events"| MQ
    MQ -->|"Consume Events"| WS
    WS -->|"Push Notification"| USER["Màn hình Cán bộ / Lãnh đạo Ban"]`
};

async function downloadDiagram(name, code, filename) {
  const payload = {
    code: code,
    mermaid: {
      theme: 'default',
      flowchart: { curve: 'basis' }
    }
  };
  const base64 = Buffer.from(JSON.stringify(payload)).toString('base64');
  const url = 'https://mermaid.ink/img/' + base64 + '?bgColor=white';
  console.log('Downloading diagram:', name, 'from mermaid.ink...');
  const res = await axios.get(url, { responseType: 'arraybuffer', timeout: 30000 });
  const buffer = Buffer.from(res.data);
  const outPath = path.resolve('docs/extracted_media', filename);
  fs.writeFileSync(outPath, buffer);
  console.log('Successfully saved:', outPath, 'size:', buffer.length, 'bytes');
}

async function main() {
  await downloadDiagram('Swimlane', diagrams.swimlane, 'diagram_swimlane_workflow.png');
  await downloadDiagram('StateMachine', diagrams.statemachine, 'diagram_task_state_machine.png');
  await downloadDiagram('KpiFlow', diagrams.kpiflow, 'diagram_kpi_evaluation_flow.png');
  await downloadDiagram('Integration', diagrams.integration, 'diagram_integration_national_bus.png');
  console.log('ALL DIAGRAMS GENERATED SUCCESSFULLY!');
}

main().catch(err => {
  console.error('Error generating diagrams:', err);
  process.exit(1);
});
