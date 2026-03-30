import { PrismaClient } from '@prisma/client';

export abstract class BaseRepository<T, CreateDto, UpdateDto, QueryDto> {
    constructor(
        protected readonly prisma: PrismaClient,
        protected readonly model: any,
    ) { }

    async create(data: CreateDto): Promise<T> {
        return this.model.create({ data });
    }

    async findAll(query: QueryDto): Promise<{ rows: T[]; count: number }> {
        const { skip, take, where, orderBy } = this.prepareQuery(query);
        const [rows, count] = await Promise.all([
            this.model.findMany({ skip, take, where, orderBy }),
            this.model.count({ where }),
        ]);
        return { rows, count };
    }

    async findById(id: string): Promise<T | null> {
        return this.model.findUnique({ where: { id } });
    }

    async update(id: string, data: UpdateDto): Promise<T> {
        return this.model.update({ where: { id }, data });
    }

    async delete(id: string): Promise<T> {
        return this.model.delete({ where: { id } });
    }

    protected abstract prepareQuery(query: QueryDto): {
        skip?: number;
        take?: number;
        where?: any;
        orderBy?: any;
    };
}
