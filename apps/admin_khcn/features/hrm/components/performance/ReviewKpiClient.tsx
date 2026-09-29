import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Construction } from "lucide-react";

export function ReviewKpiClient() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Duy?t Ðánh Giá KPI (Nâng C?p Ki?n Trúc)</CardTitle>
          <CardDescription>H? th?ng dánh giá KPI/OKR dang du?c tái c?u trúc.</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert className="bg-blue-50 border-blue-200">
            <Construction className="h-4 w-4 text-blue-600" />
            <AlertTitle className="text-blue-800 font-semibold">Thông báo c?p nh?t ki?n trúc (KpiFormDocument)</AlertTitle>
            <AlertDescription className="text-blue-700 mt-2">
              Ch?c nang Ðánh giá và Duy?t KPI hi?n t?i dã du?c nâng c?p lên <b>ki?n trúc File XML/PDF d?ng</b> (Luu tr? qua Media Service) thay vì schema tinh c?ng nh?c.
              <br /><br />
              Giao di?n x? lý bi?u m?u XML d?ng dang du?c phát tri?n và s? s?m du?c c?p nh?t trên Admin Portal.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}

