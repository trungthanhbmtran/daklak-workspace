import {
  Injectable,
  Inject,
  OnModuleInit,
  BadRequestException,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { MICROSERVICES } from '../../core/constants/services';

@Injectable()
export class OrganizationsService implements OnModuleInit {
  private orgGrpcService: any;
  private userGrpcService: any;
  private reportGrpcService: any;

  constructor(
    @Inject(MICROSERVICES.ORGANIZATION.SYMBOL) private readonly client: any,
    @Inject(MICROSERVICES.USER.SYMBOL) private readonly userClient: any,
    @Inject(MICROSERVICES.REPORT.SYMBOL) private readonly reportClient: any,
  ) { }

  onModuleInit() {
    this.orgGrpcService = this.client.getService(
      MICROSERVICES.ORGANIZATION.SERVICE,
    );
    this.userGrpcService = this.userClient.getService(
      MICROSERVICES.USER.SERVICE,
    );
    this.reportGrpcService = this.reportClient.getService(
      MICROSERVICES.REPORT.SERVICE,
    );
  }

  private mapToOrganizationNode(node: any): any {
    if (!node) return null;
    const { children, typeCode, type_code, category_code, categoryCode, parent_id, parentId, domains, ...rest } = node;
    const rawParentId = parentId ?? parent_id;
    return {
      ...rest,
      categoryCode: categoryCode ?? category_code ?? typeCode ?? type_code ?? undefined,
      parentId: rawParentId === 0 ? null : (rawParentId ?? null),
      domains: domains ?? [],
      children: Array.isArray(children) ? children.map(c => this.mapToOrganizationNode(c)) : undefined,
    };
  }

  async create(body: any) {
    try {
      if (body.domainIds !== undefined && !Array.isArray(body.domainIds)) {
        throw new BadRequestException('domainIds phải là một mảng');
      }
      const result = await firstValueFrom(
        this.orgGrpcService.CreateUnit({
          code: body.code,
          name: body.name,
          shortName: body.shortName,
          typeId: body.typeId,
          typeCode: body.categoryCode,
          parentId: body.parentId,
          domainIds: body.domainIds ?? [],
          scope: body.scope,
        }),
      );
      return { success: true, data: result };
    } catch (err: any) {
      const message = err?.details ?? err?.message ?? 'Lỗi tạo đơn vị';
      if (err?.code === 5) throw new NotFoundException(message);
      if (err?.code === 6) throw new ConflictException(message);
      throw new BadRequestException(message);
    }
  }

  async getUnitTypes() {
    const res = (await firstValueFrom(
      this.orgGrpcService.ListUnitTypes({}),
    ).catch((e) => {
      throw new InternalServerErrorException(e.message || 'RPC Call Failed');
    })) as any;
    return { success: true, data: res.data };
  }

  async getFullTree(user: any, q?: string) {
    const res = (await firstValueFrom(
      this.orgGrpcService.GetFullTree({ q: q || '' }),
    ).catch((e) => {
      throw new InternalServerErrorException(e.message || 'RPC Call Failed');
    })) as any;
    let nodes = res.nodes || [];

    const userId = user?.id;
    const userInfo: any = userId
      ? await firstValueFrom(
        this.userGrpcService.FindOne({ id: userId }),
      ).catch(() => null)
      : null;

    const isAdmin: boolean = !!userInfo?.permissionsFlatten?.includes(
      'ORGANIZATION:MANAGE',
    );

    if (!isAdmin) {
      if (!userInfo?.unitCode) {
        nodes = [];
      } else {
        const findNodeByCodePrefix = (
          treeNodes: any[],
          prefix: string,
        ): any | null => {
          for (const node of treeNodes) {
            if (node.code && node.code.startsWith(prefix)) return node;
            if (node.children && node.children.length > 0) {
              const found = findNodeByCodePrefix(node.children, prefix);
              if (found) return found;
            }
          }
          return null;
        };

        const userUnitNode = findNodeByCodePrefix(nodes, userInfo!.unitCode);
        nodes = userUnitNode ? [userUnitNode] : [];
      }
    }

    const allowedActions: string[] = [];
    if (isAdmin) {
      allowedActions.push('CREATE_ROOT', 'CREATE_CHILD', 'EDIT', 'DELETE');
    }

    return {
      success: true,
      data: nodes.map(n => this.mapToOrganizationNode(n)),
      meta: { allowedActions },
    };
  }

  async getOrganizations(user: any, q?: string) {
    const res = (await firstValueFrom(
      this.orgGrpcService.GetOrganizations({ q: q || '' }),
    ).catch((e) => {
      throw new InternalServerErrorException(e.message || 'RPC Call Failed');
    })) as any;

    let flatList = res.nodes || [];

    const userId = user?.id;
    const userInfo: any = userId
      ? await firstValueFrom(
        this.userGrpcService.FindOne({ id: userId }),
      ).catch(() => null)
      : null;

    const isAdmin: boolean = !!userInfo?.permissionsFlatten?.includes(
      'ORGANIZATION:MANAGE',
    );

    if (!isAdmin) {
      if (!userInfo?.unitCode) {
        flatList = [];
      } else {
        flatList = flatList.filter(
          (node: any) => node.code && node.code.startsWith(userInfo.unitCode),
        );
      }
    }

    return { success: true, data: flatList.map(n => this.mapToOrganizationNode(n)) };
  }

  async getJobTitles(unitId?: string) {
    const unitIdNum =
      unitId != null && unitId !== '' ? parseInt(unitId, 10) : undefined;
    const res = (await firstValueFrom(
      this.orgGrpcService.ListJobTitles({
        unitId: Number.isNaN(unitIdNum) ? undefined : unitIdNum,
      }),
    ).catch((e) => {
      throw new InternalServerErrorException(e.message || 'RPC Call Failed');
    })) as any;
    const data = res.data || [];
    const isParty = (j: any) => ["DANG", "PARTY"].includes(j.category?.toUpperCase() ?? "") || ["DANG", "PARTY"].includes(j.type?.toUpperCase() ?? "");
    const partyTitles = data.filter(isParty);
    const govTitles = data.filter((j: any) => !isParty(j));

    return { success: true, data: { partyTitles, govTitles, allTitles: data } };
  }

  async updateJobTitle(id: number, body: any) {
    const result = await firstValueFrom(
      this.orgGrpcService.UpdateJobTitle({
        id,
        domainId: body.domainId,
      }),
    ).catch((e) => {
      throw new InternalServerErrorException(e.message || 'RPC Call Failed');
    });
    return { success: true, data: result };
  }

  async getOne(id: number) {
    try {
      const result = await firstValueFrom(this.orgGrpcService.GetOne({ id }));
      return { success: true, data: this.mapToOrganizationNode(result) };
    } catch (err: any) {
      const message = err?.details ?? err?.message ?? 'Đơn vị không tồn tại';
      if (err?.code === 5) throw new NotFoundException(message);
      throw new BadRequestException(message);
    }
  }

  async getOneByCode(code: string) {
    try {
      const result = await firstValueFrom(this.orgGrpcService.GetOrganizationByCode({ code }));
      return { success: true, data: this.mapToOrganizationNode(result) };
    } catch (err: any) {
      const message = err?.details ?? err?.message ?? 'Đơn vị không tồn tại';
      if (err?.code === 5) throw new NotFoundException(message);
      throw new BadRequestException(message);
    }
  }

  async getDetail(identifier: string) {
    const isNumeric = /^\d+$/.test(identifier);
    
    const enrichWithSubordinates = async (mapped: any, id: number) => {
      try {
        const allOrgsRes: any = await firstValueFrom(this.orgGrpcService.GetOrganizations({ q: '' }));
        mapped.subordinateUnits = (allOrgsRes.nodes || []).filter((n: any) => n.parentId === id || n.parent_id === id).map((n: any) => this.mapToOrganizationNode(n));
      } catch (e) {
        mapped.subordinateUnits = [];
      }
      return mapped;
    };

    try {
      const result = (await firstValueFrom(this.orgGrpcService.GetOrganizationByCode({ code: identifier }))) as any;
      const mapped = await enrichWithSubordinates(this.mapToOrganizationNode(result), result.id);
      return { success: true, data: mapped };
    } catch (err: any) {
      if (isNumeric && err?.code === 5) {
        try {
          const resultById = (await firstValueFrom(this.orgGrpcService.GetOne({ id: parseInt(identifier, 10) }))) as any;
          const mapped = await enrichWithSubordinates(this.mapToOrganizationNode(resultById), resultById.id);
          return { success: true, data: mapped };
        } catch (e2: any) {
          const message = e2?.details ?? e2?.message ?? 'Đơn vị không tồn tại';
          if (e2?.code === 5) throw new NotFoundException(message);
          throw new BadRequestException(message);
        }
      }
      const message = err?.details ?? err?.message ?? 'Đơn vị không tồn tại';
      if (err?.code === 5) throw new NotFoundException(message);
      throw new BadRequestException(message);
    }
  }

  async getUnitScope(id: number) {
    try {
      const result: any = await firstValueFrom(this.orgGrpcService.GetUnitScope({ id }));
      const data = result?.data ?? result;
      return { 
        success: true, 
        ...data,
        domains: data.domains ?? [],
        scope: data.scope ?? ''
      };
    } catch (err: any) {
      const message = err?.details ?? err?.message ?? 'Đơn vị không tồn tại';
      if (err?.code === 5) throw new NotFoundException(message);
      throw new BadRequestException(message);
    }
  }

  async update(id: number, body: any) {
    try {
      if (body.domainIds !== undefined && !Array.isArray(body.domainIds)) {
        throw new BadRequestException('domainIds phải là một mảng');
      }
      if (
        body.geographicAreaIds !== undefined &&
        !Array.isArray(body.geographicAreaIds)
      ) {
        throw new BadRequestException('geographicAreaIds phải là một mảng');
      }
      const payload: Record<string, unknown> = {
        id,
        code: body.code,
        name: body.name,
        shortName: body.shortName,
        typeId: body.typeId,
        typeCode: body.categoryCode,
      };
      if (body.parentId !== undefined) payload.parentId = body.parentId;
      const result = await firstValueFrom(
        this.orgGrpcService.UpdateUnit(payload as any),
      );
      return { success: true, data: result };
    } catch (err: any) {
      const message = err?.details ?? err?.message ?? 'Lỗi cập nhật đơn vị';
      if (err?.code === 5) throw new NotFoundException(message);
      if (err?.code === 6) throw new ConflictException(message);
      throw new BadRequestException(message);
    }
  }

  async delete(id: number) {
    try {
      const res = (await firstValueFrom(
        this.orgGrpcService.DeleteUnit({ id }),
      )) as any;
      return {
        success: res?.success ?? true,
        message: res?.message ?? 'Đã xóa đơn vị',
      };
    } catch (err: any) {
      const message = err?.details ?? err?.message ?? 'Lỗi xóa đơn vị';
      if (err?.code === 5) throw new NotFoundException(message);
      if (err?.code === 9) throw new ConflictException(message);
      throw new BadRequestException(message);
    }
  }

  async updateScope(id: number, body: any) {
    if (body.domainIds !== undefined && !Array.isArray(body.domainIds)) {
      throw new BadRequestException('domainIds phải là một mảng');
    }
    try {
      const result = await firstValueFrom(
        this.orgGrpcService.UpdateUnitScope({
          id,
          domainIds: body.domainIds ?? [],
          scope: body.scope,
        }),
      );
      return { success: true, data: result };
    } catch (err: any) {
      const message =
        err?.details ?? err?.message ?? 'Lỗi cập nhật phạm vi phụ trách';
      if (err?.code === 5) throw new NotFoundException(message);
      throw new BadRequestException(message);
    }
  }

  async getSubTree(id: number) {
    const res = (await firstValueFrom(
      this.orgGrpcService.GetSubTree({ id }),
    ).catch((e) => {
      throw new InternalServerErrorException(e.message || 'RPC Call Failed');
    })) as any;
    return { success: true, data: (res.nodes || []).map(n => this.mapToOrganizationNode(n)) };
  }

  async setStaffing(body: any) {
    const result = await firstValueFrom(
      this.orgGrpcService.SetStaffing({
        unitId: body.unitId,
        jobTitleId: body.jobTitleId,
        quantity: body.quantity,
      }),
    ).catch((e) => {
      throw new InternalServerErrorException(e.message || 'RPC Call Failed');
    });
    return { success: true, data: result };
  }

  private mapStaffingReportItem(rep: any): any {
    return {
      id: rep.id,
      unitId: rep.unitId ?? rep.unit_id,
      jobTitleId: rep.jobTitleId ?? rep.job_title_id,
      jobTitleName: rep.jobTitleName ?? rep.job_title_name ?? '',
      quantity: rep.quantity ?? 0,
      currentCount: rep.currentCount ?? rep.current_count ?? 0,
      currentEmployeeNames: rep.currentEmployeeNames ?? rep.current_employee_names ?? [],
      jobTitleDomainName: rep.jobTitleDomainName ?? rep.job_title_domain_name ?? '',
      jobTitleMonitoredUnitNames: rep.jobTitleMonitoredUnitNames ?? rep.job_title_monitored_unit_names ?? [],
      jobTitleGeographicAreaName: rep.jobTitleGeographicAreaName ?? rep.job_title_geographic_area_name ?? '',
      slots: (rep.slots ?? []).map((s: any) => ({
        id: s.id,
        staffingId: s.staffingId ?? s.staffing_id,
        slotOrder: s.slotOrder ?? s.slot_order,
        description: s.description ?? '',
        domains: s.domains ?? [],
        geographicAreas: s.geographicAreas ?? s.geographic_areas ?? [],
        monitoredUnits: s.monitoredUnits ?? s.monitored_units ?? [],
        assignedEmployeeName: s.assignedEmployeeName ?? s.assigned_employee_name ?? '',
        assignedEmployeeCode: s.assignedEmployeeCode ?? s.assigned_employee_code ?? ''
      }))
    };
  }

  async getStaffingReport(id: number) {
    try {
      const res = (await firstValueFrom(
        this.orgGrpcService.GetStaffingReport({ unitId: id }),
      )) as any;
      
      const jtRes = await this.getJobTitles(id.toString()).catch(() => ({ data: { allTitles: [] } }));
      const allTitles = jtRes.data?.allTitles || [];
      const isParty = (j: any) => ["DANG", "PARTY"].includes(j.category?.toUpperCase() ?? "") || ["DANG", "PARTY"].includes(j.type?.toUpperCase() ?? "");
      
      const partyReport: any[] = [];
      const govReport: any[] = [];
      const reportData = (res.data || []).map((r: any) => this.mapStaffingReportItem(r));
      
      reportData.forEach((rep: any) => {
        const jt = allTitles.find((j: any) => j.id === (rep.jobTitleId || rep.job_title_id));
        const party = jt ? isParty(jt) : false;
        if (party) partyReport.push(rep);
        else govReport.push(rep);
      });
      
      return { success: true, data: { partyReport, govReport, allReport: reportData } };
    } catch (err: any) {
      throw new InternalServerErrorException(err.message || 'RPC Call Failed');
    }
  }

  async setStaffingSlot(body: any) {
    if (
      body.geographicAreaIds !== undefined &&
      !Array.isArray(body.geographicAreaIds)
    ) {
      throw new BadRequestException('geographicAreaIds phải là một mảng');
    }
    if (
      body.monitoredUnitIds !== undefined &&
      !Array.isArray(body.monitoredUnitIds)
    ) {
      throw new BadRequestException('monitoredUnitIds phải là một mảng');
    }
    const result = await firstValueFrom(
      this.orgGrpcService.SetStaffingSlot({
        staffingId: body.staffingId,
        slotOrder: body.slotOrder,
        description: body.description,
        domainIds: body.domainIds,
        geographicAreaIds: body.geographicAreaIds,
        monitoredUnitIds: body.monitoredUnitIds,
      }),
    ).catch((e) => {
      throw new InternalServerErrorException(e.message || 'RPC Call Failed');
    });
    return { success: true, data: result };
  }

  async getPublicOrgUnits() {
    try {
      const res = (await firstValueFrom(
        this.orgGrpcService.GetFullTree({}),
      )) as any;
      const nodes = res.nodes || [];
      const flatList = this.flattenTree(nodes);
      return { success: true, data: flatList };
    } catch (error: any) {
      throw new InternalServerErrorException(
        error?.message || 'Failed to fetch public org units',
      );
    }
  }

  private flattenTree(nodes: any[]): any[] {
    if (!Array.isArray(nodes)) return [];
    let result: any[] = [];
    nodes.forEach((node) => {
      const normalizedNode = this.mapToOrganizationNode(node);
      const { children: mappedChildren, ...restNormalized } = normalizedNode;
      result.push(restNormalized);
      if (Array.isArray(node.children) && node.children.length > 0) {
        result = result.concat(this.flattenTree(node.children));
      }
    });
    return result;
  }

  async getUnitTypeJobTemplates(unitTypeId: number) {
    const res = await firstValueFrom(
      this.orgGrpcService.GetUnitTypeJobTemplates({ unitTypeId }),
    ).catch((e) => {
      throw new InternalServerErrorException(e.message || 'RPC Call Failed');
    }) as any;
    return { success: true, data: res.jobTitleIds || [] };
  }

  async updateUnitTypeJobTemplates(unitTypeId: number, jobTitleIds: number[]) {
    const res = await firstValueFrom(
      this.orgGrpcService.UpdateUnitTypeJobTemplates({ unitTypeId, jobTitleIds }),
    ).catch((e) => {
      throw new InternalServerErrorException(e.message || 'RPC Call Failed');
    }) as any;
    return { success: res.success };
  }
}
