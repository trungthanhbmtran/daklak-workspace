import { Module } from '@nestjs/common';
import { OrganizationsService } from './organizations.service';
import { OrganizationsController } from './organizations.controller';
// Không cần import PrismaModule vào imports vì đã để @Global() ở trên
// Nếu không dùng @Global, bạn phải thêm PrismaModule vào imports: []

@Module({
  controllers: [OrganizationsController],
  providers: [OrganizationsService],
  exports: [OrganizationsService], // Export nếu module User cần dùng
})
export class OrganizationsModule {}