"use client";

import React, { useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

// --- Types ---
export interface FieldOption {
  label: string;
  value: string;
}

export interface FormFieldSchema {
  name: string;
  label: string;
  type: "text" | "textarea" | "number" | "date" | "select" | "checkbox" | "file";
  required?: boolean;
  options?: FieldOption[];
  placeholder?: string;
}

interface DynamicFormProps {
  schema: string | FormFieldSchema[]; // JSON string or array of schema objects
  defaultValues?: Record<string, any>;
  onSubmit: (data: Record<string, any>) => void;
  submitLabel?: string;
  isSubmitting?: boolean;
}

// --- Component ---
export const DynamicForm = ({
  schema,
  defaultValues = {},
  onSubmit,
  submitLabel = "Lưu & Tiếp tục",
  isSubmitting = false,
}: DynamicFormProps) => {
  
  // Parse schema if it's a string
  const fields: FormFieldSchema[] = useMemo(() => {
    if (Array.isArray(schema)) return schema;
    if (!schema || typeof schema !== "string") return [];
    try {
      const parsed = JSON.parse(schema);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      console.error("Invalid dynamic form schema", e);
      return [];
    }
  }, [schema]);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues,
  });

  if (!fields.length) {
    return (
      <div className="text-center p-6 border border-dashed rounded-lg text-slate-500 text-sm">
        Biểu mẫu chưa được định nghĩa hoặc cấu trúc formSchema bị lỗi.
      </div>
    );
  }

  const renderField = (field: FormFieldSchema, fieldProps: any) => {
    switch (field.type) {
      case "textarea":
        return (
          <Textarea
            {...fieldProps}
            placeholder={field.placeholder || `Nhập ${field.label.toLowerCase()}...`}
            className="min-h-[100px] resize-y"
          />
        );
      case "number":
        return (
          <Input
            {...fieldProps}
            type="number"
            placeholder={field.placeholder || "0"}
            onChange={(e) => fieldProps.onChange(e.target.valueAsNumber || 0)}
          />
        );
      case "date":
        return (
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !fieldProps.value && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {fieldProps.value ? (
                  format(new Date(fieldProps.value), "dd/MM/yyyy")
                ) : (
                  <span>Chọn ngày...</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={fieldProps.value ? new Date(fieldProps.value) : undefined}
                onSelect={(date) => fieldProps.onChange(date?.toISOString())}
              />
            </PopoverContent>
          </Popover>
        );
      case "select":
        return (
          <NativeSelect
            {...fieldProps}
            value={fieldProps.value || ""}
          >
            <NativeSelectOption value="">-- Chọn một giá trị --</NativeSelectOption>
            {field.options?.map((opt, i) => (
              <NativeSelectOption key={i} value={opt.value}>
                {opt.label}
              </NativeSelectOption>
            ))}
          </NativeSelect>
        );
      case "checkbox":
        return (
          <div className="flex items-center space-x-2 py-2">
            <Checkbox
              id={field.name}
              checked={fieldProps.value}
              onCheckedChange={fieldProps.onChange}
            />
            <Label htmlFor={field.name} className="font-normal text-sm cursor-pointer">
              Xác nhận {field.label.toLowerCase()}
            </Label>
          </div>
        );
      case "file":
        return (
          <div className="border border-dashed border-slate-300 rounded-lg p-6 text-center text-slate-500 bg-slate-50">
            <Input 
               type="file" 
               className="hidden" 
               id={`file-${field.name}`}
               onChange={(e) => {
                 const file = e.target.files?.[0];
                 if (file) {
                   fieldProps.onChange(file.name);
                 }
               }} 
            />
            <Label htmlFor={`file-${field.name}`} className="cursor-pointer text-primary hover:underline font-semibold flex items-center justify-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-upload"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>
              Bấm để đính kèm tệp
            </Label>
            {fieldProps.value && <p className="text-xs text-emerald-600 mt-2 font-medium">Đã chọn: {fieldProps.value}</p>}
          </div>
        );
      default: // text
        return (
          <Input
            {...fieldProps}
            type="text"
            placeholder={field.placeholder || `Nhập ${field.label.toLowerCase()}...`}
          />
        );
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-4">
        {fields.map((field) => (
          <div key={field.name} className="flex flex-col gap-1.5">
            {field.type !== "checkbox" && (
              <Label className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </Label>
            )}
            
            <Controller
              name={field.name}
              control={control}
              rules={{ required: field.required ? "Vui lòng nhập trường này" : false }}
              render={({ field: fieldProps }) => (
                <div className="flex flex-col gap-1">
                  {renderField(field, fieldProps)}
                  {errors[field.name] && (
                    <span className="text-xs text-red-500 font-medium">
                      {errors[field.name]?.message as string}
                    </span>
                  )}
                </div>
              )}
            />
          </div>
        ))}
      </div>

      <div className="pt-4 flex justify-end">
        <Button type="submit" disabled={isSubmitting} className="min-w-[150px]">
          {isSubmitting ? "Đang xử lý..." : submitLabel}
        </Button>
      </div>
    </form>
  );
};
