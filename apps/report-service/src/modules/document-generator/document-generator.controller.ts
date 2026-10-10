import { Controller } from '@nestjs/common';
import { GrpcMethod, RpcException } from '@nestjs/microservices';
import { DocumentGeneratorService } from './document-generator.service';

@Controller()
export class DocumentGeneratorController {
  constructor(private readonly docGenService: DocumentGeneratorService) {}

  @GrpcMethod('ReportService', 'GenerateDocument')
  async generateDocument(data: { payload: string }) {
    try {
      const body = JSON.parse(data.payload) as {
        templateName: string;
        data: any;
      };

      if (!body.templateName) {
        throw new RpcException('Thiếu tên file template');
      }

      // Generate document buffer
      const buffer = await this.docGenService.generateDocx(body.templateName, body.data || {});
      
      // Convert to base64 to send via gRPC JSON
      const base64Data = buffer.toString('base64');

      return {
        success: true,
        message: 'Tạo tài liệu thành công',
        data: JSON.stringify({ fileData: base64Data, fileName: `Export_${Date.now()}.docx` }),
      };
    } catch (error: any) {
      throw new RpcException({
        code: 3,
        message: error.message || 'Lỗi khi tạo tài liệu',
      });
    }
  }
}
