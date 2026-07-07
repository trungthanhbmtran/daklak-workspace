/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { usePostmanParser } from "../hooks/usePostmanParser";

interface PostmanImportButtonProps {
  onSuccess: (data: any) => void;
}

export function PostmanImportButton({ onSuccess }: PostmanImportButtonProps) {
  const { fileInputRef, handleFileUpload, triggerUpload } = usePostmanParser(onSuccess);

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
        className="rounded-xl border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 h-10 px-4 text-orange-600 dark:text-orange-500"
      >
        <Upload className="w-4 h-4 mr-2" />
        Nhập Postman
      </Button>
    </>
  );
}
