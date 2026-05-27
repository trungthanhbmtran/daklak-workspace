import React from 'react';
import { Metadata } from 'next';
import { CreateMasterPlanClient } from '@/features/hrm/components/plans/CreateMasterPlanClient';

export const metadata: Metadata = {
  title: 'Tạo Kế hoạch (AI) | HRM',
  description: 'Tự động phân rã nhiệm vụ và tạo Kế hoạch bằng AI',
};

export default function CreateMasterPlanPage() {
  return (
    <div className="min-h-screen bg-gray-50/50 p-6">
      <CreateMasterPlanClient />
    </div>
  );
}
