import { useState, useMemo } from 'react';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';
import { categoryApi } from '@/features/system-admin/categories/api';
import { organizationApi } from '@/features/system-admin/organization/api';
import { useTaskTemplatesList } from '@/features/hrm/hooks';
import { GovClassification } from '../ConfigureRankTasksClient';
import { hrmTaskTemplatesApi } from '@/features/hrm/api/task-templates.api';
import { JobTitleItem } from '@/features/system-admin/organization/types';
import { CategoryItem } from '@/features/system-admin/categories/types';

export interface TaskRankTemplateItem {
    id: number;
    classification: 'CONG_CHUC' | 'VIEN_CHUC' | 'DANG' | string;
    rank: string;
    taskName: string;
    defaultUnit: string;
    defaultWeight?: number | null;
    standardDurationDays?: number | null;
    rankNameVN?: string | null;
    legalBasis?: string | null;
    createdAt?: string;
    updatedAt?: string;
}

export function useConfigureRankTasks() {
    const [selectedClass, setSelectedClass] = useState<GovClassification>('CONG_CHUC');
    const [isSaved, setIsSaved] = useState(false);

    const {
        data: congChucData,
        isLoading: isLoadingCongChuc,
        refetch: refetchCongChuc
    } = useTaskTemplatesList({ classification: 'CONG_CHUC' });

    const {
        data: vienChucData,
        isLoading: isLoadingVienChuc,
        refetch: refetchVienChuc
    } = useTaskTemplatesList(
        { classification: 'VIEN_CHUC' },
        { enabled: selectedClass === 'VIEN_CHUC' }
    );

    const {
        data: dangData,
        isLoading: isLoadingDang,
        refetch: refetchDang
    } = useTaskTemplatesList(
        { classification: 'DANG' },
        { enabled: selectedClass === 'DANG' }
    );

    const {
        data: rawUnits = [],
        isLoading: isLoadingUnits,
        refetch: refetchUnits
    } = useQuery({
        queryKey: ['categories', 'UNIT'],
        queryFn: async () => {
            const res = await categoryApi.fetchByGroup('UNIT');
            return res.data || [];
        },
        staleTime: 5 * 60 * 1000,
    });

    const units: CategoryItem[] = useMemo(() => {
        return Array.isArray(rawUnits) ? rawUnits : [];
    }, [rawUnits]);

    const {
        data: jobTitlesRes,
        isLoading: isLoadingJobTitles,
        refetch: refetchJobTitles
    } = useQuery({
        queryKey: ['job-titles-all'],
        queryFn: async () => (await organizationApi.getJobTitles()).data,
        staleTime: 5 * 60 * 1000,
    });

    const allJobTitles: JobTitleItem[] = useMemo(() => jobTitlesRes?.allTitles || [], [jobTitlesRes]);
    const govJobTitles: JobTitleItem[] = useMemo(() => jobTitlesRes?.govTitles || [], [jobTitlesRes]);
    const partyJobTitles: JobTitleItem[] = useMemo(() => jobTitlesRes?.partyTitles || [], [jobTitlesRes]);

    // Phân loại danh mục VTVL chuẩn Trung ương
    const congChucRanks: JobTitleItem[] = useMemo(() => {
        if (govJobTitles.length > 0) return govJobTitles;
        return allJobTitles.filter((j: any) =>
            j.type === 'GOVERNMENT' ||
            (!['DANG', 'PARTY'].includes(j.category?.toUpperCase() ?? '') &&
             !['VIEN_CHUC'].includes(j.category?.toUpperCase() ?? ''))
        );
    }, [govJobTitles, allJobTitles]);

    const vienChucRanks: JobTitleItem[] = useMemo(() => {
        const list = allJobTitles.filter((j: any) =>
            (j.category && j.category.includes('Viên chức')) ||
            (j.category && j.category.toUpperCase().includes('VIEN_CHUC')) ||
            (j.type === 'POSITION' && !['DANG', 'PARTY'].includes(j.category?.toUpperCase() ?? ''))
        );
        return list.length > 0 ? list : allJobTitles.filter(j => !['DANG', 'PARTY'].includes(j.category?.toUpperCase() ?? ''));
    }, [allJobTitles]);

    const dangRanks: JobTitleItem[] = useMemo(() => {
        if (partyJobTitles.length > 0) return partyJobTitles;
        return allJobTitles.filter((j: any) =>
            ['DANG', 'PARTY'].includes(j.category?.toUpperCase() ?? '') ||
            ['DANG', 'PARTY'].includes(j.type?.toUpperCase() ?? '')
        );
    }, [partyJobTitles, allJobTitles]);

    const congChucTemplates: TaskRankTemplateItem[] = useMemo(() => {
        const raw = (congChucData as any)?.data ?? (Array.isArray(congChucData) ? congChucData : []);
        return Array.isArray(raw) ? raw : [];
    }, [congChucData]);

    const vienChucTemplates: TaskRankTemplateItem[] = useMemo(() => {
        const raw = (vienChucData as any)?.data ?? (Array.isArray(vienChucData) ? vienChucData : []);
        return Array.isArray(raw) ? raw : [];
    }, [vienChucData]);

    const dangTemplates: TaskRankTemplateItem[] = useMemo(() => {
        const raw = (dangData as any)?.data ?? (Array.isArray(dangData) ? dangData : []);
        return Array.isArray(raw) ? raw : [];
    }, [dangData]);

    // Thống kê tổng hợp theo từng khối
    const statsByClass = useMemo(() => {
        const calculate = (ranksList: JobTitleItem[], templatesList: TaskRankTemplateItem[]) => {
            const configuredRanks = new Set(templatesList.map(t => t.rank));
            const configuredCount = ranksList.filter(r => configuredRanks.has(r.code)).length;
            const totalRanks = ranksList.length;
            const coverage = totalRanks > 0 ? Math.round((configuredCount / totalRanks) * 100) : 0;
            return {
                totalRanks,
                configuredCount,
                templatesCount: templatesList.length,
                coverage,
            };
        };

        return {
            CONG_CHUC: calculate(congChucRanks, congChucTemplates),
            VIEN_CHUC: calculate(vienChucRanks, vienChucTemplates),
            DANG: calculate(dangRanks, dangTemplates),
        };
    }, [congChucRanks, congChucTemplates, vienChucRanks, vienChucTemplates, dangRanks, dangTemplates]);

    const isLoadingTemplates =
        (selectedClass === 'CONG_CHUC' && isLoadingCongChuc) ||
        (selectedClass === 'VIEN_CHUC' && isLoadingVienChuc) ||
        (selectedClass === 'DANG' && isLoadingDang);

    const isLoading = isLoadingTemplates || isLoadingUnits || isLoadingJobTitles;

    const [isSaving, setIsSaving] = useState(false);

    const currentClassTemplates = useMemo(() => {
        if (selectedClass === 'CONG_CHUC') return congChucTemplates;
        if (selectedClass === 'VIEN_CHUC') return vienChucTemplates;
        return dangTemplates;
    }, [selectedClass, congChucTemplates, vienChucTemplates, dangTemplates]);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await hrmTaskTemplatesApi.bulkUpdate(currentClassTemplates, selectedClass);
            setIsSaved(true);
            const classNameVN = selectedClass === 'CONG_CHUC' ? 'Công chức' : selectedClass === 'VIEN_CHUC' ? 'Viên chức' : 'Đảng';
            toast.success(`Đồng bộ thư viện khối ${classNameVN} thành công!`);
            setTimeout(() => setIsSaved(false), 2000);
        } catch (error: any) {
            toast.error(error?.response?.data?.message || "Có lỗi xảy ra khi đồng bộ thư viện.");
        } finally {
            setIsSaving(false);
        }
    };

    const refetchAll = async () => {
        await Promise.all([refetchCongChuc(), refetchVienChuc(), refetchDang(), refetchUnits(), refetchJobTitles()]);
        toast.success("Đã làm mới dữ liệu thư viện VTVL");
    };

    return {
        selectedClass,
        setSelectedClass,
        isSaved,
        isSaving,
        handleSave,
        refetchAll,
        units,
        congChucRanks,
        vienChucRanks,
        dangRanks,
        congChucTemplates,
        vienChucTemplates,
        dangTemplates,
        statsByClass,
        isLoading
    };
}
