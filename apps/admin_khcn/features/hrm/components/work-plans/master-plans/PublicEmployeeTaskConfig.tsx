/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React from 'react';
import { Briefcase } from 'lucide-react';
import { CategoryItem } from '@/features/system-admin/categories/types';
import { RankTaskCatalogManager } from './RankTaskCatalogManager';

export function PublicEmployeeTaskConfig({
    templates,
    units,
    ranks,
    isLoading = false
}: {
    templates: any[];
    units: CategoryItem[];
    ranks: any[];
    isLoading?: boolean;
}) {
    return (
        <RankTaskCatalogManager
            classification="VIEN_CHUC"
            classificationTitle="VTVL Khối Viên chức"
            legalBasis="Theo Nghị định 106/2020/NĐ-CP & NĐ 115/2020/NĐ-CP"
            icon={<Briefcase className="w-4 h-4" />}
            templates={templates}
            units={units}
            ranks={ranks}
            defaultRank="GRADE_3"
            isLoading={isLoading}
        />
    );
}
