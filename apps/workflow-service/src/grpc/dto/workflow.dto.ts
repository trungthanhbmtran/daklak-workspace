import { IsString, IsNotEmpty, IsOptional, IsObject, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class WorkflowNodeDto {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsNotEmpty()
  nodeKey: string;

  @IsString()
  @IsOptional()
  type?: string;

  @IsString()
  @IsOptional()
  name?: string;
  
  @IsOptional()
  propertiesJson?: string;
}

export class WorkflowEdgeDto {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsNotEmpty()
  sourceNodeId: string;

  @IsString()
  @IsNotEmpty()
  targetNodeId: string;
}

export class WorkflowDefinitionDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WorkflowNodeDto)
  nodes: WorkflowNodeDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WorkflowEdgeDto)
  edges: WorkflowEdgeDto[];
}

export class CreateWorkflowGrpcDto {
  @IsString()
  @IsNotEmpty()
  code: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsObject()
  @IsOptional()
  @ValidateNested()
  @Type(() => WorkflowDefinitionDto)
  definition?: WorkflowDefinitionDto;
}

export class StartWorkflowGrpcDto {
  @IsString()
  @IsNotEmpty()
  workflowId: string;

  @IsObject()
  @IsOptional()
  initialContext?: any;

  @IsString()
  @IsNotEmpty()
  initiatorId: string;
}

export class FindOneWorkflowGrpcDto {
  @IsString()
  @IsNotEmpty()
  id: string;
}

export class UpdateWorkflowGrpcDto {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsOptional()
  code?: string;

  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsObject()
  @IsOptional()
  @ValidateNested()
  @Type(() => WorkflowDefinitionDto)
  definition?: WorkflowDefinitionDto;
}

export class PublishWorkflowGrpcDto {
  @IsString()
  @IsNotEmpty()
  id: string;
}

export class ApplyModuleGrpcDto {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsNotEmpty()
  moduleCode: string;
export class ListWorkflowsGrpcDto {
  @IsOptional()
  skip?: number;

  @IsOptional()
  take?: number;

  @IsString()
  @IsOptional()
  search?: string;
}

export class ListInstancesGrpcDto {
  @IsOptional()
  skip?: number;

  @IsOptional()
  take?: number;

  @IsString()
  @IsOptional()
  workflowId?: string;

  @IsString()
  @IsOptional()
  status?: string;

  @IsString()
  @IsOptional()
  search?: string;
}

export class EmptyGrpcDto {}
