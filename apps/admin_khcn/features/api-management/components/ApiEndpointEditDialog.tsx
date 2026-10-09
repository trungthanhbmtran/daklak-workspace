import React, { useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCreateEndpoint, useUpdateEndpoint } from "../hooks/useApiManagement";
import { Plus, Trash2 } from "lucide-react";

const parameterSchema = z.object({
  name: z.string().min(1, "Bắt buộc"),
  in: z.string().min(1, "Bắt buộc"), // query, header, path
  type: z.string().min(1, "Bắt buộc"), // string, number, boolean
  required: z.string(), // "true" or "false"
  description: z.string().optional(),
});

const responseFieldSchema = z.object({
  name: z.string().min(1, "Bắt buộc"),
  type: z.string().min(1, "Bắt buộc"), // string, number, boolean, object, array
  description: z.string().optional(),
});

const formSchema = z.object({
  method: z.string().min(1, "Vui lòng chọn phương thức"),
  pathTemplate: z.string().min(1, "Vui lòng nhập đường dẫn"),
  name: z.string().optional(),
  description: z.string().optional(),
  parameters: z.array(parameterSchema),
  responseFields: z.array(responseFieldSchema).optional(),
  bodySchema: z.string().optional(),
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
      parameters: [],
      responseFields: [],
      bodySchema: "",
    }
  });

  const { fields: paramFields, append: appendParam, remove: removeParam } = useFieldArray({
    control: form.control,
    name: "parameters"
  });

  const { fields: resFields, append: appendRes, remove: removeRes } = useFieldArray({
    control: form.control,
    name: "responseFields"
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
          parameters: (schemaObj.parameters || []).map((p: any) => ({
            ...p,
            required: p.required ? "true" : "false"
          })),
          responseFields: schemaObj.responseFields || [],
          bodySchema: schemaObj.body ? (typeof schemaObj.body === 'string' ? schemaObj.body : JSON.stringify(schemaObj.body, null, 2)) : "",
        });
      } else {
        form.reset({
          method: "GET",
          pathTemplate: "/",
          name: "",
          description: "",
          parameters: [],
          responseFields: [],
          bodySchema: "",
        });
      }
    }
  }, [open, endpoint, form]);

  const onSubmit = (values: FormValues) => {
    let bodyObj = undefined;
    if (values.bodySchema) {
      try {
        bodyObj = JSON.parse(values.bodySchema);
      } catch (e) {
        bodyObj = values.bodySchema;
      }
    }

    const data = {
      method: values.method,
      pathTemplate: values.pathTemplate,
      schema: JSON.stringify({
        name: values.name,
        description: values.description,
        parameters: values.parameters.map(p => ({
          ...p,
          required: p.required === "true"
        })),
        responseFields: values.responseFields,
        body: bodyObj
      })
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
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{endpoint ? "Chỉnh sửa Endpoint" : "Thêm mới Endpoint"}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-2">
            
            <Tabs defaultValue="general" className="w-full">
              <TabsList className="w-full grid grid-cols-4">
                <TabsTrigger value="general">Thông tin chung</TabsTrigger>
                <TabsTrigger value="params">Tham số (Params)</TabsTrigger>
                <TabsTrigger value="body">Body Payload</TabsTrigger>
                <TabsTrigger value="response">Cột Trả Về (Response)</TabsTrigger>
              </TabsList>
              
              <TabsContent value="general" className="space-y-4 mt-4">
                <div className="grid grid-cols-3 gap-4">
                  <FormField
                    control={form.control as any}
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
                    control={form.control as any}
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
                  control={form.control as any}
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
                  control={form.control as any}
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
              </TabsContent>

              <TabsContent value="params" className="mt-4 space-y-4">
                <div className="flex justify-between items-center">
                  <FormLabel>Danh sách tham số</FormLabel>
                  <Button type="button" variant="outline" size="sm" onClick={() => appendParam({ name: "", in: "query", type: "string", required: "false", description: "" })}>
                    <Plus className="w-4 h-4 mr-1" /> Thêm tham số
                  </Button>
                </div>
                
                {paramFields.length === 0 && (
                  <div className="text-center text-sm text-gray-500 py-4 border rounded-md border-dashed">
                    Chưa có tham số nào.
                  </div>
                )}
                
                <div className="space-y-4">
                  {paramFields.map((field, index) => (
                    <div key={field.id} className="grid grid-cols-12 gap-2 items-start border p-3 rounded-md relative">
                      <div className="col-span-3">
                        <FormField
                          control={form.control as any}
                          name={`parameters.${index}.name`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs">Tên biến</FormLabel>
                              <FormControl><Input placeholder="systemcode" {...field} /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="col-span-2">
                        <FormField
                          control={form.control as any}
                          name={`parameters.${index}.in`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs">Vị trí</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                <SelectContent>
                                  <SelectItem value="query">Query</SelectItem>
                                  <SelectItem value="header">Header</SelectItem>
                                  <SelectItem value="path">Path</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="col-span-2">
                        <FormField
                          control={form.control as any}
                          name={`parameters.${index}.type`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs">Kiểu DL</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                <SelectContent>
                                  <SelectItem value="string">String</SelectItem>
                                  <SelectItem value="number">Number</SelectItem>
                                  <SelectItem value="boolean">Boolean</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="col-span-2">
                        <FormField
                          control={form.control as any}
                          name={`parameters.${index}.required`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs">Bắt buộc</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                <SelectContent>
                                  <SelectItem value="true">Có</SelectItem>
                                  <SelectItem value="false">Không</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="col-span-2">
                        <FormField
                          control={form.control as any}
                          name={`parameters.${index}.description`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs">Mô tả</FormLabel>
                              <FormControl><Input placeholder="Ghi chú" {...field} /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="col-span-1 pt-6 flex justify-end">
                        <Button type="button" variant="ghost" size="icon" onClick={() => removeParam(index)}>
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="body" className="mt-4 space-y-4">
                <FormField
                  control={form.control as any}
                  name="bodySchema"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Body Schema (JSON định nghĩa hoặc JSON mẫu)</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder={'{\n  "systemcode": "string",\n  "year": 2024\n}'} 
                          className="font-mono text-sm h-64"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>
              
              <TabsContent value="response" className="mt-4 space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <FormLabel>Các cột dữ liệu trả về (Response Fields)</FormLabel>
                    <p className="text-xs text-slate-500 mt-1">Định nghĩa các cột để có thể chọn làm trục X, Y khi vẽ biểu đồ báo cáo.</p>
                  </div>
                  <Button type="button" variant="outline" size="sm" onClick={() => appendRes({ name: "", type: "string", description: "" })}>
                    <Plus className="w-4 h-4 mr-1" /> Thêm cột
                  </Button>
                </div>
                
                {resFields.length === 0 && (
                  <div className="text-center text-sm text-gray-500 py-4 border rounded-md border-dashed">
                    Chưa định nghĩa cột dữ liệu trả về. Báo cáo vẽ biểu đồ sẽ không có trường để chọn.
                  </div>
                )}
                
                <div className="space-y-4">
                  {resFields.map((field, index) => (
                    <div key={field.id} className="grid grid-cols-12 gap-2 items-start border p-3 rounded-md relative">
                      <div className="col-span-4">
                        <FormField
                          control={form.control as any}
                          name={`responseFields.${index}.name`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs">Tên cột (Field Name)</FormLabel>
                              <FormControl><Input placeholder="vd: totalCount, departmentName" {...field} /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="col-span-3">
                        <FormField
                          control={form.control as any}
                          name={`responseFields.${index}.type`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs">Kiểu Dữ liệu</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                <SelectContent>
                                  <SelectItem value="string">String (Văn bản)</SelectItem>
                                  <SelectItem value="number">Number (Số)</SelectItem>
                                  <SelectItem value="boolean">Boolean</SelectItem>
                                  <SelectItem value="date">Date (Ngày tháng)</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="col-span-4">
                        <FormField
                          control={form.control as any}
                          name={`responseFields.${index}.description`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs">Ghi chú (Hiển thị cho user)</FormLabel>
                              <FormControl><Input placeholder="vd: Tổng số lượng..." {...field} /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="col-span-1 pt-6 flex justify-end">
                        <Button type="button" variant="ghost" size="icon" onClick={() => removeRes(index)}>
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>

            <div className="flex justify-end gap-2 mt-6 pt-4 border-t">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Hủy</Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Đang xử lý..." : "Lưu Endpoint"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
