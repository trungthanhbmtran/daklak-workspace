import { IsString, IsNotEmpty, IsInt, IsOptional, ValidateNested, IsArray } from 'class-validator';
import { Type } from 'class-transformer';

export class UploadRequestDto {
  @IsString()
  @IsNotEmpty()
  originalName: string;

  @IsString()
  @IsNotEmpty()
  mimeType: string;

  @IsInt()
  @Type(() => Number)
  size: number;

  @IsString()
  @IsNotEmpty()
  ownerId: string;
}

export class ConfirmRequestDto {
  @IsString()
  @IsNotEmpty()
  fileId: string;
}

export class MediaIdRequestDto {
  @IsString()
  @IsNotEmpty()
  fileId: string;
}

export class InitMultipartRequestDto {
  @IsString()
  @IsNotEmpty()
  originalName: string;

  @IsString()
  @IsNotEmpty()
  mimeType: string;

  @IsInt()
  @Type(() => Number)
  size: number;

  @IsString()
  @IsNotEmpty()
  ownerId: string;
}

export class GetMultipartUrlsRequestDto {
  @IsString()
  @IsNotEmpty()
  fileKey: string;

  @IsString()
  @IsNotEmpty()
  uploadId: string;

  @IsInt()
  partsCount: number;
}

export class PartInfoDto {
  @IsInt()
  partNumber: number;

  @IsString()
  @IsNotEmpty()
  eTag: string;
}

export class CompleteMultipartRequestDto {
  @IsString()
  @IsNotEmpty()
  fileId: string;

  @IsString()
  @IsNotEmpty()
  fileKey: string;

  @IsString()
  @IsNotEmpty()
  uploadId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PartInfoDto)
  parts: PartInfoDto[];
}
