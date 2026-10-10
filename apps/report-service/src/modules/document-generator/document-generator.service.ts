import { Injectable, Logger } from '@nestjs/common';
import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';
import * as fs from 'fs';
import * as path from 'path';
import { RpcException } from '@nestjs/microservices';

@Injectable()
export class DocumentGeneratorService {
  private readonly logger = new Logger(DocumentGeneratorService.name);

  /**
   * Tạo file Word (.docx) từ template dựa trên dữ liệu đầu vào.
   * @param templateName Tên file template (VD: 'Mau_05_QDKT.docx')
   * @param data Dữ liệu JSON để map vào template
   * @returns Buffer của file docx kết quả
   */
  async generateDocx(templateName: string, data: any): Promise<Buffer> {
    try {
      // Xác định đường dẫn file template. Mặc định để trong thư mục assets/templates.
      const templatePath = path.resolve(process.cwd(), 'assets', 'templates', templateName);
      
      if (!fs.existsSync(templatePath)) {
        this.logger.error(`Template not found: ${templatePath}`);
        throw new RpcException(`Không tìm thấy mẫu báo cáo: ${templateName}`);
      }

      const content = fs.readFileSync(templatePath, 'binary');
      const zip = new PizZip(content);
      const doc = new Docxtemplater(zip, {
        paragraphLoop: true,
        linebreaks: true,
      });

      // Render dữ liệu vào template
      doc.render(data);

      // Trả về dạng buffer
      const buf = doc.getZip().generate({
        type: 'nodebuffer',
        compression: 'DEFLATE',
      });

      return buf;
    } catch (error: any) {
      this.logger.error(`Lỗi sinh file tài liệu: ${error.message}`, error.stack);
      throw new RpcException(`Lỗi khi tạo file tài liệu: ${error.message}`);
    }
  }
}
