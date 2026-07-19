/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React from "react";
import { DndContext, SensorDescriptor, SensorOptions } from "@dnd-kit/core";
import { LeftSidebar } from "../components/LeftSidebar";
import { EditorCanvas } from "../components/EditorCanvas";
import { RightProperties } from "../components/RightProperties";

interface EditorSandboxProps {
    sensors: SensorDescriptor<SensorOptions>[];
    onDragEnd: (event: any) => void;
    showLeftPanel: boolean;
    showRightPanel: boolean;
}

export function EditorSandbox({ sensors, onDragEnd, showLeftPanel, showRightPanel }: EditorSandboxProps) {
    return (
        <div className="flex-1 flex overflow-hidden w-full relative">
            <DndContext sensors={sensors} onDragEnd={onDragEnd}>
                {showLeftPanel && <LeftSidebar />}

                {/* Khung Canvas vẽ giao diện layout trực quan */}
                <EditorCanvas />

                {showRightPanel && <RightProperties />}
            </DndContext>
        </div>
    );
}