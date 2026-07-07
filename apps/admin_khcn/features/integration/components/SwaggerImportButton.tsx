/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { useSwaggerParser } from "../hooks/useSwaggerParser";

interface SwaggerImportButtonProps {
  onSuccess: (data: any) => void;
}

export function SwaggerImportButton({ onSuccess }: SwaggerImportButtonProps) {
  const { fileInputRef, handleFileUpload, triggerUpload } = useSwaggerParser(onSuccess);

  return (
    <>
      <input
        type="file"
        accept=".json"
        className="hidden"
        ref={fileInputRef}
        onChange={handleFileUpload}
      />
      <Button
        onClick={triggerUpload}
        variant="outline"
        className="rounded-xl border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 h-10 px-4 text-green-600 dark:text-green-500"
      >
        <Upload className="w-4 h-4 mr-2" />
        Nhập Swagger
      </Button>
    </>
  );
}
