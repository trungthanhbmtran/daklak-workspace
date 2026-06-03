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
    const domainIds = Array.isArray(data.domainIds)
      ? data.domainIds
      : data.domainId != null
        ? [data.domainId]
        : [];
    const geographicAreaIds = Array.isArray(data.geographicAreaIds)
      ? data.geographicAreaIds
      : data.geographicAreaId != null
        ? [data.geographicAreaId]
        : [];
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

    // Bước 2 & 3: Dùng chính code làm hierarchyPath (mã liên thông đã mã hóa phân cấp)
    // VD: H15.07.04.02 → tự nó là materialized path theo chấm (dot notation)
    await this.prisma.organizationUnit.update({
      where: { id: unit.id },
      data: { hierarchyPath: data.code },
    });
    if (domainIds.length > 0) {
      await this.prisma.unitDomain.createMany({
        data: domainIds
          .filter((id: number) => id > 0)
          .map((domainId: number) => ({ unitId: unit.id, domainId })),
        skipDuplicates: true,
      });
    }
    if (geographicAreaIds.length > 0) {
      await this.prisma.unitGeographicArea.createMany({
        data: geographicAreaIds
          .filter((id: number) => id > 0)
          .map((geographicAreaId: number) => ({ unitId: unit.id, geographicAreaId })),
        skipDuplicates: true,
      });
    }
    return this.prisma.organizationUnit.findUniqueOrThrow({
      where: { id: unit.id },
      include: {
        type: true,
        unitDomains: {
          include: {
            domain: {
              include: {
                translations: {
                  where: { langCode: 'vi' },
                },
              },
            },
          },
        },
        unitGeographicAreas: {
          include: {
            geographicArea: {
              include: {
                translations: {
                  where: { langCode: 'vi' },
                },
              },
            },
          },
        },
      },
    });
  }

  async getById(id: number) {
    const unit = await this.prisma.organizationUnit.findUnique({
      where: { id },
      include: {
        type: true,
        unitDomains: {
          include: {
            domain: {
              include: {
                translations: {
                  where: { langCode: 'vi' },
                },
              },
            },
          },
        },
        unitGeographicAreas: {
          include: {
            geographicArea: {
              include: {
                translations: {
                  where: { langCode: 'vi' },
                },
              },
            },
          },
        },
      },
    });
    if (!unit) return null;
    return unit;
  }

  async updateUnit(
    id: number,
    data: {
      code?: string;
      name?: string;
      shortName?: string;
      typeId?: number;
      parentId?: number | null;
      domainIds?: number[] | null;
      geographicAreaIds?: number[] | null;
      scope?: string | null;
    },
  ) {
    const unit = await this.prisma.organizationUnit.findUnique({
      where: { id },
      include: { children: true },
    });
    if (!unit) return null;

    // Chỉ validate/đổi mã khi client gửi mã không rỗng (khi chỉ cập nhật parentId, gateway/proto có thể gửi code: "" — bỏ qua, không ném lỗi)
    if (data.code !== undefined) {
      const code = String(data.code).trim();
      if (code) {
        const existing = await this.prisma.organizationUnit.findFirst({
          where: { code, id: { not: id } },
        });
        if (existing)
          throw new RpcException({
            message: `Mã đơn vị "${code}" đã được sử dụng`,
            code: 3,
          });
      }
    }
    // parentId 0 hoặc undefined = không đổi đơn vị cha; null = chuyển lên gốc; > 0 = chuyển sang đơn vị cha mới
    const effectiveParentId = data.parentId === 0 ? undefined : data.parentId;
    if (effectiveParentId !== undefined) {
      if (effectiveParentId === id)
        throw new RpcException({
          message: 'Đơn vị không thể là cha của chính nó',
          code: 3,
        });
      if (unit.children.length > 0)
        throw new RpcException({
          message:
            'Không thể đổi đơn vị cha khi có đơn vị con. Hãy di chuyển hoặc xóa đơn vị con trước.',
          code: 9,
        });
      if (effectiveParentId !== null) {
        const parent = await this.prisma.organizationUnit.findUnique({
          where: { id: effectiveParentId },
        });
        if (!parent)
          throw new RpcException({
            message: 'Đơn vị cha không tồn tại',
            code: GRPC.NOT_FOUND,
          });
      }
    }

    if (data.typeId !== undefined && data.typeId > 0) {
      const typeExists = await this.prisma.unitType.findUnique({
        where: { id: data.typeId },
      });
      if (!typeExists)
        throw new RpcException({
          message: 'Loại đơn vị không tồn tại',
          code: 3,
        });
    }

    const updateData: any = {};
    if (data.code !== undefined && String(data.code).trim() !== '')
      updateData.code = String(data.code).trim();
    if (data.name !== undefined) updateData.name = data.name;
    if (data.shortName !== undefined)
      updateData.shortName = data.shortName || null;
    if (data.typeId !== undefined && data.typeId > 0)
      updateData.typeId = data.typeId;
    if (data.scope !== undefined) updateData.scope = data.scope || null;
    // Đổi đơn vị cha: luôn dùng code làm hierarchyPath
    if (data.code !== undefined && String(data.code).trim() !== '') {
      updateData.hierarchyPath = String(data.code).trim();
    } else if (updateData.code) {
      updateData.hierarchyPath = updateData.code;
    }

    await this.prisma.organizationUnit.update({
      where: { id },
      data: updateData,
    });
    if (data.domainIds !== undefined) {
      await this.prisma.unitDomain.deleteMany({ where: { unitId: id } });
      const ids = Array.isArray(data.domainIds)
        ? data.domainIds.filter((d) => d > 0)
        : [];
      if (ids.length > 0) {
        await this.prisma.unitDomain.createMany({
          data: ids.map((domainId) => ({ unitId: id, domainId })),
          skipDuplicates: true,
        });
      }
    }
    if (data.geographicAreaIds !== undefined) {
      await this.prisma.unitGeographicArea.deleteMany({ where: { unitId: id } });
      const geoIds = Array.isArray(data.geographicAreaIds)
        ? data.geographicAreaIds.filter((d) => d > 0)
        : [];
      if (geoIds.length > 0) {
        await this.prisma.unitGeographicArea.createMany({
          data: geoIds.map((geographicAreaId) => ({ unitId: id, geographicAreaId })),
          skipDuplicates: true,
        });
      }
    }
    return this.prisma.organizationUnit.findUniqueOrThrow({
      where: { id: unit.id },
      include: {
        type: true,
        unitDomains: {
          include: {
            domain: {
              include: {
                translations: {
                  where: { langCode: 'vi' },
                },
              },
            },
          },
        },
        unitGeographicAreas: {
          include: {
            geographicArea: {
              include: {
                translations: {
                  where: { langCode: 'vi' },
                },
              },
            },
          },
        },
      },
    });
  }

  async deleteUnit(id: number) {
    const unit = await this.prisma.organizationUnit.findUnique({
      where: { id },
      include: { children: true },
    });
    if (!unit) return false;
    if (unit.children.length > 0) {
      throw new RpcException({
        message:
          'Không thể xóa đơn vị có đơn vị con. Hãy xóa đơn vị con trước.',
        code: 9,
      });
    }
    await this.prisma.organizationUnit.delete({ where: { id } });
    return true;
  }

  // Lấy cây tổ chức (Full Tree)
  async getFullTree() {
    const units = await this.prisma.organizationUnit.findMany({
      orderBy: { hierarchyPath: 'asc' },
      include: {
        type: true,
        unitDomains: {
          include: {
            domain: {
              include: {
                translations: {
                  where: { langCode: 'vi' },
                },
              },
            },
          },
        },
        unitGeographicAreas: {
          include: {
            geographicArea: {
              include: {
                translations: {
                  where: { langCode: 'vi' },
                },
              },
            },
          },
        },
      },
    });
    return { data: buildTree(units, null) };
  }

  // Lấy cây con của 1 đơn vị (Dùng Materialized Path)
  async getSubTree(rootId: number) {
    const root = await this.prisma.organizationUnit.findUnique({
      where: { id: rootId },
    });
    if (!root) {
      throw new RpcException({
        message: 'Đơn vị không tồn tại',
        code: GRPC.NOT_FOUND,
      });
    }

    // hierarchyPath = code, nên dùng startsWith(code + '.') để lấy con cháu
    // Đồng thời lấy cả root (where code = rootId's code)
    const units = await this.prisma.organizationUnit.findMany({
      where: {
        OR: [
          { id: rootId },
          { hierarchyPath: { startsWith: (root.code || root.hierarchyPath || '') + '.' } },
        ],
      },
      orderBy: { hierarchyPath: 'asc' },
      include: {
        type: true,
        unitDomains: {
          include: {
            domain: {
              include: {
                translations: {
                  where: { langCode: 'vi' },
                },
              },
            },
          },
        },
        unitGeographicAreas: {
          include: {
            geographicArea: {
              include: {
                translations: {
                  where: { langCode: 'vi' },
                },
              },
            },
          },
        },
      },
    });

    return { data: buildTree(units, root.parentId) };
  }

  // --- 2. QUẢN LÝ ĐỊNH BIÊN (STAFFING) ---

  // Thiết lập định biên cho đơn vị
  async setStaffing(dto: {
    unitId: number;
    jobTitleId: number;
    quantity: number;
  }) {
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
    const items = await this.prisma.organizationStaffing.findMany({
      where: { unitId },
      include: {
        jobTitle: {
          include: {
            domain: {
              include: { translations: { where: { langCode: 'vi' } } },
            },
            geographicArea: {
              include: { translations: { where: { langCode: 'vi' } } },
            },
            monitoredUnits: { include: { unit: true } },
          },
        },
        slots: {
          orderBy: { slotOrder: 'asc' },
          include: {
            geographicArea: {
              include: { translations: { where: { langCode: 'vi' } } },
            },
            geographicAreas: {
              include: {
                geographicArea: {
                  include: { translations: { where: { langCode: 'vi' } } },
                },
              },
            },
            domains: {
              include: {
                domain: {
                  include: { translations: { where: { langCode: 'vi' } } },
                },
              },
            },
            monitoredUnits: { include: { unit: true } },
          },
        },
      },
    });
    
    // Fetch all current employees holding these job positions in this unit
    const jobPositions = await this.prisma.jobPosition.findMany({
      where: { unitId },
      include: { user: true }
    });

    const data = items.map(item => {
      const assignedUsers = jobPositions
        .filter(jp => jp.jobTitleId === item.jobTitleId)
        .map(jp => jp.user?.fullName)
        .filter(Boolean) as string[];
      
      return {
        ...item,
        current_employee_names: assignedUsers
      };
    });

    return { data };
  }

  // Danh sách chức danh (cho dropdown định biên). unitId: chỉ lấy chức danh áp dụng cho loại đơn vị đó
  async listJobTitles(unitId?: number) {
    const include = {
      domain: { include: { translations: { where: { langCode: 'vi' } } } },
      geographicArea: {
        include: { translations: { where: { langCode: 'vi' } } },
      },
      monitoredUnits: { include: { unit: true } },
    };
    let items;
    if (!unitId || unitId === 0) {
      items = await this.prisma.jobTitle.findMany({
        orderBy: { code: 'asc' },
        include,
      });
    } else {
      const unit = await this.prisma.organizationUnit.findUnique({
        where: { id: unitId },
        select: { typeId: true },
      });
      if (!unit) items = [];
      else {
        const typeId = unit.typeId;
        items = await this.prisma.jobTitle.findMany({
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
    }
    return { data: items };
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
        domainId: domainId === 0 ? null : (domainId ?? undefined),
        geographicAreaId:
          geographicAreaId === 0 ? null : (geographicAreaId ?? undefined),
      },
    });
    if (monitoredUnitIds !== undefined) {
      await this.prisma.jobTitleMonitoredUnit.deleteMany({
        where: { jobTitleId: id },
      });
      if (monitoredUnitIds.length > 0) {
        await this.prisma.jobTitleMonitoredUnit.createMany({
          data: monitoredUnitIds.map((unitId) => ({ jobTitleId: id, unitId })),
        });
      }
    }
    const updated = await this.prisma.jobTitle.findUnique({
      where: { id },
      include: {
        domain: { include: { translations: { where: { langCode: 'vi' } } } },
        geographicArea: {
          include: { translations: { where: { langCode: 'vi' } } },
        },
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
    geographicAreaId?: number | null; // deprecated
    geographicAreaIds?: number[]; // mới: nhiều khu vực
    domainIds?: number[];
    monitoredUnitIds?: number[];
  }) {
    const {
      staffingId,
      slotOrder,
      description,
      geographicAreaIds,
      domainIds,
      monitoredUnitIds,
    } = dto;
    const slot = await this.prisma.staffingSlot.upsert({
      where: {
        staffingId_slotOrder: { staffingId, slotOrder },
      },
      update: {
        description: description ?? undefined,
      },
      create: {
        staffingId,
        slotOrder,
        description: description ?? undefined,
      },
    });
    // Xử lý nhiều khu vực địa lý (geographicAreaIds)
    if (geographicAreaIds !== undefined) {
      await this.prisma.staffingSlotGeographicArea.deleteMany({
        where: { slotId: slot.id },
      });
      const validIds = geographicAreaIds.filter((id) => id > 0);
      if (validIds.length > 0) {
        await this.prisma.staffingSlotGeographicArea.createMany({
          data: validIds.map((geographicAreaId) => ({
            slotId: slot.id,
            geographicAreaId,
          })),
          skipDuplicates: true,
        });
      }
    }
    if (domainIds !== undefined) {
      await this.prisma.staffingSlotDomain.deleteMany({
        where: { slotId: slot.id },
      });
      if (domainIds.length > 0) {
        await this.prisma.staffingSlotDomain.createMany({
          data: domainIds.map((domainId) => ({ slotId: slot.id, domainId })),
        });
      }
    }
    if (monitoredUnitIds !== undefined) {
      await this.prisma.staffingSlotMonitoredUnit.deleteMany({
        where: { slotId: slot.id },
      });
      if (monitoredUnitIds.length > 0) {
        await this.prisma.staffingSlotMonitoredUnit.createMany({
          data: monitoredUnitIds.map((unitId) => ({ slotId: slot.id, unitId })),
        });
      }
    }
    const updated = await this.prisma.staffingSlot.findUnique({
      where: { id: slot.id },
      include: {
        geographicArea: {
          include: { translations: { where: { langCode: 'vi' } } },
        },
        geographicAreas: {
          include: {
            geographicArea: {
              include: { translations: { where: { langCode: 'vi' } } },
            },
          },
        },
        domains: {
          include: {
            domain: {
              include: { translations: { where: { langCode: 'vi' } } },
            },
          },
        },
        monitoredUnits: { include: { unit: true } },
      },
    });
    return updated!;
  }

  // --- 3. QUẢN LÝ LOẠI ĐƠN VỊ ---
  async listUnitTypes() {
    const items = await this.prisma.unitType.findMany({
      orderBy: { level: 'asc' },
    });
    return { data: items };
  }
}
