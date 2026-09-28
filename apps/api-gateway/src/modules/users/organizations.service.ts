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
  private handleRpcError(e: any, defaultMsg = 'RPC Call Failed'): never {
    const code = e?.code;
    const message = e?.details || e?.message || defaultMsg;
    if (code === 5) throw new NotFoundException(message);
    if (code === 6) throw new ConflictException(message);
    if (code === 3) throw new BadRequestException(message);
    throw new InternalServerErrorException(message);
  }

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

  private getCategoryCodeFromTypeCode(typeCode?: string): string | undefined {
    if (!typeCode) return undefined;
    const CHINH_QUYEN = ['CQ_TU', 'UBND_TINH', 'HDND_TINH', 'SO_NGANH', 'PHONG_BAN_SO', 'TO_CHUC_CTXH'];
    const DANG = ['CQ_DANG', 'BAN_DANG', 'PHONG_BAN_DANG', 'VAN_PHONG_DANG_UY'];
    const THAM_MUU = ['VAN_PHONG', 'THANH_TRA'];
    const CHUYEN_MON = ['CHI_CUC'];
    const SU_NGHIEP = ['DVSN', 'TRUNG_TAM'];
    const PHONG_THUOC_SN = ['PHONG_BAN_TRUNG_TAM'];

    if (CHINH_QUYEN.includes(typeCode)) return 'CHINH_QUYEN';
    if (DANG.includes(typeCode)) return 'DANG';
    if (THAM_MUU.includes(typeCode)) return 'THAM_MUU';
    if (CHUYEN_MON.includes(typeCode)) return 'CHUYEN_MON';
    if (SU_NGHIEP.includes(typeCode)) return 'SU_NGHIEP';
    if (PHONG_THUOC_SN.includes(typeCode)) return 'PHONG_THUOC_SN';
    
    return 'CHINH_QUYEN'; // fallback
  }

  private mapToOrganizationNode(node: any): any {
    if (!node) return null;
    const { children, typeCode, categoryCode, parentId, domains, ...rest } = node;
    const rawParentId = parentId;
    return {
      ...rest,
      typeCode,
      categoryCode: this.getCategoryCodeFromTypeCode(typeCode),
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
          typeCode: body.typeCode,
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
    ).catch((e) => this.handleRpcError(e))) as any;
    
    const dataWithCategory = (res.data || []).map((t: any) => ({
      ...t,
      categoryCode: this.getCategoryCodeFromTypeCode(t.code)
    }));

    return { success: true, data: dataWithCategory };
  }

  async getFullTree(user: any, q?: string) {
    const res = (await firstValueFrom(
      this.orgGrpcService.GetFullTree({ q: q || '' }),
    ).catch((e) => this.handleRpcError(e))) as any;
    let nodes = res.nodes || [];

    const userId = user?.id;
    let userInfo: any = null;
    if (userId) {
      try {
        userInfo = await firstValueFrom(this.userGrpcService.FindOne({ id: userId }));
      } catch (err: any) {
        if (err?.code === 5) throw new NotFoundException('Người dùng không tồn tại');
        throw new InternalServerErrorException(err?.message || 'Lỗi kiểm tra thông tin người dùng');
      }
    }

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
    ).catch((e) => this.handleRpcError(e))) as any;

    let flatList = res.nodes || [];

    const userId = user?.id;
    let userInfo: any = null;
    if (userId) {
      try {
        userInfo = await firstValueFrom(this.userGrpcService.FindOne({ id: userId }));
      } catch (err: any) {
        if (err?.code === 5) throw new NotFoundException('Người dùng không tồn tại');
        throw new InternalServerErrorException(err?.message || 'Lỗi kiểm tra thông tin người dùng');
      }
    }

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
    ).catch((e) => this.handleRpcError(e))) as any;
    const data = res.data || [];
    const isParty = (j: any) => ["DANG", "PARTY"].includes(j.category?.toUpperCase() ?? "") || ["DANG", "PARTY"].includes(j.type?.toUpperCase() ?? "");
    const partyTitles = data.filter(isParty);
    const govTitles = data.filter((j: any) => !isParty(j));

    return { success: true, data: { partyTitles, govTitles, allTitles: data } };
  }

  async updateJobTitle(id: number, body: any) {
    try {
      const result = await firstValueFrom(
        this.orgGrpcService.UpdateJobTitle({
          id,
          domainId: body.domainId,
        }),
      );
      return { success: true, data: result };
    } catch (err: any) {
      const message = err?.details ?? err?.message ?? 'Lỗi cập nhật chức danh';
      if (err?.code === 5) throw new NotFoundException(message);
      if (err?.code === 3) throw new BadRequestException(message);
      throw new InternalServerErrorException(message);
    }
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
      } catch (err: any) {
        throw new InternalServerErrorException(err?.message || 'Lỗi lấy danh sách đơn vị cấp dưới');
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
        domainIds: (data.domains ?? []).map((x: any) => x.id),
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
        typeCode: body.typeCode,
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
    ).catch((e) => this.handleRpcError(e))) as any;
    return { success: true, data: (res.nodes || []).map(n => this.mapToOrganizationNode(n)) };
  }

  async setStaffing(body: any) {
    try {
      const result = await firstValueFrom(
        this.orgGrpcService.SetStaffing({
          unitId: body.unitId,
          jobTitleId: body.jobTitleId,
          quantity: body.quantity,
        }),
      );
      return { success: true, data: result };
    } catch (err: any) {
      const message = err?.details ?? err?.message ?? 'Lỗi thiết lập biên chế';
      if (err?.code === 5) throw new NotFoundException(message);
      if (err?.code === 3) throw new BadRequestException(message);
      throw new InternalServerErrorException(message);
    }
  }

  private mapStaffingReportItem(rep: any): any {
    return {
      id: rep.id,
      unitId: rep.unitId,
      jobTitleId: rep.jobTitleId,
      jobTitleName: rep.jobTitleName ?? '',
      quantity: rep.quantity ?? 0,
      currentCount: rep.currentCount ?? 0,
      currentEmployeeNames: rep.currentEmployeeNames ?? [],
      jobTitleDomainName: rep.jobTitleDomainName ?? '',
      jobTitleMonitoredUnitNames: rep.jobTitleMonitoredUnitNames ?? [],
      jobTitleGeographicAreaName: rep.jobTitleGeographicAreaName ?? '',
      slots: (rep.slots ?? []).map((s: any) => ({
        id: s.id,
        staffingId: s.staffingId,
        slotOrder: s.slotOrder,
        description: s.description ?? '',
        domains: s.domains ?? [],
        domainIds: (s.domains ?? []).map((x: any) => x.id),
        geographicAreas: s.geographicAreas ?? [],
        geographicAreaIds: (s.geographicAreas ?? []).map((x: any) => x.id),
        monitoredUnits: s.monitoredUnits ?? [],
        monitoredUnitIds: (s.monitoredUnits ?? []).map((x: any) => x.id),
        assignedEmployeeName: s.assignedEmployeeName ?? '',
        assignedEmployeeCode: s.assignedEmployeeCode ?? ''
      }))
    };
  }

  async getStaffingReport(id: number) {
    try {
      const res = (await firstValueFrom(
        this.orgGrpcService.GetStaffingReport({ unitId: id }),
      )) as any;

      let jtRes: any;
      try {
        jtRes = await this.getJobTitles(id.toString());
      } catch (err: any) {
        throw new InternalServerErrorException(err?.message || 'Lỗi lấy danh sách chức danh');
      }
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
    try {
      const result = await firstValueFrom(
        this.orgGrpcService.SetStaffingSlot({
          staffingId: body.staffingId,
          slotOrder: body.slotOrder,
          description: body.description,
          domainIds: body.domainIds,
          geographicAreaIds: body.geographicAreaIds,
          monitoredUnitIds: body.monitoredUnitIds,
        }),
      );
      return { success: true, data: result };
    } catch (err: any) {
      const message = err?.details ?? err?.message ?? 'Lỗi thiết lập vị trí biên chế';
      if (err?.code === 5) throw new NotFoundException(message);
      if (err?.code === 3) throw new BadRequestException(message);
      throw new InternalServerErrorException(message);
    }
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
    try {
      const res = await firstValueFrom(
        this.orgGrpcService.GetUnitTypeJobTemplates({ unitTypeId }),
      ) as any;
      return { success: true, data: res.jobTitleIds || [] };
    } catch (err: any) {
      const message = err?.details ?? err?.message ?? 'Lỗi lấy mẫu chức danh';
      if (err?.code === 5) throw new NotFoundException(message);
      throw new InternalServerErrorException(message);
    }
  }

  async updateUnitTypeJobTemplates(unitTypeId: number, jobTitleIds: number[]) {
    try {
      const res = await firstValueFrom(
        this.orgGrpcService.UpdateUnitTypeJobTemplates({ unitTypeId, jobTitleIds }),
      ) as any;
      return { success: res.success };
    } catch (err: any) {
      const message = err?.details ?? err?.message ?? 'Lỗi cập nhật mẫu chức danh';
      if (err?.code === 5) throw new NotFoundException(message);
      if (err?.code === 3) throw new BadRequestException(message);
      throw new InternalServerErrorException(message);
    }
  }
}

