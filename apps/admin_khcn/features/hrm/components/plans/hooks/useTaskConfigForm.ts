import { useState, useEffect } from 'react';
import { useCreateTaskTemplate, useDeleteTaskTemplate, useUpdateTaskTemplate } from '@/features/hrm/hooks';
import { CategoryItem } from '@/features/system-admin/categories/types';

interface UseTaskConfigFormProps {
    templates: any[];
    ranks: CategoryItem[];
    classification: 'CONG_CHUC' | 'VIEN_CHUC';
    defaultRank: string;
}

export function useTaskConfigForm({ templates, ranks, classification, defaultRank }: UseTaskConfigFormProps) {
    const { mutateAsync: createTemplate } = useCreateTaskTemplate();
    const { mutateAsync: deleteTemplate } = useDeleteTaskTemplate();
    const { mutateAsync: updateTemplate } = useUpdateTaskTemplate();

    const [selectedRank, setSelectedRank] = useState<string>(defaultRank);
    const [newTaskName, setNewTaskName] = useState('');
    const [newUnit, setNewUnit] = useState('');

    const [editingId, setEditingId] = useState<string | null>(null);
    const [editTaskName, setEditTaskName] = useState('');
    const [editUnit, setEditUnit] = useState('');

    useEffect(() => {
        if (ranks.length > 0 && !ranks.find(r => r.code === selectedRank)) {
            setSelectedRank(ranks[0].code);
        }
    }, [ranks, selectedRank]);

    const handleAddTemplate = async () => {
        if (!newTaskName.trim() || !newUnit) return;
        try {
            await createTemplate({
                classification,
                rank: selectedRank,
                taskName: newTaskName.trim(),
                defaultUnit: newUnit
            });
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

    const handleStartEdit = (item: any) => {
        setEditingId(item.id);
        setEditTaskName(item.taskName);
        setEditUnit(item.defaultUnit);
    };

    const handleSaveEdit = async () => {
        if (!editingId || !editTaskName.trim()) return;
        const currentItem = templates.find(t => t.id === editingId);
        if (!currentItem) return;
        try {
            await updateTemplate({
                id: editingId,
                payload: {
                    classification,
                    rank: currentItem.rank,
                    taskName: editTaskName.trim(),
                    defaultUnit: editUnit,
                }
            });
            setEditingId(null);
        } catch (error) {
            console.error('Error updating template', error);
        }
    };

    const handleCancelEdit = () => setEditingId(null);

    return {
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
    };
}
