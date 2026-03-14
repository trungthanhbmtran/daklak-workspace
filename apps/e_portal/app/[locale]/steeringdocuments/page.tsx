import React, { Suspense } from 'react';

function SteeringDocumentsPage() {
    return (
        <Suspense fallback={<div>Đang tải dữ liệu...</div>}>
            <h1>Steering</h1>
        </Suspense>
    )
}

export default SteeringDocumentsPage