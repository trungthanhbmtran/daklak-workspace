"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { organizationUnitSchema, type OrganizationUnitFormValues } from "../schemas";
import { useOrganizationContext } from "../context/OrganizationContext";

import { IdentityFields } from "./organization-form/IdentityFields";
import { CategoryFields } from "./organization-form/CategoryFields";

export function OrganizationForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { state, actions, meta } = useOrganizationContext();
  const { flatUnits } = state;

  const parentIdStr = searchParams.get('parentId');
  const parentId = parentIdStr ? Number(parentIdStr) : undefined;
  const parentUnit = parentId != null ? flatUnits.find((u) => u.id === parentId) : null;

  const form = useForm<OrganizationUnitFormValues>({
    resolver: zodResolver(organizationUnitSchema) as unknown as Resolver<OrganizationUnitFormValues>,
    defaultValues: { code: "", name: "", shortName: "", categoryCode: "", domainIds: [], scope: "" },
  });

  useEffect(() => {
    form.reset({ code: "", name: "", shortName: "", categoryCode: "", domainIds: [], scope: "" });
  }, [parentId, form]);

  const handleSubmit = async (values: OrganizationUnitFormValues) => {
    await actions.createUnit({
      code: values.code.trim(),
      name: values.name.trim(),
      shortName: values.shortName?.trim() || undefined,
      categoryCode: values.categoryCode,
      parentId: parentId ?? undefined,
    });
    router.push('/services/admin/organization');
  };

  const handleCancel = () => {
    router.push('/services/admin/organization');
  };

  return (
    <Card className="flex-1 flex flex-col overflow-hidden rounded-lg shadow-none border-border">
      <CardHeader className="pb-4 shrink-0 bg-muted/10 border-b">
        <div className="space-y-0.5">
          <p className="text-xs text-muted-foreground">
            {parentUnit ? `Trực thuộc: ${parentUnit.name}` : "Đơn vị cấp gốc"}
          </p>
          <h2 className="text-base font-semibold leading-none tracking-tight">
            Thêm đơn vị tổ chức
          </h2>
        </div>
      </CardHeader>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="flex flex-1 flex-col overflow-hidden bg-background">
          <CardContent className="flex-1 overflow-y-auto pt-6 space-y-6">
            <IdentityFields />
            <Separator />
            <CategoryFields />
          </CardContent>

          <Separator />

          <CardFooter className="pt-4 pb-4 flex justify-end gap-2 shrink-0 bg-muted/10 border-t">
            <Button type="button" variant="outline" size="sm" onClick={handleCancel}>
              Hủy
            </Button>
            <Button type="submit" size="sm" disabled={meta.isCreating}>
              {meta.isCreating ? "Đang thêm..." : (
                <>
                  <Plus className="h-4 w-4 mr-1.5" />
                  Thêm đơn vị
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
