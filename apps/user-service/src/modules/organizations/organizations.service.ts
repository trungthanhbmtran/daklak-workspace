import { Injectable } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { PrismaService } from '@/database/prisma.service';
import { buildTree } from '@/common/utils/tree.util';

const GRPC = { NOT_FOUND: 5 } as const;

// Include dùng chung cho OrganizationUnit — tránh lặp lại object include ở nhiều nơi
// (giảm rủi ro gõ sai / lệch nhau giữa các method, và dễ sửa 1 chỗ khi đổi field).
const UNIT_FULL_INCLUDE = {
  type: true,
  unitDomains: {
    include: {
      domain: {
        include: {
          translations: { where: { langCode: 'vi' } },
        },
      },
    },
  },
} as const;

@Injectable()
export class OrganizationsService {
  private treeCache = new Map<string, { data: any; expiresAt: number }>();
  private readonly CACHE_TTL_MS = 3600 * 1000; // 1 giờ

  constructor(private prisma: PrismaService) { }

  // ----------------- Helper cache (gộp logic get/set/invalidate lặp lại) -----------------
  private getCache<T = any>(key: string): T | undefined {
    const cached = this.treeCache.get(key);
    if (cached && cached.expiresAt > Date.now()) return cached.data as T;
    if (cached) this.treeCache.delete(key); // dọn entry hết hạn thay vì để rác trong Map
    return undefined;
  }

  private setCache(key: string, data: any) {
    this.treeCache.set(key, { data, expiresAt: Date.now() + this.CACHE_TTL_MS });
  }

  private invalidateCache() {
    // Mọi thay đổi cấu trúc cây đều có thể ảnh hưởng full tree + nhiều sub-tree,
    // nên clear toàn bộ vẫn là lựa chọn an toàn nhất với materialized path.
    this.treeCache.clear();
  }

  // --- 1. QUẢN LÝ ĐƠN VỊ (CRUD) ---

  async createUnit(data: any) {
    const domainIds: number[] = Array.isArray(data.domainIds)
      ? data.domainIds
      : data.domainId != null
        ? [data.domainId]
        : [];

    let resolvedTypeId = data.typeId;
    if (!resolvedTypeId && data.typeCode) {
      const unitType = await this.prisma.unitType.findUnique({
        where: { code: data.typeCode },
      });
      if (!unitType) {
        throw new RpcException({ message: 'Mã loại tổ chức không hợp lệ', code: GRPC.NOT_FOUND });
      }
      resolvedTypeId = unitType.id;
    }

    // hierarchyPath luôn = code ngay từ đầu (VD: H15.07.04.02), nên tạo unit
    // và gán unitDomains trong 1 transaction thay vì create → update → createMany rời rạc.
    const unit = await this.prisma.$transaction(async (tx) => {
      const created = await tx.organizationUnit.create({
        data: {
          code: data.code,
          name: data.name,
          shortName: data.shortName ?? null,
          typeId: resolvedTypeId,
          parentId: data.parentId || null,
          hierarchyPath: data.code,
        },
      });

      const validDomainIds = domainIds.filter((id) => id > 0);
      if (validDomainIds.length > 0) {
        await tx.unitDomain.createMany({
          data: validDomainIds.map((domainId) => ({ unitId: created.id, domainId })),
          skipDuplicates: true,
        });
      }

      return created;
    });

    this.invalidateCache();

    return this.prisma.organizationUnit.findUniqueOrThrow({
      where: { id: unit.id },
      include: UNIT_FULL_INCLUDE,
    });
  }

  async getById(id: number) {
    return this.prisma.organizationUnit.findUnique({
      where: { id },
      include: UNIT_FULL_INCLUDE,
    });
  }

  async getOneByCode(code: string) {
    return this.prisma.organizationUnit.findUnique({
      where: { code },
      include: UNIT_FULL_INCLUDE,
    });
  }

  async getUnitScope(id: number) {
    return this.prisma.organizationUnit.findUnique({
      where: { id },
      include: {
        unitDomains: {
          include: {
            domain: {
              include: { translations: { where: { langCode: 'vi' } } },
            },
          },
        },
      },
    });
  }

  async updateUnit(
    id: number,
    data: {
      code?: string;
      name?: string;
      shortName?: string;
      typeId?: number;
      typeCode?: string;
      parentId?: number | null;
    },
  ) {
    const unit = await this.prisma.organizationUnit.findUnique({
      where: { id },
      select: { id: true, children: { select: { id: true } } },
    });
    if (!unit) return null;

    const trimmedCode = data.code !== undefined ? String(data.code).trim() : undefined;

    // parentId 0 hoặc undefined = không đổi; null = chuyển lên gốc; > 0 = đổi cha mới
    const effectiveParentId = data.parentId === 0 ? undefined : data.parentId;

    // Chạy song song các việc validate độc lập (mã trùng, cha mới tồn tại, type tồn tại)
    // thay vì await tuần tự từng cái.
    const [existingCode, newParent, newType] = await Promise.all([
      trimmedCode ? this.prisma.organizationUnit.findFirst({ where: { code: trimmedCode, id: { not: id } } }) : null,
      effectiveParentId !== undefined && effectiveParentId !== null
        ? this.prisma.organizationUnit.findUnique({ where: { id: effectiveParentId }, select: { id: true } })
        : null,
      !data.typeId && data.typeCode
        ? this.prisma.unitType.findUnique({ where: { code: data.typeCode } })
        : null,
    ]);

    if (trimmedCode && existingCode) {
      throw new RpcException({ message: `Mã đơn vị "${trimmedCode}" đã được sử dụng`, code: 3 });
    }

    if (effectiveParentId !== undefined) {
      if (effectiveParentId === id) {
        throw new RpcException({ message: 'Đơn vị không thể là cha của chính nó', code: 3 });
      }
      if (unit.children.length > 0) {
        throw new RpcException({
          message: 'Không thể đổi đơn vị cha khi có đơn vị con. Hãy di chuyển hoặc xóa đơn vị con trước.',
          code: 9,
        });
      }
      if (effectiveParentId !== null && !newParent) {
        throw new RpcException({ message: 'Đơn vị cha không tồn tại', code: GRPC.NOT_FOUND });
      }
    }

    let finalTypeId = data.typeId;
    if (!finalTypeId && newType) finalTypeId = newType.id;

    if (finalTypeId !== undefined && finalTypeId > 0) {
      const typeExists = await this.prisma.unitType.findUnique({ where: { id: finalTypeId } });
      if (!typeExists) throw new RpcException({ message: 'Loại đơn vị không tồn tại', code: 3 });
    }

    const updateData: any = {};
    if (trimmedCode) {
      updateData.code = trimmedCode;
      updateData.hierarchyPath = trimmedCode; // hierarchyPath luôn theo code, chỉ cần set 1 lần
    }
    if (data.name !== undefined) updateData.name = data.name;
    if (data.shortName !== undefined) updateData.shortName = data.shortName || null;
    if (finalTypeId !== undefined && finalTypeId > 0) updateData.typeId = finalTypeId;

    await this.prisma.organizationUnit.update({ where: { id }, data: updateData });

    this.invalidateCache();

    return this.prisma.organizationUnit.findUniqueOrThrow({
      where: { id },
      include: UNIT_FULL_INCLUDE,
    });
  }

  async updateUnitScope(id: number, data: { domainIds?: number[]; scope?: string }) {
    const unit = await this.prisma.organizationUnit.findUnique({ where: { id }, select: { id: true } });
    if (!unit) return null;

    if (data.domainIds !== undefined) {
      const ids = Array.isArray(data.domainIds) ? data.domainIds.filter((d) => d > 0) : [];
      // delete + create phải atomic để không có khoảng trống dữ liệu nếu 1 trong 2 lệnh lỗi.
      await this.prisma.$transaction([
        this.prisma.unitDomain.deleteMany({ where: { unitId: id } }),
        ...(ids.length > 0
          ? [
            this.prisma.unitDomain.createMany({
              data: ids.map((domainId) => ({ unitId: id, domainId })),
              skipDuplicates: true,
            }),
          ]
          : []),
      ]);
    }

    this.invalidateCache();

    return this.prisma.organizationUnit.findUniqueOrThrow({
      where: { id },
      include: UNIT_FULL_INCLUDE,
    });
  }

  async deleteUnit(id: number) {
    const unit = await this.prisma.organizationUnit.findUnique({
      where: { id },
      select: { id: true, children: { select: { id: true } } },
    });
    if (!unit) return false;
    if (unit.children.length > 0) {
      throw new RpcException({
        message: 'Không thể xóa đơn vị có đơn vị con. Hãy xóa đơn vị con trước.',
        code: 9,
      });
    }
    await this.prisma.organizationUnit.delete({ where: { id } });

    this.invalidateCache();

    return true;
  }

  // Lấy cây tổ chức (Full Tree)
  async getFullTree(q?: string) {
    let fullTree = this.getCache<any[]>('FULL_TREE');

    if (!fullTree) {
      const units = await this.prisma.organizationUnit.findMany({
        orderBy: { hierarchyPath: 'asc' },
        include: { type: true },
      });
      fullTree = buildTree(units, null);
      this.setCache('FULL_TREE', fullTree);
    }

    if (!q || !q.trim()) return { data: fullTree };

    const lowerQ = q.toLowerCase().trim();
    const filterTree = (nodes: any[]): any[] => {
      const result: any[] = [];
      for (const node of nodes) {
        const filteredChildren = filterTree(node.children || []);
        const matches =
          node.name?.toLowerCase().includes(lowerQ) ||
          node.code?.toLowerCase().includes(lowerQ) ||
          node.shortName?.toLowerCase().includes(lowerQ);

        if (matches || filteredChildren.length > 0) {
          result.push({ ...node, children: filteredChildren });
        }
      }
      return result;
    };

    return { data: filterTree(fullTree) };
  }

  // Lấy danh sách phẳng (có thể lọc theo tên, mã)
  async getOrganizations(q?: string) {
    const where: any = q
      ? { OR: [{ name: { contains: q } }, { code: { contains: q } }, { shortName: { contains: q } }] }
      : {};
    const units = await this.prisma.organizationUnit.findMany({
      where,
      orderBy: { hierarchyPath: 'asc' },
      include: { type: true },
    });
    return { data: units };
  }

  // Lấy cây con của 1 đơn vị (Dùng Materialized Path)
  async getSubTree(rootId: number) {
    const cacheKey = `SUB_TREE_${rootId}`;
    const cached = this.getCache(cacheKey);
    if (cached) return cached;

    const root = await this.prisma.organizationUnit.findUnique({
      where: { id: rootId },
      select: { code: true, hierarchyPath: true, parentId: true },
    });
    if (!root) {
      throw new RpcException({ message: 'Đơn vị không tồn tại', code: GRPC.NOT_FOUND });
    }

    const prefix = (root.code || root.hierarchyPath || '') + '.';
    const units = await this.prisma.organizationUnit.findMany({
      where: { OR: [{ id: rootId }, { hierarchyPath: { startsWith: prefix } }] },
      orderBy: { hierarchyPath: 'asc' },
      include: { type: true },
    });

    const result = { data: buildTree(units, root.parentId) };
    this.setCache(cacheKey, result);
    return result;
  }

  // Lấy tất cả IDs của con cháu (bao gồm chính nó)
  async getDescendants(rootId: number) {
    const root = await this.prisma.organizationUnit.findUnique({
      where: { id: rootId },
      select: { code: true, hierarchyPath: true },
    });
    if (!root) return { data: [] };

    const prefix = (root.code || root.hierarchyPath || '') + '.';
    const units = await this.prisma.organizationUnit.findMany({
      where: { OR: [{ id: rootId }, { hierarchyPath: { startsWith: prefix } }] },
      select: { id: true },
    });

    return { data: units.map((u) => u.id) };
  }

  // --- 2. QUẢN LÝ ĐỊNH BIÊN (STAFFING) ---

  async setStaffing(dto: { unitId: number; jobTitleId: number; quantity: number }) {
    return this.prisma.organizationStaffing.upsert({
      where: { unitId_jobTitleId: { unitId: dto.unitId, jobTitleId: dto.jobTitleId } },
      update: { quantity: dto.quantity },
      create: { unitId: dto.unitId, jobTitleId: dto.jobTitleId, quantity: dto.quantity },
    });
  }

  // Xem báo cáo thừa thiếu nhân sự (kèm phân công từng vị trí / từng phó)
  async getStaffingReport(unitId: number) {
    const items = await this.prisma.organizationStaffing.findMany({
      where: { unitId },
      include: {
        jobTitle: true,
        slots: {
          orderBy: { slotOrder: 'asc' },
          include: {
            domains: {
              include: { domain: { include: { translations: { where: { langCode: 'vi' } } } } },
            },
            geographicAreas: {
              include: { geographicArea: { include: { translations: { where: { langCode: 'vi' } } } } },
            },
            monitoredUnits: { include: { unit: true } },
          },
        },
      },
    });

    const employeeCodes = [
      ...new Set(
        items.flatMap((item) => item.slots.map((s) => (s as any).assignedEmployeeCode).filter(Boolean)),
      ),
    ];

    const userMap = new Map<string, string>();
    if (employeeCodes.length > 0) {
      const users = await this.prisma.user.findMany({
        where: { employeeCode: { in: employeeCodes } },
        select: { employeeCode: true, fullName: true },
      });
      users.forEach((u) => {
        if (u.employeeCode && u.fullName) userMap.set(u.employeeCode, u.fullName);
      });
    }

    const data = items.map((item) => {
      const assignedUserBySlot: Record<number, { fullName: string; employeeCode: string | null }> = {};

      const mappedSlots = item.slots.map((slot) => {
        const code = (slot as any).assignedEmployeeCode;
        const fullName = code ? userMap.get(code) : undefined;
        if (fullName) assignedUserBySlot[slot.slotOrder] = { fullName, employeeCode: code };

        return { ...slot, assignedEmployeeCode: code || '', assignedEmployeeName: fullName || '' };
      });

      const currentEmployeeNames = Object.values(assignedUserBySlot).map((u) => u.fullName);

      return {
        ...item,
        currentCount: currentEmployeeNames.length,
        current_employee_names: currentEmployeeNames,
        assignedUserBySlot,
        slots: mappedSlots,
      };
    });

    return { data };
  }

  // Danh sách chức danh (cho dropdown định biên). unitId: chỉ lấy chức danh áp dụng cho loại đơn vị đó
  async listJobTitles(unitId?: number) {
    if (!unitId || unitId === 0) {
      return { data: await this.prisma.jobTitle.findMany({ orderBy: { code: 'asc' } }) };
    }

    const unit = await this.prisma.organizationUnit.findUnique({
      where: { id: unitId },
      select: { typeId: true },
    });
    if (!unit) return { data: [] };

    const items = await this.prisma.jobTitle.findMany({
      orderBy: { code: 'asc' },
      where: {
        OR: [
          { applicableUnitTemplates: { none: {} } },
          { applicableUnitTemplates: { some: { unitTypeId: unit.typeId } } },
        ],
      },
    });
    return { data: items };
  }

  // NOTE: method này hiện chỉ đọc dữ liệu, không cập nhật gì cả — tên gọi "updateJobTitle"
  // đang gây hiểu nhầm. Giữ nguyên hành vi cũ vì không rõ field nào cần cho phép sửa;
  // nên bổ sung tham số update thực sự hoặc đổi tên thành getJobTitle nếu đúng ý đồ chỉ là đọc.
  async updateJobTitle(dto: { id: number }) {
    return this.prisma.jobTitle.findUniqueOrThrow({ where: { id: dto.id } });
  }

  // Phân công từng vị trí (từng phó): nhiệm vụ, đơn vị theo dõi riêng cho từng slot
  async setStaffingSlot({
    staffingId,
    slotOrder,
    description,
    domainIds,
    geographicAreaIds,
    monitoredUnitIds,
  }: {
    staffingId: number;
    slotOrder: number;
    description?: string;
    domainIds?: number[];
    geographicAreaIds?: number[];
    monitoredUnitIds?: number[];
  }) {
    const staffing = await this.prisma.organizationStaffing.findUnique({ where: { id: staffingId } });
    if (!staffing) throw new Error('Staffing not found');

    const slot = await this.prisma.staffingSlot.upsert({
      where: { staffingId_slotOrder: { staffingId, slotOrder } },
      update: { description: description ?? undefined },
      create: { staffingId, slotOrder, description: description ?? undefined },
    });

    // Gộp toàn bộ delete/create của 3 quan hệ vào 1 transaction để tránh trạng thái
    // dữ liệu nửa vời nếu 1 bước giữa chừng lỗi.
    const ops: any[] = [];
    if (domainIds !== undefined) {
      ops.push(this.prisma.staffingSlotDomain.deleteMany({ where: { slotId: slot.id } }));
      if (domainIds.length > 0) {
        ops.push(
          this.prisma.staffingSlotDomain.createMany({
            data: domainIds.map((domainId) => ({ slotId: slot.id, domainId })),
          }),
        );
      }
    }
    if (geographicAreaIds !== undefined) {
      ops.push(this.prisma.staffingSlotGeographicArea.deleteMany({ where: { slotId: slot.id } }));
      if (geographicAreaIds.length > 0) {
        ops.push(
          this.prisma.staffingSlotGeographicArea.createMany({
            data: geographicAreaIds.map((geographicAreaId) => ({ slotId: slot.id, geographicAreaId })),
          }),
        );
      }
    }
    if (monitoredUnitIds !== undefined) {
      ops.push(this.prisma.staffingSlotMonitoredUnit.deleteMany({ where: { slotId: slot.id } }));
      if (monitoredUnitIds.length > 0) {
        ops.push(
          this.prisma.staffingSlotMonitoredUnit.createMany({
            data: monitoredUnitIds.map((unitId) => ({ slotId: slot.id, unitId })),
          }),
        );
      }
    }
    if (ops.length > 0) await this.prisma.$transaction(ops);

    return this.prisma.staffingSlot.findUniqueOrThrow({
      where: { id: slot.id },
      include: {
        monitoredUnits: { include: { unit: true } },
        geographicAreas: { include: { geographicArea: true } },
        domains: { include: { domain: true } },
      },
    });
  }

  // --- 3. QUẢN LÝ LOẠI ĐƠN VỊ ---
  async listUnitTypes() {
    return { data: await this.prisma.unitType.findMany({ orderBy: { level: 'asc' } }) };
  }

  async getUnitTypeJobTemplates(unitTypeId: number) {
    const templates = await this.prisma.unitTypeJobTemplate.findMany({
      where: { unitTypeId },
      select: { jobTitleId: true },
    });
    return { jobTitleIds: templates.map((t) => t.jobTitleId) };
  }

  async updateUnitTypeJobTemplates(unitTypeId: number, jobTitleIds: number[]) {
    await this.prisma.$transaction([
      this.prisma.unitTypeJobTemplate.deleteMany({ where: { unitTypeId } }),
      ...(jobTitleIds?.length > 0
        ? [
          this.prisma.unitTypeJobTemplate.createMany({
            data: jobTitleIds.map((jobTitleId) => ({ unitTypeId, jobTitleId })),
            skipDuplicates: true,
          }),
        ]
        : []),
    ]);

    return { success: true };
  }
}