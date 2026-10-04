import { Injectable, NotFoundException, ConflictException, Logger } from "@nestjs/common";
import { PrismaService } from "../infra/prisma.service";

export interface RegisterProcessTypeDto {
  code: string;
  name: string;
  description?: string;
  ownerService: string;
  validTriggers: string[];
  validActions: string[];
  enforcementMode?: "OBSERVE" | "ENFORCE";
}

/**
 * ProcessCatalogService — quản lý catalog các loại quy trình nghiệp vụ.
 *
 * Domain service đăng ký processType khi khởi động (upsert theo code).
 * Chỉ các processType đã đăng ký mới được phép tạo binding.
 */
@Injectable()
export class ProcessCatalogService {
  private readonly logger = new Logger(ProcessCatalogService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Đăng ký hoặc cập nhật processType (idempotent — domain service gọi khi khởi động).
   */
  async register(dto: RegisterProcessTypeDto) {
    this.logger.log(`Registering processType: ${dto.code} (owner: ${dto.ownerService})`);
    return this.prisma.processType.upsert({
      where: { code: dto.code },
      update: {
        name: dto.name,
        description: dto.description,
        ownerService: dto.ownerService,
        validTriggers: dto.validTriggers,
        validActions: dto.validActions,
        enforcementMode: dto.enforcementMode ?? "OBSERVE",
        isActive: true,
        updatedAt: new Date(),
      },
      create: {
        code: dto.code,
        name: dto.name,
        description: dto.description,
        ownerService: dto.ownerService,
        validTriggers: dto.validTriggers,
        validActions: dto.validActions,
        enforcementMode: dto.enforcementMode ?? "OBSERVE",
        isActive: true,
      },
    });
  }

  async findByCode(code: string) {
    const pt = await this.prisma.processType.findUnique({ where: { code } });
    if (!pt) throw new NotFoundException(`ProcessType ${code} not found`);
    return pt;
  }

  async listAll(activeOnly = true) {
    return this.prisma.processType.findMany({
      where: activeOnly ? { isActive: true } : undefined,
      orderBy: { code: "asc" },
    });
  }

  /**
   * Kiểm tra xem trigger có hợp lệ với processType không.
   */
  async validateTrigger(processTypeCode: string, trigger: string): Promise<void> {
    const pt = await this.findByCode(processTypeCode);
    const validTriggers = pt.validTriggers as string[];
    if (!validTriggers.includes(trigger)) {
      throw new ConflictException(
        `Trigger '${trigger}' is not valid for processType '${processTypeCode}'. Valid triggers: ${validTriggers.join(", ")}`,
      );
    }
  }

  /**
   * Kiểm tra xem action có hợp lệ với processType không.
   */
  async validateAction(processTypeCode: string, action: string): Promise<void> {
    const pt = await this.findByCode(processTypeCode);
    const validActions = pt.validActions as string[];
    if (!validActions.includes(action)) {
      throw new ConflictException(
        `Action '${action}' is not valid for processType '${processTypeCode}'. Valid actions: ${validActions.join(", ")}`,
      );
    }
  }

  /**
   * Lấy enforcementMode của processType.
   */
  async getEnforcementMode(processTypeCode: string): Promise<"OBSERVE" | "ENFORCE"> {
    const pt = await this.findByCode(processTypeCode);
    return pt.enforcementMode as "OBSERVE" | "ENFORCE";
  }
}
