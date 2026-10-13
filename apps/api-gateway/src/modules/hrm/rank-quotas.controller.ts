import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
  Inject,
  InternalServerErrorException,
  BadRequestException,
  NotFoundException,
  ConflictException,
  UnauthorizedException,
  ForbiddenException,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../core/guards/permissions.guard';
import { MICROSERVICES } from '../../core/constants/services';
import { TokenIssuerService } from '../../core/auth/token-issuer.service';
import { clientIp } from '../../core/client-ip';
import { randomUUID } from 'crypto';
import { Metadata } from '@grpc/grpc-js';
import { firstValueFrom } from 'rxjs';

@ApiTags('HRM - Rank Quotas')
@Controller('admin/hrm/rank-quotas')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth('JWT-auth')
export class RankQuotasController {
  private handleRpcError(e: any, defaultMsg = 'RPC Call Failed'): never {
    const code = e?.code;
    const message = e?.details || e?.message || defaultMsg;
    if (code === 16) throw new UnauthorizedException(message);
    if (code === 7) throw new ForbiddenException(message);
    if (code === 5) throw new NotFoundException(message);
    if (code === 6) throw new ConflictException(message);
    if (code === 3) throw new BadRequestException(message);
    throw new InternalServerErrorException(message);
  }

  private rankQuotaService: any;
  private aiService: any;

  constructor(
    @Inject(MICROSERVICES.TASK.SYMBOL) private readonly client: any,
    @Inject(MICROSERVICES.AI.SYMBOL) private readonly aiClient: any,
    private readonly issuer: TokenIssuerService,
  ) {}

  onModuleInit() {
    this.rankQuotaService = this.client.getService('TaskService');
    try {
      this.aiService = this.aiClient.getService('AiService');
    } catch {
      // AI service optional
    }
  }

  private getGrpcMetadata(req: any) {
    const meta = new Metadata();
    meta.set(
      'authorization',
      'Bearer ' +
        this.issuer.signDelegation(req.user, {
          requestId: randomUUID(),
          ipAddress: clientIp(req),
        }),
    );
    return meta;
  }

  @Post()
  async saveRankQuotas(@Req() req: any, @Body() body: any) {
    const data = await firstValueFrom(
      this.rankQuotaService.SaveRankQuotas(
        {
          rankCode: body.rankCode,
          domainCode: body.domainCode,
          quotas: body.quotas,
          departmentId: body.departmentId ? Number(body.departmentId) : undefined,
          unitCode: body.unitCode,
        },
        this.getGrpcMetadata(req),
      ),
    ).catch((e) => this.handleRpcError(e));
    return data;
  }

  @Post('ai-suggest')
  async suggestQuotasAndPlan(@Req() req: any, @Body() body: any) {
    const {
      unitName = 'Đơn vị',
      unitCode = '',
      rankName = 'Vị trí việc làm',
      rankCode = 'JOB_POSITION',
      classification = 'CONG_CHUC',
      domainCode = 'GENERIC',
      targetScope = 'INDIVIDUAL',
      goalOrientation = 'STANDARD',
      headcount = 1,
    } = body;

    const userId = req.user?.id ? Number(req.user.id) : 1;
    let aiResponseText = '';

    if (this.aiService?.GenerateText) {
      try {
        const prompt = `Bạn là chuyên gia tư vấn xây dựng định mức công việc và kế hoạch nhiệm vụ trong cơ quan Nhà nước Việt Nam.
Thông tin đầu vào:
- Đối tượng: ${targetScope === 'UNIT' ? `Toàn bộ Đơn vị: ${unitName} (${unitCode})` : `Vị trí việc làm: ${rankName} (${rankCode}) thuộc đơn vị ${unitName}`}
- Khối phân loại: ${classification} (Công chức NĐ 62/2020, Viên chức NĐ 106/2020, hoặc Cơ quan Đảng QĐ 137-QĐ/TW)
- Mảng nghiệp vụ: ${domainCode}
- Định hướng mục tiêu: ${goalOrientation}
- Định biên biên chế: ${headcount} người

Yêu cầu xuất ra JSON cấu trúc:
{
  "strategicGoal": "Mục tiêu SMART trọng tâm",
  "rationale": "Căn cứ pháp lý và phân tích tải công việc theo biên chế",
  "suggestedQuotas": [
    {
      "taskName": "Tên nhiệm vụ",
      "unit": "Hồ sơ / Báo cáo / Đề án / Lượt",
      "monthlyTarget": 5,
      "quarterlyTarget": 15,
      "yearlyTarget": 60,
      "weight": 25,
      "outputProduct": "Sản phẩm đầu ra",
      "rationale": "Căn cứ giao việc"
    }
  ],
  "suggestedPlan": {
    "title": "Tên kế hoạch nhiệm vụ",
    "phases": [
      { "phase": "Quý 1", "focus": "Trọng tâm triển khai", "expectedOutput": "Sản phẩm bàn giao" }
    ]
  }
}
Chỉ trả về JSON hợp lệ không bọc trong markdown code fence. Tổng trọng số weight của các nhiệm vụ phải đúng bằng 100.`;

        const res: any = await firstValueFrom(
          this.aiService.GenerateText({ prompt, user_id: userId }),
        );
        aiResponseText = res?.result || '';
      } catch {
        // Fallback to internal rule engine
      }
    }

    if (aiResponseText) {
      try {
        const cleaned = aiResponseText.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(cleaned);
        if (parsed && Array.isArray(parsed.suggestedQuotas) && parsed.suggestedQuotas.length > 0) {
          return {
            success: true,
            data: {
              ...parsed,
              targetScope,
              goalOrientation,
              unitName,
              rankName,
            },
          };
        }
      } catch {
        // Fallback
      }
    }

    return {
      success: true,
      data: this.buildRuleBasedSuggestion({
        unitName,
        unitCode,
        rankName,
        rankCode,
        classification,
        domainCode,
        targetScope,
        goalOrientation,
        headcount,
      }),
    };
  }

  private buildRuleBasedSuggestion(params: {
    unitName: string;
    unitCode: string;
    rankName: string;
    rankCode: string;
    classification: string;
    domainCode: string;
    targetScope: string;
    goalOrientation: string;
    headcount: number;
  }) {
    const isLeader = /(trưởng|phó|chủ nhiệm|giám đốc|thường trực)/i.test(params.rankName);
    const isSpecialist = /(chuyên viên|nghiên cứu|thẩm tra|kiểm tra)/i.test(params.rankName);
    const isParty = params.classification === 'DANG' || /(BTCTU|TU|Đảng)/i.test(params.unitCode);
    const multiplier = params.goalOrientation === 'INTENSIVE' ? 1.25 : params.goalOrientation === 'DIGITAL_TRANSFORMATION' ? 1.1 : 1.0;

    let quotas: Array<{
      taskName: string;
      unit: string;
      monthlyTarget: number;
      quarterlyTarget: number;
      yearlyTarget: number;
      weight: number;
      outputProduct: string;
      rationale: string;
    }> = [];

    if (params.targetScope === 'UNIT') {
      quotas = [
        {
          taskName: `Chỉ đạo và điều hành toàn diện công tác chuyên môn tại ${params.unitName}`,
          unit: 'Chương trình',
          monthlyTarget: Math.round(2 * multiplier),
          quarterlyTarget: Math.round(6 * multiplier),
          yearlyTarget: Math.round(24 * multiplier),
          weight: 25,
          outputProduct: 'Chương trình công tác & Thông báo kết luận cuộc họp',
          rationale: 'Bảo đảm tiến độ thực hiện chức năng, nhiệm vụ của đơn vị theo quy chế hoạt động',
        },
        {
          taskName: `Thẩm định, duyệt và phát hành văn bản tham mưu lãnh đạo cấp trên`,
          unit: 'Văn bản',
          monthlyTarget: Math.round(15 * params.headcount * multiplier * 0.4),
          quarterlyTarget: Math.round(45 * params.headcount * multiplier * 0.4),
          yearlyTarget: Math.round(180 * params.headcount * multiplier * 0.4),
          weight: 30,
          outputProduct: 'Tờ trình, Báo cáo chuyên đề đã ký duyệt',
          rationale: 'Chất lượng tham mưu và tiến độ văn bản xử lý đúng hạn',
        },
        {
          taskName: `Kiểm tra, giám sát và đánh giá thực thi nhiệm vụ theo định biên đơn vị`,
          unit: 'Đợt kiểm tra',
          monthlyTarget: Math.round(1 * multiplier),
          quarterlyTarget: Math.round(3 * multiplier),
          yearlyTarget: Math.round(12 * multiplier),
          weight: 20,
          outputProduct: 'Báo cáo giám sát định kỳ & Bảng chấm điểm KPI nội bộ',
          rationale: 'Phòng ngừa rủi ro sai sót và bảo đảm kỷ cương hành chính',
        },
        {
          taskName: `Cải cách hành chính, số hóa hồ sơ và ứng dụng công nghệ trong quản lý`,
          unit: 'Quy trình',
          monthlyTarget: Math.round(1 * multiplier),
          quarterlyTarget: Math.round(2 * multiplier),
          yearlyTarget: Math.round(8 * multiplier),
          weight: 15,
          outputProduct: 'Quy trình số hóa & Hồ sơ lưu trữ điện tử',
          rationale: 'Thực hiện chuyển đổi số theo Nghị quyết và Kế hoạch tỉnh',
        },
        {
          taskName: `Xử lý các nhiệm vụ đột xuất do Cấp ủy và Lãnh đạo cấp trên giao`,
          unit: 'Vụ việc',
          monthlyTarget: Math.round(2 * multiplier),
          quarterlyTarget: Math.round(6 * multiplier),
          yearlyTarget: Math.round(24 * multiplier),
          weight: 10,
          outputProduct: 'Báo cáo giải quyết nhiệm vụ đột xuất',
          rationale: 'Đáp ứng kịp thời yêu cầu chỉ đạo điều hành đột xuất',
        },
      ];
    } else if (isLeader) {
      quotas = [
        {
          taskName: `Điều hành, phân công nhiệm vụ và kiểm soát chất lượng chuyên môn ${params.rankName}`,
          unit: 'Kế hoạch',
          monthlyTarget: Math.round(1 * multiplier),
          quarterlyTarget: Math.round(3 * multiplier),
          yearlyTarget: Math.round(12 * multiplier),
          weight: 30,
          outputProduct: 'Lịch công tác tuần & Bảng phân công nhiệm vụ cán bộ',
          rationale: 'Thực hiện chức trách lãnh đạo, quản lý theo quy định Trung ương',
        },
        {
          taskName: `Soát xét, thẩm định và ký duyệt hồ sơ/văn bản chuyên môn`,
          unit: 'Hồ sơ',
          monthlyTarget: Math.round(8 * multiplier),
          quarterlyTarget: Math.round(24 * multiplier),
          yearlyTarget: Math.round(96 * multiplier),
          weight: 30,
          outputProduct: 'Hồ sơ đã soát xét, phiếu trình lãnh đạo',
          rationale: 'Chất lượng hồ sơ không có sai sót pháp lý và thẩm quyền',
        },
        {
          taskName: `Chủ trì xây dựng đề án, quy chế hoặc văn bản hướng dẫn nghiệp vụ`,
          unit: 'Đề án',
          monthlyTarget: 0.5,
          quarterlyTarget: 1.5,
          yearlyTarget: 6,
          weight: 20,
          outputProduct: 'Dự thảo đề án/văn bản quy phạm',
          rationale: 'Nhiệm vụ trọng tâm cấp phòng/ban trong kỳ',
        },
        {
          taskName: `Chủ trì giao ban, đánh giá hiệu quả công việc và giải quyết kiến nghị`,
          unit: 'Cuộc họp',
          monthlyTarget: Math.round(4 * multiplier),
          quarterlyTarget: Math.round(12 * multiplier),
          yearlyTarget: Math.round(48 * multiplier),
          weight: 20,
          outputProduct: 'Biên bản giao ban & Kết luận xử lý',
          rationale: 'Duy trì kỷ cương và tháo gỡ điểm nghẽn nghiệp vụ',
        },
      ];
    } else if (isSpecialist) {
      const taskBase = isParty ? 'cán bộ, đảng viên và công tác tổ chức' : 'nghiệp vụ chuyên ngành và quản lý nhà nước';
      quotas = [
        {
          taskName: `Thẩm định, xử lý và hoàn thiện hồ sơ ${taskBase}`,
          unit: 'Hồ sơ',
          monthlyTarget: Math.round(6 * multiplier),
          quarterlyTarget: Math.round(18 * multiplier),
          yearlyTarget: Math.round(72 * multiplier),
          weight: 35,
          outputProduct: 'Báo cáo thẩm định & Tờ trình trình Lãnh đạo',
          rationale: 'Nhiệm vụ trực tiếp chính yếu của vị trí việc làm',
        },
        {
          taskName: `Soạn thảo văn bản hành chính, văn bản hướng dẫn và báo cáo chuyên đề`,
          unit: 'Văn bản',
          monthlyTarget: Math.round(4 * multiplier),
          quarterlyTarget: Math.round(12 * multiplier),
          yearlyTarget: Math.round(48 * multiplier),
          weight: 25,
          outputProduct: 'Dự thảo văn bản đạt chuẩn thể thức quy định',
          rationale: 'Kỹ năng tham mưu tổng hợp theo vị trí chuyên viên',
        },
        {
          taskName: `Theo dõi, tổng hợp số liệu và cập nhật cơ sở dữ liệu chuyên ngành`,
          unit: 'Kỳ cập nhật',
          monthlyTarget: Math.round(2 * multiplier),
          quarterlyTarget: Math.round(6 * multiplier),
          yearlyTarget: Math.round(24 * multiplier),
          weight: 20,
          outputProduct: 'Hồ sơ điện tử & Biểu mẫu tổng hợp số liệu',
          rationale: 'Đảm bảo dữ liệu chính xác, kịp thời phục vụ điều hành',
        },
        {
          taskName: `Phối hợp liên bộ phận, tham gia các đoàn công tác và kiểm tra nghiệp vụ`,
          unit: 'Đợt',
          monthlyTarget: Math.round(1 * multiplier),
          quarterlyTarget: Math.round(3 * multiplier),
          yearlyTarget: Math.round(12 * multiplier),
          weight: 20,
          outputProduct: 'Biên bản làm việc & Phiếu ý kiến đóng góp',
          rationale: 'Trách nhiệm phối hợp liên ngành theo phân công',
        },
      ];
    } else {
      quotas = [
        {
          taskName: `Tiếp nhận, đăng ký, luân chuyển và quản lý văn thư, tài liệu`,
          unit: 'Văn bản',
          monthlyTarget: Math.round(40 * multiplier),
          quarterlyTarget: Math.round(120 * multiplier),
          yearlyTarget: Math.round(480 * multiplier),
          weight: 40,
          outputProduct: 'Sổ theo dõi công văn & Hồ sơ văn bản đã vào sổ',
          rationale: 'Bảo đảm an toàn thông tin và thời hạn luân chuyển văn bản',
        },
        {
          taskName: `Số hóa tài liệu và lưu trữ hồ sơ công việc theo quy định`,
          unit: 'Hồ sơ',
          monthlyTarget: Math.round(15 * multiplier),
          quarterlyTarget: Math.round(45 * multiplier),
          yearlyTarget: Math.round(180 * multiplier),
          weight: 30,
          outputProduct: 'File scan và metadata lưu trên phần mềm',
          rationale: 'Công tác bảo quản và khai thác tài liệu lưu trữ',
        },
        {
          taskName: `Bảo đảm công tác hậu cần, kỹ thuật, chuẩn bị phòng họp và phương tiện`,
          unit: 'Lượt phục vụ',
          monthlyTarget: Math.round(10 * multiplier),
          quarterlyTarget: Math.round(30 * multiplier),
          yearlyTarget: Math.round(120 * multiplier),
          weight: 30,
          outputProduct: 'Phòng họp chu đáo, thiết bị kỹ thuật hoạt động thông suốt',
          rationale: 'Hỗ trợ hoạt động chuyên môn của cơ quan',
        },
      ];
    }

    return {
      targetScope: params.targetScope,
      goalOrientation: params.goalOrientation,
      unitName: params.unitName,
      rankName: params.rankName,
      strategicGoal: `Mục tiêu SMART 2026: Đảm bảo 100% nhiệm vụ theo định biên được chuẩn hóa, hoàn thành vượt mức chỉ tiêu với chất lượng cao và đúng hạn.`,
      rationale: `Định mức được tính toán dựa trên cơ cấu Vị trí việc làm Trung ương (${params.classification === 'DANG' ? 'Quy định 137-QĐ/TW' : params.classification === 'VIEN_CHUC' ? 'Nghị định 106/2020/NĐ-CP' : 'Nghị định 62/2020/NĐ-CP'}), số lượng biên chế hiện tại (${params.headcount} người) và mục tiêu định hướng ${params.goalOrientation}.`,
      suggestedQuotas: quotas,
      suggestedPlan: {
        title: params.targetScope === 'UNIT'
          ? `Kế hoạch hành động thực hiện nhiệm vụ trọng tâm năm 2026 - ${params.unitName}`
          : `Kế hoạch cá nhân thực hiện nhiệm vụ năm 2026 - ${params.rankName} (${params.unitName})`,
        phases: [
          {
            phase: 'Quý 1',
            focus: 'Triển khai nhiệm vụ định kỳ đầu năm, rà soát văn bản và phân bổ chỉ tiêu chi tiết',
            expectedOutput: 'Bản phân công công tác & 100% hồ sơ quý 1 được tiếp nhận xử lý đúng tiến độ',
          },
          {
            phase: 'Quý 2',
            focus: 'Đẩy mạnh tiến độ giải quyết hồ sơ chuyên ngành, tổ chức sơ kết 6 tháng đầu năm',
            expectedOutput: 'Báo cáo sơ kết 6 tháng & Hoàn thành tối thiểu 50% chỉ tiêu năm',
          },
          {
            phase: 'Quý 3',
            focus: 'Xử lý các hồ sơ trọng điểm, hoàn thành các dự thảo đề án và kiểm tra giám sát',
            expectedOutput: 'Sản phẩm đề án hoàn thiện & Đạt 80% chỉ tiêu khối lượng năm',
          },
          {
            phase: 'Quý 4',
            focus: 'Nước rút hoàn thành 100% chỉ tiêu, tổng kết công tác năm, nghiệm thu và chấm điểm KPI',
            expectedOutput: 'Báo cáo tổng kết năm, hồ sơ đánh giá KPI hoàn tất, không tồn đọng hồ sơ',
          },
        ],
      },
    };
  }

  @Get(':rankCode')
  async getRankQuotasByRank(
    @Req() req: any,
    @Param('rankCode') rankCode: string,
    @Query('domainCode') domainCode: string,
    @Query('departmentId') departmentId?: string,
    @Query('unitCode') unitCode?: string,
  ) {
    const data = await firstValueFrom(
      this.rankQuotaService.GetRankQuotasByRank(
        {
          rankCode,
          domainCode,
          departmentId: departmentId ? Number(departmentId) : undefined,
          unitCode,
        },
        this.getGrpcMetadata(req),
      ),
    ).catch((e) => this.handleRpcError(e));
    return data;
  }
}
