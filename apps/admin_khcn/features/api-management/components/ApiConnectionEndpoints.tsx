"use client";
import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash } from "lucide-react";
import { useDeleteEndpoint } from "../hooks/useApiManagement";
import { ApiEndpointEditDialog } from "./ApiEndpointEditDialog";
import { Badge } from "@/components/ui/badge";

function getEndpointSchema(endpoint: any) {
  if (!endpoint?.schema) return {};
  if (typeof endpoint.schema === "object") return endpoint.schema;
  try {
    return JSON.parse(endpoint.schema);
  } catch {
    return {};
  }
}

export default function ApiConnectionEndpoints({
  connectionId,
  endpoints,
}: {
  connectionId: string;
  endpoints?: any[];
}) {
  const [editingEp, setEditingEp] = useState<any | null>(null);
  const [showEdit, setShowEdit] = useState(false);
  const deleteMut = useDeleteEndpoint();

  const handleEdit = (ep: any) => {
    setEditingEp(ep);
    setShowEdit(true);
  };

  const handleAdd = () => {
    setEditingEp(null);
    setShowEdit(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Xóa endpoint này?")) {
      deleteMut.mutate(id);
    }
  };

  return (
    <div className="border rounded-xl bg-card overflow-hidden">
      <div className="flex justify-between items-center p-4 border-b">
        <h3 className="font-semibold text-sm">Danh sách Endpoints</h3>
        <Button size="sm" variant="outline" onClick={handleAdd}>
          <Plus className="w-4 h-4 mr-1" /> Thêm Endpoint
        </Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Method</TableHead>
            <TableHead>Path</TableHead>
            <TableHead>Thông tin import</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {endpoints?.map((ep: any) => {
            const schema = getEndpointSchema(ep);
            const parameters = Array.isArray(schema.parameters)
              ? schema.parameters
              : [];
            const headers = parameters.filter(
              (parameter: any) => parameter.in === "header",
            ).length;
            const params = parameters.filter(
              (parameter: any) => parameter.in !== "header",
            ).length;
            const hasBody = Boolean(
              schema.body ||
              schema.formItems?.length ||
              (schema.bodyType && schema.bodyType !== "none"),
            );
            return (
              <TableRow key={ep.id}>
                <TableCell className="font-mono font-medium text-xs">
                  <Badge variant="outline" className={`justify-center w-16 border-transparent ${ep.method === 'GET' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : ep.method === 'POST' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' : ep.method === 'PUT' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' : ep.method === 'DELETE' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : 'bg-gray-100 text-gray-700'}`}>
                    {ep.method}
                  </Badge>
                </TableCell>
                <TableCell className="font-mono text-sm">
                  {ep.pathTemplate}
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1.5">
                    <Badge variant="outline">Headers: {headers}</Badge>
                    <Badge variant="outline">Params: {params}</Badge>
                    <Badge variant={hasBody ? "secondary" : "outline"}>
                      Body:{" "}
                      {hasBody ? schema.bodyType || "có dữ liệu" : "không có"}
                    </Badge>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEdit(ep)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-red-500"
                    onClick={() => handleDelete(ep.id)}
                  >
                    <Trash className="w-4 h-4" />
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
          {(!endpoints || endpoints.length === 0) && (
            <TableRow>
              <TableCell
                colSpan={4}
                className="text-center py-8 text-muted-foreground"
              >
                Chưa có endpoint nào được định nghĩa
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <ApiEndpointEditDialog
        open={showEdit}
        onOpenChange={setShowEdit}
        connectionId={connectionId}
        endpoint={editingEp}
      />
    </div>
  );
}
