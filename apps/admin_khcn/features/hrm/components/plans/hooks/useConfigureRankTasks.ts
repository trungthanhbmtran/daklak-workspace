import { useState } from 'react';
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
        queryFn: () => categoryApi.fetchByGroup('UNIT'),
        staleTime: 5 * 60 * 1000,
    });

    const { data: congChucRanks = [], isLoading: isLoadingCC } = useQuery({
        queryKey: ['categories', 'RANK_CONG_CHUC'],
        queryFn: () => categoryApi.fetchByGroup('RANK_CONG_CHUC'),
        staleTime: 5 * 60 * 1000,
    });

    const { data: vienChucRanks = [], isLoading: isLoadingVC } = useQuery({
        queryKey: ['categories', 'RANK_VIEN_CHUC'],
        queryFn: () => categoryApi.fetchByGroup('RANK_VIEN_CHUC'),
        staleTime: 5 * 60 * 1000,
    });

    const congChucTemplates = templates.filter(t => t.classification === 'CONG_CHUC');
    const vienChucTemplates = templates.filter(t => t.classification === 'VIEN_CHUC');

    const isLoading = isLoadingTemplates || isLoadingUnits || isLoadingCC || isLoadingVC;

    const handleSave = async () => {
        try {
            await hrmTaskTemplatesApi.bulkUpdate([...congChucTemplates, ...vienChucTemplates]);
            setIsSaved(true);
            setTimeout(() => setIsSaved(false), 2000);
        } catch (error) {
            console.error("Lỗi khi lưu cấu hình:", error);
        }
    };

    return {
        selectedClass,
        setSelectedClass,
        isSaved,
        handleSave,
        units,
        congChucRanks,
        vienChucRanks,
        congChucTemplates,
        vienChucTemplates,
        isLoading
    };
}
