import { IsString, IsOptional, IsInt, IsBoolean } from 'class-validator';

export class CreateDocumentGrpcDto {
  @IsString() @IsOptional() title?: string;
  @IsString() @IsOptional() content?: string;
  @IsString() @IsOptional() categoryId?: string;
  @IsString() @IsOptional() type?: string;
}

export class UpdateDocumentGrpcDto extends CreateDocumentGrpcDto {
  @IsString() id: string;
}

export class IdStringGrpcDto {
  @IsString() id: string;
}

export class ListDocumentsGrpcDto {
  @IsInt() @IsOptional() skip?: number;
  @IsInt() @IsOptional() take?: number;
  @IsString() @IsOptional() search?: string;
  @IsString() @IsOptional() categoryId?: string;
  @IsString() @IsOptional() type?: string;
  @IsString() @IsOptional() typeId?: string;
  @IsString() @IsOptional() fieldId?: string;
  @IsString() @IsOptional() status?: string;
  @IsString() @IsOptional() urgency?: string;
  @IsString() @IsOptional() startDate?: string;
  @IsString() @IsOptional() endDate?: string;
  @IsBoolean() @IsOptional() isPublic?: boolean;
  @IsInt() @IsOptional() fiscalYear?: number;
  @IsString() @IsOptional() transparencyCategory?: string;
  @IsBoolean() @IsOptional() isIncoming?: boolean;
  @IsString() @IsOptional() issuingAuthorityId?: string;
  @IsInt() @IsOptional() page?: number;
  @IsInt() @IsOptional() limit?: number;
}

export class ExtractMetadataGrpcDto {
  @IsString() fileId: string;
}

export class GetLogsGrpcDto {
  @IsString() documentId: string;
}

export class DocumentActionGrpcDto {
  @IsString() id: string;
  @IsString() actorId: string;
  @IsString() actorName: string;
  @IsString() @IsOptional() note?: string;
}

export class ReceiveDocumentGrpcDto {
  @IsString() id: string;
  @IsString() @IsOptional() actorId?: string;
  @IsString() @IsOptional() actorName?: string;
}

export class DossierCodeDto {
  @IsString() @IsOptional() id?: string;
  @IsString() @IsOptional() code?: string;
}

export class AnyGrpcDto {
  @IsOptional() id?: string;
  @IsOptional() anyField?: any; // Bypassing for complex any structures in this mass refactoring to avoid build breakage
}
