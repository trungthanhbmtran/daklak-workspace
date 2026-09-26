import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { PbacService } from './pbac.service';

@Controller()
export class PbacController {
  constructor(private readonly pbacService: PbacService) {}

  @GrpcMethod('PbacService', 'CreateUserGroup')
  async createUserGroup(data: any) {
    return this.pbacService.createUserGroup(data);
  }

  @GrpcMethod('PbacService', 'FindAllUserGroups')
  async findAllUserGroups() {
    return this.pbacService.findAllUserGroups();
  }

  @GrpcMethod('PbacService', 'FindOneUserGroup')
  async findOneUserGroup(data: { id: number }) {
    return this.pbacService.findOneUserGroup(data.id);
  }

  @GrpcMethod('PbacService', 'UpdateUserGroup')
  async updateUserGroup(data: any) {
    return this.pbacService.updateUserGroup(data.id, data);
  }

  @GrpcMethod('PbacService', 'DeleteUserGroup')
  async deleteUserGroup(data: { id: number }) {
    return this.pbacService.deleteUserGroup(data.id);
  }

  @GrpcMethod('PbacService', 'GetResources')
  async getResources() {
    return this.pbacService.getResources();
  }

  @GrpcMethod('PbacService', 'CreateResource')
  async createResource(data: any) {
    return this.pbacService.createResource(data);
  }

  @GrpcMethod('PbacService', 'UpdateResource')
  async updateResource(data: any) {
    return this.pbacService.updateResource(data.id, data);
  }

  @GrpcMethod('PbacService', 'DeleteResource')
  async deleteResource(data: { id: number }) {
    return this.pbacService.deleteResource(data.id);
  }
}
