import {
  Injectable,
  Inject,
  OnModuleInit,
  InternalServerErrorException,
  BadRequestException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { firstValueFrom } from 'rxjs';

import { MICROSERVICES } from '../../core/constants/services';

@Injectable()
export class MasterPlansService implements OnModuleInit {
  private handleRpcError(e: any, defaultMsg = 'RPC Call Failed'): never {
    const code = e?.code;
    const message = e?.details || e?.message || defaultMsg;
    if (code === 5) throw new NotFoundException(message);
    if (code === 6) throw new ConflictException(message);
    if (code === 3) throw new BadRequestException(message);
    throw new InternalServerErrorException(message);
  }

  private masterPlanService: any;
  private orgService: any;
  private userService: any;

  private unitMapCache: {
    data: Record<number, any>;
    expiresAt: number;
  } | null = null;

  constructor(
    @Inject('MASTER_PLAN_PACKAGE') private client: any,
    @Inject(MICROSERVICES.ORGANIZATION.SYMBOL) private readonly orgClient: any,
    @Inject(MICROSERVICES.USER.SYMBOL) private readonly userClient: any,
  ) {}

  onModuleInit() {
    this.masterPlanService = this.client.getService('MasterPlanService');
    this.orgService = this.orgClient.getService(
      MICROSERVICES.ORGANIZATION.SERVICE,
    );
    this.userService = this.userClient.getService(MICROSERVICES.USER.SERVICE);
  }

  private async populateUsers(plans: any[]) {
    if (!plans || plans.length === 0) return plans;

    const empCodes = new Set<string>();
    const userIds = new Set<number>();

    const collectCodes = (plan: any) => {
      if (plan.createdByCode && plan.createdByCode !== 'system') {
        empCodes.add(plan.createdByCode);
        const parsed = parseInt(plan.createdByCode, 10);
        if (!isNaN(parsed) && parsed > 0) userIds.add(parsed);
      }
      if (plan.updatedByCode && plan.updatedByCode !== 'system') {
        empCodes.add(plan.updatedByCode);
        const parsed = parseInt(plan.updatedByCode, 10);
        if (!isNaN(parsed) && parsed > 0) userIds.add(parsed);
      }

      if (plan.tasks) {
        plan.tasks.forEach((t: any) => {
          if (t.assigneeCode && t.assigneeCode !== 'UNASSIGNED') {
            empCodes.add(t.assigneeCode);
            const parsed = parseInt(t.assigneeCode, 10);
            if (!isNaN(parsed) && parsed > 0) userIds.add(parsed);
          }
          if (t.assignerCode) {
            empCodes.add(t.assignerCode);
            const parsed = parseInt(t.assignerCode, 10);
            if (!isNaN(parsed) && parsed > 0) userIds.add(parsed);
          }
        });
      }
    };
    plans.forEach(collectCodes);

    if (empCodes.size === 0 && userIds.size === 0) return plans;

    try {
      const usersRes: any = await firstValueFrom(
        this.userService.ListUsers({ take: 500 }),
      );
      const users = usersRes?.data || [];
      const usersMap = new Map<string, any>();
      users.forEach((u: any) => {
        if (u.employeeCode) {
          usersMap.set(u.employeeCode, u);
        }
        usersMap.set(String(u.id), u);
      });

      const mapUsers = (plan: any) => {
        if (plan.createdByCode) {
          const u = usersMap.get(plan.createdByCode);
          if (u) plan.createdByName = u.fullName || u.username;
        }
        if (plan.updatedByCode) {
          const u = usersMap.get(plan.updatedByCode);
          if (u) plan.updatedByName = u.fullName || u.username;
        }

        if (plan.tasks) {
          plan.tasks.forEach((t: any) => {
            if (t.assigneeCode && t.assigneeCode !== 'UNASSIGNED') {
              const u = usersMap.get(t.assigneeCode);
              if (u) {
                t.assigneeName = u.fullName || u.username;
                t.assigneeAvatar = u.avatarUrl;
                t.assigneeJobTitle = u.jobTitleName;
                t.assigneeUnitName = u.unitName;
              }
            }
            if (t.assignerCode) {
              const u = usersMap.get(t.assignerCode);
              if (u) t.assignerName = u.fullName || u.username;
            }
          });
        }
      };
      plans.forEach(mapUsers);
    } catch (e) {
      console.error('Failed to populate users for master plans:', e);
    }
    return plans;
  }

  private async getUnitMap(): Promise<Record<number, any>> {
    if (this.unitMapCache && this.unitMapCache.expiresAt > Date.now()) {
      return this.unitMapCache.data;
    }
    try {
      const treeRes: any = await firstValueFrom(
        this.orgService.GetFullTree({}),
      );
      const unitMap: Record<number, any> = {};
      const flatten = (nodes: any[]) => {
        for (const n of nodes) {
          const nId = parseInt(n.id, 10);
          if (nId)
            unitMap[nId] = {
              id: nId,
              parentId: n.parentId ? parseInt(n.parentId, 10) : null,
            };
          if (n.children?.length) flatten(n.children);
        }
      };
      flatten(treeRes?.nodes || []);
      this.unitMapCache = {
        data: unitMap,
        expiresAt: Date.now() + 5 * 60 * 1000,
      };
      return unitMap;
    } catch {
      return {};
    }
  }

  private getAncestorUnitIds(
    unitMap: Record<number, any>,
    unitId: number,
  ): number[] {
    const ids: number[] = [];
    const visited = new Set<number>();
    let current = unitMap[unitId];
    if (current) {
      ids.push(unitId);
      visited.add(unitId);
    }
    while (current?.parentId) {
      if (visited.has(current.parentId)) {
        console.warn(
          `[MasterPlansService] Cycle detected at unitId: ${current.parentId}`,
        );
        break;
      }
      ids.push(current.parentId);
      visited.add(current.parentId);
      current = unitMap[current.parentId];
    }
    return ids;
  }

  async findAll(
    user: any,
    type?: string,
    status?: string,
    reqDepartmentId?: string,
  ) {
    const isAdmin =
      user?.permissionsFlatten?.includes('PLAN:MANAGE') ||
      user?.username === 'admin' ||
      user?.username === 'system';
    const isLeader =
      user?.permissionsFlatten?.includes('PLAN:APPROVE') || false;

    let callerAncestorUnitIds: number[] = [];
    if (!isAdmin && user?.unitId) {
      const unitMap = await this.getUnitMap();
      callerAncestorUnitIds = this.getAncestorUnitIds(
        unitMap,
        parseInt(user.unitId, 10),
      );
    }

    const res: any = await firstValueFrom(
      this.masterPlanService.FindAll({
        type,
        status,
        departmentId: reqDepartmentId
          ? parseInt(reqDepartmentId, 10)
          : undefined,
        currentEmployeeCode: user?.employeeCode,
        isAdmin,
        currentUserDept: user?.unitId ? parseInt(user.unitId, 10) : undefined,
        callerAncestorUnitIds,
        isLeader,
      }),
    ).catch((e) => this.handleRpcError(e));
    if (res?.data) {
      if (Array.isArray(res.data)) {
        await this.populateUsers(res.data);
      } else {
        await this.populateUsers([res.data]);
      }
    }
    return res;
  }

  async findById(user: any, id: string) {
    const isAdmin =
      user?.permissionsFlatten?.includes('PLAN:MANAGE') ||
      user?.username === 'admin' ||
      user?.username === 'system';
    const isLeader =
      user?.permissionsFlatten?.includes('PLAN:APPROVE') || false;

    let callerAncestorUnitIds: number[] = [];
    if (!isAdmin && user?.unitId) {
      const unitMap = await this.getUnitMap();
      callerAncestorUnitIds = this.getAncestorUnitIds(
        unitMap,
        parseInt(user.unitId, 10),
      );
    }

    const res: any = await firstValueFrom(
      this.masterPlanService.FindById({
        id: parseInt(id, 10),
        currentEmployeeCode: user?.employeeCode,
        isAdmin,
        currentUserDept: user?.unitId ? parseInt(user.unitId, 10) : undefined,
        callerAncestorUnitIds,
        isLeader,
      }),
    ).catch((e) => this.handleRpcError(e));
    if (res) {
      await this.populateUsers([res]);
    }
    return res;
  }

  async create(user: any, body: any) {
    body.createdByCode = user?.employeeCode || 'system';
    if (user?.unitId) {
      body.departmentId = parseInt(user.unitId, 10);
    }
    return firstValueFrom(this.masterPlanService.Create(body)).catch((e) =>
      this.handleRpcError(e),
    );
  }

  async update(user: any, id: string, body: any) {
    body.updatedByCode = user?.employeeCode || 'system';
    return firstValueFrom(
      this.masterPlanService.Update({ id: parseInt(id, 10), ...body }),
    ).catch((e) => this.handleRpcError(e));
  }
}
