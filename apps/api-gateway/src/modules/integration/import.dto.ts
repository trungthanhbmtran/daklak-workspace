import { IsString, IsArray, ValidateNested, IsIn, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';

export class ParsedEndpointDto {
  @IsString()
  @IsNotEmpty()
  method: string;

  @IsString()
  @IsNotEmpty()
  path: string;

  @IsString()
  name: string;

  @IsString()
  description: string;
}

export class ImportCommitDto {
  @IsString()
  @IsNotEmpty()
  systemName: string;

  @IsString()
  @IsNotEmpty()
  baseUrl: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ParsedEndpointDto)
  endpoints: ParsedEndpointDto[];

  @IsString()
  @IsIn(['OVERWRITE', 'IGNORE'])
  conflictStrategy: 'OVERWRITE' | 'IGNORE';
}
