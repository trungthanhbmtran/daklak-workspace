import React from 'react';
import { KpiFormulasClient } from '@/features/hrm/components/work-plans/kpi/KpiFormulasClient';

export default function KpiFormulasPage() {
    return (
        <div className="w-full min-h-full flex flex-col flex-1 min-w-0 bg-background">
            <KpiFormulasClient />
        </div>
    );
}
