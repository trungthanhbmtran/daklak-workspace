import { Controller } from '@nestjs/common';
import { GrpcMethod, RpcException } from '@nestjs/microservices';
import { status as GrpcStatus } from '@grpc/grpc-js';
import { OrganizationsService } from './organizations.service';

@Controller()
export class OrganizationsController {
  constructor(private readonly orgService: OrganizationsService) {}

  private domainIdsAndNames(unit: any): { domainIds: number[]; domainNames: string[] } {
    const ud = unit.unitDomains ?? [];
    return {
      domainIds: ud.map((d: any) => d.domainId ?? d.domain?.id).filter(Boolean),
      domainNames: ud.map((d: any) => d.domain?.name).filter(Boolean),
    };
  }

  private mapUnitNode(node: any): any {
    const { domainIds, domainNames } = this.domainIdsAndNames(node);
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
      children: (node.children && node.children.length)
        ? node.children.map((c: any) => this.mapUnitNode(c))
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
    domainId?: number;
    scope?: string;
  }) {
    const domainIds = data.domainIds ?? (data.domainId != null ? [data.domainId] : []);
    const unit = await this.orgService.createUnit({
      code: data.code,
      name: data.name,
      shortName: data.shortName,
      typeId: data.typeId,
      parentId: data.parentId,
      domainIds,
      scope: data.scope,
    });
    return this.toUnitResponse(unit);
  }

  @GrpcMethod('OrganizationService', 'GetOne')
  async getOne(data: { id: number }) {
    const unit = await this.orgService.getById(data.id);
    if (!unit) {
      throw new RpcException({ code: GrpcStatus.NOT_FOUND, message: 'Đơn vị không tồn tại' });
    }
    return this.toUnitResponse(unit);
  }

  @GrpcMethod('OrganizationService', 'UpdateUnit')
  async updateUnit(data: { id: number; code?: string; name?: string; shortName?: string; typeId?: number; parentId?: number; domainIds?: number[]; scope?: string }) {
    try {
      const unit = await this.orgService.updateUnit(data.id, {
        code: data.code,
        name: data.name,
        shortName: data.shortName,
        typeId: data.typeId,
        parentId: data.parentId,
        domainIds: data.domainIds,
        scope: data.scope,
      });
      if (!unit) {
        throw new RpcException({ code: GrpcStatus.NOT_FOUND, message: 'Đơn vị không tồn tại' });
      }
      return this.toUnitResponse(unit);
    } catch (e: any) {
      if (e instanceof RpcException) throw e;
      throw new RpcException({ code: GrpcStatus.INVALID_ARGUMENT, message: e?.message ?? 'Lỗi cập nhật đơn vị' });
    }
  }

  @GrpcMethod('OrganizationService', 'DeleteUnit')
  async deleteUnit(data: { id: number }) {
    try {
      const ok = await this.orgService.deleteUnit(data.id);
      return { success: ok, message: 'Đã xóa đơn vị' };
    } catch (e: any) {
      if (e instanceof RpcException) throw e;
      throw new RpcException({ code: GrpcStatus.FAILED_PRECONDITION, message: e?.message ?? 'Lỗi xóa đơn vị' });
    }
  }

  @GrpcMethod('OrganizationService', 'GetFullTree')
  async getFullTree() {
    const tree = await this.orgService.getFullTree();
    return {
      nodes: tree.map((node: any) => this.mapUnitNode(node)),
    };
  }

  @GrpcMethod('OrganizationService', 'GetSubTree')
  async getSubTree(data: { id: number }) {
    const tree = await this.orgService.getSubTree(data.id);
    return {
      nodes: Array.isArray(tree) ? tree.map((node: any) => this.mapUnitNode(node)) : [],
    };
  }

  @GrpcMethod('OrganizationService', 'SetStaffing')
  async setStaffing(data: { unitId: number; jobTitleId: number; quantity: number }) {
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
    const list = await this.orgService.getStaffingReport(data.unitId);
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
          jobTitleDomainName: j?.domain?.name ?? '',
          jobTitleMonitoredUnitNames: (j?.monitoredUnits ?? []).map((mu: any) => mu.unit?.name ?? '').filter(Boolean),
          jobTitleGeographicAreaName: j?.geographicArea?.name ?? '',
          slots: (s.slots ?? []).map((slot: any) => ({
            id: slot.id,
            staffingId: slot.staffingId,
            slotOrder: slot.slotOrder,
            description: slot.description ?? '',
            geographicAreaId: slot.geographicAreaId ?? 0,
            geographicAreaName: slot.geographicArea?.name ?? '',
            domainIds: (slot.domains ?? []).map((d: any) => d.domainId),
            domainNames: (slot.domains ?? []).map((d: any) => d.domain?.name ?? ''),
            monitoredUnitIds: (slot.monitoredUnits ?? []).map((mu: any) => mu.unitId),
            monitoredUnitNames: (slot.monitoredUnits ?? []).map((mu: any) => mu.unit?.name ?? ''),
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
    geographicAreaId?: number;
    domainIds?: number[];
    monitoredUnitIds?: number[];
  }) {
    const slot = await this.orgService.setStaffingSlot({
      staffingId: data.staffingId,
      slotOrder: data.slotOrder,
      description: data.description,
      geographicAreaId: data.geographicAreaId,
      domainIds: data.domainIds,
      monitoredUnitIds: data.monitoredUnitIds,
    });
    return {
      id: slot.id,
      staffingId: slot.staffingId,
      slotOrder: slot.slotOrder,
      description: slot.description ?? '',
      geographicAreaId: slot.geographicAreaId ?? 0,
      geographicAreaName: slot.geographicArea?.name ?? '',
      domainIds: (slot.domains ?? []).map((d: any) => d.domainId),
      domainNames: (slot.domains ?? []).map((d: any) => d.domain?.name ?? ''),
      monitoredUnitIds: (slot.monitoredUnits ?? []).map((mu: any) => mu.unitId),
      monitoredUnitNames: (slot.monitoredUnits ?? []).map((mu: any) => mu.unit?.name ?? ''),
    };
  }

  @GrpcMethod('OrganizationService', 'ListJobTitles')
  async listJobTitles(data: { unitId?: number }) {
    const list = await this.orgService.listJobTitles(data?.unitId);
    return {
      items: list.map((j: any) => this.mapJobTitleItem(j)),
    };
  }

  @GrpcMethod('OrganizationService', 'UpdateJobTitle')
  async updateJobTitle(data: {
    id: number;
    domainId?: number;
    geographicAreaId?: number;
    monitoredUnitIds?: number[];
  }) {
    const j = await this.orgService.updateJobTitle({
      id: data.id,
      domainId: data.domainId,
      geographicAreaId: data.geographicAreaId,
      monitoredUnitIds: data.monitoredUnitIds,
    });
    return this.mapJobTitleItem(j);
  }

  private mapJobTitleItem(j: any) {
    return {
      id: j.id,
      code: j.code,
      name: j.name,
      domainId: j.domainId ?? 0,
      domainName: j.domain?.name ?? '',
      monitoredUnitIds: (j.monitoredUnits ?? []).map((mu: any) => mu.unitId),
      monitoredUnitNames: (j.monitoredUnits ?? []).map((mu: any) => mu.unit?.name ?? ''),
      geographicAreaId: j.geographicAreaId ?? 0,
      geographicAreaName: j.geographicArea?.name ?? '',
    };
  }
}
