import { IsString, IsNumber, IsArray, ValidateNested, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class UploadRequestDto {
  @IsString() originalName: string;
  @IsString() mimeType: string;
  @IsNumber() size: number;
  @IsString() ownerId: string;
}

export class ConfirmRequestDto {
  @IsString() fileId: string;
}

export class MediaIdRequestDto {
  @IsString() fileId: string;
}

export class InitMultipartRequestDto {
  @IsString() originalName: string;
  @IsString() mimeType: string;
  @IsNumber() size: number;
  @IsString() ownerId: string;
}

export class GetMultipartUrlsRequestDto {
  @IsString() fileKey: string;
  @IsString() uploadId: string;
  @IsNumber() partsCount: number;
}

export class PartInfoDto {
  @IsNumber() partNumber: number;
  @IsString() eTag: string;
}

export class CompleteMultipartRequestDto {
  @IsString() fileId: string;
  @IsString() fileKey: string;
  @IsString() uploadId: string;
  
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PartInfoDto)
  parts: PartInfoDto[];
}
