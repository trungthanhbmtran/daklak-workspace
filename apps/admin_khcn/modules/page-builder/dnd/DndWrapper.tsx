import React from "react";
import {
  useDraggable,
  useDroppable,
  useSensors,
  useSensor,
  PointerSensor,
} from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";

// --- Custom sensors to allow click interactions inside dragged items ---
export const useDndSensors = () => {
  return useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Require moving 8px before initiating drag, allowing clicks on inputs
      },
    })
  );
};

// --- LeftSidebar Draggable Card ---
interface DraggableTemplateProps {
  id: string;
  type: string;
  children: React.ReactNode;
}

export const DraggableTemplate: React.FC<DraggableTemplateProps> = ({ id, type, children }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id,
    data: {
      isTemplate: true,
      blockType: type,
    },
  });

  const style: React.CSSProperties = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.4 : 1,
    cursor: "grab",
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      {...listeners} 
      {...attributes}
      className="touch-none select-none active:cursor-grabbing transition-opacity"
    >
      {children}
    </div>
  );
};

// --- Column Droppable Dropzone ---
interface DroppableColumnProps {
  id: string;
  rowId: string;
  children: React.ReactNode;
  className?: string;
}

export const DroppableColumn: React.FC<DroppableColumnProps> = ({ id, rowId, children, className }) => {
  const { setNodeRef, isOver } = useDroppable({
    id,
    data: {
      rowId,
      colId: id,
    },
  });

  return (
    <div
      ref={setNodeRef}
      className={`${className} transition-all duration-200 ${
        isOver 
          ? "bg-indigo-50/40 dark:bg-indigo-950/15 ring-2 ring-indigo-500/50 ring-dashed" 
          : ""
      }`}
    >
      {children}
    </div>
  );
};

// --- Canvas Draggable & Reorderable Block instance ---
interface DraggableBlockProps {
  id: string;
  rowId: string;
  colId: string;
  index: number;
  children: React.ReactNode;
  className?: string;
}

export const DraggableBlock: React.FC<DraggableBlockProps> = ({ 
  id, 
  rowId, 
  colId, 
  index, 
  children,
  className
}) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id,
    data: {
      isTemplate: false,
      blockId: id,
      rowId,
      colId,
      index,
    },
  });

  const style: React.CSSProperties = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.3 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`${className} relative group transition-all duration-200`}
    >
      {/* Visual drag handle to allow clicks inside the block form */}
      <div 
        {...listeners} 
        {...attributes}
        className="absolute top-2 left-2 z-25 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing w-7 h-7 bg-slate-900/80 text-white rounded-xl flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 touch-none"
        title="Kéo để di chuyển vị trí"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="9" cy="5" r="1"/>
          <circle cx="9" cy="12" r="1"/>
          <circle cx="9" cy="19" r="1"/>
          <circle cx="15" cy="5" r="1"/>
          <circle cx="15" cy="12" r="1"/>
          <circle cx="15" cy="19" r="1"/>
        </svg>
      </div>
      
      {children}
    </div>
  );
};
