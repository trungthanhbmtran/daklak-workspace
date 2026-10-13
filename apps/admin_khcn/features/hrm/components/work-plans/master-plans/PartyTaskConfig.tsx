/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React from 'react';
import { ShieldCheck } from 'lucide-react';
import { CategoryItem } from '@/features/system-admin/categories/types';
import { RankTaskCatalogManager } from './RankTaskCatalogManager';

export function PartyTaskConfig({
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
    const defaultPartyRank = ranks.find(r => r.code === 'SPECIALIST' || r.code === 'TRUONG_BAN')?.code || (ranks[0]?.code || 'SPECIALIST');

    return (
        <RankTaskCatalogManager
            classification="DANG"
            classificationTitle="VTVL Cơ quan Đảng"
            legalBasis="Theo Quy định 137-QĐ/TW & Hướng dẫn BTCTW"
            icon={<ShieldCheck className="w-4 h-4" />}
            templates={templates}
            units={units}
            ranks={ranks}
            defaultRank={defaultPartyRank}
            isLoading={isLoading}
        />
    );
}
