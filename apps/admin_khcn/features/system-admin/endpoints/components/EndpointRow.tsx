/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useCallback } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TableCell, TableRow } from "@/components/ui/table";
import { useAssignEndpointPermission } from "../hooks/use-endpoints";

interface EndpointRowProps {
  ep: any;
  permissions: { id: number; label: string; group: string }[];
}

export const EndpointRow = React.memo(function EndpointRow({
  ep,
  permissions,
}: EndpointRowProps) {
  const assignMutation = useAssignEndpointPermission();

  const handleChange = useCallback(
    (val: string) => {
      assignMutation.mutate(
        { endpointId: ep.id, permissionId: Number(val) },
        {
          onSuccess: () => toast.success("Cập nhật quyền thành công"),
          onError: () => toast.error("Có lỗi xảy ra khi cập nhật"),
        }
      );
    },
    [ep.id, assignMutation]
  );

  const methodVariant = ep.method === "GET" ? "secondary" : "default";

  return (
    <TableRow className="hover:bg-muted/30">
      <TableCell className="hidden md:table-cell px-4 py-3">
        <Badge variant={methodVariant} className="font-mono">
          {ep.method}
        </Badge>
      </TableCell>
      <TableCell className="px-4 py-3 font-mono text-sm">{ep.path}</TableCell>
      <TableCell className="px-4 py-3">
        <Select
          value={ep.permission_id ? String(ep.permission_id) : "0"}
          onValueChange={handleChange}
          disabled={assignMutation.isPending}
        >
          <SelectTrigger className="w-[300px] h-8">
            <SelectValue placeholder="Không yêu cầu quyền (Public)" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="0">
              <span className="text-muted-foreground italic">
                -- Không yêu cầu quyền (Public) --
              </span>
            </SelectItem>
            {permissions.map((p) => (
              <SelectItem key={p.id} value={String(p.id)}>
                <span className="font-mono text-xs">{p.label}</span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </TableCell>
    </TableRow>
  );
});
