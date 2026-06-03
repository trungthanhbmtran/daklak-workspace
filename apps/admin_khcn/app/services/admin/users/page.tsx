import { UserClient } from "@/features/system-admin/users";
import { NotificationConfigPanel } from "@/features/system-admin/users/components/NotificationConfigPanel";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const metadata = {
  title: "Quản lý người dùng | Quản trị Hệ thống",
};

export default function UsersPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Quản lý người dùng</h2>
          <p className="text-muted-foreground">
            Xem danh sách, quản lý cấu hình và chi tiết người dùng
          </p>
        </div>
      </div>

      <Tabs defaultValue="users" className="space-y-4">
        <TabsList>
          <TabsTrigger value="users">Danh sách người dùng</TabsTrigger>
          <TabsTrigger value="notifications">Cấu hình thông báo</TabsTrigger>
        </TabsList>
        <TabsContent value="users" className="space-y-4">
          <UserClient />
        </TabsContent>
        <TabsContent value="notifications" className="space-y-4">
          <NotificationConfigPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
}
