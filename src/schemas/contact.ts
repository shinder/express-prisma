import { z } from "zod";
import moment from "moment";

export const createContactSchema = z.object({
  name: z.string().min(2, "姓名至少需要兩個字"),
  email: z.string().email({ message: "請輸入有效的電子郵件格式" }),
  mobile: z.string().optional(),
  address: z.string().optional(),
  birthday: z
    .string()
    .optional()
    .refine((val) => {
      if (!val || val.trim() === "") return true;
      return moment(val, "YYYY-MM-DD", true).isValid();
    }, "無效的日期格式，請使用 YYYY-MM-DD 格式")
    .transform((val) => {
      if (!val || val.trim() === "") return null;
      const momentDate = moment(val, "YYYY-MM-DD", true);
      return momentDate.isValid() ? momentDate.toDate() : null;
    })
});