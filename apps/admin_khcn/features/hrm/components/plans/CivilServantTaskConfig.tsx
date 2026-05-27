"use client";

import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Save, Award, Edit2, X } from 'lucide-react';
import { CategoryItem } from '@/features/system-admin/categories/types';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import { useTaskConfigForm } from './hooks/useTaskConfigForm';

export function CivilServantTaskConfig({ templates, units, ranks }: { templates: any[], units: CategoryItem[], ranks: CategoryItem[] }) {
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
        defaultRank: 'CHUYEN_VIEN'
    });

    return (
        <div className="space-y-4">
            <div className="space-y-4 bg-slate-50/50 p-4 rounded-xl border border-slate-200">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                    <div className="md:col-span-3 space-y-1">
                        <label className="text-[10px] font-black text-slate-500 uppercase">Ngạch công chức</label>
                        <Select value={selectedRank} onValueChange={setSelectedRank}>
                            <SelectTrigger className="w-full h-10 font-bold bg-white text-xs">
                                <SelectValue placeholder="Chọn ngạch" />
                            </SelectTrigger>
                            <SelectContent>
                                {ranks.length > 0 ? ranks.map(r => (
                                    <SelectItem key={r.id} value={r.code} className="text-xs">{(r as any).nameVi || r.name}</SelectItem>
                                )) : (
                                    <>
                                        <SelectItem value="CHUYEN_VIEN_CAO_CAP" className="text-xs">Chuyên viên Cao cấp</SelectItem>
                                        <SelectItem value="CHUYEN_VIEN_CHINH" className="text-xs">Chuyên viên Chính</SelectItem>
                                        <SelectItem value="CHUYEN_VIEN" className="text-xs">Chuyên viên</SelectItem>
                                        <SelectItem value="CAN_SU" className="text-xs">Cán sự</SelectItem>
                                        <SelectItem value="NHAN_VIEN" className="text-xs">Nhân viên</SelectItem>
                                    </>
                                )}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="md:col-span-6 space-y-1">
                        <label className="text-[10px] font-black text-slate-500 uppercase">Nhiệm vụ định biên mẫu bám sát tiêu chuẩn ngạch</label>
                        <Input
                            placeholder="Nhập nội dung tác vụ hành chính..."
                            value={newTaskName}
                            onChange={e => setNewTaskName(e.target.value)}
                            className="h-10 font-semibold bg-white text-xs"
                        />
                    </div>

                    <div className="md:col-span-2 space-y-1">
                        <label className="text-[10px] font-black text-slate-500 uppercase">Đơn vị tính</label>
                        <Select value={newUnit || undefined} onValueChange={setNewUnit}>
                            <SelectTrigger className="w-full h-10 font-bold bg-white text-xs">
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
                        <Button type="button" onClick={handleAddTemplate} className="w-full h-10 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white">
                            <Plus className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </div>

            <div className="border rounded-xl overflow-hidden bg-white">
                <div className="bg-slate-900 text-white px-4 py-3 text-xs font-black uppercase tracking-wider flex items-center gap-2">
                    <Award className="w-4 h-4 text-amber-400" />
                    Thư viện phân cấp nhiệm vụ công vụ hiện hành
                </div>
                <div className="divide-y divide-slate-100 max-h-[400px] overflow-y-auto">
                    {templates.map(item => (
                        <div key={item.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-slate-50/60 transition-colors text-xs">
                            <div className="space-y-1 w-full sm:w-auto flex-1">
                                {editingId === item.id ? (
                                    <div className="flex flex-col sm:flex-row gap-2 w-full items-center">
                                        <Input
                                            value={editTaskName}
                                            onChange={e => setEditTaskName(e.target.value)}
                                            className="h-8 flex-1 font-semibold text-xs"
                                        />
                                        <Select value={editUnit || undefined} onValueChange={setEditUnit}>
                                            <SelectTrigger className="w-[180px] h-8 font-bold text-xs bg-white">
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
                                    <div className="font-bold text-slate-900 leading-relaxed">{item.taskName}</div>
                                )}
                                <div className="flex items-center gap-2">
                                    <span className={`text-[9px] font-black px-2 py-0.5 rounded border ${item.rank === 'CHUYEN_VIEN_CAO_CAP' ? 'bg-red-50 border-red-200 text-red-700' :
                                        item.rank === 'CHUYEN_VIEN_CHINH' ? 'bg-amber-50 border-amber-200 text-amber-700' :
                                            item.rank === 'CHUYEN_VIEN' ? 'bg-blue-50 border-blue-200 text-blue-700' :
                                                'bg-purple-50 border-purple-200 text-purple-700'
                                        }`}>
                                        {item.rank.replace(/_/g, ' ')}
                                    </span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                                {editingId === item.id ? (
                                    <>
                                        <Button variant="ghost" size="icon" onClick={handleSaveEdit} className="text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 h-8 w-8">
                                            <Save className="w-4 h-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" onClick={handleCancelEdit} className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 h-8 w-8">
                                            <X className="w-4 h-4" />
                                        </Button>
                                    </>
                                ) : (
                                    <>
                                        <span className="bg-slate-100 font-mono font-bold text-slate-600 px-2.5 py-0.5 rounded text-[10px] mr-2">
                                            Chuẩn đầu ra: {item.defaultUnit}
                                        </span>
                                        <Button variant="ghost" size="icon" onClick={() => handleStartEdit(item)} className="text-slate-400 hover:text-indigo-600 h-8 w-8">
                                            <Edit2 className="w-4 h-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" onClick={() => handleDeleteTemplate(item.id)} className="text-slate-400 hover:text-red-600 h-8 w-8">
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
