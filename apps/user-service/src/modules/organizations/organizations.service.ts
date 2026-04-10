import { Injectable } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { PrismaService } from '@/database/prisma.service';
import { buildTree } from '@/common/utils/tree.util';

const GRPC = { NOT_FOUND: 5 } as const;

@Injectable()
export class OrganizationsService {
  constructor(private prisma: PrismaService) {}

  // --- 1. QUẢN LÝ ĐƠN VỊ (CRUD) ---

  async createUnit(data: any) {
    const domainIds = Array.isArray(data.domainIds) ? data.domainIds : (data.domainId != null ? [data.domainId] : []);
    // Bước 1: Tạo đơn vị (Path tạm để trống)
    const unit = await this.prisma.organizationUnit.create({
      data: {
        code: data.code,
        name: data.name,
        shortName: data.shortName ?? null,
        typeId: data.typeId,
        parentId: data.parentId || null,
        scope: data.scope ?? null,
        hierarchyPath: '', // Placeholder
      },
    });

    // Bước 2: Tính toán Path dựa trên ID vừa tạo
    let newPath = `/${unit.id}/`;
    if (data.parentId) {
      const parent = await this.prisma.organizationUnit.findUnique({
        where: { id: data.parentId },
      });
      if (!parent) {
        throw new RpcException({ message: 'Đơn vị cha không tồn tại', code: GRPC.NOT_FOUND });
      }
      newPath = `${parent.hierarchyPath}${unit.id}/`;
    }

    // Bước 3: Update Path và gán nhiều lĩnh vực
    await this.prisma.organizationUnit.update({
      where: { id: unit.id },
      data: { hierarchyPath: newPath },
    });
    if (domainIds.length > 0) {
      await this.prisma.unitDomain.createMany({
        data: domainIds.filter((id: number) => id > 0).map((domainId: number) => ({ unitId: unit.id, domainId })),
        skipDuplicates: true,
      });
    }
    return this.prisma.organizationUnit.findUniqueOrThrow({
      where: { id: unit.id },
      include: { type: true, unitDomains: { include: { domain: true } } },
    });
  }

  async getById(id: number) {
    const unit = await this.prisma.organizationUnit.findUnique({
      where: { id },
      include: { type: true, unitDomains: { include: { domain: true } } },
    });
    if (!unit) return null;
    return unit;
  }

  async updateUnit(id: number, data: { code?: string; name?: string; shortName?: string; typeId?: number; parentId?: number | null; domainIds?: number[] | null; scope?: string | null }) {
    const unit = await this.prisma.organizationUnit.findUnique({ where: { id }, include: { children: true } });
    if (!unit) return null;

    // Chỉ validate/đổi mã khi client gửi mã không rỗng (khi chỉ cập nhật parentId, gateway/proto có thể gửi code: "" — bỏ qua, không ném lỗi)
    if (data.code !== undefined) {
      const code = String(data.code).trim();
      if (code) {
        const existing = await this.prisma.organizationUnit.findFirst({ where: { code, id: { not: id } } });
        if (existing) throw new RpcException({ message: `Mã đơn vị "${code}" đã được sử dụng`, code: 3 });
      }
    }
    // parentId 0 hoặc undefined = không đổi đơn vị cha; null = chuyển lên gốc; > 0 = chuyển sang đơn vị cha mới
    const effectiveParentId = data.parentId === 0 ? undefined : data.parentId;
    if (effectiveParentId !== undefined) {
      if (effectiveParentId === id) throw new RpcException({ message: 'Đơn vị không thể là cha của chính nó', code: 3 });
      if (unit.children.length > 0) throw new RpcException({ message: 'Không thể đổi đơn vị cha khi có đơn vị con. Hãy di chuyển hoặc xóa đơn vị con trước.', code: 9 });
      if (effectiveParentId !== null) {
        const parent = await this.prisma.organizationUnit.findUnique({ where: { id: effectiveParentId } });
        if (!parent) throw new RpcException({ message: 'Đơn vị cha không tồn tại', code: GRPC.NOT_FOUND });
      }
    }

    if (data.typeId !== undefined && data.typeId > 0) {
      const typeExists = await this.prisma.unitType.findUnique({ where: { id: data.typeId } });
      if (!typeExists) throw new RpcException({ message: 'Loại đơn vị không tồn tại', code: 3 });
    }

    const updateData: any = {};
    if (data.code !== undefined && String(data.code).trim() !== '') updateData.code = String(data.code).trim();
    if (data.name !== undefined) updateData.name = data.name;
    if (data.shortName !== undefined) updateData.shortName = data.shortName || null;
    if (data.typeId !== undefined && data.typeId > 0) updateData.typeId = data.typeId;
    if (data.scope !== undefined) updateData.scope = data.scope || null;
    // Đổi đơn vị cha: parentId === null = chuyển lên gốc; parentId > 0 = chuyển sang đơn vị cha mới; không gửi / 0 = giữ nguyên.
    if (data.parentId === null) {
      updateData.parentId = null;
      updateData.hierarchyPath = `/${id}/`;
    } else if (data.parentId !== undefined && data.parentId > 0) {
      updateData.parentId = data.parentId;
      const parent = await this.prisma.organizationUnit.findUnique({ where: { id: data.parentId } });
      if (parent?.hierarchyPath != null) {
        updateData.hierarchyPath = `${parent.hierarchyPath}${id}/`;
      }
    }

    await this.prisma.organizationUnit.update({
      where: { id },
      data: updateData,
    });
    if (data.domainIds !== undefined) {
      await this.prisma.unitDomain.deleteMany({ where: { unitId: id } });
      const ids = Array.isArray(data.domainIds) ? data.domainIds.filter((d) => d > 0) : [];
      if (ids.length > 0) {
        await this.prisma.unitDomain.createMany({
          data: ids.map((domainId) => ({ unitId: id, domainId })),
          skipDuplicates: true,
        });
      }
    }
    return this.prisma.organizationUnit.findUniqueOrThrow({
      where: { id: unit.id },
      include: { type: true, unitDomains: { include: { domain: true } } },
    });
  }

  async deleteUnit(id: number) {
    const unit = await this.prisma.organizationUnit.findUnique({ where: { id }, include: { children: true } });
    if (!unit) return false;
    if (unit.children.length > 0) {
      throw new RpcException({ message: 'Không thể xóa đơn vị có đơn vị con. Hãy xóa đơn vị con trước.', code: 9 });
    }
    await this.prisma.organizationUnit.delete({ where: { id } });
    return true;
  }

  // Lấy cây tổ chức (Full Tree)
  async getFullTree() {
    const units = await this.prisma.organizationUnit.findMany({
      orderBy: { hierarchyPath: 'asc' },
      include: { type: true, unitDomains: { include: { domain: true } } },
    });
    return buildTree(units, null);
  }

  // Lấy cây con của 1 đơn vị (Dùng Materialized Path)
  async getSubTree(rootId: number) {
    const root = await this.prisma.organizationUnit.findUnique({
      where: { id: rootId },
    });
    if (!root) {
      throw new RpcException({ message: 'Đơn vị không tồn tại', code: GRPC.NOT_FOUND });
    }

    const units = await this.prisma.organizationUnit.findMany({
      where: {
        hierarchyPath: { startsWith: root.hierarchyPath || '' },
      },
      orderBy: { hierarchyPath: 'asc' },
      include: { type: true, unitDomains: { include: { domain: true } } },
    });

    return buildTree(units, root.parentId);
  }

  // --- 2. QUẢN LÝ ĐỊNH BIÊN (STAFFING) ---

  // Thiết lập định biên cho đơn vị
  async setStaffing(dto: { unitId: number; jobTitleId: number; quantity: number }) {
    return this.prisma.organizationStaffing.upsert({
      where: {
        unitId_jobTitleId: { unitId: dto.unitId, jobTitleId: dto.jobTitleId },
      },
      update: { quantity: dto.quantity },
      create: {
        unitId: dto.unitId,
        jobTitleId: dto.jobTitleId,
        quantity: dto.quantity,
      },
    });
  }

  // Xem báo cáo thừa thiếu nhân sự (kèm phân công từng vị trí / từng phó)
  async getStaffingReport(unitId: number) {
    return this.prisma.organizationStaffing.findMany({
      where: { unitId },
      include: {
        jobTitle: {
          include: {
            domain: true,
            geographicArea: true,
            monitoredUnits: { include: { unit: true } },
          },
        },
        slots: {
          orderBy: { slotOrder: 'asc' },
          include: {
            geographicArea: true,
            domains: { include: { domain: true } },
            monitoredUnits: { include: { unit: true } },
          },
        },
      },
    });
  }

  // Danh sách chức danh (cho dropdown định biên). unitId: chỉ lấy chức danh áp dụng cho loại đơn vị đó
  async listJobTitles(unitId?: number) {
    const include = {
      domain: true,
      geographicArea: true,
      monitoredUnits: { include: { unit: true } },
    };
    if (unitId == null) {
      return this.prisma.jobTitle.findMany({ orderBy: { code: 'asc' }, include });
    }
    const unit = await this.prisma.organizationUnit.findUnique({
      where: { id: unitId },
      select: { typeId: true },
    });
    if (!unit) return [];
    const typeId = unit.typeId;
    return this.prisma.jobTitle.findMany({
      orderBy: { code: 'asc' },
      include,
      where: {
        OR: [
          { applicableUnitTemplates: { none: {} } },
          { applicableUnitTemplates: { some: { unitTypeId: typeId } } },
        ],
      },
    });
  }

  // Cập nhật chức danh: lĩnh vực phụ trách, theo dõi phòng ban, khu vực địa lý
  async updateJobTitle(dto: {
    id: number;
    domainId?: number | null;
    geographicAreaId?: number | null;
    monitoredUnitIds?: number[];
  }) {
    const { id, domainId, geographicAreaId, monitoredUnitIds } = dto;
    await this.prisma.jobTitle.update({
      where: { id },
      data: {
        domainId: domainId === 0 ? null : domainId ?? undefined,
        geographicAreaId: geographicAreaId === 0 ? null : geographicAreaId ?? undefined,
      },
    });
    if (monitoredUnitIds !== undefined) {
      await this.prisma.jobTitleMonitoredUnit.deleteMany({ where: { jobTitleId: id } });
      if (monitoredUnitIds.length > 0) {
        await this.prisma.jobTitleMonitoredUnit.createMany({
          data: monitoredUnitIds.map((unitId) => ({ jobTitleId: id, unitId })),
        });
      }
    }
    const updated = await this.prisma.jobTitle.findUnique({
      where: { id },
      include: {
        domain: true,
        geographicArea: true,
        monitoredUnits: { include: { unit: true } },
      },
    });
    return updated!;
  }

  // Phân công từng vị trí (từng phó): lĩnh vực, nhiệm vụ, khu vực riêng cho từng slot
  async setStaffingSlot(dto: {
    staffingId: number;
    slotOrder: number;
    description?: string | null;
    geographicAreaId?: number | null;
    domainIds?: number[];
    monitoredUnitIds?: number[];
  }) {
    const { staffingId, slotOrder, description, geographicAreaId, domainIds, monitoredUnitIds } = dto;
    const slot = await this.prisma.staffingSlot.upsert({
      where: {
        staffingId_slotOrder: { staffingId, slotOrder },
      },
      update: {
        description: description ?? undefined,
        geographicAreaId: geographicAreaId === 0 ? null : geographicAreaId ?? undefined,
      },
      create: {
        staffingId,
        slotOrder,
        description: description ?? undefined,
        geographicAreaId: geographicAreaId === 0 ? null : geographicAreaId ?? undefined,
      },
    });
    if (domainIds !== undefined) {
      await this.prisma.staffingSlotDomain.deleteMany({ where: { slotId: slot.id } });
      if (domainIds.length > 0) {
        await this.prisma.staffingSlotDomain.createMany({
          data: domainIds.map((domainId) => ({ slotId: slot.id, domainId })),
        });
      }
    }
    if (monitoredUnitIds !== undefined) {
      await this.prisma.staffingSlotMonitoredUnit.deleteMany({ where: { slotId: slot.id } });
      if (monitoredUnitIds.length > 0) {
        await this.prisma.staffingSlotMonitoredUnit.createMany({
          data: monitoredUnitIds.map((unitId) => ({ slotId: slot.id, unitId })),
        });
      }
    }
    const updated = await this.prisma.staffingSlot.findUnique({
      where: { id: slot.id },
      include: {
        geographicArea: true,
        domains: { include: { domain: true } },
        monitoredUnits: { include: { unit: true } },
      },
    });
    return updated!;
  }

  // --- 3. QUẢN LÝ LOẠI ĐƠN VỊ ---
  async listUnitTypes() {
    return this.prisma.unitType.findMany({
      orderBy: { level: 'asc' },
    });
  }
}