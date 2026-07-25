import { Input } from "@/components/ui/input";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useFormContext } from "react-hook-form";

export function IdentityFields() {
  const { control } = useFormContext();

  return (
    <div className="space-y-4">
      <FormField control={control} name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              Tên đầy đủ <span className="text-destructive">*</span>
            </FormLabel>
            <FormControl>
              <Input placeholder="VD: Sở Khoa học và Công nghệ tỉnh Đắk Lắk" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <div className="grid grid-cols-2 gap-4">
        <FormField control={control} name="shortName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tên viết tắt</FormLabel>
              <FormControl>
                <Input {...field} placeholder="VD: SKHCN" className="font-mono" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField control={control} name="code"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Mã <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Input {...field} placeholder="SKHCN_DL" className="font-mono uppercase" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}
