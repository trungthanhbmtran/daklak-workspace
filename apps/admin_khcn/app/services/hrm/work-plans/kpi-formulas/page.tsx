import React from 'react';
import { KpiFormulasClient } from '@/features/hrm/components/work-plans/kpi/KpiFormulasClient';

export default function KpiFormulasPage() {
    return (
        <div className="flex flex-col flex-1 h-full min-h-0 bg-background pb-8 overflow-y-auto">
            <KpiFormulasClient />
        </div>
    );
}
