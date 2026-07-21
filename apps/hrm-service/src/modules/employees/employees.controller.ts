import { Controller } from '@nestjs/common';
import { GrpcMethod, Payload } from '@nestjs/microservices';
import { CreateEmployeeGrpcDto, UpdateEmployeeGrpcDto, IdGrpcDto, CodeGrpcDto, ListEmployeesGrpcDto } from './dto/employee.grpc.dto';
import { EmployeesService } from './employees.service';

@Controller()
export class EmployeesController {
  constructor(private readonly employees: EmployeesService) { }

  @GrpcMethod('EmployeeHandlers', 'CreateEmployee')
  create(@Payload() data: CreateEmployeeGrpcDto) {
    return this.employees.create({
      firstname: data.firstname ?? '',
      lastname: data.lastname ?? '',
      fullName: data.fullName ?? '',
      employeeCode: data.employeeCode,
      email: data.email,
      phone: data.phone,
      gender: data.gender,
      birthday: data.birthday,
      identityCard: data.identityCard,
      departmentId: data.departmentId ?? 0,
      jobTitleId: data.jobTitleId ?? 0,
      civilServantRankId: data.civilServantRankId ?? 0,
      partyTitleId: data.partyTitleId ?? 0,
      startDate: data.startDate,
      employmentStatus: data.status,
      address: data.address,
      avatar: data.avatar,
    });
  }

  @GrpcMethod('EmployeeHandlers', 'UpdateEmployee')
  update(@Payload() data: UpdateEmployeeGrpcDto) {
    return this.employees.update(data.id, data);
  }

  @GrpcMethod('EmployeeHandlers', 'DeleteEmployee')
  delete(@Payload() data: IdGrpcDto) {
    return this.employees.delete(data.id);
  }

  @GrpcMethod('EmployeeHandlers', 'GetEmployee')
  getOne(@Payload() data: IdGrpcDto) {
    return this.employees.getOne(data.id);
  }

  @GrpcMethod('EmployeeHandlers', 'GetEmployeeByCode')
  getByCode(@Payload() data: CodeGrpcDto) {
    return this.employees.getByCode(data.code);
  }

  @GrpcMethod('EmployeeHandlers', 'ListEmployees')
  list(@Payload() data: ListEmployeesGrpcDto) {
    return this.employees.list(data);
  }
}

