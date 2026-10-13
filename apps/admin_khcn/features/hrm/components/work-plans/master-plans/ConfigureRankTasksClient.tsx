"use client";

import React from 'react';
import { Settings2, Save, Building2, Briefcase, ShieldCheck } from 'lucide-react';
import { CivilServantTaskConfig } from './CivilServantTaskConfig';
import { PublicEmployeeTaskConfig } from './PublicEmployeeTaskConfig';
import { PartyTaskConfig } from './PartyTaskConfig';
import { useConfigureRankTasks } from './hooks/useConfigureRankTasks';

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";

export type GovClassification = 'CONG_CHUC' | 'VIEN_CHUC' | 'DANG';

export function ConfigureRankTasksClient() {
    const {
        selectedClass, setSelectedClass, isSaving, handleSave,
        units, congChucRanks, vienChucRanks, dangRanks,
        congChucTemplates, vienChucTemplates, dangTemplates,
    } = useConfigureRankTasks();

    return (
        <Card className="w-full mx-auto mt-2 shadow-sm border rounded-2xl flex flex-col flex-1 min-w-0">
            <CardHeader className="min-w-0 pb-4">
                <CardTitle className="flex items-center gap-2.5 text-lg sm:text-xl font-black text-foreground min-w-0">
                    <div className="p-2 bg-primary/10 rounded-xl text-primary shrink-0">
                        <Settings2 className="w-5 h-5" />
                    </div>
                    <span className="truncate">Cấu hình Thư viện Nhiệm vụ theo Vị trí việc làm</span>
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground mt-1 max-w-4xl leading-relaxed break-words">
                    Hệ thống hóa danh mục công việc dựa trên phân hạng Vị trí việc làm chuẩn hóa theo quy định Trung ương (Nghị định 62/2020/NĐ-CP, Nghị định 106/2020/NĐ-CP và Quy định 137-QĐ/TW của Ban Bí thư).
                </CardDescription>
            </CardHeader>
            <CardContent className="min-w-0 flex-1 flex flex-col">
                <Tabs value={selectedClass} onValueChange={(val) => setSelectedClass(val as GovClassification)} className="w-full flex flex-col flex-1 min-w-0">
                    <TabsList className="grid w-full grid-cols-3 mb-6 p-1 bg-muted rounded-xl h-11 shrink-0">
                        <TabsTrigger value="CONG_CHUC" className="rounded-lg text-xs font-semibold gap-1.5 flex items-center min-w-0">
                            <Building2 className="w-3.5 h-3.5 shrink-0" />
                            <span className="truncate">Khối Công chức (NĐ 62)</span>
                        </TabsTrigger>
                        <TabsTrigger value="VIEN_CHUC" className="rounded-lg text-xs font-semibold gap-1.5 flex items-center min-w-0">
                            <Briefcase className="w-3.5 h-3.5 shrink-0" />
                            <span className="truncate">Khối Viên chức (NĐ 106)</span>
                        </TabsTrigger>
                        <TabsTrigger value="DANG" className="rounded-lg text-xs font-semibold gap-1.5 flex items-center min-w-0">
                            <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                            <span className="truncate">Khối Cơ quan Đảng (QĐ 137)</span>
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="CONG_CHUC" className="mt-0 min-w-0 flex-1">
                        <CivilServantTaskConfig
                            templates={congChucTemplates}
                            units={units}
                            ranks={congChucRanks}
                        />
                    </TabsContent>

                    <TabsContent value="VIEN_CHUC" className="mt-0 min-w-0 flex-1">
                        <PublicEmployeeTaskConfig
                            templates={vienChucTemplates}
                            units={units}
                            ranks={vienChucRanks}
                        />
                    </TabsContent>

                    <TabsContent value="DANG" className="mt-0 min-w-0 flex-1">
                        <PartyTaskConfig
                            templates={dangTemplates}
                            units={units}
                            ranks={dangRanks}
                        />
                    </TabsContent>
                </Tabs>
            </CardContent>

            <CardFooter className="flex justify-end pt-4 pb-4 border-t bg-muted/30 rounded-b-2xl shrink-0">
                <Button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="gap-2 font-bold text-xs h-10 px-6 rounded-xl"
                >
                    {isSaving ? (
                        <>Đang lưu...</>
                    ) : (
                        <><Save className="w-4 h-4" /> LƯU ĐỒNG BỘ THƯ VIỆN VTVL</>
                    )}
                </Button>
            </CardFooter>
        </Card>
    );
}