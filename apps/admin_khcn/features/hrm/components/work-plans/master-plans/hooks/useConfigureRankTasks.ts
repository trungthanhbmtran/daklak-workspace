import { useState } from 'react';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';
import { categoryApi } from '@/features/system-admin/categories/api';
import { useTaskTemplatesList } from '@/features/hrm/hooks';
import { GovClassification } from '../ConfigureRankTasksClient';
import { hrmTaskTemplatesApi } from '@/features/hrm/api/task-templates.api';

export function useConfigureRankTasks() {
    const [selectedClass, setSelectedClass] = useState<GovClassification>('CONG_CHUC');
    const [isSaved, setIsSaved] = useState(false);

    const { data: templatesData, isLoading: isLoadingTemplates } = useTaskTemplatesList();
    const templates = templatesData?.data || [];

    const { data: units = [], isLoading: isLoadingUnits } = useQuery({
        queryKey: ['categories', 'UNIT'],
        queryFn: async () => (await categoryApi.fetchByGroup('UNIT')).data,
        staleTime: 5 * 60 * 1000,
    });

    const { data: congChucRanks = [], isLoading: isLoadingCC } = useQuery({
        queryKey: ['categories', 'CIVIL_SERVANT_RANK'],
        queryFn: async () => (await categoryApi.fetchByGroup('CIVIL_SERVANT_RANK')).data,
        staleTime: 5 * 60 * 1000,
    });

    const { data: vienChucRanks = [], isLoading: isLoadingVC } = useQuery({
        queryKey: ['categories', 'PUBLIC_EMPLOYEE_RANK'],
        queryFn: async () => (await categoryApi.fetchByGroup('PUBLIC_EMPLOYEE_RANK')).data,
        staleTime: 5 * 60 * 1000,
    });

    const congChucTemplates = templates.filter(t => t.classification === 'CONG_CHUC');
    const vienChucTemplates = templates.filter(t => t.classification === 'VIEN_CHUC');

    const isLoading = isLoadingTemplates || isLoadingUnits || isLoadingCC || isLoadingVC;

    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await hrmTaskTemplatesApi.bulkUpdate([...congChucTemplates, ...vienChucTemplates]);
            setIsSaved(true);
            toast.success("Đồng bộ thư viện ngạch thành công!");
            setTimeout(() => setIsSaved(false), 2000);
        } catch (error) {
            console.error("Lỗi khi lưu cấu hình:", error);
            toast.error("Có lỗi xảy ra khi đồng bộ thư viện.");
        } finally {
            setIsSaving(false);
        }
    };

    return {
        selectedClass,
        setSelectedClass,
        isSaved,
        isSaving,
        handleSave,
        units,
        congChucRanks,
        vienChucRanks,
        congChucTemplates,
        vienChucTemplates,
        isLoading
    };
}
