import { Injectable, Inject, OnModuleInit, BadRequestException, NotFoundException, ConflictException, InternalServerErrorException } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { MICROSERVICES } from '../../core/constants/services';

@Injectable()
export class OrganizationsService implements OnModuleInit {
  private orgGrpcService: any;
  private userGrpcService: any;

  constructor(
    @Inject(MICROSERVICES.ORGANIZATION.SYMBOL) private readonly client: any,
    @Inject(MICROSERVICES.USER.SYMBOL) private readonly userClient: any,
  ) {}

  onModuleInit() {
    this.orgGrpcService = this.client.getService(MICROSERVICES.ORGANIZATION.SERVICE);
    this.userGrpcService = this.userClient.getService(MICROSERVICES.USER.SERVICE);
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
          parentId: body.parentId,
          domainIds: body.domainIds ?? [],
          scope: body.scope,
        }),
      );
      return { success: true, data: result };
    } catch (err: any) {
      const message = err?.message ?? err?.details ?? 'Lỗi tạo đơn vị';
      if (err?.code === 5) throw new NotFoundException(message);
      if (err?.code === 6) throw new ConflictException(message);
      throw new BadRequestException(message);
    }
  }

  async getUnitTypes() {
    const res = (await firstValueFrom(this.orgGrpcService.ListUnitTypes({})).catch(
      (e) => {
        throw new InternalServerErrorException(e.message || 'RPC Call Failed');
      },
    )) as any;
    return { success: true, data: res.data };
  }

  async getFullTree(user: any, q?: string) {
    const res = (await firstValueFrom(this.orgGrpcService.GetFullTree({ q: q || '' })).catch(
      (e) => {
        throw new InternalServerErrorException(e.message || 'RPC Call Failed');
      },
    )) as any;
    let nodes = res.nodes || [];

    const userId = user?.id;
    const userInfo: any = userId
      ? await firstValueFrom(this.userGrpcService.FindOne({ id: userId })).catch(
          () => null,
        )
      : null;

    const isAdmin: boolean = !!userInfo?.roles?.some(
      (r: any) => r?.code === 'SUPER_ADMIN' || r?.code === 'ADMIN',
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
      data: nodes,
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
      ? await firstValueFrom(this.userGrpcService.FindOne({ id: userId })).catch(
          () => null,
        )
      : null;

    const isAdmin: boolean = !!userInfo?.roles?.some(
      (r: any) => r?.code === 'SUPER_ADMIN' || r?.code === 'ADMIN',
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

    return { success: true, data: flatList };
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
    return { success: true, data: res.data };
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
      return { success: true, data: result };
    } catch (err: any) {
      const message = err?.message ?? err?.details ?? 'Đơn vị không tồn tại';
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
        domainIds: body.domainIds,
        scope: body.scope,
      };
      if (body.parentId !== undefined) payload.parentId = body.parentId;
      const result = await firstValueFrom(
        this.orgGrpcService.UpdateUnit(payload as any),
      );
      return { success: true, data: result };
    } catch (err: any) {
      const message = err?.message ?? err?.details ?? 'Lỗi cập nhật đơn vị';
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
      const message = err?.message ?? err?.details ?? 'Lỗi xóa đơn vị';
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
        this.orgGrpcService.UpdateUnit({
          id,
          domainIds: body.domainIds ?? [],
        }),
      );
      return { success: true, data: result };
    } catch (err: any) {
      const message =
        err?.message ?? err?.details ?? 'Lỗi cập nhật phạm vi phụ trách';
      if (err?.code === 5) throw new NotFoundException(message);
      throw new BadRequestException(message);
    }
  }

  async getSubTree(id: number) {
    const res = (await firstValueFrom(this.orgGrpcService.GetSubTree({ id })).catch(
      (e) => {
        throw new InternalServerErrorException(e.message || 'RPC Call Failed');
      },
    )) as any;
    return { success: true, data: res.nodes };
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

  async getStaffingReport(id: number) {
    const res = (await firstValueFrom(
      this.orgGrpcService.GetStaffingReport({ unitId: id }),
    ).catch((e) => {
      throw new InternalServerErrorException(e.message || 'RPC Call Failed');
    })) as any;
    return { success: true, data: res.data };
  }

  async setStaffingSlot(body: any) {
    if (body.geographicAreaIds !== undefined && !Array.isArray(body.geographicAreaIds)) {
      throw new BadRequestException('geographicAreaIds phải là một mảng');
    }
    if (body.monitoredUnitIds !== undefined && !Array.isArray(body.monitoredUnitIds)) {
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
      throw new InternalServerErrorException(error?.message || 'Failed to fetch public org units');
    }
  }

  private flattenTree(nodes: any[]): any[] {
    if (!Array.isArray(nodes)) return [];
    let result: any[] = [];
    nodes.forEach((node) => {
      const { children, ...rest } = node;
      const rawParentId = rest.parentId ?? rest.parent_id;
      const normalizedNode = {
        ...rest,
        parentId: rawParentId === 0 ? null : (rawParentId ?? null),
      };
      result.push(normalizedNode);
      if (Array.isArray(children) && children.length > 0) {
        result = result.concat(this.flattenTree(children));
      }
    });
    return result;
  }
}
