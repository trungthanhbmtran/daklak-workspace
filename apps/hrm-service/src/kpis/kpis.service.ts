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
    employeeId: number;
    periodId: number;
    details: { criteriaId: number; selfScore: number; notes?: string }[];
  }) {
    return this.prisma.kpiEvaluation.create({
      data: {
        employeeId: data.employeeId,
        periodId: data.periodId,
        status: 'SUBMITTED',
        details: {
          create: data.details,
        },
      },
    });
  }

  async findEvaluationsByEmployee(employeeId: number) {
    return this.prisma.kpiEvaluation.findMany({
      where: { employeeId },
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
