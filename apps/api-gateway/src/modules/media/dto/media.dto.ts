import { IsString, IsNotEmpty, IsInt, IsOptional, ValidateNested, IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class RequestUploadDto {
  @ApiProperty({ example: 'document.pdf' })
  @IsString()
  @IsNotEmpty()
  originalName: string;

  @ApiProperty({ example: 'application/pdf' })
  @IsString()
  @IsNotEmpty()
  mimeType: string;

  @ApiProperty({ example: 1048576 })
  @IsInt()
  @Type(() => Number)
  size: number;
}

export class ConfirmUploadDto {
  @ApiProperty({ example: 'uuid-123' })
  @IsString()
  @IsNotEmpty()
  fileId: string;
}

export class InitMultipartUploadDto {
  @ApiProperty({ example: 'video.mp4' })
  @IsString()
  @IsNotEmpty()
  originalName: string;

  @ApiProperty({ example: 'video/mp4' })
  @IsString()
  @IsNotEmpty()
  mimeType: string;

  @ApiProperty({ example: 524288000 })
  @IsInt()
  @Type(() => Number)
  size: number;
}

export class GetMultipartUrlsDto {
  @ApiProperty({ example: 'key/video.mp4' })
  @IsString()
  @IsNotEmpty()
  fileKey: string;

  @ApiProperty({ example: 'upload-id' })
  @IsString()
  @IsNotEmpty()
  uploadId: string;

  @ApiProperty({ example: 10 })
  @IsInt()
  partsCount: number;
}

export class PartDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  partNumber: number;

  @ApiProperty({ example: 'etag-123' })
  @IsString()
  @IsNotEmpty()
  eTag: string;
}

export class CompleteMultipartUploadDto {
  @ApiProperty({ example: 'uuid-123' })
  @IsString()
  @IsNotEmpty()
  fileId: string;

  @ApiProperty({ example: 'key/video.mp4' })
  @IsString()
  @IsNotEmpty()
  fileKey: string;

  @ApiProperty({ example: 'upload-id' })
  @IsString()
  @IsNotEmpty()
  uploadId: string;

  @ApiProperty({ type: [PartDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PartDto)
  parts: PartDto[];
}
