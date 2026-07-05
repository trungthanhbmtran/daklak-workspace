"use client";

import React from 'react';
import { Settings2, Save } from 'lucide-react';
import { CivilServantTaskConfig } from './CivilServantTaskConfig';
import { PublicEmployeeTaskConfig } from './PublicEmployeeTaskConfig';
import { useConfigureRankTasks } from './hooks/useConfigureRankTasks';

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";

export type GovClassification = 'CONG_CHUC' | 'VIEN_CHUC';

export function ConfigureRankTasksClient() {
    const {
        selectedClass, setSelectedClass, isSaved, isSaving, handleSave,
        units, congChucRanks, vienChucRanks,
        congChucTemplates, vienChucTemplates, isLoading
    } = useConfigureRankTasks();

    return (
        <Card className="max-w-5xl mx-auto mt-6 shadow-sm border">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl font-black text-foreground">
                    <Settings2 className="w-5 h-5 text-primary" /> Cấu hình Thư viện Định biên theo Ngạch & Chức danh Công vụ
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground mt-1">
                    Hệ thống hóa danh mục công việc dựa trên phân hạng Ngạch giúp phân rã khối lượng công việc đúng năng lực, đúng thẩm quyền pháp lý.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Tabs value={selectedClass} onValueChange={(val) => setSelectedClass(val as GovClassification)} className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-6">
                        <TabsTrigger value="CONG_CHUC">
                            Khối Công chức
                        </TabsTrigger>
                        <TabsTrigger value="VIEN_CHUC">
                            Khối Viên chức
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="CONG_CHUC" className="mt-0">
                        <CivilServantTaskConfig
                            templates={congChucTemplates}
                            units={units}
                            ranks={congChucRanks}
                        />
                    </TabsContent>

                    <TabsContent value="VIEN_CHUC" className="mt-0">
                        <PublicEmployeeTaskConfig
                            templates={vienChucTemplates}
                            units={units}
                            ranks={vienChucRanks}
                        />
                    </TabsContent>
                </Tabs>
            </CardContent>

            <CardFooter className="flex justify-end pt-4 pb-4 border-t bg-muted/30 rounded-b-2xl">
                <Button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="gap-2 font-bold text-xs h-10 px-6 rounded-xl"
                >
                    {isSaving ? (
                        <>Đang lưu...</>
                    ) : (
                        <><Save className="w-4 h-4" /> LƯU ĐỒNG BỘ THƯ VIỆN NGẠCH</>
                    )}
                </Button>
            </CardFooter>
        </Card>
    );
}