"use client";

import React from 'react';
import {
    Save,
    Building2,
    Briefcase,
    ShieldCheck,
    RotateCw,
    Library,
    Sparkles
} from 'lucide-react';
import { CivilServantTaskConfig } from './CivilServantTaskConfig';
import { PublicEmployeeTaskConfig } from './PublicEmployeeTaskConfig';
import { PartyTaskConfig } from './PartyTaskConfig';
import { useConfigureRankTasks } from './hooks/useConfigureRankTasks';

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export type GovClassification = 'CONG_CHUC' | 'VIEN_CHUC' | 'DANG';

export function ConfigureRankTasksClient() {
    const {
        selectedClass,
        setSelectedClass,
        isSaving,
        handleSave,
        refetchAll,
        units,
        congChucRanks,
        vienChucRanks,
        dangRanks,
        congChucTemplates,
        vienChucTemplates,
        dangTemplates,
        isLoading
    } = useConfigureRankTasks();

    return (
        <div className="w-full flex-1 min-h-0 flex flex-col gap-4 min-w-0">
            {/* Top Enterprise Page Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 p-4 sm:p-5 rounded-2xl border bg-card/80 shadow-xs backdrop-blur-xs min-w-0 shrink-0">
                <div className="flex items-start sm:items-center gap-3.5 min-w-0">
                    <div className="p-2.5 rounded-xl bg-primary/10 text-primary shrink-0 ring-1 ring-primary/20">
                        <Library className="w-6 h-6" />
                    </div>
                    <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap min-w-0">
                            <h1 className="text-lg sm:text-xl font-black tracking-tight text-foreground truncate">
                                Thư viện Nhiệm vụ theo Vị trí việc làm (VTVL)
                            </h1>
                            <Badge variant="outline" className="text-[11px] font-bold bg-primary/5 text-primary border-primary/20">
                                <Sparkles className="w-3 h-3 mr-1" /> Chuẩn hóa Nhà nước
                            </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5 max-w-4xl leading-relaxed break-words">
                            Hệ thống hóa danh mục công việc định mức theo phân hạng VTVL (Nghị định 62/2020/NĐ-CP, Nghị định 106/2020/NĐ-CP và Quy định 137-QĐ/TW của Ban Bí thư).
                        </p>
                    </div>
                </div>

                {/* Right Header Actions */}
                <div className="flex items-center gap-2 self-start lg:self-center shrink-0">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={refetchAll}
                        disabled={isLoading}
                        className="h-9 px-3 gap-1.5 text-xs font-semibold rounded-xl"
                        title="Tải lại toàn bộ dữ liệu VTVL và Thư viện"
                    >
                        <RotateCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                        <span className="hidden sm:inline">Làm mới</span>
                    </Button>

                    <Button
                        size="sm"
                        onClick={handleSave}
                        disabled={isSaving || isLoading}
                        className="h-9 px-4 gap-1.5 font-bold text-xs rounded-xl shadow-xs"
                    >
                        {isSaving ? (
                            <>
                                <RotateCw className="w-3.5 h-3.5 animate-spin" />
                                <span>Đang đồng bộ...</span>
                            </>
                        ) : (
                            <>
                                <Save className="w-3.5 h-3.5" />
                                <span>Đồng bộ thư viện</span>
                            </>
                        )}
                    </Button>
                </div>
            </div>

            {/* Classification Tabs Navigation & Content */}
            <Tabs
                value={selectedClass}
                onValueChange={(val) => setSelectedClass(val as GovClassification)}
                className="w-full flex-1 min-h-0 flex flex-col min-w-0"
            >
                {/* Enterprise Segmented Tabs List */}
                <TabsList className="grid w-full grid-cols-3 p-1.5 bg-muted/70 rounded-2xl h-12 shrink-0 border shadow-2xs gap-1">
                    <TabsTrigger
                        value="CONG_CHUC"
                        className="rounded-xl text-xs font-bold gap-2 flex items-center justify-center min-w-0 transition-all data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-xs"
                    >
                        <Building2 className="w-4 h-4 shrink-0 text-blue-600" />
                        <span className="truncate">Khối Công chức (NĐ 62)</span>
                        <Badge variant="secondary" className="hidden sm:inline-flex text-[10px] font-mono py-0 px-1.5 h-4 ml-1">
                            {congChucTemplates.length}
                        </Badge>
                    </TabsTrigger>

                    <TabsTrigger
                        value="VIEN_CHUC"
                        className="rounded-xl text-xs font-bold gap-2 flex items-center justify-center min-w-0 transition-all data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-xs"
                    >
                        <Briefcase className="w-4 h-4 shrink-0 text-amber-600" />
                        <span className="truncate">Khối Viên chức (NĐ 106)</span>
                        <Badge variant="secondary" className="hidden sm:inline-flex text-[10px] font-mono py-0 px-1.5 h-4 ml-1">
                            {vienChucTemplates.length}
                        </Badge>
                    </TabsTrigger>

                    <TabsTrigger
                        value="DANG"
                        className="rounded-xl text-xs font-bold gap-2 flex items-center justify-center min-w-0 transition-all data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-xs"
                    >
                        <ShieldCheck className="w-4 h-4 shrink-0 text-red-600" />
                        <span className="truncate">Cơ quan Đảng (QĐ 137)</span>
                        <Badge variant="secondary" className="hidden sm:inline-flex text-[10px] font-mono py-0 px-1.5 h-4 ml-1">
                            {dangTemplates.length}
                        </Badge>
                    </TabsTrigger>
                </TabsList>

                {/* Tab 1: Công chức */}
                <TabsContent value="CONG_CHUC" className="mt-4 flex-1 min-h-0 flex flex-col min-w-0 data-[state=inactive]:hidden">
                    <CivilServantTaskConfig
                        templates={congChucTemplates}
                        units={units}
                        ranks={congChucRanks}
                        isLoading={isLoading}
                    />
                </TabsContent>

                {/* Tab 2: Viên chức */}
                <TabsContent value="VIEN_CHUC" className="mt-4 flex-1 min-h-0 flex flex-col min-w-0 data-[state=inactive]:hidden">
                    <PublicEmployeeTaskConfig
                        templates={vienChucTemplates}
                        units={units}
                        ranks={vienChucRanks}
                        isLoading={isLoading}
                    />
                </TabsContent>

                {/* Tab 3: Đảng */}
                <TabsContent value="DANG" className="mt-4 flex-1 min-h-0 flex flex-col min-w-0 data-[state=inactive]:hidden">
                    <PartyTaskConfig
                        templates={dangTemplates}
                        units={units}
                        ranks={dangRanks}
                        isLoading={isLoading}
                    />
                </TabsContent>
            </Tabs>
        </div>
    );
}