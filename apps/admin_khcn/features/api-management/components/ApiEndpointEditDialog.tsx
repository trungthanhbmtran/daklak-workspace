import React, { useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCreateEndpoint, useUpdateEndpoint } from "../hooks/useApiManagement";

const formSchema = z.object({
  method: z.string().min(1, "Vui lòng chọn phương thức"),
  pathTemplate: z.string().min(1, "Vui lòng nhập đường dẫn"),
  name: z.string().optional(),
  description: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  connectionId: string;
  endpoint?: any;
}

export function ApiEndpointEditDialog({ open, onOpenChange, connectionId, endpoint }: Props) {
  const createMut = useCreateEndpoint();
  const updateMut = useUpdateEndpoint();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      method: "GET",
      pathTemplate: "/",
      name: "",
      description: "",
    }
  });

  useEffect(() => {
    if (open) {
      if (endpoint) {
        let schemaObj: any = {};
        try {
          schemaObj = typeof endpoint.schema === 'string' ? JSON.parse(endpoint.schema) : (endpoint.schema || {});
        } catch { }
        form.reset({
          method: endpoint.method,
          pathTemplate: endpoint.pathTemplate,
          name: schemaObj.name || "",
          description: schemaObj.description || "",
        });
      } else {
        form.reset({
          method: "GET",
          pathTemplate: "/",
          name: "",
          description: "",
        });
      }
    }
  }, [open, endpoint, form]);

  const onSubmit = (values: FormValues) => {
    const data = {
      method: values.method,
      pathTemplate: values.pathTemplate,
      schema: JSON.stringify({ name: values.name, description: values.description })
    };

    if (endpoint) {
      updateMut.mutate({ endpointId: endpoint.id, data }, {
        onSuccess: () => onOpenChange(false)
      });
    } else {
      createMut.mutate({ connectionId, data }, {
        onSuccess: () => onOpenChange(false)
      });
    }
  };

  const isPending = createMut.isPending || updateMut.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{endpoint ? "Chỉnh sửa Endpoint" : "Thêm mới Endpoint"}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-2">
            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="method"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phương thức</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn method" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="GET">GET</SelectItem>
                        <SelectItem value="POST">POST</SelectItem>
                        <SelectItem value="PUT">PUT</SelectItem>
                        <SelectItem value="PATCH">PATCH</SelectItem>
                        <SelectItem value="DELETE">DELETE</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="pathTemplate"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Đường dẫn (Path)</FormLabel>
                    <FormControl>
                      <Input placeholder="/api/v1/users" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tên Endpoint</FormLabel>
                  <FormControl>
                    <Input placeholder="Lấy danh sách người dùng" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mô tả</FormLabel>
                  <FormControl>
                    <Input placeholder="Mô tả chi tiết chức năng..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 mt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Hủy</Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Đang xử lý..." : "Lưu"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
