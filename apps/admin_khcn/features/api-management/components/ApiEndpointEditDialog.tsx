import React, { useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useCreateEndpoint,
  useUpdateEndpoint,
} from "../hooks/useApiManagement";
import {
  Plus,
  Trash2,
  Settings,
  List,
  Code2,
  Globe,
  Database,
  FileJson,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

const getMethodColor = (method: string) => {
  switch (method) {
    case "GET":
      return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200";
    case "POST":
      return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200";
    case "PUT":
      return "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 border-orange-200";
    case "PATCH":
      return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200";
    case "DELETE":
      return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200";
    default:
      return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400 border-gray-200";
  }
};

const parameterSchema = z.object({
  name: z.string().min(1, "Bắt buộc"),
  in: z.string().min(1, "Bắt buộc"), // query, header, path
  type: z.string().min(1, "Bắt buộc"), // string, number, boolean
  required: z.string(), // "true" or "false"
  enabled: z.string(), // "true" or "false"
  value: z.string().optional(),
  description: z.string().optional(),
});

const formSchema = z.object({
  method: z.string().min(1, "Vui lòng chọn phương thức"),
  pathTemplate: z.string().min(1, "Vui lòng nhập đường dẫn"),
  name: z.string().optional(),
  description: z.string().optional(),
  parameters: z.array(parameterSchema),
  bodySchema: z.string().optional(),
  bodyType: z.enum(["none", "raw", "x-www-form-urlencoded", "form-data"]),
  formItemsJson: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  connectionId: string;
  endpoint?: any;
}

export function ApiEndpointEditDialog({
  open,
  onOpenChange,
  connectionId,
  endpoint,
}: Props) {
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
      bodySchema: "",
      bodyType: "none",
      formItemsJson: "",
    },
  });

  const {
    fields: paramFields,
    append: appendParam,
    remove: removeParam,
  } = useFieldArray({
    control: form.control,
    name: "parameters",
  });

  useEffect(() => {
    if (open) {
      if (endpoint) {
        let schemaObj: any = {};
        try {
          schemaObj =
            typeof endpoint.schema === "string"
              ? JSON.parse(endpoint.schema)
              : endpoint.schema || {};
        } catch {}

        form.reset({
          method: endpoint.method,
          pathTemplate: endpoint.pathTemplate,
          name: schemaObj.name || "",
          description: schemaObj.description || "",
          parameters: (schemaObj.parameters || []).map((p: any) => ({
            ...p,
            required: p.required ? "true" : "false",
            enabled: p.enabled === false ? "false" : "true",
          })),
          bodySchema:
            schemaObj.body !== undefined && schemaObj.body !== null
              ? typeof schemaObj.body === "string"
                ? schemaObj.body
                : JSON.stringify(schemaObj.body, null, 2)
              : "",
          bodyType:
            schemaObj.bodyType ||
            (schemaObj.body !== undefined && schemaObj.body !== null
              ? "raw"
              : "none"),
          formItemsJson: Array.isArray(schemaObj.formItems)
            ? JSON.stringify(schemaObj.formItems, null, 2)
            : "",
        });
      } else {
        form.reset({
          method: "GET",
          pathTemplate: "/",
          name: "",
          description: "",
          parameters: [],
          bodySchema: "",
          bodyType: "none",
          formItemsJson: "",
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

    let formItems = [];
    if (values.formItemsJson?.trim()) {
      try {
        const parsedFormItems = JSON.parse(values.formItemsJson);
        if (!Array.isArray(parsedFormItems)) {
          form.setError("formItemsJson", { message: "Nhập một mảng JSON." });
          return;
        }
        formItems = parsedFormItems;
      } catch {
        form.setError("formItemsJson", { message: "JSON không hợp lệ." });
        return;
      }
    }

    const data = {
      method: values.method,
      pathTemplate: values.pathTemplate,
      schema: JSON.stringify({
        name: values.name,
        description: values.description,
        parameters: values.parameters.map((p) => ({
          ...p,
          required: p.required === "true",
          enabled: p.enabled === "true",
        })),
        body: bodyObj,
        bodyType: values.bodyType,
        formItems,
      }),
    };

    if (endpoint) {
      updateMut.mutate(
        { endpointId: endpoint.id, data },
        {
          onSuccess: () => onOpenChange(false),
        },
      );
    } else {
      createMut.mutate(
        { connectionId, data },
        {
          onSuccess: () => onOpenChange(false),
        },
      );
    }
  };

  const isPending = createMut.isPending || updateMut.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] p-0 overflow-hidden flex flex-col rounded-xl sm:rounded-2xl">
        <DialogHeader className="px-6 py-5 border-b bg-card">
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <div className="p-2 bg-primary/10 rounded-lg text-primary">
              <Globe className="w-5 h-5" />
            </div>
            {endpoint ? "Cập nhật Endpoint" : "Thêm mới Endpoint"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col flex-1 overflow-hidden h-[calc(90vh-140px)] min-h-[500px]"
          >
            <div className="flex-1 overflow-y-auto px-6 py-6 bg-slate-50/50 dark:bg-zinc-950/50">
              <Tabs
                defaultValue="general"
                className="w-full h-full flex flex-col"
              >
                <TabsList className="grid grid-cols-3 w-full max-w-[500px] mb-6 mx-auto bg-muted/50 p-1">
                  <TabsTrigger
                    value="general"
                    className="flex items-center justify-center gap-2 rounded-md"
                  >
                    <Settings className="w-4 h-4" /> Thông tin chung
                  </TabsTrigger>
                  <TabsTrigger
                    value="params"
                    className="flex items-center justify-center gap-2 rounded-md"
                  >
                    <List className="w-4 h-4" /> Tham số
                  </TabsTrigger>
                  <TabsTrigger
                    value="body"
                    className="flex items-center justify-center gap-2 rounded-md"
                  >
                    <Code2 className="w-4 h-4" /> Body Payload
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="general" className="space-y-6 mt-0">
                  <div className="flex flex-col gap-6 bg-card p-6 border rounded-xl shadow-sm">
                    <div className="grid grid-cols-12 gap-6">
                      <div className="col-span-12 md:col-span-4">
                        <FormField
                          control={form.control as any}
                          name="method"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm font-semibold">
                                Phương thức
                              </FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                value={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger
                                    className={`h-11 ${getMethodColor(field.value)} font-medium transition-colors`}
                                  >
                                    <SelectValue placeholder="Chọn method" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {[
                                    "GET",
                                    "POST",
                                    "PUT",
                                    "PATCH",
                                    "DELETE",
                                  ].map((m) => (
                                    <SelectItem key={m} value={m}>
                                      <div className="flex items-center font-medium">
                                        <Badge
                                          variant="outline"
                                          className={`w-16 justify-center mr-2 border-transparent ${getMethodColor(m)}`}
                                        >
                                          {m}
                                        </Badge>
                                      </div>
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="col-span-12 md:col-span-8">
                        <FormField
                          control={form.control as any}
                          name="pathTemplate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm font-semibold">
                                Đường dẫn (Path)
                              </FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-muted-foreground">
                                    <Globe className="w-4 h-4" />
                                  </div>
                                  <Input
                                    placeholder="/api/v1/users"
                                    className="pl-9 h-11 font-mono text-sm bg-background"
                                    {...field}
                                  />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    <div className="w-full h-px bg-border my-2"></div>

                    <FormField
                      control={form.control as any}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-semibold">
                            Tên Endpoint
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Ví dụ: Lấy danh sách người dùng"
                              className="h-11 bg-background"
                              {...field}
                            />
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
                          <FormLabel className="text-sm font-semibold">
                            Mô tả chi tiết
                          </FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Mô tả chức năng của endpoint này..."
                              className="resize-none h-24 bg-background"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="params" className="mt-0 h-full">
                  <div className="bg-card border rounded-xl shadow-sm flex flex-col min-h-[400px]">
                    <div className="flex justify-between items-center p-4 border-b bg-muted/20">
                      <div>
                        <h4 className="font-semibold text-sm">
                          Danh sách tham số
                        </h4>
                        <p className="text-xs text-muted-foreground mt-1">
                          Định nghĩa các tham số truyền vào qua Query, Path hoặc
                          Header
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() =>
                          appendParam({
                            name: "",
                            in: "query",
                            type: "string",
                            required: "false",
                            enabled: "true",
                            value: "",
                            description: "",
                          })
                        }
                        className="gap-2 shadow-sm"
                      >
                        <Plus className="w-4 h-4" /> Thêm tham số
                      </Button>
                    </div>

                    <div className="flex-1 p-4">
                      {paramFields.length === 0 ? (
                        <div className="h-full min-h-[300px] flex flex-col items-center justify-center text-muted-foreground border-2 border-dashed rounded-lg bg-muted/10 transition-colors hover:bg-muted/30">
                          <Database className="w-10 h-10 mb-3 opacity-20" />
                          <p className="text-sm font-medium">
                            Chưa có tham số nào được định nghĩa
                          </p>
                          <Button
                            type="button"
                            variant="link"
                            onClick={() =>
                              appendParam({
                                name: "",
                                in: "query",
                                type: "string",
                                required: "false",
                                enabled: "true",
                                value: "",
                                description: "",
                              })
                            }
                            className="mt-2 text-primary"
                          >
                            Bấm vào đây để thêm
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {paramFields.map((field, index) => (
                            <div
                              key={field.id}
                              className="p-4 bg-background border rounded-lg relative hover:border-primary/30 transition-all group shadow-sm flex flex-col gap-4"
                            >
                              <div className="flex justify-between items-center border-b pb-3">
                                <h5 className="text-sm font-semibold text-primary">
                                  Tham số {index + 1}
                                </h5>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50"
                                  onClick={() => removeParam(index)}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                                <FormField
                                  control={form.control as any}
                                  name={`parameters.${index}.name`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel className="text-xs text-muted-foreground font-medium">
                                        Tên biến
                                      </FormLabel>
                                      <FormControl>
                                        <Input
                                          placeholder="Ví dụ: page"
                                          className="h-9 font-mono text-sm"
                                          {...field}
                                        />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />

                                <FormField
                                  control={form.control as any}
                                  name={`parameters.${index}.in`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel className="text-xs text-muted-foreground font-medium">
                                        Vị trí
                                      </FormLabel>
                                      <Select
                                        onValueChange={field.onChange}
                                        value={field.value}
                                      >
                                        <FormControl>
                                          <SelectTrigger className="h-9">
                                            <SelectValue />
                                          </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                          <SelectItem value="query">
                                            Query
                                          </SelectItem>
                                          <SelectItem value="header">
                                            Header
                                          </SelectItem>
                                          <SelectItem value="path">
                                            Path
                                          </SelectItem>
                                        </SelectContent>
                                      </Select>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />

                                <FormField
                                  control={form.control as any}
                                  name={`parameters.${index}.type`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel className="text-xs text-muted-foreground font-medium">
                                        Kiểu dữ liệu
                                      </FormLabel>
                                      <Select
                                        onValueChange={field.onChange}
                                        value={field.value}
                                      >
                                        <FormControl>
                                          <SelectTrigger className="h-9 font-mono text-xs">
                                            <SelectValue />
                                          </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                          <SelectItem value="string">
                                            String
                                          </SelectItem>
                                          <SelectItem value="number">
                                            Number
                                          </SelectItem>
                                          <SelectItem value="boolean">
                                            Boolean
                                          </SelectItem>
                                        </SelectContent>
                                      </Select>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />

                                <FormField
                                  control={form.control as any}
                                  name={`parameters.${index}.required`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel className="text-xs text-muted-foreground font-medium">
                                        Bắt buộc
                                      </FormLabel>
                                      <Select
                                        onValueChange={field.onChange}
                                        value={field.value}
                                      >
                                        <FormControl>
                                          <SelectTrigger className="h-9">
                                            <SelectValue />
                                          </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                          <SelectItem value="true">
                                            Có
                                          </SelectItem>
                                          <SelectItem value="false">
                                            Không
                                          </SelectItem>
                                        </SelectContent>
                                      </Select>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />

                                <FormField
                                  control={form.control as any}
                                  name={`parameters.${index}.enabled`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel className="text-xs text-muted-foreground font-medium">
                                        Trạng thái
                                      </FormLabel>
                                      <Select
                                        onValueChange={field.onChange}
                                        value={field.value}
                                      >
                                        <FormControl>
                                          <SelectTrigger className="h-9">
                                            <SelectValue />
                                          </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                          <SelectItem value="true">
                                            Bật
                                          </SelectItem>
                                          <SelectItem value="false">
                                            Tắt
                                          </SelectItem>
                                        </SelectContent>
                                      </Select>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </div>

                              <FormField
                                control={form.control as any}
                                name={`parameters.${index}.value`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="text-xs text-muted-foreground font-medium">
                                      Giá trị mẫu
                                    </FormLabel>
                                    <FormControl>
                                      <Input
                                        placeholder="Giá trị mặc định hoặc ví dụ"
                                        className="h-9 font-mono text-sm"
                                        {...field}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              <FormField
                                control={form.control as any}
                                name={`parameters.${index}.description`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="text-xs text-muted-foreground font-medium">
                                      Mô tả chi tiết
                                    </FormLabel>
                                    <FormControl>
                                      <Input
                                        placeholder="Giải thích ý nghĩa hoặc cách sử dụng của tham số này..."
                                        className="h-9"
                                        {...field}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="body" className="mt-0 h-full">
                  <div className="bg-card border rounded-xl shadow-sm flex flex-col h-[450px]">
                    <div className="p-4 border-b bg-muted/20 flex items-center gap-2">
                      <FileJson className="w-4 h-4 text-primary" />
                      <div>
                        <h4 className="font-semibold text-sm">Body Schema</h4>
                        <p className="text-xs text-muted-foreground">
                          Định nghĩa JSON mẫu cho request body
                        </p>
                      </div>
                    </div>
                    <div className="flex-1 p-0 rounded-b-xl overflow-y-auto">
                      <FormField
                        control={form.control as any}
                        name="bodyType"
                        render={({ field }) => (
                          <FormItem className="p-4 border-b">
                            <FormLabel className="text-xs text-muted-foreground">
                              Loại body
                            </FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value}
                            >
                              <FormControl>
                                <SelectTrigger className="h-9 max-w-sm">
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="none">
                                  Không có body
                                </SelectItem>
                                <SelectItem value="raw">Raw / JSON</SelectItem>
                                <SelectItem value="form-data">
                                  Form data
                                </SelectItem>
                                <SelectItem value="x-www-form-urlencoded">
                                  URL encoded
                                </SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control as any}
                        name="bodySchema"
                        render={({ field }) => (
                          <FormItem className="min-h-[300px] m-0 border-0">
                            <FormControl className="min-h-[300px]">
                              <Textarea
                                placeholder={
                                  '{\n  "systemcode": "string",\n  "year": 2024\n}'
                                }
                                className="font-mono text-sm min-h-[300px] w-full resize-y p-4 bg-zinc-950 text-zinc-50 border-0 focus-visible:ring-0 focus-visible:ring-offset-0 rounded-none rounded-b-xl"
                                spellCheck={false}
                                {...field}
                              />
                            </FormControl>
                            <FormMessage className="px-4 py-2 bg-background border-t" />
                          </FormItem>
                        )}
                      />
                      {(form.watch("bodyType") === "form-data" ||
                        form.watch("bodyType") === "x-www-form-urlencoded") && (
                        <FormField
                          control={form.control as any}
                          name="formItemsJson"
                          render={({ field }) => (
                            <FormItem className="p-4 border-t">
                              <FormLabel className="text-xs text-muted-foreground">
                                Các trường form (JSON)
                              </FormLabel>
                              <FormControl>
                                <Textarea
                                  className="min-h-32 font-mono text-xs"
                                  spellCheck={false}
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            <div className="px-6 py-4 border-t bg-card flex justify-end gap-3 items-center">
              <Button
                type="button"
                variant="ghost"
                onClick={() => onOpenChange(false)}
              >
                Hủy bỏ
              </Button>
              <Button
                type="submit"
                className="min-w-[120px] font-medium"
                disabled={isPending}
              >
                {isPending
                  ? "Đang xử lý..."
                  : endpoint
                    ? "Cập nhật"
                    : "Tạo mới"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
