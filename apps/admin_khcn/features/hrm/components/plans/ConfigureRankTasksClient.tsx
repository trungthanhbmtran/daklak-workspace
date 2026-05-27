"use client";

import React, { useState, useEffect } from 'react';
import { Settings2, Shield, Plus, Trash2, Save, CheckCircle2, Award, Users, Edit2, X } from 'lucide-react';
import { useTaskTemplatesList, useCreateTaskTemplate, useDeleteTaskTemplate, useUpdateTaskTemplate } from '../../hooks';
import { categoryApi } from '@/features/system-admin/categories/api';
import { CategoryItem } from '@/features/system-admin/categories/types';

export type GovClassification = 'CONG_CHUC' | 'VIEN_CHUC';
export type GovRank = 'CHUYEN_VIEN_CAO_CAP' | 'CHUYEN_VIEN_CHINH' | 'CHUYEN_VIEN' | 'CAN_SU' | 'NHAN_VIEN' | 'VIEN_CHUC_HANG_1' | 'VIEN_CHUC_HANG_2' | 'VIEN_CHUC_HANG_3' | 'VIEN_CHUC_HANG_4';


export function ConfigureRankTasksClient() {
    const { data, isLoading } = useTaskTemplatesList();
    const templates = data?.data || [];

    const { mutateAsync: createTemplate } = useCreateTaskTemplate();
    const { mutateAsync: deleteTemplate } = useDeleteTaskTemplate();
    const { mutateAsync: updateTemplate } = useUpdateTaskTemplate();

    const [units, setUnits] = useState<CategoryItem[]>([]);
    useEffect(() => {
        categoryApi.fetchAll().then(data => {
            setUnits(data.filter(c => c.group === 'UNIT'));
        });
    }, []);

    const [selectedClass, setSelectedClass] = useState<GovClassification>('CONG_CHUC');
    const [selectedRank, setSelectedRank] = useState<GovRank>('CHUYEN_VIEN');
    const [newTaskName, setNewTaskName] = useState('');
    const [newUnit, setNewUnit] = useState('');
    const [isSaved, setIsSaved] = useState(false);

    const [editingId, setEditingId] = useState<string | null>(null);
    const [editTaskName, setEditTaskName] = useState('');
    const [editUnit, setEditUnit] = useState('');

    const handleAddTemplate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTaskName.trim()) return;

        console.log('classification', selectedClass);
        console.log('rank', selectedRank);
        console.log('taskName', newTaskName);
        console.log('defaultUnit', newUnit);

        const payload = {
            classification: selectedClass,
            rank: selectedRank,
            taskName: newTaskName.trim(),
            defaultUnit: newUnit
        };

        try {
            await createTemplate(payload);
            setNewTaskName('');
        } catch (error) {
            console.error('Error adding template', error);
        }
    };

    const handleDeleteTemplate = async (id: string) => {
        try {
            await deleteTemplate(id);
        } catch (error) {
            console.error('Error deleting template', error);
        }
    };

    const handleSaveEdit = async () => {
        if (!editingId || !editTaskName.trim()) return;
        try {
            await updateTemplate({
                id: editingId,
                payload: {
                    classification: selectedClass,
                    rank: selectedRank,
                    taskName: editTaskName.trim(),
                    defaultUnit: editUnit,
                }
            });
            setEditingId(null);
        } catch (error) {
            console.error('Error updating template', error);
        }
    };

    return (
        <div className="space-y-6 max-w-5xl mx-auto p-6 bg-white rounded-2xl border border-slate-200 shadow-sm mt-6">
            <div>
                <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                    <Settings2 className="w-5 h-5 text-indigo-600" /> Cấu hình Thư viện Định biên theo Ngạch & Chức danh Công vụ
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                    Hệ thống hóa danh mục công việc dựa trên phân hạng Ngạch (Chuyên viên Cao cấp, Chuyên viên Chính, Chuyên viên) giúp phân rã khối lượng công việc đúng năng lực, đúng thẩm quyền pháp lý.
                </p>
            </div>

            {/* CHỌN KHỐI ĐỐI TƯỢNG TỔNG THỂ */}
            <div className="grid grid-cols-2 gap-4 bg-slate-50 p-1.5 rounded-xl border">
                <button
                    onClick={() => { setSelectedClass('CONG_CHUC'); setSelectedRank('CHUYEN_VIEN'); }}
                    className={`py-2.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${selectedClass === 'CONG_CHUC' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-500'}`}
                >
                    <Shield className="w-4 h-4" /> KHỐI CÔNG CHỨC (Hành chính công)
                </button>
                <button
                    onClick={() => { setSelectedClass('VIEN_CHUC'); setSelectedRank('VIEN_CHUC_HANG_3'); }}
                    className={`py-2.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${selectedClass === 'VIEN_CHUC' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-500'}`}
                >
                    <Users className="w-4 h-4" /> KHỐI VIÊN CHỨC (Đơn vị sự nghiệp/Kỹ thuật)
                </button>
            </div>

            {/* FORM THIẾT LẬP CHI TIẾT */}
            <form onSubmit={handleAddTemplate} className="space-y-4 bg-slate-50/50 p-4 rounded-xl border border-slate-200">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                    <div className="md:col-span-3 space-y-1">
                        <label className="text-[10px] font-black text-slate-500 uppercase">
                            {selectedClass === 'CONG_CHUC' ? 'Ngạch công chức' : 'Chức danh nghề nghiệp'}
                        </label>
                        <select
                            value={selectedRank}
                            onChange={e => setSelectedRank(e.target.value as GovRank)}
                            className="w-full h-10 text-xs border rounded-lg px-3 bg-white border-slate-200 font-bold text-slate-700 focus:outline-none"
                        >
                            {selectedClass === 'CONG_CHUC' ? (
                                <>
                                    <option value="CHUYEN_VIEN_CAO_CAP">Chuyên viên Cao cấp</option>
                                    <option value="CHUYEN_VIEN_CHINH">Chuyên viên Chính</option>
                                    <option value="CHUYEN_VIEN">Chuyên viên</option>
                                    <option value="CAN_SU">Cán sự</option>
                                    <option value="NHAN_VIEN">Nhân viên</option>
                                </>
                            ) : (
                                <>
                                    <option value="VIEN_CHUC_HANG_1">Viên chức Hạng I</option>
                                    <option value="VIEN_CHUC_HANG_2">Viên chức Hạng II</option>
                                    <option value="VIEN_CHUC_HANG_3">Viên chức Hạng III</option>
                                    <option value="VIEN_CHUC_HANG_4">Viên chức Hạng IV</option>
                                </>
                            )}
                        </select>
                    </div>

                    <div className="md:col-span-6 space-y-1">
                        <label className="text-[10px] font-black text-slate-500 uppercase">Nhiệm vụ định biên mẫu bám sát tiêu chuẩn ngạch</label>
                        <input
                            type="text"
                            placeholder="Nhập nội dung tác vụ hành chính..."
                            value={newTaskName}
                            onChange={e => setNewTaskName(e.target.value)}
                            className="w-full h-10 text-xs border rounded-lg px-3 bg-white border-slate-200 font-semibold focus:outline-none"
                            required
                        />
                    </div>

                    <div className="md:col-span-2 space-y-1">
                        <label className="text-[10px] font-black text-slate-500 uppercase">Đơn vị tính</label>
                        <select
                            value={newUnit}
                            onChange={e => setNewUnit(e.target.value)}
                            className="w-full h-10 text-xs border rounded-lg px-3 bg-white border-slate-200 font-bold focus:outline-none"
                            required
                        >
                            <option value="">-- Chọn ĐVT --</option>
                            {units.map(u => (
                                <option key={u.id} value={u.name}>{u.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="md:col-span-1">
                        <button type="submit" className="w-full h-10 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-xs flex items-center justify-center">
                            <Plus className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </form>

            {/* DANH SÁCH HIỂN THỊ PHÂN RÃ THEO NGẠCH THỰC TẾ */}
            <div className="border rounded-xl overflow-hidden bg-white">
                <div className="bg-slate-900 text-white px-4 py-3 text-xs font-black uppercase tracking-wider flex items-center gap-2">
                    <Award className="w-4 h-4 text-amber-400" />
                    Thư viện phân cấp nhiệm vụ công vụ hiện hành
                </div>
                <div className="divide-y divide-slate-100 max-h-[400px] overflow-y-auto">
                    {templates
                        .filter(t => t.classification === selectedClass)
                        .map(item => (
                            <div key={item.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-slate-50/60 transition-colors text-xs">
                                <div className="space-y-1 w-full sm:w-auto flex-1">
                                    {editingId === item.id ? (
                                        <div className="flex flex-col sm:flex-row gap-2 w-full">
                                            <input
                                                type="text"
                                                value={editTaskName}
                                                onChange={e => setEditTaskName(e.target.value)}
                                                className="h-8 text-xs border rounded px-2 flex-1 font-semibold focus:outline-none"
                                            />
                                            <select
                                                value={editUnit}
                                                onChange={e => setEditUnit(e.target.value)}
                                                className="h-8 text-xs border rounded px-2 font-bold focus:outline-none"
                                            >
                                                <option value="">-- Chọn ĐVT --</option>
                                                {units.map(u => (
                                                    <option key={u.id} value={u.name}>{u.name}</option>
                                                ))}
                                            </select>
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
                                            <button onClick={handleSaveEdit} className="text-indigo-600 hover:text-indigo-800 p-1 bg-indigo-50 rounded">
                                                <Save className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => setEditingId(null)} className="text-slate-400 hover:text-slate-600 p-1 bg-slate-100 rounded">
                                                <X className="w-4 h-4" />
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <span className="bg-slate-100 font-mono font-bold text-slate-600 px-2.5 py-0.5 rounded text-[10px] mr-2">
                                                Chuẩn đầu ra: {item.defaultUnit}
                                            </span>
                                            <button onClick={() => {
                                                setEditingId(item.id);
                                                setEditTaskName(item.taskName);
                                                setEditUnit(item.defaultUnit);
                                            }} className="text-slate-400 hover:text-indigo-600 p-1">
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => handleDeleteTemplate(item.id)} className="text-slate-400 hover:text-red-600 p-1">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        ))}
                </div>
            </div>

            <div className="flex justify-end pt-2 border-t">
                <button onClick={() => { setIsSaved(true); setTimeout(() => setIsSaved(false), 2000); }} className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-6 h-10 rounded-xl flex items-center gap-2 shadow-sm">
                    <Save className="w-4 h-4" /> LƯU ĐỒNG BỘ THƯ VIỆN NGẠCH
                </button>
            </div>
        </div>
    );
}