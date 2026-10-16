import React from "react";
import { TaskDetailSheetClient } from "./TaskDetailSheetClient";

export default async function TaskDetailSheetSlot({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const taskId = id ? parseInt(id, 10) : undefined;

  return <TaskDetailSheetClient taskId={taskId} />;
}
