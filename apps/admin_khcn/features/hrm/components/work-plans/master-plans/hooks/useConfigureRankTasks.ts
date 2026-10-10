import { useState } from 'react';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';
import { categoryApi } from '@/features/system-admin/categories/api';
import { organizationApi } from '@/features/system-admin/organization/api';
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

    const { data: jobTitles = [], isLoading: isLoadingJobTitles } = useQuery({
        queryKey: ['job-titles-all'],
        queryFn: async () => (await organizationApi.getJobTitles()).data.allTitles,
        staleTime: 5 * 60 * 1000,
    });

    const congChucTemplates = templates.filter(t => t.classification === 'CONG_CHUC');
    const vienChucTemplates = templates.filter(t => t.classification === 'VIEN_CHUC');

    const isLoading = isLoadingTemplates || isLoadingUnits || isLoadingJobTitles;

    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await hrmTaskTemplatesApi.bulkUpdate([...congChucTemplates, ...vienChucTemplates]);
            setIsSaved(true);
            toast.success("Đồng bộ thư viện vị trí việc làm thành công!");
            setTimeout(() => setIsSaved(false), 2000);
        } catch (error) {
            console.error("Lỗi khi lưu cấu hình:", error);
            toast.error((error as any)?.response?.data?.message || "Có lỗi xảy ra khi đồng bộ thư viện.");
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
        congChucRanks: jobTitles,
        vienChucRanks: jobTitles,
        congChucTemplates,
        vienChucTemplates,
        isLoading
    };
}
