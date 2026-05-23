import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';

@Injectable()
export class KpisService {
  constructor(private prisma: PrismaService) {}

  async findPeriods() {
    return this.prisma.kpiPeriod.findMany();
  }

  async createPeriod(data: { name: string; startDate: Date; endDate: Date }) {
    return this.prisma.kpiPeriod.create({ data });
  }

  async findCriteria() {
    return this.prisma.kpiCriteria.findMany();
  }

  async createEvaluation(data: {
    employeeCode: string;
    periodId: number;
    details: { criteriaId: number; selfScore: number; notes?: string }[];
  }) {
    return this.prisma.kpiEvaluation.create({
      data: {
        employeeCode: data.employeeCode,
        periodId: data.periodId,
        status: 'SUBMITTED',
        details: {
          create: data.details,
        },
      },
    });
  }

  async findEvaluationsByEmployee(employeeCode: string) {
    return this.prisma.kpiEvaluation.findMany({
      where: { employeeCode },
      include: {
        period: true,
        details: {
          include: {
            criteria: true,
          },
        },
      },
    });
  }
}
