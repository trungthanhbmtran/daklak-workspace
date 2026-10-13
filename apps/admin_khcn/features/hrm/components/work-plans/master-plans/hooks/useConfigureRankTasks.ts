/* eslint-disable @typescript-eslint/no-explicit-any */
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

    const { data: jobTitlesRes = { allTitles: [], govTitles: [], partyTitles: [] }, isLoading: isLoadingJobTitles } = useQuery({
        queryKey: ['job-titles-all'],
        queryFn: async () => (await organizationApi.getJobTitles()).data,
        staleTime: 5 * 60 * 1000,
    });

    // Phân loại danh mục VTVL chuẩn Trung ương
    const congChucRanks = jobTitlesRes.govTitles.length > 0
        ? jobTitlesRes.govTitles
        : jobTitlesRes.allTitles.filter((j: any) => j.type === 'GOVERNMENT' || !['DANG', 'PARTY'].includes(j.category?.toUpperCase() ?? ''));

    const vienChucRanks = jobTitlesRes.allTitles.filter((j: any) =>
        (j.category && j.category.includes('Viên chức')) ||
        (j.type === 'POSITION' && !['DANG', 'PARTY'].includes(j.category?.toUpperCase() ?? ''))
    );

    const dangRanks = jobTitlesRes.partyTitles.length > 0
        ? jobTitlesRes.partyTitles
        : jobTitlesRes.allTitles.filter((j: any) =>
            ['DANG', 'PARTY'].includes(j.category?.toUpperCase() ?? '') ||
            ['DANG', 'PARTY'].includes(j.type?.toUpperCase() ?? '')
        );

    const congChucTemplates = templates.filter(t => t.classification === 'CONG_CHUC');
    const vienChucTemplates = templates.filter(t => t.classification === 'VIEN_CHUC');
    const dangTemplates = templates.filter(t => t.classification === 'DANG');

    const isLoading = isLoadingTemplates || isLoadingUnits || isLoadingJobTitles;

    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await hrmTaskTemplatesApi.bulkUpdate([...congChucTemplates, ...vienChucTemplates, ...dangTemplates]);
            setIsSaved(true);
            toast.success("Đồng bộ thư viện vị trí việc làm thành công!");
            setTimeout(() => setIsSaved(false), 2000);
        } catch (error) {
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
        congChucRanks,
        vienChucRanks,
        dangRanks,
        congChucTemplates,
        vienChucTemplates,
        dangTemplates,
        isLoading
    };
}
