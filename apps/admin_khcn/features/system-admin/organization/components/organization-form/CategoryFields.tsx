import { useFormContext } from "react-hook-form";
import { Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { UnitTypeSelector } from "../UnitTypeSelector";
import { useGetCategoryByGroup } from "../../../categories/hooks/useCategoryApi";
import { parseUnitTypeCategoryMeta, UNIT_TYPE_CATEGORY_GROUP } from "../../hooks/useUnitTypeCategories";

export function CategoryFields() {
  const { control, watch } = useFormContext();
  
  // eslint-disable-next-line react-hooks/incompatible-library
  const categoryCode = watch("categoryCode");
  const { data: categoryItems = [] } = useGetCategoryByGroup(UNIT_TYPE_CATEGORY_GROUP);
  const selectedCat  = categoryItems.find((c) => c.code === categoryCode);
  const categoryMeta = selectedCat ? parseUnitTypeCategoryMeta(selectedCat) : null;

  return (
    <div className="space-y-3">
      <div>
        <p className="text-sm font-medium leading-none">
          Phân loại tổ chức <span className="text-destructive">*</span>
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Xác định thẩm quyền ký duyệt và luồng nghiệp vụ
        </p>
      </div>
      <FormField control={control} name="categoryCode"
        render={({ field }) => (
          <FormItem>
            <FormControl>
              <UnitTypeSelector value={field.value} onChange={field.onChange} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      {categoryMeta && (
        <div className="rounded-md border bg-muted/30 p-3 space-y-2">
          <div className="flex flex-wrap gap-1.5">
            {categoryMeta.signingAuthority && (
              <Badge variant="secondary" className="text-xs">
                {categoryMeta.signingAuthority === "FULL" && "Toàn quyền ký"}
                {categoryMeta.signingAuthority === "DELEGATED" && "Ký theo ủy quyền"}
                {categoryMeta.signingAuthority === "INTERNAL" && "Nội bộ"}
              </Badge>
            )}
            {categoryMeta.politicalSystem && (
              <Badge variant="outline" className="text-xs font-mono">
                {categoryMeta.politicalSystem}
              </Badge>
            )}
          </div>
          {categoryMeta.purposeNote && (
            <p className="text-xs text-muted-foreground leading-relaxed">
              {categoryMeta.purposeNote}
            </p>
          )}
          {categoryMeta.signingNote && (
            <p className="text-xs text-muted-foreground flex gap-1.5 leading-relaxed">
              <Info className="h-3.5 w-3.5 shrink-0 mt-0.5" />
              {categoryMeta.signingNote}
            </p>
          )}
        </div>
      )}
      {categoryMeta?.requiredFields?.some(f => f === "domainIds") && (
        <p className="text-xs text-muted-foreground border border-dashed rounded-md px-3 py-2">
          Sau khi tạo đơn vị, vào tab <strong>Phạm vi phụ trách</strong> để thiết lập lĩnh vực và địa bàn.
        </p>
      )}
    </div>
  );
}
