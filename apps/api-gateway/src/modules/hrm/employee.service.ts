import {
  Injectable,
  Inject,
  OnModuleInit,
  InternalServerErrorException,
} from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { Metadata } from '@grpc/grpc-js';
import { MICROSERVICES } from '../../core/constants/services';

@Injectable()
export class EmployeeService implements OnModuleInit {
  private employeeService: any;
  private orgService: any;
  private catService: any;

  constructor(
    @Inject(MICROSERVICES.EMPLOYEE.SYMBOL) private readonly client: any,
    @Inject(MICROSERVICES.ORGANIZATION.SYMBOL) private readonly orgClient: any,
    @Inject(MICROSERVICES.SYS_CATEGORY.SYMBOL) private readonly catClient: any,
  ) {}

  onModuleInit() {
    this.employeeService = this.client.getService(
      MICROSERVICES.EMPLOYEE.SERVICE,
    );
    this.orgService = this.orgClient.getService(
      MICROSERVICES.ORGANIZATION.SERVICE,
    );
    this.catService = this.catClient.getService(
      MICROSERVICES.SYS_CATEGORY.SERVICE,
    );
  }

  private async fetchDictionaries(empList: any[], metadata?: Metadata) {
    try {
      const jobTitleIds = new Set<number>();
      const unitIds = new Set<number>();
      const catIds = new Set<number>();

      empList.forEach((e) => {
        if (e.jobTitleId) jobTitleIds.add(e.jobTitleId);
        if (e.partyTitleId) jobTitleIds.add(e.partyTitleId);
        if (e.departmentId) unitIds.add(e.departmentId);
        if (e.civilServantRankId) catIds.add(e.civilServantRankId);
      });

      const jtArray = Array.from(jobTitleIds);
      const unitArray = Array.from(unitIds);
      const catArray = Array.from(catIds);

      const results = await Promise.allSettled([
        jtArray.length > 0
          ? firstValueFrom(this.orgService.ListJobTitles({ ids: jtArray }, metadata))
          : Promise.resolve({ data: [] }),
        unitArray.length > 0
          ? firstValueFrom(this.orgService.GetOrganizations({ ids: unitArray }, metadata))
          : Promise.resolve({ nodes: [] }),
        catArray.length > 0
          ? firstValueFrom(this.catService.GetAllCategories({ ids: catArray }, metadata))
          : Promise.resolve({ data: [] }),
      ]);

      const jobTitlesRes: any =
        results[0].status === 'fulfilled' ? results[0].value : { data: [] };
      const orgRes: any =
        results[1].status === 'fulfilled' ? results[1].value : { nodes: [] };
      const catRes: any =
        results[2].status === 'fulfilled' ? results[2].value : { data: [] };

      const jtMap: Record<string, any> = {};
      (jobTitlesRes?.data || []).forEach((jt: any) => {
        jtMap[jt.id] = {
          name: jt.name,
          code: jt.code,
          monitoredUnitIds: jt.monitoredUnitIds || [],
          domainId: jt.domainId || null,
          category: jt.category || '',
        };
      });

      const catMap: Record<string, any> = {};
      (catRes?.data || []).forEach((c: any) => {
        catMap[c.id] = { name: c.name, code: c.code };
      });

      const unitMap: Record<number, any> = {};
      (orgRes?.nodes || []).forEach((n: any) => {
        const nId = parseInt(n.id, 10);
        if (nId) {
          unitMap[nId] = {
            id: nId,
            name: n.name,
            code: n.code,
          };
        }
      });

      return { jtMap, unitMap, catMap };
    } catch (_error) {
      return { jtMap: {}, unitMap: {}, catMap: {} };
    }
  }

  private enrichEmployee(
    emp: any,
    jtMap: Record<string, any>,
    unitMap: Record<string, any>,
    catMap: Record<string, any>,
  ) {
    if (!emp) return emp;
    const lookup = (map: Record<string, any>, id?: number) =>
      id && id > 0
        ? map[id as any] || { name: '', code: '' }
        : { name: '', code: '' };

    return {
      ...emp,
      department: {
        id: emp.departmentId,
        ...lookup(unitMap, emp.departmentId),
      },
      jobTitle: { id: emp.jobTitleId, ...lookup(jtMap, emp.jobTitleId) },
      civilServantRank: {
        id: emp.civilServantRankId,
        ...lookup(catMap, emp.civilServantRankId),
      },
      partyTitle: { id: emp.partyTitleId, ...lookup(jtMap, emp.partyTitleId) },
    };
  }

  private async executeWithDicts(
    rpcCall: Promise<any>,
    isList = false,
    metadata?: Metadata,
  ) {
    const res = await rpcCall.catch((e: any) => {
      throw new InternalServerErrorException(e.message || 'RPC Call Failed');
    });

    if (res && res.data) {
      const empList = isList && Array.isArray(res.data) ? res.data : [res.data];
      const dicts = await this.fetchDictionaries(empList, metadata);

      if (isList && Array.isArray(res.data)) {
        res.data = res.data.map((e: any) =>
          this.enrichEmployee(e, dicts.jtMap, dicts.unitMap, dicts.catMap),
        );
      } else {
        res.data = this.enrichEmployee(
          res.data,
          dicts.jtMap,
          dicts.unitMap,
          dicts.catMap,
        );
      }
    }
    return res;
  }

  async list(user: any, query: any, metadata?: Metadata) {
    const req = { ...query };
    if (req.page) req.page = parseInt(req.page);
    if (req.pageSize) req.pageSize = parseInt(req.pageSize);
    if (req.departmentId) req.departmentId = parseInt(req.departmentId);
    if (req.civilServantRankId)
      req.civilServantRankId = parseInt(req.civilServantRankId);
    if (req.partyTitleId) req.partyTitleId = parseInt(req.partyTitleId);

    if (req.ids) {
      if (typeof req.ids === 'string') {
        req.ids = req.ids
          .split(',')
          .map((id: string) => parseInt(id, 10))
          .filter((id: number) => !isNaN(id));
      } else if (Array.isArray(req.ids)) {
        req.ids = req.ids
          .map((id: any) => parseInt(id, 10))
          .filter((id: number) => !isNaN(id));
      }
    }

    if (user) {
      req.callerEmail = user.email;
      req.callerUnitId = user.unitId;
      req.callerJobCode = user.jobTitleCode;
      req.callerEmployeeCode = user.employeeCode || user.username;
      req.callerUserId = user.id;
    }

    if (req.assignableOnly === 'true' || req.assignableOnly === true)
      req.assignableOnly = true;
    if (req.crossDepartment === 'true' || req.crossDepartment === true)
      req.crossDepartment = true;

    const roles: string[] = Array.isArray(user?.roles) ? user.roles : [];
    const perms: string[] = Array.isArray(user?.permissionsFlatten) ? user.permissionsFlatten : [];
    const isAdmin =
      user?.isAdmin ||
      perms.includes('*') ||
      perms.includes('*:*') ||
      perms.includes('HRM_EMPLOYEE:MANAGE') ||
      perms.includes('HRM_EMPLOYEE:*') ||
      perms.includes('SYSTEM:*') ||
      roles.some((r: any) => {
        const s = typeof r === 'string' ? r : r?.name || '';
        return s.toLowerCase().includes('admin') || s.toLowerCase().includes('quản trị viên hệ thống');
      });

    if (isAdmin) {
      delete req.callerUnitId;
    } else if (req.callerUnitId) {
      const callerUnitId = parseInt(req.callerUnitId, 10);
      try {
        const descRes: any = await firstValueFrom(
          this.orgService.GetDescendants({ id: callerUnitId }, metadata),
        );
        const allowedIds: number[] =
          Array.isArray(descRes?.ids) && descRes.ids.length > 0
            ? descRes.ids.map((id: any) => parseInt(id, 10))
            : [callerUnitId];

        // Lãnh đạo có thể được phân công theo dõi thêm đơn vị khác (monitoredUnitIds)
        if (Array.isArray(user?.monitoredUnitIds) && user.monitoredUnitIds.length > 0) {
          user.monitoredUnitIds.forEach((mId: any) => {
            const parsed = parseInt(mId, 10);
            if (!isNaN(parsed) && !allowedIds.includes(parsed)) {
              allowedIds.push(parsed);
            }
          });
        }

        req.descendantUnitIds = allowedIds;

        // Nếu client có truyền lọc departmentId cụ thể:
        if (req.departmentId) {
          const reqDeptId = parseInt(req.departmentId, 10);
          if (!allowedIds.includes(reqDeptId)) {
            // Không thuộc thẩm quyền quản lý -> bỏ filter để trả về toàn bộ phạm vi được phép
            delete req.departmentId;
          }
        }
      } catch (e) {
        req.descendantUnitIds = [callerUnitId];
      }

      if (req.assignableOnly) {
        req.excludeEmployeeCode = req.callerEmployeeCode;
      }
    }

    const res: any = await this.executeWithDicts(
      firstValueFrom(this.employeeService.ListEmployees(req, metadata)),
      true,
      metadata,
    );

    if (res) {
      res.meta = res.meta || {};
      const allowedActions: string[] = [];

      if (isAdmin || perms.includes('HRM_EMPLOYEE:CREATE') || perms.includes('HRM_EMPLOYEE:*')) allowedActions.push('CREATE');
      if (isAdmin || perms.includes('HRM_EMPLOYEE:UPDATE') || perms.includes('HRM_EMPLOYEE:*')) allowedActions.push('EDIT');
      if (isAdmin || perms.includes('HRM_EMPLOYEE:DELETE') || perms.includes('HRM_EMPLOYEE:*')) allowedActions.push('DELETE');

      res.meta.allowedActions = allowedActions;
    }

    return res;
  }

  async getDetail(id: string, metadata?: Metadata) {
    return this.executeWithDicts(
      firstValueFrom(this.employeeService.GetEmployee({ id: parseInt(id) }, metadata)),
      false,
      metadata,
    );
  }

  async create(body: any, metadata?: Metadata) {
    if (body.departmentId) {
      try {
        const resOrg: any = await firstValueFrom(
          this.orgService.GetOrganizations({ ids: [parseInt(body.departmentId)] }, metadata),
        );
        if (resOrg?.nodes?.[0]?.hierarchyPath) {
          body.departmentPath = resOrg.nodes[0].hierarchyPath;
        }
      } catch (e) {}
    }

    const res = await this.executeWithDicts(
      firstValueFrom(this.employeeService.CreateEmployee(body, metadata)),
      false,
      metadata,
    );
    if (res?.data?.employeeCode) {
      const effectiveJobTitleId =
        body.partyTitleId ||
        res.data.partyTitleId ||
        res.data.jobTitle?.id ||
        res.data.jobTitleId ||
        0;
      await firstValueFrom(
        this.orgService.SyncStaffingSlot({
          employeeCode: res.data.employeeCode,
          unitId: res.data.department?.id || res.data.departmentId || 0,
          jobTitleId: effectiveJobTitleId,
          isActive:
            res.data.employmentStatus !== 'retired' &&
            res.data.employmentStatus !== 'resigned',
          slotOrder: body.slotOrder ? parseInt(body.slotOrder, 10) : 0,
        }, metadata),
      ).catch(() => {});
    }
    return res;
  }

  async update(id: string, body: any, metadata?: Metadata) {
    const payload = { ...body, id: parseInt(id) };

    if (payload.departmentId) {
      try {
        const resOrg: any = await firstValueFrom(
          this.orgService.GetOrganizations({ ids: [parseInt(payload.departmentId)] }, metadata),
        );
        if (resOrg?.nodes?.[0]?.hierarchyPath) {
          payload.departmentPath = resOrg.nodes[0].hierarchyPath;
        }
      } catch (e) {}
    }

    const res = await this.executeWithDicts(
      firstValueFrom(this.employeeService.UpdateEmployee(payload, metadata)),
      false,
      metadata,
    );
    if (res?.data?.employeeCode) {
      const effectiveJobTitleId =
        payload.partyTitleId ||
        res.data.partyTitleId ||
        res.data.jobTitle?.id ||
        res.data.jobTitleId ||
        0;
      await firstValueFrom(
        this.orgService.SyncStaffingSlot({
          employeeCode: res.data.employeeCode,
          unitId: res.data.department?.id || res.data.departmentId || 0,
          jobTitleId: effectiveJobTitleId,
          isActive:
            res.data.employmentStatus !== 'retired' &&
            res.data.employmentStatus !== 'resigned',
          slotOrder: payload.slotOrder ? parseInt(payload.slotOrder, 10) : 0,
        }, metadata),
      ).catch(() => {});
    }
    return res;
  }

  async delete(id: string, metadata?: Metadata) {
    // 1. Lấy mã NV trước khi xóa
    let empCode = '';
    try {
      const emp = await this.getDetail(id, metadata);
      empCode = emp?.data?.employeeCode || '';
    } catch (e) {
      // ignore
    }

    // 2. Xóa
    const res = await firstValueFrom(
      this.employeeService.DeleteEmployee({ id: parseInt(id) }, metadata),
    ).catch((e: any) => {
      throw new InternalServerErrorException(e.message || 'RPC Call Failed');
    });

    // 3. Giải phóng slot nếu có mã NV
    if (empCode) {
      await firstValueFrom(
        this.orgService.SyncStaffingSlot({
          employeeCode: empCode,
          unitId: 0,
          jobTitleId: 0,
          isActive: false,
        }, metadata)
      ).catch(() => {});
    }

    return res;
  }
}
