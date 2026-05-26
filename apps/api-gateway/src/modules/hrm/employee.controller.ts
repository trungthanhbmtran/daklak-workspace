import { Controller, Get, Post, Put, Delete, Body, Param, Query, Inject, UseGuards, OnModuleInit } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { firstValueFrom } from 'rxjs';
import { MICROSERVICES } from '../../core/constants/services';
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard';

@ApiTags('HRM')
@Controller('admin/hrm/employees')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class EmployeeController implements OnModuleInit {
  private employeeService: any;
  private orgService: any;

  constructor(
    @Inject(MICROSERVICES.EMPLOYEE.SYMBOL) private readonly client: any,
    @Inject(MICROSERVICES.ORGANIZATION.SYMBOL) private readonly orgClient: any,
  ) { }

  onModuleInit() {
    this.employeeService = this.client.getService(MICROSERVICES.EMPLOYEE.SERVICE);
    this.orgService = this.orgClient.getService(MICROSERVICES.ORGANIZATION.SERVICE);
  }

  /**
   * Lấy danh sách map của JobTitle và Unit từ user-service
   */
  private async fetchDictionaries() {
    try {
      const [jobTitlesRes, treeRes] = await Promise.all([
        firstValueFrom(this.orgService.ListJobTitles({})) as Promise<any>,
        firstValueFrom(this.orgService.GetFullTree({})) as Promise<any>,
      ]).catch(() => [{ items: [] }, { nodes: [] }]);

      const jtMap = new Map((jobTitlesRes?.items || []).map((jt: any) => [jt.id, { name: jt.name, code: jt.code }]));
      const unitMap = new Map();
      const flattenNodes = (nodes: any[]) => {
        for (const n of nodes) {
          if (n.id) unitMap.set(n.id, { name: n.name, code: n.code });
          if (n.children?.length) flattenNodes(n.children);
        }
      };
      flattenNodes(treeRes?.nodes || []);

      return { jtMap, unitMap };
    } catch (error) {
      return { jtMap: new Map(), unitMap: new Map() };
    }
  }

  /**
   * Ánh xạ thông tin chức danh, phòng ban vào nhân viên
   */
  private enrichEmployee(emp: any, jtMap: Map<number, any>, unitMap: Map<number, any>) {
    if (!emp) return emp;
    const lookup = (map: Map<number, any>, id?: number) => id && id > 0 ? map.get(id) || { name: '', code: '' } : { name: '', code: '' };

    return {
      ...emp,
      department: { id: emp.departmentId, ...lookup(unitMap, emp.departmentId) },
      jobTitle: { id: emp.jobTitleId, ...lookup(jtMap, emp.jobTitleId) },
      civilServantRank: { id: emp.civilServantRankId, ...lookup(jtMap, emp.civilServantRankId) },
      partyTitle: { id: emp.partyTitleId, ...lookup(jtMap, emp.partyTitleId) },
    };
  }

  @Get()
  async list(@Query() query: any) {
    const req = { ...query };
    if (req.page) req.page = parseInt(req.page);
    if (req.pageSize) req.pageSize = parseInt(req.pageSize);
    if (req.departmentId) req.departmentId = parseInt(req.departmentId);
    // Nhận thêm params từ client
    if (req.civilServantRankId) req.civilServantRankId = parseInt(req.civilServantRankId);
    if (req.partyTitleId) req.partyTitleId = parseInt(req.partyTitleId);

    const [res, dicts] = await Promise.all([
      firstValueFrom(this.employeeService.ListEmployees(req)) as Promise<any>,
      this.fetchDictionaries()
    ]);

    if (res && res.data) {
      res.data = res.data.map((e: any) => this.enrichEmployee(e, dicts.jtMap, dicts.unitMap));
    }
    return res;
  }

  @Get(':id')
  async getDetail(@Param('id') id: string) {
    const [res, dicts] = await Promise.all([
      firstValueFrom(this.employeeService.GetEmployee({ id: parseInt(id) })) as Promise<any>,
      this.fetchDictionaries()
    ]);

    if (res && res.data) {
      res.data = this.enrichEmployee(res.data, dicts.jtMap, dicts.unitMap);
    }
    return res;
  }

  @Post()
  async create(@Body() body: any) {
    const [res, dicts] = await Promise.all([
      firstValueFrom(this.employeeService.CreateEmployee(body)) as Promise<any>,
      this.fetchDictionaries()
    ]);

    if (res && res.data) {
      res.data = this.enrichEmployee(res.data, dicts.jtMap, dicts.unitMap);
    }
    return res;
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() body: any) {
    const payload = { ...body, id: parseInt(id) };
    const [res, dicts] = await Promise.all([
      firstValueFrom(this.employeeService.UpdateEmployee(payload)) as Promise<any>,
      this.fetchDictionaries()
    ]);

    if (res && res.data) {
      res.data = this.enrichEmployee(res.data, dicts.jtMap, dicts.unitMap);
    }
    return res;
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return firstValueFrom(this.employeeService.DeleteEmployee({ id: parseInt(id) }));
  }
}
