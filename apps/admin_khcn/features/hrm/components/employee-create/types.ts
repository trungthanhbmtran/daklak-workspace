import * as z from "zod";

export const employeeCreateSchema = z.object({
  firstname: z.string().min(1, "Vui lòng nhập họ và tên đệm"),
  lastname: z.string().min(1, "Vui lòng nhập tên chính"),
  gender: z.string().optional(),
  employeeCode: z.string().optional(),
  email: z.string().optional(),
  phone: z.string().optional(),
  identityCard: z.string().optional(),
  address: z.string().optional(),
  departmentId: z.number({ message: "Vui lòng chọn cơ quan, đơn vị công tác" }),
  jobTitleId: z.number().optional(),
  partyTitleId: z.number().optional(),
  civilServantRankId: z.number().optional(),
  slotOrder: z.number().optional(),
  startDate: z.string().optional(),
  birthday: z.string().optional(),
  employmentStatus: z.string().optional(),
  avatar: z.string().optional(),
});

export type EmployeeCreateFormValues = z.infer<typeof employeeCreateSchema>;
