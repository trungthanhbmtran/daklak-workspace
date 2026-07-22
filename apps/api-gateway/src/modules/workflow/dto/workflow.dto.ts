import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsObject, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class PositionDto {
  @ApiProperty({ required: false })
  @IsOptional()
  x?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  y?: number;
}

export class MeasuredDto {
  @ApiProperty({ required: false })
  @IsOptional()
  width?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  height?: number;
}

export class WorkflowNodeDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  id: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  nodeKey?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  type?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  propertiesJson?: string;
  
  // React Flow Properties
  @ApiProperty({ required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => PositionDto)
  position?: PositionDto;

  @ApiProperty({ required: false })
  @IsObject()
  @IsOptional()
  data?: Record<string, any>;

  @ApiProperty({ required: false })
  @IsOptional()
  width?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  height?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  selected?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => PositionDto)
  positionAbsolute?: PositionDto;

  @ApiProperty({ required: false })
  @IsOptional()
  dragging?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => MeasuredDto)
  measured?: MeasuredDto;
}

export class WorkflowEdgeDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  id: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  sourceNodeId?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  targetNodeId?: string;
  
  // React Flow Properties
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  source?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  target?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  sourceHandle?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  targetHandle?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  animated?: boolean;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  label?: string;

  @ApiProperty({ required: false })
  @IsObject()
  @IsOptional()
  data?: Record<string, any>;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  type?: string;
}

export class WorkflowDefinitionDto {
  @ApiProperty({ type: [WorkflowNodeDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WorkflowNodeDto)
  nodes: WorkflowNodeDto[];

  @ApiProperty({ type: [WorkflowEdgeDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WorkflowEdgeDto)
  edges: WorkflowEdgeDto[];
}

export class CreateWorkflowDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ required: false, type: WorkflowDefinitionDto })
  @IsObject()
  @IsOptional()
  @ValidateNested()
  @Type(() => WorkflowDefinitionDto)
  definition?: WorkflowDefinitionDto;
}

export class UpdateWorkflowDto extends CreateWorkflowDto { }

export class StartWorkflowDto {
  @ApiProperty({ required: false })
  @IsObject()
  @IsOptional()
  initialContext?: any;
}

export class ResumeWorkflowDto {
  @ApiProperty({ required: false })
  @IsObject()
  @IsOptional()
  actionData?: any;
}

export class ApplyModuleDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  moduleCode: string;
}
