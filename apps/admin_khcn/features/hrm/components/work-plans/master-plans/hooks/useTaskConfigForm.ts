/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useCreateTaskTemplate, useDeleteTaskTemplate, useUpdateTaskTemplate } from '@/features/hrm/hooks';
import { CategoryItem } from '@/features/system-admin/categories/types';
import { JobTitleItem } from '@/features/system-admin/organization/types';

interface UseTaskConfigFormProps {
    templates: any[];
    ranks: (JobTitleItem | CategoryItem)[];
    classification: 'CONG_CHUC' | 'VIEN_CHUC' | 'DANG';
    defaultRank: string;
}

export function useTaskConfigForm({ templates, ranks, classification, defaultRank }: UseTaskConfigFormProps) {
    const { mutateAsync: createTemplate } = useCreateTaskTemplate();
    const { mutateAsync: deleteTemplate } = useDeleteTaskTemplate();
    const { mutateAsync: updateTemplate } = useUpdateTaskTemplate();

    const [selectedRank, setSelectedRank] = useState<string>(defaultRank);
    const [newTaskName, setNewTaskName] = useState('');
    const [newUnit, setNewUnit] = useState('');
    const [newWeight, setNewWeight] = useState<string>('');

    const [editingId, setEditingId] = useState<number | string | null>(null);
    const [editTaskName, setEditTaskName] = useState('');
    const [editUnit, setEditUnit] = useState('');
    const [editWeight, setEditWeight] = useState<string>('');

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [deletingId, setDeletingId] = useState<number | string | null>(null);
    const [itemToDelete, setItemToDelete] = useState<any | null>(null);

    useEffect(() => {
        if (ranks.length > 0 && !ranks.find(r => r.code === selectedRank)) {
            setSelectedRank(ranks[0].code);
        }
    }, [ranks, selectedRank]);

    const handleAddTemplate = async () => {
        const trimmedName = newTaskName.trim();
        if (!trimmedName) {
            toast.error("Vui lòng nhập nội dung nhiệm vụ mẫu");
            return;
        }
        if (!newUnit) {
            toast.error("Vui lòng chọn đơn vị tính (ĐVT)");
            return;
        }

        const weightNum = newWeight ? parseFloat(newWeight) : null;
        if (weightNum !== null && (isNaN(weightNum) || weightNum < 0 || weightNum > 100)) {
            toast.error("Trọng số KPI phải là số từ 0% đến 100%");
            return;
        }

        setIsSubmitting(true);
        try {
            await createTemplate({
                classification,
                rank: selectedRank,
                taskName: trimmedName,
                defaultUnit: newUnit,
                defaultWeight: weightNum,
            });
            toast.success("Thêm nhiệm vụ mẫu vào VTVL thành công!");
            setNewTaskName('');
            setNewUnit('');
            setNewWeight('');
        } catch (error: any) {
            toast.error(error?.response?.data?.message || error?.message || 'Không thể thêm nhiệm vụ mẫu');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleRequestDelete = (item: any) => {
        setItemToDelete(item);
    };

    const handleCancelDelete = () => {
        setItemToDelete(null);
    };

    const handleConfirmDelete = async () => {
        if (!itemToDelete) return;
        setDeletingId(itemToDelete.id);
        try {
            await deleteTemplate(itemToDelete.id);
            toast.success("Đã xóa nhiệm vụ mẫu khỏi danh mục!");
            setItemToDelete(null);
        } catch (error: any) {
            toast.error(error?.response?.data?.message || error?.message || 'Không thể xóa nhiệm vụ mẫu');
        } finally {
            setDeletingId(null);
        }
    };

    const handleStartEdit = (item: any) => {
        setEditingId(item.id);
        setEditTaskName(item.taskName || '');
        setEditUnit(item.defaultUnit || '');
        setEditWeight(item.defaultWeight != null ? String(item.defaultWeight) : '');
    };

    const handleSaveEdit = async () => {
        if (!editingId) return;
        const trimmedName = editTaskName.trim();
        if (!trimmedName) {
            toast.error("Nội dung nhiệm vụ không được để trống");
            return;
        }
        if (!editUnit) {
            toast.error("Vui lòng chọn đơn vị tính");
            return;
        }

        const weightNum = editWeight ? parseFloat(editWeight) : null;
        if (weightNum !== null && (isNaN(weightNum) || weightNum < 0 || weightNum > 100)) {
            toast.error("Trọng số KPI phải là số từ 0% đến 100%");
            return;
        }

        const currentItem = templates.find(t => String(t.id) === String(editingId));
        if (!currentItem) return;

        setIsUpdating(true);
        try {
            await updateTemplate({
                id: String(editingId),
                payload: {
                    classification,
                    rank: currentItem.rank,
                    taskName: trimmedName,
                    defaultUnit: editUnit,
                    defaultWeight: weightNum,
                }
            });
            setEditingId(null);
            toast.success("Cập nhật nhiệm vụ mẫu thành công!");
        } catch (error: any) {
            toast.error(error?.response?.data?.message || error?.message || 'Không thể cập nhật nhiệm vụ mẫu');
        } finally {
            setIsUpdating(false);
        }
    };

    const handleCancelEdit = () => {
        setEditingId(null);
    };

    const handleDeleteTemplate = async (id: number | string) => {
        try {
            await deleteTemplate(String(id));
            toast.success("Đã xóa nhiệm vụ mẫu khỏi danh mục!");
        } catch (error: any) {
            toast.error(error?.response?.data?.message || error?.message || 'Không thể xóa nhiệm vụ mẫu');
        }
    };

    return {
        selectedRank,
        setSelectedRank,
        newTaskName,
        setNewTaskName,
        newUnit,
        setNewUnit,
        newWeight,
        setNewWeight,
        isSubmitting,
        isUpdating,
        deletingId,
        itemToDelete,
        handleRequestDelete,
        handleCancelDelete,
        handleConfirmDelete,
        handleDeleteTemplate,
        editingId,
        editTaskName,
        setEditTaskName,
        editUnit,
        setEditUnit,
        editWeight,
        setEditWeight,
        handleAddTemplate,
        handleStartEdit,
        handleSaveEdit,
        handleCancelEdit
    };
}
