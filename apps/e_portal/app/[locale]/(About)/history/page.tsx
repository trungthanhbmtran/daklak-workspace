'use client'

import React from 'react';
import { Card, CardHeader, CardBody } from '@heroui/card';

export default function PDFViewer() {
    return (
        <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto">
                <Card className="border shadow-lg rounded-lg">
                    <CardHeader>
                        <h1 className="text-2xl font-bold">Tài liệu: TCDakLak.pdf</h1>
                    </CardHeader>
                    <CardBody className="flex justify-center">
                        <iframe
                            src="/tcdaklak.pdf"
                            width="100%"
                            height="800px"
                            className="border rounded"
                        ></iframe>
                    </CardBody>
                </Card>
            </div>
        </div>
    );
}
