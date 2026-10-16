import React from "react";
import { TaskEvaluateSheetClient } from "./TaskEvaluateSheetClient";

export default async function EvaluateTaskSheetSlot({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const taskId = id ? parseInt(id, 10) : undefined;

  return <TaskEvaluateSheetClient taskId={taskId} />;
}
