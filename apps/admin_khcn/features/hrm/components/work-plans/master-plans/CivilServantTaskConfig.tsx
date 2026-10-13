/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React from 'react';
import { Building2 } from 'lucide-react';
import { CategoryItem } from '@/features/system-admin/categories/types';
import { RankTaskCatalogManager } from './RankTaskCatalogManager';

export function CivilServantTaskConfig({
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
            classification="CONG_CHUC"
            classificationTitle="VTVL Khối Công chức"
            legalBasis="Theo Nghị định 62/2020/NĐ-CP & TT 12/2022/TT-BNV"
            icon={<Building2 className="w-4 h-4" />}
            templates={templates}
            units={units}
            ranks={ranks}
            defaultRank="SPECIALIST"
            isLoading={isLoading}
        />
    );
}
