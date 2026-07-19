/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useMemo, useState } from "react";
import { Link } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useEndpoints } from "../hooks/use-endpoints";
import { usePermissions } from "../hooks/use-permissions";
import { EndpointRow } from "./EndpointRow";
import { useDebounce } from "@/hooks/use-debounce";

export function EndpointClient() {
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const { data: endpointsData, isLoading: isEndpointsLoading } = useEndpoints();
  const { data: permissionsData, isLoading: isPermissionsLoading } = usePermissions();

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const endpoints = endpointsData || [];
  const permissions = permissionsData || [];

  const filtered = useMemo(() => {
    return endpoints.filter(
      (e: any) =>
        e.path.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        e.method.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
    );
  }, [endpoints, debouncedSearchTerm]);

  const isLoading = isEndpointsLoading || isPermissionsLoading;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Link className="h-5 w-5" /> Dynamic API Policy
          </CardTitle>
          <CardDescription>
            Phân quyền truy cập động cho các API Endpoint. Không cần khởi động
            lại hệ thống.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <Input
              placeholder="Tìm kiếm path (vd: /admin/users)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-md"
            />
          </div>

          <div className="border rounded-md overflow-hidden">
            <ScrollArea className="w-full">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted">
                    <TableHead className="hidden md:table-cell px-4 py-3 text-xs uppercase text-muted-foreground">
                      Method
                    </TableHead>
                    <TableHead className="px-4 py-3 text-xs uppercase text-muted-foreground">
                      Path
                    </TableHead>
                    <TableHead className="px-4 py-3 text-xs uppercase text-muted-foreground">
                      Require Permission
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    Array.from({ length: 6 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell className="hidden md:table-cell px-4 py-3">
                          <Skeleton className="h-5 w-16" />
                        </TableCell>
                        <TableCell className="px-4 py-3">
                          <Skeleton className="h-4 w-48" />
                        </TableCell>
                        <TableCell className="px-4 py-3">
                          <Skeleton className="h-8 w-[300px]" />
                        </TableCell>
                      </TableRow>
                    ))
                  ) : filtered.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={3}
                        className="px-4 py-8 text-center text-muted-foreground"
                      >
                        Không tìm thấy Endpoint nào. Thử F5 hoặc khởi động lại
                        Gateway để tự động quét.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filtered.map((ep: any) => (
                      <EndpointRow
                        key={ep.id}
                        ep={ep}
                        permissions={permissions}
                      />
                    ))
                  )}
                </TableBody>
              </Table>
            </ScrollArea>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
