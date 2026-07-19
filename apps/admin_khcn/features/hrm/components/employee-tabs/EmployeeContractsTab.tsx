import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Heading, Text } from "@/components/ui/typography";
import { TabsContent } from "@/components/ui/tabs";
import { FileText } from "lucide-react";

export function EmployeeContractsTab() {
  return (
    <TabsContent value="contracts" className="outline-none">
      <Card className="rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6 md:p-8">
          <div className="flex justify-between items-center mb-6">
            <Heading level="h4">Hợp đồng lao động</Heading>
            <Button variant="outline" size="sm" className="rounded-full">Thêm mới</Button>
          </div>
          <div className="space-y-4">
            <div className="border border-border rounded-xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-primary/50 transition-colors">
              <div className="flex items-start gap-3">
                <div className="bg-primary/10 p-2 rounded-lg text-primary mt-0.5">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <Heading level="h4">Hợp đồng làm việc không xác định thời hạn</Heading>
                  <Text variant="small" className="text-muted-foreground mt-1 font-normal">Số: HD-2022/001 • Ký ngày: 01/01/2022</Text>
                </div>
              </div>
              <div className="flex flex-col sm:items-end gap-2 shrink-0">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  Đang hiệu lực
                </span>
                <Text as="span" variant="small" className="text-muted-foreground font-normal">Thời hạn: Vô thời hạn</Text>
              </div>
            </div>
            
            <div className="border border-border rounded-xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-muted/30">
              <div className="flex items-start gap-3">
                <div className="bg-muted p-2 rounded-lg text-muted-foreground mt-0.5">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <Heading level="h4">Hợp đồng thử việc</Heading>
                  <Text variant="small" className="text-muted-foreground mt-1 font-normal">Số: HDTV-2021/045 • Ký ngày: 01/10/2021</Text>
                </div>
              </div>
              <div className="flex flex-col sm:items-end gap-2 shrink-0">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground border border-border">
                  Đã hết hạn
                </span>
                <Text as="span" variant="small" className="text-muted-foreground font-normal">Hết hạn: 31/12/2021</Text>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </TabsContent>
  );
}
