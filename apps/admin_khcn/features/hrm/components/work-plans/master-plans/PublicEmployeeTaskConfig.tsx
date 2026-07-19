"use client";

import React, { useState } from 'react';
import { Plus, Trash2, Save, Award, Edit2, X, Search } from 'lucide-react';
import { CategoryItem } from '@/features/system-admin/categories/types';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Heading } from "@/components/ui/typography";

import { useTaskConfigForm } from './hooks/useTaskConfigForm';

export function PublicEmployeeTaskConfig({ templates, units, ranks }: { templates: any[], units: CategoryItem[], ranks: CategoryItem[] }) {
    const [searchQuery, setSearchQuery] = useState('');
    
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
        classification: 'VIEN_CHUC',
        defaultRank: 'GRADE_3'
    });

    const filteredTemplates = templates.filter(t => 
        t.rank === selectedRank && 
        t.taskName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="flex flex-col md:flex-row gap-6 h-[600px]">
            {/* Left Sidebar: Ranks */}
            <div className="w-full md:w-[280px] flex-shrink-0 flex flex-col h-full border rounded-xl overflow-hidden bg-background shadow-sm">
                <div className="p-4 bg-muted/30 border-b flex-shrink-0">
                    <Heading level="h4" className="font-semibold uppercase tracking-wider">Chức danh nghề nghiệp</Heading>
                </div>
                <ScrollArea className="flex-1 w-full">
                    <div className="flex flex-col gap-1 p-3">
                        {ranks.map(r => (
                            <Button
                                key={r.id}
                                variant={selectedRank === r.code ? "secondary" : "ghost"}
                                onClick={() => setSelectedRank(r.code)}
                                className={`justify-start text-left h-auto py-2.5 px-3 transition-colors ${selectedRank === r.code ? 'border-l-4 border-primary rounded-l-none bg-secondary' : ''}`}
                            >
                                <span className={`text-xs font-semibold whitespace-normal leading-tight ${selectedRank === r.code ? 'text-primary' : 'text-muted-foreground'}`}>
                                    {(r as any).nameVi || r.name}
                                </span>
                            </Button>
                        ))}
                    </div>
                </ScrollArea>
            </div>

            {/* Right Main Area */}
            <div className="flex-1 flex flex-col min-w-0 h-full border rounded-xl overflow-hidden bg-background shadow-sm">
                
                {/* Add Template Form */}
                <div className="p-4 bg-muted/10 border-b flex-shrink-0 space-y-3">
                    <Heading level="h4" className="font-semibold">Thêm nhiệm vụ mẫu</Heading>
                    <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-end">
                        <div className="flex-1 w-full space-y-1.5">
                            <label className="text-[10px] font-bold text-muted-foreground uppercase">Nội dung nhiệm vụ</label>
                            <Input
                                placeholder="Nhập tên nhiệm vụ mẫu..."
                                value={newTaskName}
                                onChange={e => setNewTaskName(e.target.value)}
                                className="h-9 text-xs"
                            />
                        </div>
                        <div className="w-full sm:w-[150px] space-y-1.5">
                            <label className="text-[10px] font-bold text-muted-foreground uppercase">Đơn vị tính</label>
                            <Select value={newUnit || undefined} onValueChange={setNewUnit}>
                                <SelectTrigger className="w-full h-9 text-xs bg-background">
                                    <SelectValue placeholder="Chọn ĐVT" />
                                </SelectTrigger>
                                <SelectContent>
                                    {units.map(u => (
                                        <SelectItem key={u.id} value={(u as any).nameVi || u.name} className="text-xs">{(u as any).nameVi || u.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <Button type="button" onClick={handleAddTemplate} className="w-full sm:w-auto h-9 px-4 gap-2 text-xs">
                            <Plus className="w-3.5 h-3.5" /> Thêm mới
                        </Button>
                    </div>
                </div>

                {/* Templates List Header */}
                <div className="p-3 px-4 bg-muted/30 border-b flex-shrink-0 flex items-center justify-between gap-4">
                    <div className="text-sm font-semibold flex items-center gap-2">
                        <Award className="w-4 h-4 text-primary" />
                        Thư viện Nhiệm vụ 
                        <Badge variant="outline" className="ml-2 font-normal">{filteredTemplates.length}</Badge>
                    </div>
                    <div className="relative w-[200px]">
                        <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <Input 
                            placeholder="Tìm kiếm..." 
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="h-8 pl-8 text-xs bg-background"
                        />
                    </div>
                </div>

                {/* Templates List */}
                <ScrollArea className="flex-1 w-full">
                    <div className="divide-y">
                        {filteredTemplates.length === 0 ? (
                            <div className="p-10 flex flex-col items-center justify-center text-center text-muted-foreground text-sm">
                                <Award className="w-8 h-8 mb-3 opacity-20" />
                                <p>Chưa có nhiệm vụ mẫu nào được cấu hình cho ngạch này.</p>
                            </div>
                        ) : filteredTemplates.map(item => (
                            <div key={item.id} className="p-3 px-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-muted/50 transition-colors">
                                <div className="w-full sm:w-auto flex-1">
                                    {editingId === item.id ? (
                                        <div className="flex gap-2 w-full items-center">
                                            <Input
                                                value={editTaskName}
                                                onChange={e => setEditTaskName(e.target.value)}
                                                className="h-8 flex-1 text-xs"
                                            />
                                            <Select value={editUnit || undefined} onValueChange={setEditUnit}>
                                                <SelectTrigger className="w-[120px] h-8 text-xs bg-background">
                                                    <SelectValue placeholder="ĐVT" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {units.map(u => (
                                                        <SelectItem key={u.id} value={(u as any).nameVi || u.name} className="text-xs">{(u as any).nameVi || u.name}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    ) : (
                                        <div className="font-medium text-sm text-foreground leading-relaxed whitespace-normal break-words">
                                            {item.taskName}
                                        </div>
                                    )}
                                </div>
                                
                                <div className="flex items-center gap-1 shrink-0 self-end sm:self-center">
                                    {editingId === item.id ? (
                                        <>
                                            <Button variant="ghost" size="icon" onClick={handleSaveEdit} className="text-primary hover:bg-primary/10 h-8 w-8">
                                                <Save className="w-4 h-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" onClick={handleCancelEdit} className="text-muted-foreground hover:bg-muted h-8 w-8">
                                                <X className="w-4 h-4" />
                                            </Button>
                                        </>
                                    ) : (
                                        <>
                                            <Badge variant="secondary" className="font-mono text-[10px] mr-2">
                                                {item.defaultUnit}
                                            </Badge>
                                            <Button variant="ghost" size="icon" onClick={() => handleStartEdit(item)} className="text-muted-foreground hover:text-primary h-8 w-8">
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
                </ScrollArea>
            </div>
        </div>
    );
}
