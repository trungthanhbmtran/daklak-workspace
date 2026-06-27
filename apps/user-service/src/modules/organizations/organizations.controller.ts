import { Controller } from '@nestjs/common';
import { GrpcMethod, RpcException } from '@nestjs/microservices';
import { status as GrpcStatus } from '@grpc/grpc-js';
import { OrganizationsService } from './organizations.service';

@Controller()
export class OrganizationsController {
  constructor(private readonly orgService: OrganizationsService) { }

  private getCatName(cat: any): string {
    if (!cat) return '';
    return cat.translations?.[0]?.name ?? '';
  }

  private domainIdsAndNames(unit: any): {
    domainIds: number[];
    domainNames: string[];
  } {
    const ud = unit.unitDomains ?? [];
    return {
      domainIds: ud.map((d: any) => d.domainId ?? d.domain?.id).filter(Boolean),
      domainNames: ud
        .map((d: any) => this.getCatName(d.domain))
        .filter(Boolean),
    };
  }

  private mapUnitNode(node: any, depth = 0): any {
    const { domainIds, domainNames } = this.domainIdsAndNames(node);
    const hasChildren = node.children && node.children.length > 0;
    return {
      id: node.id,
      code: node.code,
      name: node.name,
      shortName: node.shortName ?? '',
      typeId: node.typeId,
      parentId: node.parentId ?? 0,
      hierarchyPath: node.hierarchyPath ?? '',
      typeName: node.type?.name ?? '',
      domainIds,
      domainNames,
      scope: node.scope ?? '',
      isLeaf: !hasChildren,
      depth,
      children: hasChildren
        ? node.children.map((c: any) => this.mapUnitNode(c, depth + 1))
        : [],
    };
  }

  private toUnitResponse(unit: any): any {
    const { domainIds, domainNames } = this.domainIdsAndNames(unit);
    return {
      id: unit.id,
      code: unit.code,
      name: unit.name,
      shortName: unit.shortName ?? '',
      typeId: unit.typeId,
      parentId: unit.parentId ?? 0,
      hierarchyPath: unit.hierarchyPath ?? '',
      typeName: unit.type?.name ?? '',
      domainIds,
      domainNames,
      scope: unit.scope ?? '',
    };
  }

  @GrpcMethod('OrganizationService', 'CreateUnit')
  async createUnit(data: {
    code: string;
    name: string;
    shortName?: string;
    typeId: number;
    parentId?: number;
    domainIds?: number[];
    scope?: string;
  }) {
    if (data.domainIds !== undefined && !Array.isArray(data.domainIds)) {
      throw new RpcException({
        code: GrpcStatus.INVALID_ARGUMENT,
        message: 'domainIds phải là một mảng',
      });
    }

    const unit = await this.orgService.createUnit({
      code: data.code,
      name: data.name,
      shortName: data.shortName,
      typeId: data.typeId,
      parentId: data.parentId,
      domainIds: data.domainIds ?? [],
      scope: data.scope,
    });
    return this.toUnitResponse(unit);
  }

  @GrpcMethod('OrganizationService', 'GetOne')
  async getOne(data: { id: number }) {
    const unit = await this.orgService.getById(data.id);
    if (!unit) {
      throw new RpcException({
        code: GrpcStatus.NOT_FOUND,
        message: 'Đơn vị không tồn tại',
      });
    }
    return this.toUnitResponse(unit);
  }

  @GrpcMethod('OrganizationService', 'UpdateUnit')
  async updateUnit(data: {
    id: number;
    code?: string;
    name?: string;
    shortName?: string;
    typeId?: number;
    parentId?: number;
    domainIds?: number[];
    scope?: string;
  }) {
    if (data.domainIds !== undefined && !Array.isArray(data.domainIds)) {
      throw new RpcException({
        code: GrpcStatus.INVALID_ARGUMENT,
        message: 'domainIds phải là một mảng',
      });
    }

    try {
      const unit = await this.orgService.updateUnit(data.id, {
        code: data.code,
        name: data.name,
        shortName: data.shortName,
        typeId: data.typeId,
        parentId: data.parentId,
        domainIds: data.domainIds,
      });
      if (!unit) {
        throw new RpcException({
          code: GrpcStatus.NOT_FOUND,
          message: 'Đơn vị không tồn tại',
        });
      }
      return this.toUnitResponse(unit);
    } catch (e: any) {
      if (e instanceof RpcException) throw e;
      throw new RpcException({
        code: GrpcStatus.INVALID_ARGUMENT,
        message: e?.message ?? 'Lỗi cập nhật đơn vị',
      });
    }
  }

  @GrpcMethod('OrganizationService', 'DeleteUnit')
  async deleteUnit(data: { id: number }) {
    try {
      const ok = await this.orgService.deleteUnit(data.id);
      return { success: ok, message: 'Đã xóa đơn vị' };
    } catch (e: any) {
      if (e instanceof RpcException) throw e;
      throw new RpcException({
        code: GrpcStatus.FAILED_PRECONDITION,
        message: e?.message ?? 'Lỗi xóa đơn vị',
      });
    }
  }

  @GrpcMethod('OrganizationService', 'GetFullTree')
  async getFullTree() {
    const res = await this.orgService.getFullTree();
    const tree = res?.data ?? [];
    return {
      nodes: tree.map((node: any) => this.mapUnitNode(node)),
    };
  }

  @GrpcMethod('OrganizationService', 'GetSubTree')
  async getSubTree(data: { id: number }) {
    const res = await this.orgService.getSubTree(data.id);
    const tree = res?.data ?? [];
    return {
      nodes: Array.isArray(tree)
        ? tree.map((node: any) => this.mapUnitNode(node))
        : [],
    };
  }

  @GrpcMethod('OrganizationService', 'SetStaffing')
  async setStaffing(data: {
    unitId: number;
    jobTitleId: number;
    quantity: number;
  }) {
    const staffing = await this.orgService.setStaffing({
      unitId: data.unitId,
      jobTitleId: data.jobTitleId,
      quantity: data.quantity,
    });
    return {
      id: staffing.id,
      unitId: staffing.unitId,
      jobTitleId: staffing.jobTitleId,
      quantity: staffing.quantity,
    };
  }

  @GrpcMethod('OrganizationService', 'GetStaffingReport')
  async getStaffingReport(data: { unitId: number }) {
    const res = await this.orgService.getStaffingReport(data.unitId);
    const list = res?.data ?? [];
    return {
      items: list.map((s: any) => {
        const j = s.jobTitle;
        return {
          id: s.id,
          unitId: s.unitId,
          jobTitleId: s.jobTitleId,
          jobTitleName: j?.name ?? '',
          quantity: s.quantity,
          currentCount: s.currentCount ?? 0,
          currentEmployeeNames: s.current_employee_names ?? [],
          jobTitleDomainName:
            this.getCatName(j?.domain) ||
            [
              ...new Set(
                (s.slots ?? []).flatMap((slot: any) =>
                  (slot.domains ?? []).map((d: any) =>
                    this.getCatName(d.domain),
                  ),
                ),
              ),
            ]
              .filter(Boolean)
              .join(', '),

          slots: (s.slots ?? []).map((slot: any) => ({
            id: slot.id,
            staffingId: slot.staffingId,
            slotOrder: slot.slotOrder,
            description: slot.description ?? '',
            domainIds: (slot.domains ?? []).map((d: any) => d.domainId),
            domainNames: (slot.domains ?? []).map((d: any) =>
              this.getCatName(d.domain),
            ),
            geographicAreaIds: (slot.geographicAreas ?? []).map(
              (ga: any) => ga.geographicAreaId,
            ),
            geographicAreaNames: (slot.geographicAreas ?? []).map((ga: any) =>
              this.getCatName(ga.geographicArea),
            ),
            monitoredUnitIds: (slot.monitoredUnits ?? []).map(
              (mu: any) => mu.unitId,
            ),
            monitoredUnitNames: (slot.monitoredUnits ?? []).map(
              (mu: any) => mu.unit?.name ?? mu.unit?.code ?? '',
            ),
          })),
        };
      }),
    };
  }

  @GrpcMethod('OrganizationService', 'SetStaffingSlot')
  async setStaffingSlot(data: {
    staffingId: number;
    slotOrder: number;
    description?: string;
    domainIds?: number[];
    geographicAreaIds?: number[];
    monitoredUnitIds?: number[];
  }) {
    if (data.domainIds !== undefined && !Array.isArray(data.domainIds)) {
      throw new RpcException({
        code: GrpcStatus.INVALID_ARGUMENT,
        message: 'domainIds phải là một mảng',
      });
    }
    if (
      data.geographicAreaIds !== undefined &&
      !Array.isArray(data.geographicAreaIds)
    ) {
      throw new RpcException({
        code: GrpcStatus.INVALID_ARGUMENT,
        message: 'geographicAreaIds phải là một mảng',
      });
    }
    if (
      data.monitoredUnitIds !== undefined &&
      !Array.isArray(data.monitoredUnitIds)
    ) {
      throw new RpcException({
        code: GrpcStatus.INVALID_ARGUMENT,
        message: 'monitoredUnitIds phải là một mảng',
      });
    }

    const slot = await this.orgService.setStaffingSlot({
      staffingId: data.staffingId,
      slotOrder: data.slotOrder,
      description: data.description,
      domainIds: data.domainIds,
      geographicAreaIds: data.geographicAreaIds,
      monitoredUnitIds: data.monitoredUnitIds,
    });
    return {
      id: slot.id,
      staffingId: slot.staffingId,
      slotOrder: slot.slotOrder,
      description: slot.description ?? '',
      domainIds: (slot.domains ?? []).map((d: any) => d.domainId),
      geographicAreaIds: (slot.geographicAreas ?? []).map(
        (ga: any) => ga.geographicAreaId,
      ),
      monitoredUnitIds: (slot.monitoredUnits ?? []).map((mu: any) => mu.unitId),
    };
  }

  @GrpcMethod('OrganizationService', 'ListJobTitles')
  async listJobTitles(data: { unitId?: number }) {
    const res = await this.orgService.listJobTitles(data?.unitId);
    const list = res?.data ?? [];
    return {
      items: list.map((j: any) => this.mapJobTitleItem(j)),
    };
  }

  @GrpcMethod('OrganizationService', 'UpdateJobTitle')
  async updateJobTitle(data: { id: number }) {
    const j = await this.orgService.updateJobTitle({
      id: data.id,
    });
    return this.mapJobTitleItem(j);
  }

  @GrpcMethod('OrganizationService', 'ListUnitTypes')
  async listUnitTypes() {
    const res = await this.orgService.listUnitTypes();
    const list = res?.data ?? [];
    return {
      items: list.map((ut: any) => ({
        id: ut.id,
        code: ut.code,
        name: ut.name,
        level: ut.level,
      })),
    };
  }

  private mapJobTitleItem(j: any) {
    return {
      id: j.id,
      code: j.code,
      name: j.name,
      category: j.category ?? '',
      rank: j.rank ?? 0,
      type: j.type ?? '',
    };
  }
}
