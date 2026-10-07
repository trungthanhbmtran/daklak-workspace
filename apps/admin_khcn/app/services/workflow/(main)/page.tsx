import { redirect } from "next/navigation";
import { WORKFLOW_ROUTES } from "@/features/workflow/routes";
export default function WorkflowIndex() { redirect(WORKFLOW_ROUTES.list); }
