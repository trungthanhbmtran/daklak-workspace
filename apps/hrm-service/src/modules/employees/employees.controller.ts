import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { EmployeesService } from './employees.service';

@Controller()
export class EmployeesController {
  constructor(private readonly employees: EmployeesService) {}

  @GrpcMethod('EmployeeHandlers', 'CreateEmployee')
  create(data: any) {
    return this.employees.create({
      firstname: data.firstname ?? '',
      lastname: data.lastname ?? '',
      employeeCode: data.employeeCode,
      email: data.email,
      phone: data.phone,
      gender: data.gender,
      birthday: data.birthday,
      identityCard: data.identityCard,
      departmentId: data.departmentId ?? 0,
      jobTitleId: data.jobTitleId ?? 0,
      startDate: data.startDate,
      status: data.status,
      address: data.address,
    });
  }

  @GrpcMethod('EmployeeHandlers', 'UpdateEmployee')
  update(data: { id: number; firstname?: string; lastname?: string; email?: string; phone?: string; gender?: string; birthday?: string; identityCard?: string; departmentId?: number; jobTitleId?: number; status?: string; address?: string; avatar?: string }) {
    return this.employees.update(data.id, data);
  }

  @GrpcMethod('EmployeeHandlers', 'DeleteEmployee')
  delete(data: { id: number }) {
    return this.employees.delete(data.id);
  }

  @GrpcMethod('EmployeeHandlers', 'GetEmployee')
  getOne(data: { id: number }) {
    return this.employees.getOne(data.id);
  }

  @GrpcMethod('EmployeeHandlers', 'ListEmployees')
  list(data: { page?: number; pageSize?: number; keyword?: string; departmentId?: number; jobTitleId?: number; status?: string; includeChildren?: boolean }) {
    return this.employees.list(data);
  }
}
