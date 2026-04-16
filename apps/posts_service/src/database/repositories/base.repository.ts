import { PrismaClient } from '@generated/prisma/client';

export abstract class BaseRepository<T, CreateDto, UpdateDto, QueryDto> {
  constructor(
    protected readonly prisma: PrismaClient,
    protected readonly model: any, // Prisma models don't share a base type easily
  ) {}

  async create(data: CreateDto): Promise<T> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
    return (await this.model.create({ data })) as T;
  }

  async findAll(query: QueryDto): Promise<{ rows: T[]; count: number }> {
    const { skip, take, where, orderBy } = this.prepareQuery(query);
    const [rows, count] = (await Promise.all([
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
      this.model.findMany({ skip, take, where, orderBy }),
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
      this.model.count({ where }),
    ])) as [T[], number];
    return { rows, count };
  }

  async findById(id: string): Promise<T | null> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
    return (await this.model.findUnique({ where: { id } })) as T | null;
  }

  async update(id: string, data: UpdateDto): Promise<T> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
    return (await this.model.update({ where: { id }, data })) as T;
  }

  async delete(id: string): Promise<T> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
    return (await this.model.delete({ where: { id } })) as T;
  }

  protected abstract prepareQuery(query: QueryDto): {
    skip?: number;
    take?: number;
    where?: unknown;
    orderBy?: unknown;
  };
}
