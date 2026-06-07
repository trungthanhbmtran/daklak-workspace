"use client";

import React, { useState } from "react";
import { GatewayRoute, gatewayApi } from "../api/gateway.api";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Edit2, Check, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";

interface RoutesManagerProps {
  gatewayId: string;
  routes: GatewayRoute[];
  onRoutesChange: () => void;
}

export function RoutesManager({ gatewayId, routes, onRoutesChange }: RoutesManagerProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // State for new/editing route
  const [formData, setFormData] = useState<Partial<GatewayRoute>>({
    path: "/",
    targetService: "",
    stripPrefix: false,
    isActive: true,
    order: 0,
  });

  const handleEdit = (route: GatewayRoute) => {
    setEditingId(route.id);
    setFormData(route);
    setIsAdding(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc chắn muốn xoá route này?")) return;
    try {
      await gatewayApi.deleteRoute(id);
      toast.success("Đã xoá route");
      onRoutesChange();
    } catch (error) {
      toast.error("Lỗi khi xoá route");
    }
  };

  const handleSave = async () => {
    try {
      if (!formData.path || !formData.targetService) {
        toast.error("Path và Target Service là bắt buộc");
        return;
      }

      if (editingId) {
        await gatewayApi.updateRoute(editingId, formData);
        toast.success("Đã cập nhật route");
      } else {
        await gatewayApi.addRoute(gatewayId, formData);
        toast.success("Đã thêm route mới");
      }
      
      setEditingId(null);
      setIsAdding(false);
      onRoutesChange();
    } catch (error) {
      toast.error("Lỗi khi lưu route");
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setIsAdding(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium">Danh sách Route</h3>
          <p className="text-sm text-muted-foreground">
            Định tuyến các request tới các service backend tương ứng.
          </p>
        </div>
        <Button onClick={() => {
          setIsAdding(true);
          setEditingId(null);
          setFormData({ path: "/", targetService: "", stripPrefix: false, isActive: true, order: 0 });
        }}>
          <Plus className="w-4 h-4 mr-2" /> Thêm Route
        </Button>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Path</TableHead>
              <TableHead>Target Service</TableHead>
              <TableHead>Strip Prefix</TableHead>
              <TableHead>Order</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isAdding && (
              <TableRow className="bg-muted/50">
                <TableCell>
                  <Input 
                    value={formData.path} 
                    onChange={e => setFormData({...formData, path: e.target.value})} 
                    placeholder="/api/v1/user"
                  />
                </TableCell>
                <TableCell>
                  <Input 
                    value={formData.targetService} 
                    onChange={e => setFormData({...formData, targetService: e.target.value})} 
                    placeholder="http://user-service:3000"
                  />
                </TableCell>
                <TableCell>
                  <Switch 
                    checked={formData.stripPrefix} 
                    onCheckedChange={val => setFormData({...formData, stripPrefix: val})} 
                  />
                </TableCell>
                <TableCell>
                  <Input 
                    type="number" 
                    className="w-20"
                    value={formData.order} 
                    onChange={e => setFormData({...formData, order: Number(e.target.value)})} 
                  />
                </TableCell>
                <TableCell>
                  <Switch 
                    checked={formData.isActive} 
                    onCheckedChange={val => setFormData({...formData, isActive: val})} 
                  />
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button size="icon" variant="ghost" className="text-green-600" onClick={handleSave}>
                      <Check className="w-4 h-4" />
                    </Button>
                    <Button size="icon" variant="ghost" className="text-red-600" onClick={cancelEdit}>
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            )}

            {routes.length === 0 && !isAdding ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  Chưa có route nào được cấu hình
                </TableCell>
              </TableRow>
            ) : (
              routes.map((route) => (
                editingId === route.id ? (
                  <TableRow key={route.id} className="bg-muted/50">
                    <TableCell>
                      <Input 
                        value={formData.path} 
                        onChange={e => setFormData({...formData, path: e.target.value})} 
                      />
                    </TableCell>
                    <TableCell>
                      <Input 
                        value={formData.targetService} 
                        onChange={e => setFormData({...formData, targetService: e.target.value})} 
                      />
                    </TableCell>
                    <TableCell>
                      <Switch 
                        checked={formData.stripPrefix} 
                        onCheckedChange={val => setFormData({...formData, stripPrefix: val})} 
                      />
                    </TableCell>
                    <TableCell>
                      <Input 
                        type="number" 
                        className="w-20"
                        value={formData.order} 
                        onChange={e => setFormData({...formData, order: Number(e.target.value)})} 
                      />
                    </TableCell>
                    <TableCell>
                      <Switch 
                        checked={formData.isActive} 
                        onCheckedChange={val => setFormData({...formData, isActive: val})} 
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button size="icon" variant="ghost" className="text-green-600" onClick={handleSave}>
                          <Check className="w-4 h-4" />
                        </Button>
                        <Button size="icon" variant="ghost" className="text-red-600" onClick={cancelEdit}>
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  <TableRow key={route.id}>
                    <TableCell className="font-mono">{route.path}</TableCell>
                    <TableCell className="font-mono">{route.targetService}</TableCell>
                    <TableCell>{route.stripPrefix ? "Có" : "Không"}</TableCell>
                    <TableCell>{route.order}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${route.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                        {route.isActive ? "Hoạt động" : "Tạm dừng"}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button size="icon" variant="ghost" onClick={() => handleEdit(route)}>
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button size="icon" variant="ghost" className="text-red-600" onClick={() => handleDelete(route.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
