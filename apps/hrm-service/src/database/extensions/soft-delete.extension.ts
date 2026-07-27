import { Prisma } from '../../generated/prisma/client';

const softDeleteModels = ['Task', 'TaskStep', 'TaskAttachment', 'TaskComment', 'Employee'];

export const softDeleteExtension = Prisma.defineExtension((client) => {
  return client.$extends({
    name: 'softDelete',
    query: {
      $allModels: {
        async findMany({ model, args, query }) {
          if (model && softDeleteModels.includes(model as string)) {
            args.where = { ...args.where, isDeleted: false };
          }
          return query(args);
        },
        async findFirst({ model, args, query }) {
          if (model && softDeleteModels.includes(model as string)) {
            args.where = { ...args.where, isDeleted: false };
          }
          return query(args);
        },
        async findUnique({ model, args, query }) {
          if (model && softDeleteModels.includes(model as string)) {
            const result = await query(args);
            if (result && (result as any).isDeleted) {
              return null;
            }
            return result;
          }
          return query(args);
        },
        async count({ model, args, query }) {
          if (model && softDeleteModels.includes(model as string)) {
            args.where = { ...args.where, isDeleted: false };
          }
          return query(args);
        },
        async aggregate({ model, args, query }) {
          if (model && softDeleteModels.includes(model as string)) {
            args.where = { ...args.where, isDeleted: false };
          }
          return query(args);
        },
        async delete({ model, args, query }) {
          if (model && softDeleteModels.includes(model as string)) {
            return (client as any)[model].update({
              ...args,
              data: { isDeleted: true },
            });
          }
          return query(args);
        },
        async deleteMany({ model, args, query }) {
          if (model && softDeleteModels.includes(model as string)) {
            return (client as any)[model].updateMany({
              ...args,
              data: { isDeleted: true },
            });
          }
          return query(args);
        },
      },
    },
  });
});
