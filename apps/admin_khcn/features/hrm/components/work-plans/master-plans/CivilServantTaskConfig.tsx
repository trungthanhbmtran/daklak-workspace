"use client";

import React, { useState } from 'react';
import { Plus, Trash2, Save, Award, Edit2, X, Search, Filter } from 'lucide-react';
import { CategoryItem } from '@/features/system-admin/categories/types';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import { useTaskConfigForm } from './hooks/useTaskConfigForm';

export function CivilServantTaskConfig({ templates, units, ranks }: { templates: any[], units: CategoryItem[], ranks: CategoryItem[] }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [filterRank, setFilterRank] = useState('ALL');
    const {
        selectedRank, setSelectedRank,
        newTaskName, setNewTaskName,
        newUnit, setNewUnit,
        editingId,
        editTaskName, setEditTaskName,
        editUnit, setEditUnit,
        handleAddTemplate,
        handleDeleteTemplate,
        handleStartEdit,
        handleSaveEdit,
        handleCancelEdit
    } = useTaskConfigForm({
        templates,
        ranks,
        classification: 'CONG_CHUC',
        defaultRank: 'SPECIALIST'
    });

    const filteredTemplates = templates.filter(t => 
        (filterRank === 'ALL' || t.rank === filterRank) && 
        t.taskName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-4">
            <div className="space-y-4 bg-muted/30 p-4 rounded-xl border">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                    <div className="md:col-span-3 space-y-1">
                        <label className="text-[10px] font-black text-muted-foreground uppercase">Ngạch công chức</label>
                        <Select value={selectedRank} onValueChange={setSelectedRank}>
                            <SelectTrigger className="w-full h-10 font-bold bg-background text-xs">
                                <SelectValue placeholder="Chọn ngạch" />
                            </SelectTrigger>
                            <SelectContent>
                                {ranks.map(r => (
                                    <SelectItem key={r.id} value={r.code} className="text-xs">{(r as any).nameVi || r.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="md:col-span-6 space-y-1">
                        <label className="text-[10px] font-black text-muted-foreground uppercase">Nhiệm vụ định biên mẫu bám sát tiêu chuẩn ngạch</label>
                        <Input
                            placeholder="Nhập nội dung tác vụ hành chính..."
                            value={newTaskName}
                            onChange={e => setNewTaskName(e.target.value)}
                            className="h-10 font-semibold bg-background text-xs"
                        />
                    </div>

                    <div className="md:col-span-2 space-y-1">
                        <label className="text-[10px] font-black text-muted-foreground uppercase">Đơn vị tính</label>
                        <Select value={newUnit || undefined} onValueChange={setNewUnit}>
                            <SelectTrigger className="w-full h-10 font-bold bg-background text-xs">
                                <SelectValue placeholder="-- Chọn ĐVT --" />
                            </SelectTrigger>
                            <SelectContent>
                                {units.map(u => (
                                    <SelectItem key={u.id} value={(u as any).nameVi || u.name} className="text-xs">{(u as any).nameVi || u.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="md:col-span-1">
                        <Button type="button" onClick={handleAddTemplate} className="w-full h-10 rounded-lg">
                            <Plus className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </div>

            <div className="border rounded-xl overflow-hidden bg-card">
                <div className="bg-primary text-primary-foreground px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="text-xs font-black uppercase tracking-wider flex items-center gap-2">
                        <Award className="w-4 h-4" />
                        Thư viện phân cấp nhiệm vụ công vụ hiện hành
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="relative">
                            <Search className="w-4 h-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-primary-foreground/60" />
                            <Input 
                                placeholder="Tìm kiếm công việc..." 
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                className="h-8 pl-8 text-xs bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/60 w-[200px] focus-visible:ring-primary-foreground/30"
                            />
                        </div>
                        <Select value={filterRank} onValueChange={setFilterRank}>
                            <SelectTrigger className="h-8 text-xs font-semibold bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground w-[160px] focus:ring-primary-foreground/30">
                                <div className="flex items-center gap-2"><Filter className="w-3 h-3"/> <SelectValue placeholder="Lọc theo ngạch" /></div>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL" className="text-xs font-bold">Tất cả các ngạch</SelectItem>
                                {ranks.map(r => (
                                    <SelectItem key={r.id} value={r.code} className="text-xs">{(r as any).nameVi || r.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <div className="divide-y max-h-[400px] overflow-y-auto">
                    {filteredTemplates.length === 0 ? (
                        <div className="p-8 text-center text-muted-foreground text-xs">Không tìm thấy công việc mẫu nào.</div>
                    ) : filteredTemplates.map(item => (
                        <div key={item.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-muted/50 transition-colors text-xs">
                            <div className="space-y-1 w-full sm:w-auto flex-1">
                                {editingId === item.id ? (
                                    <div className="flex flex-col sm:flex-row gap-2 w-full items-center">
                                        <Input
                                            value={editTaskName}
                                            onChange={e => setEditTaskName(e.target.value)}
                                            className="h-8 flex-1 font-semibold text-xs"
                                        />
                                        <Select value={editUnit || undefined} onValueChange={setEditUnit}>
                                            <SelectTrigger className="w-[180px] h-8 font-bold text-xs bg-background">
                                                <SelectValue placeholder="-- Chọn ĐVT --" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {units.map(u => (
                                                    <SelectItem key={u.id} value={(u as any).nameVi || u.name} className="text-xs">{(u as any).nameVi || u.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                ) : (
                                    <div className="font-bold text-foreground leading-relaxed">{item.taskName}</div>
                                )}
                                <div className="flex items-center gap-2">
                                    <Badge variant="outline" className="text-[9px] font-black px-2 py-0.5 rounded uppercase">
                                        {(ranks.find(r => r.code === item.rank) as any)?.nameVi || ranks.find(r => r.code === item.rank)?.name || item.rank.replace(/_/g, ' ')}
                                    </Badge>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                                {editingId === item.id ? (
                                    <>
                                        <Button variant="ghost" size="icon" onClick={handleSaveEdit} className="text-primary hover:text-primary hover:bg-primary/10 h-8 w-8">
                                            <Save className="w-4 h-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" onClick={handleCancelEdit} className="text-muted-foreground hover:text-foreground hover:bg-muted h-8 w-8">
                                            <X className="w-4 h-4" />
                                        </Button>
                                    </>
                                ) : (
                                    <>
                                        <span className="bg-muted font-mono font-bold text-muted-foreground px-2.5 py-0.5 rounded text-[10px] mr-2">
                                            Chuẩn đầu ra: {item.defaultUnit}
                                        </span>
                                        <Button variant="ghost" size="icon" onClick={() => handleStartEdit(item)} className="text-muted-foreground hover:text-primary hover:bg-primary/10 h-8 w-8">
                                            <Edit2 className="w-4 h-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" onClick={() => handleDeleteTemplate(item.id)} className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 h-8 w-8">
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
